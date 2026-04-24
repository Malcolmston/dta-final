import { NextRequest, NextResponse } from "next/server";
import { getQuote, getHistory, getIndicators, generatePortfolio, STOCK_TICKERS } from "@/lib/stocs";

export const revalidate = 60;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol") || "AAPL";
  const period = searchParams.get("period") || "1y";
  const action = searchParams.get("action") || "quote";

  try {
    let data;

    switch (action) {
      case "quote":
        data = await getQuote(symbol);
        break;

      case "history":
        data = await getHistory(symbol, period as Parameters<typeof getHistory>[1], "1d");
        break;

      case "indicators":
        data = await getIndicators(symbol, period as Parameters<typeof getIndicators>[1]);
        break;

      case "portfolio":
        data = await generatePortfolio(10000, "balanced", 30, 5);
        break;

      case "tickers":
        data = STOCK_TICKERS;
        break;

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    return NextResponse.json({ data, action, symbol });
  } catch (error) {
    console.error("Stocs API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}