// Redis client for rate limiting

import { createClient, RedisClientType } from 'redis';

let redisClient: RedisClientType | null = null;

export async function getRedisClient(): Promise<RedisClientType> {
  if (!redisClient) {
    redisClient = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
    });

    redisClient.on('error', (err) => console.error('Redis Client Error', err));
    redisClient.on('connect', () => console.log('✅ Redis connected'));

    await redisClient.connect();
  }

  return redisClient;
}

export interface TokenUsage {
  tokenId: string;
  userId: number;
  usesRemaining: number;
  maxUses: number;
  lastRefresh: number;
  sessionStart: number;
}

/**
 * Get token usage from Redis with hourly reset
 */
export async function getTokenUsage(
  tokenId: string,
  userId: number,
  maxUses: number
): Promise<TokenUsage> {
  const client = await getRedisClient();
  const key = `api:token:${tokenId}`;

  const data = await client.get(key);
  const now = Date.now();
  const oneHour = 60 * 60 * 1000;

  if (data) {
    const usage: TokenUsage = JSON.parse(data);

    // Check if we need to refresh (1 hour passed)
    if (now - usage.lastRefresh >= oneHour) {
      // Reset for new hour
      usage.usesRemaining = maxUses;
      usage.lastRefresh = now;
      await client.set(key, JSON.stringify(usage), { EX: 86400 }); // 24 hour TTL
      console.log(`[REDIS] Token ${tokenId} refreshed: ${maxUses} uses`);
    }

    return usage;
  }

  // Create new token usage
  const newUsage: TokenUsage = {
    tokenId,
    userId,
    usesRemaining: maxUses,
    maxUses,
    lastRefresh: now,
    sessionStart: now,
  };

  await client.set(key, JSON.stringify(newUsage), { EX: 86400 });
  console.log(`[REDIS] New token ${tokenId} created: ${maxUses} uses`);

  return newUsage;
}

/**
 * Decrement token usage
 */
export async function decrementTokenUsage(tokenId: string): Promise<TokenUsage | null> {
  const client = await getRedisClient();
  const key = `api:token:${tokenId}`;

  const data = await client.get(key);
  if (!data) return null;

  const usage: TokenUsage = JSON.parse(data);

  if (usage.usesRemaining > 0) {
    usage.usesRemaining--;
    await client.set(key, JSON.stringify(usage), { EX: 86400 });
  }

  return usage;
}

/**
 * Reset token usage (admin function)
 */
export async function resetTokenUsage(tokenId: string): Promise<void> {
  const client = await getRedisClient();
  const key = `api:token:${tokenId}`;
  await client.del(key);
  console.log(`[REDIS] Token ${tokenId} reset`);
}

/**
 * Get time until next refresh
 */
export function getTimeUntilReset(usage: TokenUsage): number {
  const oneHour = 60 * 60 * 1000;
  const elapsed = Date.now() - usage.lastRefresh;
  return Math.max(0, oneHour - elapsed);
}

/**
 * Close Redis connection
 */
export async function closeRedis(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    console.log('Redis connection closed');
  }
}
