import { NextRequest, NextResponse } from "next/server";
import { rateLimit, getClientIp } from "@/lib/rateLimit";

// Cache responses for 60 seconds
export const revalidate = 60;

export async function GET(request: NextRequest) {
  // Apply rate limiting
  const clientIp = getClientIp(request);
  const limit = rateLimit(`stocks-forecast-${clientIp}`, { windowMs: 60000, maxRequests: 30 });

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
    // Fetch historical data from history endpoint
    // In server-to-server calls, use relative path or check if external URL needed
    const historyUrl = new URL('/api/stocks/history', request.url);
    historyUrl.searchParams.set('symbol', ticker);
    historyUrl.searchParams.set('period', period);
    historyUrl.searchParams.set('interval', '1d');

    const historyResponse = await fetch(historyUrl.toString());

    if (!historyResponse.ok) {
      throw new Error(`Failed to fetch history data: ${historyResponse.status}`);
    }

    const historyResult = await historyResponse.json();
    const data = historyResult.data;

    if (!data || data.length === 0) {
      throw new Error("No historical data available");
    }

    // Generate simple forecast based on technical analysis
    const forecastData = generateForecast(data, ticker);

    return NextResponse.json(
      { data: forecastData },
      {
        headers: {
          "Cache-Control": "public, max-age=30, s-maxage=60, stale-while-revalidate=300",
        },
      }
    );
  } catch (err) {
    console.error("Forecast generation error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to generate forecast" },
      { status: 500 }
    );
  }
}

function generateForecast(data: any[], ticker: string) {
  const closes = data.map(d => d.close);
  const dates = data.map(d => new Date(d.date));

  // Calculate simple moving averages
  const sma20 = calculateSMA(closes, 20);
  const sma50 = calculateSMA(closes, 50);

  // Calculate RSI (14 periods)
  const rsi = calculateRSI(closes, 14);

  // Generate forecast points
  const forecast: Array<{Date: string; Close: number; score: string; signal: string}> = [];

  for (let i = 0; i < data.length; i++) {
    const close = closes[i];
    const date = dates[i].toISOString();

    // Determine signal based on indicators
    let signal = "HOLD";
    let score = "2-1"; // neutral

    if (sma20 && sma50) {
      const currentSMA20 = calculateSMA(closes.slice(0, i + 1), Math.min(20, i + 1));
      const currentSMA50 = calculateSMA(closes.slice(0, i + 1), Math.min(50, i + 1));

      if (currentSMA20 && currentSMA50) {
        if (currentSMA20 > currentSMA50) {
          signal = "BUY";
          score = "3-0";
        } else if (currentSMA20 < currentSMA50) {
          signal = "SELL";
          score = "0-3";
        }
      }
    }

    // RSI modifier
    if (i >= 14) {
      const currentRSI = calculateRSI(closes.slice(0, i + 1), 14);
      if (currentRSI > 70) {
        signal = "SELL";
        score = "1-2";
      } else if (currentRSI < 30) {
        signal = "BUY";
        score = "2-1";
      }
    }

    forecast.push({
      Date: date,
      Close: close,
      score,
      signal
    });
  }

  return forecast;
}

function calculateSMA(values: number[], period: number): number | null {
  if (values.length < period) return null;

  const slice = values.slice(-period);
  const sum = slice.reduce((a, b) => a + b, 0);
  return sum / period;
}

function calculateRSI(values: number[], period: number): number {
  if (values.length < period + 1) return 50; // neutral

  let gains = 0;
  let losses = 0;

  for (let i = values.length - period; i < values.length; i++) {
    const change = values[i] - values[i - 1];
    if (change > 0) gains += change;
    else losses -= change;
  }

  const avgGain = gains / period;
  const avgLoss = losses / period;

  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
}