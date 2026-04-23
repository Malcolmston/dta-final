import { NextRequest, NextResponse } from "next/server";
import { getRedisClient } from "@/lib/redis";

// Cron job to pull and cache stock data
// Runs every 5 minutes to keep data fresh

const POPULAR_STOCKS = [
  "AAPL", "GOOGL", "MSFT", "AMZN", "NVDA", "META", "TSLA", "BRK.B",
  "JPM", "V", "JNJ", "WMT", "PG", "MA", "UNH", "HD"
];

const PERIODS = ["1d", "1mo", "3mo", "1y"];

export async function GET(request: NextRequest) {
  // Verify cron secret for security
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const redis = await getRedisClient();

    if (!redis) {
      return NextResponse.json({
        success: false,
        error: "Redis not configured. Set REDIS_URL environment variable to enable caching."
      }, { status: 503 });
    }

    const results: { symbol: string; period: string; success: boolean; error?: string }[] = [];

    for (const symbol of POPULAR_STOCKS) {
      for (const period of PERIODS) {
        try {
          const rangeMap: Record<string, number> = {
            "1d": 1,
            "5d": 5,
            "1mo": 30,
            "3mo": 90,
            "6mo": 180,
            "1y": 365,
          };

          const days = rangeMap[period] || 30;
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
            results.push({ symbol, period, success: false, error: `HTTP ${response.status}` });
            continue;
          }

          const json = await response.json();
          const result = json.chart?.result?.[0];

          if (!result) {
            results.push({ symbol, period, success: false, error: "No data" });
            continue;
          }

          const timestamps = result.timestamp as number[];
          const quote = result.indicators.quote[0];

          const data = timestamps
            .map((ts, i) => ({
              date: new Date(ts * 1000).toISOString(),
              open: quote.open?.[i] || 0,
              high: quote.high?.[i] || 0,
              low: quote.low?.[i] || 0,
              close: quote.close?.[i] || 0,
              volume: quote.volume?.[i] || 0,
            }))
            .filter((d) => d.close > 0);

          // Cache in Redis with 5-minute expiry for active data
          const cacheKey = `stock:${symbol}:${period}`;
          await redis.setEx(cacheKey, 300, JSON.stringify(data));

          results.push({ symbol, period, success: true });
        } catch (err) {
          results.push({
            symbol,
            period,
            success: false,
            error: err instanceof Error ? err.message : "Unknown error"
          });
        }
      }
    }

    const successCount = results.filter(r => r.success).length;
    console.log(`[Cron] Data pull complete: ${successCount}/${results.length} successful`);

    return NextResponse.json({
      success: true,
      summary: { total: results.length, successful: successCount, failed: results.length - successCount },
      results: results.slice(0, 20) // Return first 20 for brevity
    });
  } catch (error) {
    console.error("[Cron] Data pull error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to pull data" },
      { status: 500 }
    );
  }
}