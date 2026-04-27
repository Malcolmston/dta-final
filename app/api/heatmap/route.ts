import { NextRequest, NextResponse } from "next/server";
import { getRedisClient } from "@/lib/redis";
import { TIME_RANGES_EXTENDED } from "@/lib/constants";

interface PerformanceData {
  ticker: string;
  period: string;
  performance: number;
}

// Fetch stock data directly from Yahoo Finance (bypasses internal API)
async function fetchStockDataFromYahoo(symbol: string, periodValue: string): Promise<number> {
  const rangeMap: Record<string, number> = {
    "5d": 5,
    "1mo": 30,
    "3mo": 90,
    "6mo": 180,
    "1y": 365,
    "2y": 730,
  };

  const days = rangeMap[periodValue] || 365;
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?period1=${Math.floor(startDate.getTime() / 1000)}&period2=${Math.floor(endDate.getTime() / 1000)}&interval=1d`;

  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    },
  });

  if (!response.ok) {
    throw new Error(`Yahoo API error: ${response.status}`);
  }

  const json = await response.json();

  if (json.chart?.error) {
    throw new Error(json.chart.error.description || "Failed to fetch data");
  }

  const result = json.chart?.result?.[0];
  if (!result) return 0;

  const timestamps = result.timestamp as number[];
  const quote = result.indicators?.quote?.[0];

  if (!timestamps || !quote) return 0;

  const data = timestamps
    .map((ts, i) => ({
      close: quote.close?.[i] || 0,
    }))
    .filter((d) => d.close > 0);

  if (data.length < 2) return 0;

  const startPrice = data[0].close;
  const endPrice = data[data.length - 1].close;

  if (startPrice === 0) return 0;

  return ((endPrice - startPrice) / startPrice) * 100;
}

async function fetchHeatmapData(symbols: string[]): Promise<PerformanceData[]> {
  const results: PerformanceData[] = [];

  for (const symbol of symbols) {
    for (const period of TIME_RANGES_EXTENDED) {
      try {
        const performance = await fetchStockDataFromYahoo(symbol, period.value);

        results.push({
          ticker: symbol,
          period: period.label,
          performance,
        });
      } catch (err) {
        console.error(`[Heatmap] Failed to fetch ${symbol} for ${period.label}:`, err);
        results.push({
          ticker: symbol,
          period: period.label,
          performance: 0,
        });
      }
    }
  }

  return results;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tickers = searchParams.get("tickers") || "AAPL,GOOGL,MSFT,AMZN,NVDA";

  const symbols = tickers
    .split(",")
    .map((s) => s.trim().toUpperCase())
    .filter((s) => s.length > 0);

  if (symbols.length === 0) {
    return NextResponse.json({ error: "Please enter at least one ticker" }, { status: 400 });
  }

  const redis = await getRedisClient();
  const cacheKey = `heatmap:${symbols.sort().join(",")}`;

  // Try to get from Redis cache first
  if (redis) {
    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        console.log(`[Heatmap] Cache hit for ${cacheKey}`);
        return NextResponse.json(JSON.parse(cached), { headers: { "X-Cache": "HIT" } });
      }
      console.log(`[Heatmap] Cache miss for ${cacheKey}`);
    } catch (err) {
      console.error("[Heatmap] Redis get error:", err);
    }
  }

  try {
    const results = await fetchHeatmapData(symbols);

    if (results.length === 0) {
      throw new Error("No data found for any of the specified tickers");
    }

    // Cache the result in Redis for 1 hour
    if (redis) {
      try {
        await redis.setEx(cacheKey, 3600, JSON.stringify(results));
        console.log(`[Heatmap] Cached data for ${cacheKey}`);
      } catch (err) {
        console.error("[Heatmap] Redis set error:", err);
      }
    }

    return NextResponse.json(results);
  } catch (err) {
    console.error("[Heatmap] Error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch stock data" },
      { status: 500 }
    );
  }
}

// Pre-cache endpoint - warms up the cache without returning data
export async function POST(request: NextRequest) {
  const { tickers = "AAPL,GOOGL,MSFT,AMZN,NVDA" } = await request.json();

  const symbols = tickers
    .split(",")
    .map((s: string) => s.trim().toUpperCase())
    .filter((s: string) => s.length > 0);

  if (symbols.length === 0) {
    return NextResponse.json({ error: "Please enter at least one ticker" }, { status: 400 });
  }

  const redis = await getRedisClient();
  const cacheKey = `heatmap:${symbols.sort().join(",")}`;

  // Check if already cached
  if (redis) {
    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        return NextResponse.json({ status: "already_cached", tickers: symbols });
      }
    } catch (err) {
      console.error("[Heatmap] Redis get error:", err);
    }
  }

  try {
    console.log(`[Heatmap] Pre-caching data for ${symbols.join(", ")}`);
    const results = await fetchHeatmapData(symbols);

    if (redis && results.length > 0) {
      await redis.setEx(cacheKey, 3600, JSON.stringify(results));
      console.log(`[Heatmap] Pre-cached data for ${cacheKey}`);
    }

    return NextResponse.json({ status: "cached", tickers: symbols });
  } catch (err) {
    console.error("[Heatmap] Pre-cache error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to pre-cache data" },
      { status: 500 }
    );
  }
}