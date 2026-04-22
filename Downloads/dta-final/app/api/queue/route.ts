import { NextRequest, NextResponse } from "next/server";
import { getCacheKey, getJobResult, isJobPending, acquireJobLock, releaseJobLock, storeJobResult, processStockJob } from "@/lib/queue/redisQueue";
import { spawn } from "child_process";
import path from "path";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const { type, symbol, period = "3mo", interval = "1d" } = await request.json();

  if (!symbol || !type) {
    return NextResponse.json({ error: "Missing symbol or type" }, { status: 400 });
  }

  const cacheKey = getCacheKey(type, symbol, period);

  try {
    // Check if we have cached data
    const cached = await getJobResult(cacheKey);
    if (cached) {
      return NextResponse.json({ data: cached, cached: true });
    }

    // Check if job is already pending
    const pending = await isJobPending(cacheKey);
    if (pending) {
      return NextResponse.json({ status: "pending", message: "Job already in progress" });
    }

    // Acquire lock to prevent duplicate jobs
    const locked = await acquireJobLock(cacheKey, 120); // 2 minute lock
    if (!locked) {
      return NextResponse.json({ status: "pending", message: "Job already in progress" });
    }

    // Process the job immediately
    const pythonScript = path.join(process.cwd(), "scrape", "main.py");
    let args = ["-t", symbol.toUpperCase(), "-p", period];

    switch (type) {
      case "history":
        break;
      case "signals":
        args.push("--signals");
        break;
      case "momentum":
        args.push("--momentum");
        break;
      case "growth":
        args.push("--growth");
        break;
      case "forecast":
        args.push("--forecast");
        break;
      default:
        releaseJobLock(cacheKey);
        return NextResponse.json({ error: "Invalid job type" }, { status: 400 });
    }

    args.push("-f", "json");

    const result = await new Promise<any>((resolve, reject) => {
      const proc = spawn("python3", [pythonScript, ...args]);
      let stdout = "";
      let stderr = "";

      proc.stdout.on("data", (data) => { stdout += data.toString(); });
      proc.stderr.on("data", (data) => { stderr += data.toString(); });

      proc.on("close", (code) => {
        if (code !== 0) {
          reject(new Error(stderr || "Python script failed"));
        } else {
          try {
            resolve(JSON.parse(stdout));
          } catch {
            reject(new Error("Invalid JSON"));
          }
        }
      });
    });

    // Store result in cache
    await storeJobResult(cacheKey, result, 3600); // 1 hour cache

    // Release lock
    await releaseJobLock(cacheKey);

    return NextResponse.json({ data: result, cached: false });
  } catch (error) {
    await releaseJobLock(cacheKey);
    console.error("Queue job error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Job failed" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const symbol = searchParams.get("symbol");
  const period = searchParams.get("period") || "3mo";

  if (!symbol || !type) {
    return NextResponse.json({ error: "Missing symbol or type" }, { status: 400 });
  }

  const cacheKey = getCacheKey(type, symbol, period);

  try {
    // Check if job is pending
    const pending = await isJobPending(cacheKey);

    // Try to get cached data
    const cached = await getJobResult(cacheKey);

    if (cached) {
      return NextResponse.json({ data: cached, cached: true, pending });
    }

    if (pending) {
      return NextResponse.json({ status: "pending" });
    }

    return NextResponse.json({ error: "No data found" }, { status: 404 });
  } catch (error) {
    console.error("Queue check error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Check failed" },
      { status: 500 }
    );
  }
}