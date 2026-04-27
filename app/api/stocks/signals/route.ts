import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";
import path from "path";
import { rateLimit, getClientIp } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

// Cache-Control: s-maxage=60 (CDN caches for 60s), stale-while-revalidate=300
export const revalidate = 60;

export async function GET(request: NextRequest) {
  // Apply rate limiting (30 requests per minute per IP - more restrictive due to Python processing)
  const clientIp = getClientIp(request);
  const limit = rateLimit(`stocks-signals-${clientIp}`, { windowMs: 60000, maxRequests: 30 });

  if (!limit.success) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers: { "Retry-After": String(Math.ceil((limit.resetTime - Date.now()) / 1000)) } }
    );
  }

  const { searchParams } = new URL(request.url);
  const ticker = searchParams.get("ticker");
  const period = searchParams.get("period") || "6mo";

  if (!ticker) {
    return NextResponse.json({ error: "Ticker parameter is required" }, { status: 400 });
  }

  try {
    const pythonScript = path.join(process.cwd(), "scrape", "main.py");
    const result = await new Promise<any>((resolve, reject) => {
      const proc = spawn("python3", [
        pythonScript,
        "-t", ticker,
        "-p", period,
        "--signals",
        "-f", "json"
      ]);

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

    // The signals output doesn't include dates, so we need to generate them
    // based on the period length. Last 30 data points, 1 day apart
    const dataWithDates = result.map((item: any, idx: number) => {
      const date = new Date();
      date.setDate(date.getDate() - (30 - idx));
      return {
        Date: date.toISOString(),
        Close: item.close,
        rsi: item.rsi,
        rsi_signal: item.rsi_signal,
        macd: item.macd,
        macd_signal: item.macd_signal,
        macd_cross: item.macd_cross,
        sma: item.sma,
        sma_2: item.sma_2,
      };
    });

    return NextResponse.json(
      { data: dataWithDates },
      {
        headers: {
          "Cache-Control": "public, max-age=30, s-maxage=60, stale-while-revalidate=300",
        },
      }
    );
  } catch (error) {
    console.error("Signals API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch signals" },
      { status: 500 }
    );
  }
}