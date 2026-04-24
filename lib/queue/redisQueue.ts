import Redis from "ioredis";
import { Worker, Job } from "bullmq";

// Redis connection
const getRedisClient = () => {
  const host = process.env.REDIS_HOST || "localhost";
  const port = parseInt(process.env.REDIS_PORT || "6379", 10);

  return new Redis({
    host,
    port,
    maxRetriesPerRequest: 3,
    lazyConnect: true,
  });
};

let redisClient: Redis | null = null;

export const getRedis = () => {
  if (!redisClient) {
    redisClient = getRedisClient();
  }
  return redisClient;
};

// Job types
export interface DataJob {
  type: "history" | "signals" | "momentum" | "growth" | "forecast";
  symbol: string;
  period?: string;
  interval?: string;
}

// Queue names
export const QUEUES = {
  STOCK_DATA: "stock-data",
};

// Store job results in Redis with TTL
export const storeJobResult = async (
  key: string,
  data: any,
  ttlSeconds: number = 3600 // 1 hour default
): Promise<void> => {
  const redis = getRedis();
  await redis.setex(key, ttlSeconds, JSON.stringify(data));
};

// Get cached job result
export const getJobResult = async (key: string): Promise<any | null> => {
  const redis = getRedis();
  const data = await redis.get(key);
  return data ? JSON.parse(data) : null;
};

// Generate cache key for job
export const getCacheKey = (type: string, symbol: string, period?: string): string => {
  return `stock:${type}:${symbol}:${period || "default"}`;
};

// Check if job is pending or processing
export const isJobPending = async (key: string): Promise<boolean> => {
  const redis = getRedis();
  const exists = await redis.exists(`lock:${key}`);
  return exists === 1;
};

// Acquire job lock
export const acquireJobLock = async (key: string, ttlSeconds: number = 60): Promise<boolean> => {
  const redis = getRedis();
  const result = await redis.set(`lock:${key}`, "1", "EX", ttlSeconds, "NX");
  return result === "OK";
};

// Release job lock
export const releaseJobLock = async (key: string): Promise<void> => {
  const redis = getRedis();
  await redis.del(`lock:${key}`);
};

// Process job data - fetches from Python and returns
export const processStockJob = async (job: Job<DataJob>): Promise<any> => {
  const { type, symbol, period = "3mo", interval = "1d" } = job.data;

  // Import Python scraper dynamically
  const { spawn } = await import("child_process");
  const path = await import("path");

  const pythonScript = path.join(process.cwd(), "scrape", "main.py");

  const args = ["-t", symbol, "-p", period];

  switch (type) {
    case "history":
      args.push("-f", "json");
      break;
    case "signals":
      args.push("--signals", "-f", "json");
      break;
    case "momentum":
      args.push("--momentum", "-f", "json");
      break;
    case "growth":
      args.push("--growth", "-f", "json");
      break;
    case "forecast":
      args.push("--forecast", "-f", "json");
      break;
  }

  return new Promise((resolve, reject) => {
    const proc = spawn("python3", [pythonScript, ...args]);

    let stdout = "";
    let stderr = "";

    proc.stdout.on("data", (data) => { stdout += data.toString(); });
    proc.stderr.on("data", (data) => { stderr += data.toString(); });

    proc.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`Python script failed: ${stderr}`));
      } else {
        try {
          resolve(JSON.parse(stdout));
        } catch {
          reject(new Error("Invalid JSON from Python"));
        }
      }
    });
  });
};

// Close Redis connection
export const closeRedis = async (): Promise<void> => {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
};