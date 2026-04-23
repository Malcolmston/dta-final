import { createClient, RedisClientType } from 'redis';

let redisClient: RedisClientType | null = null;
let redisAvailable = false;

export async function getRedisClient(): Promise<RedisClientType | null> {
  // Skip if REDIS_URL is not set or is localhost (development only)
  const redisUrl = process.env.REDIS_URL;

  if (!redisUrl || redisUrl === 'redis://localhost:6379') {
    console.log('[Redis] Not configured, skipping cache');
    return null;
  }

  if (redisClient && redisClient.isOpen) {
    return redisClient;
  }

  try {
    redisClient = createClient({
      url: redisUrl,
    });

    redisClient.on('error', (err) => {
      console.error('Redis Client Error:', err);
      redisAvailable = false;
    });

    redisClient.on('connect', () => {
      console.log('[Redis] Connected successfully');
      redisAvailable = true;
    });

    await redisClient.connect();
    return redisClient;
  } catch (err) {
    console.error('[Redis] Failed to connect:', err);
    return null;
  }
}

export async function closeRedisClient() {
  if (redisClient && redisClient.isOpen) {
    await redisClient.quit();
    redisClient = null;
  }
}

export function isRedisAvailable(): boolean {
  return redisAvailable && redisClient !== null && redisClient.isOpen;
}