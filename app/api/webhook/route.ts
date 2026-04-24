import { NextRequest, NextResponse } from "next/server";
import { rateLimit, getClientIp } from "@/lib/rateLimit";

// Available charts for export (all chart components)
const AVAILABLE_CHARTS = [
  "candlestick", "candlestick3d", "heatmap", "volume", "volume3d",
  "streamgraph", "network", "correlation", "lag", "portfolioage",
  "benchmark", "cashflow", "dualaxis", "forecast", "signals",
  "momentum", "treemap", "treemap3d", "pie", "diversification",
  "risk", "retirement", "price3d", "rebalancing", "income",
  "assetallocation", "simplified", "technical", "confusion"
];

// Cache responses for different data types
const CACHE_DURATIONS: Record<string, number> = {
  history: 60,      // 1 minute for history
  quote: 30,        // 30 seconds for quotes
  profile: 3600,   // 1 hour for company profiles
  financials: 3600, // 1 hour for financials
  options: 300,    // 5 minutes for options
  news: 300,       // 5 minutes for news
};

export async function GET(request: NextRequest) {
  const clientIp = getClientIp(request);
  const limit = rateLimit(`webhook-${clientIp}`, { windowMs: 60000, maxRequests: 100 });

  if (!limit.success) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers: { "Retry-After": String(Math.ceil((limit.resetTime - Date.now()) / 1000)) } }
    );
  }

  const url = new URL(request.url);
  const { searchParams } = url;
  const action = searchParams.get("action");
  const symbol = searchParams.get("symbol")?.toUpperCase();
  // Translate "all" to "max" for Yahoo Finance
  const rawPeriod = searchParams.get("period") || "1y";
  const period = rawPeriod === "all" ? "max" : rawPeriod;
  const interval = searchParams.get("interval") || "1d";
  const baseUrl = `${url.protocol}//${url.host}`;

  // Chart export parameter: chart=candlestick.png or chart=heatmap.jpg
  const chartParam = searchParams.get("chart");
  if (chartParam) {
    const match = chartParam.match(/^(.+)\.(png|jpg|jpeg|webp)$/i);
    if (!match) {
      return NextResponse.json(
        { error: "Invalid chart format. Use: chart=<name>.<png|jpg|webp>" },
        { status: 400 }
      );
    }
    const chartName = match[1].toLowerCase();
    const format = match[2].toLowerCase();

    if (!AVAILABLE_CHARTS.includes(chartName)) {
      return NextResponse.json(
        { error: `Unknown chart: ${chartName}`, availableCharts: AVAILABLE_CHARTS },
        { status: 400 }
      );
    }

    // Extended query parameters for chart customization
    const tickers = searchParams.get("tickers")?.split(",").map(s => s.trim().toUpperCase()).filter(s => s) || (symbol ? [symbol] : []);
    const interval = searchParams.get("interval") || "1d";
    const width = searchParams.get("width") || "800";
    const height = searchParams.get("height") || "400";
    const theme = searchParams.get("theme") || "dark";
    const title = searchParams.get("title") || "";

    // Return chart configuration for client-side capture
    return NextResponse.json({
      success: true,
      chart: {
        name: chartName,
        format,
        captureUrl: `${baseUrl}/api/webhook/capture?chart=${chartName}&format=${format}&symbol=${tickers.join(",")}&period=${period}&interval=${interval}&width=${width}&height=${height}&theme=${theme}&title=${encodeURIComponent(title)}`,
        params: {
          tickers,
          period,
          interval,
          width: Number(width),
          height: Number(height),
          theme,
          title
        },
        instructions: "Navigate to captureUrl in browser to download chart image"
      },
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  }

  if (!symbol) {
    return NextResponse.json(
      { error: "Symbol is required" },
      { status: 400 }
    );
  }

  try {
    let data: any;
    let error: string | null = null;

    switch (action) {
      case "history":
        // Fetch historical stock data
        const historyResponse = await fetch(
          `${baseUrl}/api/stocks/history?symbol=${encodeURIComponent(symbol)}&period=${period}&interval=${interval}`
        );
        if (!historyResponse.ok) {
          const err = await historyResponse.json();
          error = err.error || "Failed to fetch history";
        } else {
          data = await historyResponse.json();
        }
        break;

      case "quote":
        // Fetch current quote
        const quoteResponse = await fetch(
          `${baseUrl}/api/stocks/history?symbol=${encodeURIComponent(symbol)}&period=1d&interval=1m`
        );
        if (!quoteResponse.ok) {
          const err = await quoteResponse.json();
          error = err.error || "Failed to fetch quote";
        } else {
          const quoteData = await quoteResponse.json();
          const latest = quoteData.data?.[quoteData.data.length - 1];
          data = {
            symbol,
            price: latest?.close || 0,
            change: latest?.close && quoteData.data.length > 1
              ? ((latest.close - (quoteData.data[quoteData.data.length - 2]?.close || 0)) / (quoteData.data[quoteData.data.length - 2]?.close || 1)) * 100
              : 0,
            volume: latest?.volume || 0,
            timestamp: latest?.date || new Date().toISOString(),
          };
        }
        break;

      case "growth":
        // Fetch growth estimates
        const growthResponse = await fetch(
          `${baseUrl}/api/stocks/growth?symbol=${encodeURIComponent(symbol)}`
        );
        if (!growthResponse.ok) {
          const err = await growthResponse.json();
          error = err.error || "Failed to fetch growth data";
        } else {
          data = await growthResponse.json();
        }
        break;

      case "forecast":
        // Fetch forecast signals
        const forecastResponse = await fetch(
          `${baseUrl}/api/stocks/forecast?ticker=${encodeURIComponent(symbol)}&period=${period}`
        );
        if (!forecastResponse.ok) {
          const err = await forecastResponse.json();
          error = err.error || "Failed to fetch forecast";
        } else {
          data = await forecastResponse.json();
        }
        break;

      case "signals":
        // Fetch trading signals
        const signalsResponse = await fetch(
          `${baseUrl}/api/stocks/signals?symbol=${encodeURIComponent(symbol)}`
        );
        if (!signalsResponse.ok) {
          const err = await signalsResponse.json();
          error = err.error || "Failed to fetch signals";
        } else {
          data = await signalsResponse.json();
        }
        break;

      case "momentum":
        // Fetch momentum data
        const momentumResponse = await fetch(
          `${baseUrl}/api/stocks/momentum?symbol=${encodeURIComponent(symbol)}&period=${period}`
        );
        if (!momentumResponse.ok) {
          const err = await momentumResponse.json();
          error = err.error || "Failed to fetch momentum";
        } else {
          data = await momentumResponse.json();
        }
        break;

      case "heatmap":
        // Fetch heatmap data for multiple symbols
        const tickers = searchParams.get("tickers")?.split(",").map(s => s.trim().toUpperCase()).filter(s => s) || [symbol];
        const heatmapResponse = await fetch(
          `${baseUrl}/api/heatmap?tickers=${encodeURIComponent(tickers.join(","))}`
        );
        if (!heatmapResponse.ok) {
          const err = await heatmapResponse.json();
          error = err.error || "Failed to fetch heatmap";
        } else {
          data = await heatmapResponse.json();
        }
        break;

      case "batch":
        // Fetch multiple data types at once
        const types = searchParams.get("types")?.split(",").filter(t => t) || ["history", "quote"];
        const batchData: Record<string, any> = {};

        for (const type of types) {
          try {
            if (type === "history") {
              const histRes = await fetch(
                `${baseUrl}/api/stocks/history?symbol=${encodeURIComponent(symbol)}&period=${period}&interval=${interval}`
              );
              if (histRes.ok) batchData.history = await histRes.json();
            } else if (type === "quote") {
              const quoteRes = await fetch(
                `${baseUrl}/api/stocks/history?symbol=${encodeURIComponent(symbol)}&period=1d&interval=1m`
              );
              if (quoteRes.ok) {
                const qd = await quoteRes.json();
                const latest = qd.data?.[qd.data.length - 1];
                batchData.quote = {
                  symbol,
                  price: latest?.close || 0,
                  timestamp: latest?.date || new Date().toISOString(),
                };
              }
            } else if (type === "growth") {
              const growRes = await fetch(
                `${baseUrl}/api/stocks/growth?symbol=${encodeURIComponent(symbol)}`
              );
              if (growRes.ok) batchData.growth = await growRes.json();
            }
          } catch (e) {
            // Skip failed items
          }
        }
        data = batchData;
        break;

      default:
        return NextResponse.json(
          {
            error: "Invalid action",
            availableActions: ["history", "quote", "growth", "forecast", "signals", "momentum", "heatmap", "batch"]
          },
          { status: 400 }
        );
    }

    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data,
      meta: {
        symbol,
        action,
        period,
        interval,
        cached: true,
        timestamp: new Date().toISOString(),
      }
    });

  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}