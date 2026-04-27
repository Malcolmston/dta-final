import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rateLimit";
import { securityCheck, getClientIp as getSecClientIp, secureRateLimit, logSecurityEvent } from "@/lib/security";

function getClientIp(request: NextRequest): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || request.headers.get("x-real-ip")
    || request.headers.get("cf-connecting-ip")
    || "unknown";
}

// Webhook token from environment - must be set in Vercel project settings
const WEBHOOK_TOKEN = process.env.WEBHOOK_TOKEN || process.env.WEBHOOK_SECRET;

/**
 * Validate webhook token from request header
 * Uses constant-time comparison to prevent timing attacks
 */
function validateToken(request: NextRequest): boolean {
  // If no token configured, allow all requests (dev mode)
  if (!WEBHOOK_TOKEN) {
    console.warn("[Webhook] No WEBHOOK_TOKEN configured - allowing all requests");
    return true;
  }

  const token = request.headers.get("x-webhook-token") || request.headers.get("authorization")?.replace("Bearer ", "");

  if (!token) {
    console.warn("[Webhook] Missing token in request");
    return false;
  }

  // Constant-time comparison to prevent timing attacks
  if (token.length !== WEBHOOK_TOKEN.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < token.length; i++) {
    result |= token.charCodeAt(i) ^ WEBHOOK_TOKEN.charCodeAt(i);
  }

  return result === 0;
}

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
  // Security check first
  const securityResult = securityCheck(request);
  if (!securityResult.allowed) {
    logSecurityEvent({
      type: "BLOCK",
      ip: getSecClientIp(request),
      userAgent: request.headers.get("user-agent") || "unknown",
      path: request.nextUrl.pathname,
      details: `Request blocked: ${securityResult.reason}`,
      severity: securityResult.severity || "medium",
    });
    return NextResponse.json(
      { error: securityResult.reason || "Request blocked" },
      { status: 403 }
    );
  }

  // Validate webhook token
  if (!validateToken(request)) {
    return NextResponse.json(
      { error: "Invalid or missing webhook token. Provide X-Webhook-Token header or set WEBHOOK_TOKEN env var." },
      {
        status: 401,
        headers: {
          "WWW-Authenticate": 'Bearer realm="webhook"',
        },
      }
    );
  }

  const clientIp = getClientIp(request);
  const limit = secureRateLimit(`webhook-${clientIp}`, { windowMs: 60000, maxRequests: 500 });

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
          const historyItems = Array.isArray(quoteData.data) ? quoteData.data : [];
          const latest = historyItems[historyItems.length - 1];
          const previous = historyItems[historyItems.length - 2];
          data = {
            symbol,
            price: latest?.close || 0,
            change: latest?.close && previous?.close
              ? ((latest.close - previous.close) / previous.close) * 100
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
                const historyItems = Array.isArray(qd.data) ? qd.data : [];
                const latest = historyItems[historyItems.length - 1];
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

    return NextResponse.json(
      {
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
      },
      {
        headers: {
          "Cache-Control": "public, max-age=30, s-maxage=60, stale-while-revalidate=300",
        },
      }
    );

  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST handler for webhook - accepts JSON body with action and parameters
 */
export async function POST(request: NextRequest) {
  // Security check first
  const securityResult = securityCheck(request);
  if (!securityResult.allowed) {
    logSecurityEvent({
      type: "BLOCK",
      ip: getSecClientIp(request),
      userAgent: request.headers.get("user-agent") || "unknown",
      path: request.nextUrl.pathname,
      details: `Request blocked: ${securityResult.reason}`,
      severity: securityResult.severity || "medium",
    });
    return NextResponse.json(
      { error: securityResult.reason || "Request blocked" },
      { status: 403 }
    );
  }

  // Validate webhook token
  if (!validateToken(request)) {
    return NextResponse.json(
      { error: "Invalid or missing webhook token. Provide X-Webhook-Token header or set WEBHOOK_TOKEN env var." },
      {
        status: 401,
        headers: {
          "WWW-Authenticate": 'Bearer realm="webhook"',
        },
      }
    );
  }

  const clientIp = getClientIp(request);
  const limit = secureRateLimit(`webhook-${clientIp}`, { windowMs: 60000, maxRequests: 500 });

  if (!limit.success) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers: { "Retry-After": String(Math.ceil((limit.resetTime - Date.now()) / 1000)) } }
    );
  }

  try {
    const body = await request.json();
    const url = new URL(request.url);
    const baseUrl = `${url.protocol}//${url.host}`;

    const { action, symbol, period, interval, tickers, types, ...extra } = body;

    if (!symbol) {
      return NextResponse.json(
        { error: "Symbol is required in request body" },
        { status: 400 }
      );
    }

    const symbolUpper = symbol.toUpperCase();
    const rawPeriod = period || "1y";
    const resolvedPeriod = rawPeriod === "all" ? "max" : rawPeriod;
    const resolvedInterval = interval || "1d";

    try {
      let data: unknown;
      let error: string | null = null;

      switch (action) {
        case "history":
          const historyRes = await fetch(
            `${baseUrl}/api/stocks/history?symbol=${encodeURIComponent(symbolUpper)}&period=${resolvedPeriod}&interval=${resolvedInterval}`
          );
          if (!historyRes.ok) {
            const err = await historyRes.json();
            error = err.error || "Failed to fetch history";
          } else {
            data = await historyRes.json();
          }
          break;

        case "quote":
          const quoteRes = await fetch(
            `${baseUrl}/api/stocks/history?symbol=${encodeURIComponent(symbolUpper)}&period=1d&interval=1m`
          );
          if (!quoteRes.ok) {
            const err = await quoteRes.json();
            error = err.error || "Failed to fetch quote";
          } else {
            const quoteData = await quoteRes.json();
            const historyItems = Array.isArray(quoteData.data) ? quoteData.data : [];
            const latest = historyItems[historyItems.length - 1];
            const previous = historyItems[historyItems.length - 2];
            data = {
              symbol: symbolUpper,
              price: latest?.close || 0,
              change: latest?.close && previous?.close
                ? ((latest.close - previous.close) / previous.close) * 100
                : 0,
              volume: latest?.volume || 0,
              timestamp: latest?.date || new Date().toISOString(),
            };
          }
          break;

        case "growth":
          const growthRes = await fetch(
            `${baseUrl}/api/stocks/growth?symbol=${encodeURIComponent(symbolUpper)}`
          );
          if (!growthRes.ok) {
            const err = await growthRes.json();
            error = err.error || "Failed to fetch growth";
          } else {
            data = await growthRes.json();
          }
          break;

        case "forecast":
          const forecastRes = await fetch(
            `${baseUrl}/api/stocks/forecast?ticker=${encodeURIComponent(symbolUpper)}&period=${resolvedPeriod}`
          );
          if (!forecastRes.ok) {
            const err = await forecastRes.json();
            error = err.error || "Failed to fetch forecast";
          } else {
            data = await forecastRes.json();
          }
          break;

        case "signals":
          const signalsRes = await fetch(
            `${baseUrl}/api/stocks/signals?symbol=${encodeURIComponent(symbolUpper)}`
          );
          if (!signalsRes.ok) {
            const err = await signalsRes.json();
            error = err.error || "Failed to fetch signals";
          } else {
            data = await signalsRes.json();
          }
          break;

        case "momentum":
          const momentumRes = await fetch(
            `${baseUrl}/api/stocks/momentum?symbol=${encodeURIComponent(symbolUpper)}&period=${resolvedPeriod}`
          );
          if (!momentumRes.ok) {
            const err = await momentumRes.json();
            error = err.error || "Failed to fetch momentum";
          } else {
            data = await momentumRes.json();
          }
          break;

        case "heatmap":
          const heatmapTickers = tickers?.split(",").map((s: string) => s.trim().toUpperCase()).filter((s: string) => s) || [symbolUpper];
          const heatmapRes = await fetch(
            `${baseUrl}/api/heatmap?tickers=${encodeURIComponent(heatmapTickers.join(","))}`
          );
          if (!heatmapRes.ok) {
            const err = await heatmapRes.json();
            error = err.error || "Failed to fetch heatmap";
          } else {
            data = await heatmapRes.json();
          }
          break;

        case "batch":
          const batchTypes = types?.split(",").filter((t: string) => t) || ["history", "quote"];
          const batchData: Record<string, unknown> = {};

          for (const type of batchTypes) {
            try {
              if (type === "history") {
                const histRes = await fetch(
                  `${baseUrl}/api/stocks/history?symbol=${encodeURIComponent(symbolUpper)}&period=${resolvedPeriod}&interval=${resolvedInterval}`
                );
                if (histRes.ok) batchData.history = await histRes.json();
              } else if (type === "quote") {
                const quoteRes2 = await fetch(
                  `${baseUrl}/api/stocks/history?symbol=${encodeURIComponent(symbolUpper)}&period=1d&interval=1m`
                );
                if (quoteRes2.ok) {
                  const qd = await quoteRes2.json();
                  const historyItems = Array.isArray(qd.data) ? qd.data : [];
                  const latest = historyItems[historyItems.length - 1];
                  batchData.quote = {
                    symbol: symbolUpper,
                    price: latest?.close || 0,
                    timestamp: latest?.date || new Date().toISOString(),
                  };
                }
              } else if (type === "growth") {
                const growRes2 = await fetch(
                  `${baseUrl}/api/stocks/growth?symbol=${encodeURIComponent(symbolUpper)}`
                );
                if (growRes2.ok) batchData.growth = await growRes2.json();
              }
            } catch {
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

      return NextResponse.json(
        {
          success: true,
          data,
          meta: {
            symbol: symbolUpper,
            action: action || "unknown",
            period: resolvedPeriod,
            interval: resolvedInterval,
            timestamp: new Date().toISOString(),
          }
        },
        {
          headers: {
            "Cache-Control": "public, max-age=30, s-maxage=60, stale-while-revalidate=300",
          },
        }
      );

    } catch (err) {
      console.error("Webhook POST error:", err);
      return NextResponse.json(
        { error: err instanceof Error ? err.message : "Internal server error" },
        { status: 500 }
      );
    }

  } catch (err) {
    console.error("Webhook POST parse error:", err);
    return NextResponse.json(
      { error: "Invalid JSON body. Provide { action, symbol, period, ... }" },
      { status: 400 }
    );
  }
}
