import { NextRequest, NextResponse } from "next/server";
import { getRedisClient } from "@/lib/redis";
import { fetchHistory, StockHistory } from "@/lib/client";
import { TIME_RANGES_EXTENDED } from "@/lib/constants";

interface PerformanceData {
  ticker: string;
  period: string;
  performance: number;
}

function calculatePerformance(stockData: StockHistory[]): number {
  if (!stockData || stockData.length < 2) return 0;

  const startPrice = stockData[0].close;
  const endPrice = stockData[stockData.length - 1].close;

  if (startPrice === 0) return 0;

  return ((endPrice - startPrice) / startPrice) * 100;
}

async function fetchHeatmapData(symbols: string[]): Promise<PerformanceData[]> {
  const results: PerformanceData[] = [];

  for (const symbol of symbols) {
    for (const period of TIME_RANGES_EXTENDED) {
      try {
        const history = await fetchHistory(symbol, period.value, "1d");
        const performance = calculatePerformance(history);

        results.push({
          ticker: symbol,
          period: period.label,
          performance,
        });
      } catch (err) {
        console.error(`Failed to fetch ${symbol} for ${period.label}:`, err);
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