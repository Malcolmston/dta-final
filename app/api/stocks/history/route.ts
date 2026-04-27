import { NextRequest, NextResponse } from "next/server";
import { rateLimit, getClientIp } from "@/lib/rateLimit";
import { getRedisClient } from "@/lib/redis";

// Cache responses for 60 seconds
export const revalidate = 60;

function processYahooResult(json: any): any[] {
  const result = json.chart.result[0];
  const timestamps = result.timestamp as number[];
  const quote = result.indicators.quote[0];

  return timestamps
    .map((ts, i) => ({
      date: new Date(ts * 1000).toISOString(),
      open: quote.open?.[i] || 0,
      high: quote.high?.[i] || 0,
      low: quote.low?.[i] || 0,
      close: quote.close?.[i] || 0,
      volume: quote.volume?.[i] || 0,
    }))
    .filter((d) => d.close > 0);
}

export async function GET(request: NextRequest) {
  // Apply rate limiting (100 requests per minute per IP)
  const clientIp = getClientIp(request);
  const limit = rateLimit(`stocks-history-${clientIp}`, { windowMs: 60000, maxRequests: 100 });

  if (!limit.success) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers: { "Retry-After": String(Math.ceil((limit.resetTime - Date.now()) / 1000)) } }
    );
  }

  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol");
  const period = searchParams.get("period") || "1y";
  const interval = searchParams.get("interval") || "1d";

  if (!symbol) {
    return NextResponse.json({ error: "Symbol is required" }, { status: 400 });
  }

  try {
    // Try to get from Redis cache first (if Redis is available)
    const redis = await getRedisClient();
    const cacheKey = `stock:${symbol.toUpperCase()}:${period}`;

    if (redis) {
      const cachedData = await redis.get(cacheKey);

      if (cachedData) {
        // Track this search for analytics
        try {
          await redis.incr(`search:${symbol.toUpperCase()}`);
          await redis.expire(`search:${symbol.toUpperCase()}`, 86400);
        } catch (e) {
          // Ignore analytics errors
        }

        return NextResponse.json(
          { data: JSON.parse(cachedData), cached: true },
          {
            headers: {
              "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=3600",
              "X-Cache": "HIT",
            },
          }
        );
      }
    }

    const rangeMap: Record<string, number> = {
      "1d": 1,
      "5d": 5,
      "1mo": 30,
      "3mo": 90,
      "6mo": 180,
      "1y": 365,
      "2y": 730,
      "5y": 1825,
      "10y": 3650,
      "max": 10000,
    };

    // For 1 day period, use 5-minute intervals for intraday data
    const isIntraday = period === "1d";
    const usedInterval = isIntraday ? "5m" : interval;
    const useChartStart = isIntraday ? "1d" : period;

    const days = rangeMap[useChartStart] || 365;
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Try multiple Yahoo Finance endpoints
    const endpoints = [
      {
        url: `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?period1=${Math.floor(startDate.getTime() / 1000)}&period2=${Math.floor(endDate.getTime() / 1000)}&interval=${usedInterval}`,
        headers: {
          "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "application/json",
        },
      },
      {
        url: `https://query2.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?period1=${Math.floor(startDate.getTime() / 1000)}&period2=${Math.floor(endDate.getTime() / 1000)}&interval=${usedInterval}`,
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          "Accept": "application/json",
        },
      },
    ];

    let data: any[] = [];
    let lastError: Error | null = null;

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint.url, { headers: endpoint.headers });

        if (!response.ok) {
          lastError = new Error(`Yahoo API error: ${response.status}`);
          continue;
        }

        const json = await response.json();

        if (json.chart?.error) {
          lastError = new Error(json.chart.error.description || "Failed to fetch data");
          continue;
        }

        data = processYahooResult(json);
        if (data.length > 0) break;
      } catch (e) {
        lastError = e instanceof Error ? e : new Error(String(e));
      }
    }

    if (data.length === 0) {
      throw lastError || new Error("Failed to fetch stock data from all endpoints");
    }

    // Cache in Redis for 5 minutes (if available)
    if (redis) {
      try {
        await redis.setEx(cacheKey, 300, JSON.stringify(data));

        // Track this search for analytics
        await redis.incr(`search:${symbol.toUpperCase()}`);
        await redis.expire(`search:${symbol.toUpperCase()}`, 86400);

        // Track page view
        await redis.incr(`page_view:${symbol.toUpperCase()}`);
        await redis.expire(`page_view:${symbol.toUpperCase()}`, 3600);
      } catch (e) {
        // Ignore caching errors
      }
    }

    return NextResponse.json(
      { data },
      {
        headers: {
          "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=3600",
        },
      }
    );
  } catch (error) {
    console.error("Stock history fetch error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch stock data" },
      { status: 500 }
    );
  }
}