import { NextRequest, NextResponse } from "next/server";
import { getRedisClient } from "@/lib/redis";

// Cron job for persistent storage operations
// Runs every hour to backup and maintain data

export async function GET(request: NextRequest) {
  // Verify cron secret for security
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const redis = await getRedisClient();

    // Get all stock data keys
    const stockKeys = await redis.keys("stock:*");
    const results: { operation: string; success: boolean; count?: number; error?: string }[] = [];

    if (stockKeys.length > 0) {
      // Refresh expiry for all cached data (extend to 1 hour)
      for (const key of stockKeys) {
        const ttl = await redis.ttl(key);
        if (ttl > 0 && ttl < 300) {
          await redis.expire(key, 3600);
        }
      }
      results.push({ operation: "refresh_expiry", success: true, count: stockKeys.length });
    }

    // Track popular searches
    const searchKeys = await redis.keys("search:*");
    if (searchKeys.length > 0) {
      // Get search counts and maintain top searches
      const searchCounts: Record<string, number> = {};
      for (const key of searchKeys) {
        const count = await redis.get(key);
        if (count) {
          searchCounts[key] = parseInt(count, 10);
        }
      }

      // Store top searches for analytics
      const topSearches = Object.entries(searchCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 50);

      await redis.setEx("analytics:top_searches", 86400, JSON.stringify(topSearches));
      results.push({ operation: "top_searches", success: true, count: topSearches.length });
    }

    // Clean up old session data
    const sessionKeys = await redis.keys("session:*");
    let cleanedSessions = 0;
    for (const key of sessionKeys) {
      const ttl = await redis.ttl(key);
      if (ttl <= 0) {
        await redis.del(key);
        cleanedSessions++;
      }
    }
    if (cleanedSessions > 0) {
      results.push({ operation: "cleanup_sessions", success: true, count: cleanedSessions });
    }

    // Record storage stats
    const info = await redis.info("memory");
    const usedMemoryMatch = info.match(/used_memory_human:(\S+)/);
    const storageStats = {
      stockKeys: stockKeys.length,
      searchKeys: searchKeys.length,
      sessionsCleaned: cleanedSessions,
      memoryUsed: usedMemoryMatch ? usedMemoryMatch[1] : "unknown",
      timestamp: new Date().toISOString(),
    };

    await redis.setEx("analytics:storage_stats", 3600, JSON.stringify(storageStats));

    console.log(`[Cron] Storage maintenance complete:`, storageStats);

    return NextResponse.json({
      success: true,
      summary: storageStats,
      operations: results
    });
  } catch (error) {
    console.error("[Cron] Storage maintenance error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to maintain storage" },
      { status: 500 }
    );
  }
}