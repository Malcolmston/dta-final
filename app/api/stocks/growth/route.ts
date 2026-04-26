import { NextRequest, NextResponse } from "next/server";
import { rateLimit, getClientIp } from "@/lib/rateLimit";

// Cache responses for 60 seconds
export const revalidate = 60;

export async function GET(request: NextRequest) {
  // Apply rate limiting (100 requests per minute per IP)
  const clientIp = getClientIp(request);
  const limit = rateLimit(`stocks-growth-${clientIp}`, { windowMs: 60000, maxRequests: 100 });

  if (!limit.success) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers: { "Retry-After": String(Math.ceil((limit.resetTime - Date.now()) / 1000)) } }
    );
  }

  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol");

  if (!symbol) {
    return NextResponse.json({ error: "Symbol is required" }, { status: 400 });
  }

  try {
    const url = `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${encodeURIComponent(symbol)}?modules=earningsTrend,earningsEstimate,revenueEstimate,growthEstimate`;

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      },
    });

    if (response.status === 401 || response.status === 403) {
      // Yahoo API is blocking unauthorized requests
      // Return placeholder data with a notice
      return NextResponse.json({
        data: {
          symbol,
          currentQuarterEarnings: null,
          nextQuarterEarnings: null,
          currentYearEarnings: null,
          nextYearEarnings: null,
          earningsTrend: null,
          revenueTrend: null,
          growthCurrentYear: null,
          growthNextYear: null,
          growthNext5Years: null,
          growthPast5Years: null,
        },
        notice: "Yahoo API access restricted. Growth estimates unavailable.",
        apiBlocked: true,
      });
    }

    if (!response.ok) {
      throw new Error(`Yahoo API error: ${response.status}`);
    }

    const json = await response.json();

    if (json.quoteSummary?.error) {
      throw new Error(json.quoteSummary.error.description || "Failed to fetch growth data");
    }

    const result = json.quoteSummary?.result?.[0];
    const earningsTrend = result?.earningsTrend || {};
    const earningsEstimate = result?.earningsEstimate || {};
    const growthEstimate = result?.growthEstimate || {};

    // Extract growth estimates
    const growthData = {
      symbol,
      currentQuarterEarnings: earningsEstimate?.currentQuarterEstimate?.raw || null,
      nextQuarterEarnings: earningsEstimate?.nextQuarterEstimate?.raw || null,
      currentYearEarnings: earningsEstimate?.currentYearEstimate?.raw || null,
      nextYearEarnings: earningsEstimate?.nextYearEstimate?.raw || null,
      earningsTrend: earningsTrend?.trend?.[0]?.earningsEstimate?.raw || null,
      revenueTrend: earningsTrend?.trend?.[0]?.revenueEstimate?.raw || null,
      growthCurrentYear: growthEstimate?.growthCurrentYear?.raw || null,
      growthNextYear: growthEstimate?.growthNextYear?.raw || null,
      growthNext5Years: growthEstimate?.growthNextFiveYears?.raw || null,
      growthPast5Years: growthEstimate?.growthPastFiveYears?.raw || null,
    };

    return NextResponse.json({ data: growthData });
  } catch (error) {
    console.error("Growth estimate fetch error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch growth data" },
      { status: 500 }
    );
  }
}