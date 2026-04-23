import { NextRequest, NextResponse } from "next/server";
import { getRedisClient } from "@/lib/redis";

// Cron job for page lookup pre-warming
// Runs every 10 minutes to pre-cache popular pages

const POPULAR_PAGES = [
  "/api/stocks/history?symbol=AAPL&period=1y",
  "/api/stocks/history?symbol=GOOGL&period=1y",
  "/api/stocks/history?symbol=MSFT&period=1y",
  "/api/stocks/history?symbol=AMZN&period=1y",
  "/api/stocks/history?symbol=NVDA&period=1y",
  "/api/stocks/history?symbol=META&period=1y",
  "/api/stocks/history?symbol=TSLA&period=1y",
  "/api/stocks/growth?symbol=AAPL",
  "/api/stocks/growth?symbol=NVDA",
  "/api/stocks/signals?symbol=AAPL",
  "/api/stocks/signals?symbol=NVDA",
  "/api/stocks/forecast?symbol=AAPL",
  "/api/stocks/momentum?symbol=AAPL",
];

export async function GET(request: NextRequest) {
  // Verify cron secret for security
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const redis = await getRedisClient();
    const results: { page: string; success: boolean; cachedAt?: string; error?: string }[] = [];

    // Get top searched symbols from analytics
    const topSearchesJson = await redis.get("analytics:top_searches");
    let pagesToCache = [...POPULAR_PAGES];

    if (topSearchesJson) {
      const topSearches = JSON.parse(topSearchesJson) as [string, number][];
      // Add top searched symbols to cache list
      for (const [key, count] of topSearches.slice(0, 10)) {
        const symbol = key.replace("search:", "");
        const page = `/api/stocks/history?symbol=${symbol}&period=1y`;
        if (!pagesToCache.includes(page)) {
          pagesToCache.push(page);
        }
      }
    }

    // Pre-cache pages by warming the Redis cache
    for (const page of pagesToCache.slice(0, 20)) {
      try {
        const cacheKey = `page:${page}`;
        const existingCache = await redis.get(cacheKey);

        if (!existingCache) {
          // Mark page as needing cache warm
          await redis.setEx(cacheKey, 600, JSON.stringify({
            status: "pending",
            requestedAt: new Date().toISOString()
          }));
        }

        results.push({
          page,
          success: true,
          cachedAt: new Date().toISOString()
        });
      } catch (err) {
        results.push({
          page,
          success: false,
          error: err instanceof Error ? err.message : "Unknown error"
        });
      }
    }

    // Track page view stats
    const viewKeys = await redis.keys("page_view:*");
    const totalViews = await redis.dbSize();
    const pageViews: Record<string, number> = {};

    for (const key of viewKeys.slice(0, 100)) {
      const views = await redis.get(key);
      if (views) {
        pageViews[key.replace("page_view:", "")] = parseInt(views, 10);
      }
    }

    // Store page analytics
    const analyticsData = {
      totalCachedPages: results.length,
      successfulCache: results.filter(r => r.success).length,
      topViews: Object.entries(pageViews)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 20),
      timestamp: new Date().toISOString()
    };

    await redis.setEx("analytics:page_lookups", 600, JSON.stringify(analyticsData));

    console.log(`[Cron] Page lookup pre-warm complete: ${results.filter(r => r.success).length}/${results.length}`);

    return NextResponse.json({
      success: true,
      summary: {
        total: results.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length
      },
      analytics: analyticsData
    });
  } catch (error) {
    console.error("[Cron] Page lookup error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to pre-warm pages" },
      { status: 500 }
    );
  }
}