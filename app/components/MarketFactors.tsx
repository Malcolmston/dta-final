"use client";

import { useColorPalette } from "@/app/context/ColorPaletteContext";

interface MarketFactor {
  id: string;
  title: string;
  description: string;
  impact: "positive" | "negative" | "neutral";
  details: string;
}

const marketFactors: MarketFactor[] = [
  {
    id: "supply-demand",
    title: "Supply & Demand",
    description: "When more people want to buy a stock than sell it, the price goes up. When more people sell than buy, the price goes down.",
    impact: "neutral",
    details:
      "This is the most fundamental factor. Think of it like any marketplace - if there's high demand for apples but few apples available, the price rises.",
  },
  {
    id: "earnings",
    title: "Company Earnings",
    description: "When companies make more profit, their stock prices tend to rise. Poor earnings can cause prices to drop.",
    impact: "neutral",
    details:
      "Companies report earnings every quarter. Strong earnings usually mean higher stock prices, while missed expectations can cause declines.",
  },
  {
    id: "economy",
    title: "Economic Indicators",
    description: "GDP growth, unemployment rates, and inflation all affect how investors feel about the market.",
    impact: "neutral",
    details:
      "A growing economy (high GDP, low unemployment) typically boosts stocks. High inflation can lead to interest rate hikes, which can slow growth.",
  },
  {
    id: "interest-rates",
    title: "Interest Rates",
    description: "When the Federal Reserve raises interest rates, stocks often become less attractive compared to bonds.",
    impact: "neutral",
    details:
      "Higher interest rates mean higher borrowing costs for companies, which can reduce their profits. Lower rates generally help stocks.",
  },
  {
    id: "sentiment",
    title: "Market Sentiment",
    description: "Investors' collective mood - whether they feel greedy or fearful - can drive prices up or down independently of fundamentals.",
    impact: "neutral",
    details:
      "The VIX index measures market fear. When fear is high, markets often drop. When confidence is high, markets tend to rise.",
  },
  {
    id: "news-events",
    title: "News & Events",
    description: "Breaking news, elections, wars, and pandemics can dramatically shift investor confidence and market direction.",
    impact: "neutral",
    details:
      "Unexpected events can cause rapid market movements. Positive news (new product launches) can boost stocks, while negative news (scandals) can hurt them.",
  },
  {
    id: "sector-trends",
    title: "Sector Trends",
    description: "Certain industries move together. Tech stocks might rise together, while utilities might fall.",
    impact: "neutral",
    details:
      "When a sector is doing well, most stocks in that sector tend to benefit. Understanding sector trends helps predict broader market movements.",
  },
  {
    id: "global-markets",
    title: "Global Markets",
    description: "What happens in other markets (Europe, Asia) can affect US markets, especially in our interconnected world.",
    impact: "neutral",
    details:
      "Markets around the world are connected. A major market crash in Asia or Europe can cause US markets to drop, and vice versa.",
  },
];

function getImpactColor(impact: MarketFactor["impact"], palette: any): string {
  switch (impact) {
    case "positive":
      return `${palette.positive}20`;
    case "negative":
      return `${palette.negative}20`;
    default:
      return palette.background;
  }
}

export default function MarketFactors() {
  const { palette } = useColorPalette();

  return (
    <div className="p-6" style={{ backgroundColor: palette.background, borderColor: palette.gridLines }}>
      <div className="mb-6">
        <h2 className="text-xl font-bold" style={{ color: palette.text }}>What Influences the Stock Market?</h2>
        <p className="mt-2" style={{ color: palette.text, opacity: 0.7 }}>
          Understanding these factors can help you make better investment decisions.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {marketFactors.map((factor) => (
          <div
            key={factor.id}
            className="rounded-lg border p-4 hover:shadow-md transition-shadow"
            style={{ backgroundColor: palette.background, borderColor: palette.gridLines }}
          >
            <div className="flex-1">
              <h3 className="font-semibold" style={{ color: palette.text }}>{factor.title}</h3>
              <p className="text-sm mt-1" style={{ color: palette.text, opacity: 0.7 }}>{factor.description}</p>
              <details className="mt-2">
                <summary className="text-xs cursor-pointer hover:opacity-80" style={{ color: palette.primary }}>
                  Learn more
                </summary>
                <p className="text-sm mt-2 pl-2 border-l-2" style={{ color: palette.text, opacity: 0.6, borderColor: palette.gridLines }}>
                  {factor.details}
                </p>
              </details>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-lg p-4 border" style={{ backgroundColor: palette.primary + "15", borderColor: palette.primary }}>
        <h3 className="font-semibold" style={{ color: palette.text }}>Key Takeaway</h3>
        <p className="text-sm mt-2" style={{ color: palette.text, opacity: 0.8 }}>
          Stock prices are influenced by a combination of these factors. No single factor
          determines the market - it&apos;s the interaction of all these elements that
          creates the complex system we call the stock market.
        </p>
      </div>
    </div>
  );
}