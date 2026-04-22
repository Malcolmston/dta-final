import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";
import path from "path";
import { rateLimit, getClientIp } from "@/lib/rateLimit";

// Cache responses for 60 seconds
export const revalidate = 60;

export async function GET(request: NextRequest) {
  // Apply rate limiting (30 requests per minute per IP - more restrictive due to Python processing)
  const clientIp = getClientIp(request);
  const limit = rateLimit(`stocks-momentum-${clientIp}`, { windowMs: 60000, maxRequests: 30 });

  if (!limit.success) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers: { "Retry-After": String(Math.ceil((limit.resetTime - Date.now()) / 1000)) } }
    );
  }

  const { searchParams } = new URL(request.url);
  const ticker = searchParams.get("ticker");
  const period = searchParams.get("period") || "3mo";

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
        "--momentum",
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

    return NextResponse.json({ data: result });
  } catch (error) {
    console.error("Momentum API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch momentum" },
      { status: 500 }
    );
  }
}