"use client";

import { DashboardSection } from "./DashboardTabs";
import Card from "./Card";
import StatCard from "./StatCard";

interface SectionAnalyticsProps {
  section: DashboardSection;
}

const analyticsData: Record<DashboardSection, { title: string; metrics: { label: string; value: string; change: string; trend: "up" | "down" | "neutral" }[] }> = {
  overview: {
    title: "Market Overview",
    metrics: [
      { label: "S&P 500", value: "4,892.50", change: "+0.82%", trend: "up" },
      { label: "NASDAQ", value: "15,628.90", change: "+1.24%", trend: "up" },
      { label: "DOW", value: "38,519.80", change: "+0.35%", trend: "up" },
      { label: "Market Volatility", value: "13.45", change: "-2.1%", trend: "down" },
    ],
  },
  trends: {
    title: "Price Trends",
    metrics: [
      { label: "Avg Volume", value: "8.2M", change: "+12%", trend: "up" },
      { label: "Price Change (1W)", value: "+2.4%", change: "+0.8%", trend: "up" },
      { label: "Price Change (1M)", value: "+5.8%", change: "-1.2%", trend: "down" },
      { label: "52W High", value: "156.80", change: "-8%", trend: "down" },
    ],
  },
  factors: {
    title: "Key Factors",
    metrics: [
      { label: "Fed Rate", value: "5.25%", change: "0%", trend: "neutral" },
      { label: "Inflation", value: "3.2%", change: "-0.3%", trend: "down" },
      { label: "GDP Growth", value: "2.1%", change: "+0.4%", trend: "up" },
      { label: "Consumer Confidence", value: "78.5", change: "+2.1", trend: "up" },
    ],
  },
  sectors: {
    title: "Sector Performance",
    metrics: [
      { label: "Top Sector", value: "Technology", change: "+2.8%", trend: "up" },
      { label: "Bottom Sector", value: "Energy", change: "-1.2%", trend: "down" },
      { label: "Sectors Up", value: "8/11", change: "+2", trend: "up" },
      { label: "Sectors Down", value: "3/11", change: "-1", trend: "down" },
    ],
  },
  analysis: {
    title: "Technical Analysis",
    metrics: [
      { label: "Buy Signals", value: "15", change: "+3", trend: "up" },
      { label: "Sell Signals", value: "8", change: "-2", trend: "up" },
      { label: "Hold Signals", value: "12", change: "-1", trend: "down" },
      { label: "Market Sentiment", value: "Bullish", change: "+5%", trend: "up" },
    ],
  },
  portfolio: {
    title: "Portfolio Analytics",
    metrics: [
      { label: "Total Value", value: "$125,400", change: "+3.2%", trend: "up" },
      { label: "Day Change", value: "+$1,840", change: "+1.5%", trend: "up" },
      { label: "Best Performer", value: "+5.8%", change: "+0.2%", trend: "up" },
      { label: "Worst Performer", value: "-2.1%", change: "-0.5%", trend: "down" },
    ],
  },
  wealth: {
    title: "Wealth Management",
    metrics: [
      { label: "Net Worth", value: "$458,200", change: "+2.1%", trend: "up" },
      { label: "Assets", value: "$612,500", change: "+1.8%", trend: "up" },
      { label: "Liabilities", value: "$154,300", change: "-0.5%", trend: "down" },
      { label: "Savings Rate", value: "24.5%", change: "+1.2%", trend: "up" },
    ],
  },
};

function getTrendColor(trend: "up" | "down" | "neutral"): string {
  switch (trend) {
    case "up":
      return "text-green-600 bg-green-50";
    case "down":
      return "text-red-600 bg-red-50";
    default:
      return "text-gray-600 bg-gray-50";
  }
}

function getTrendIcon(trend: "up" | "down" | "neutral"): string {
  switch (trend) {
    case "up":
      return "↑";
    case "down":
      return "↓";
    default:
      return "→";
  }
}

export default function SectionAnalytics({ section }: SectionAnalyticsProps) {
  const data = analyticsData[section];

  return (
    <Card className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold" style={{ color: 'inherit' }}>{data.title}</h3>
        <span className="text-xs" style={{ opacity: 0.5 }}>Real-time</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {data.metrics.map((metric, index) => (
          <StatCard
            key={index}
            label={metric.label}
            value={metric.value}
            change={metric.change}
            trend={metric.trend}
          />
        ))}
      </div>
    </Card>
  );
}