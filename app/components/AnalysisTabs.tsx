"use client";

import { useState } from "react";
import { useColorPalette } from "../context/ColorPaletteContext";
import MarketOverviewTab from "./tabs/MarketOverviewTab";
import PriceTrendsTab from "./tabs/PriceTrendsTab";
import MarketFactorsTab from "./tabs/MarketFactorsTab";
import SignalsTab from "./tabs/SignalsTab";
import StrategyTab from "./tabs/StrategyTab";

type TabId = "overview" | "trends" | "factors" | "signals" | "strategy";

interface Tab {
  id: TabId;
  label: string;
  description: string;
}

const TABS: Tab[] = [
  { id: "overview", label: "Market Overview", description: "Big picture of market health" },
  { id: "trends", label: "Price Trends", description: "Patterns and fluctuations" },
  { id: "factors", label: "Market Factors", description: "What drives the market" },
  { id: "signals", label: "Buy/Sell Signals", description: "Trading indicators" },
  { id: "strategy", label: "Portfolio Strategy", description: "Recommendations" },
];

const BIG_PICTURE: Record<TabId, { title: string; description: string }> = {
  overview: {
    title: "The Big Picture",
    description: "This chart shows the overall market direction over the past 3 months. The line represents the closing price, while the shaded area shows the trading range. When the line trends upward, the market is generally bullish (optimistic); when it trends down, it's bearish (pessimistic)."
  },
  trends: {
    title: "The Big Picture",
    description: "Price trends show how stocks move over time. We use Simple Moving Averages (SMAs) to smooth out daily fluctuations and identify the underlying trend. The 20-day SMA shows short-term trends, the 50-day SMA shows medium-term trends, and the 200-day SMA shows long-term trends."
  },
  factors: {
    title: "The Big Picture",
    description: "Stock prices fluctuate based on multiple factors. This chart shows daily returns - the percentage change from one day to the next. Understanding these factors helps you make better investment decisions and manage your portfolio risk."
  },
  signals: {
    title: "The Big Picture",
    description: "Technical indicators help identify potential buy and sell opportunities. We use the MACD (Moving Average Convergence Divergence) indicator, which compares short-term and long-term moving averages to identify trend changes."
  },
  strategy: {
    title: "The Big Picture",
    description: "A well-structured portfolio balances growth potential with risk management. This section provides recommendations tailored for a larger portfolio owner with limited stock market experience."
  }
};

// Color palettes - user selectable
const COLOR_PALETTES = [
  {
    name: "Ocean" as const,
    label: "Default" as const,
    category: "Standard" as const,
    description: "Classic blue/green/red" as const,
    bullish: "#10b981" as const,
    bearish: "#ef4444" as const,
    primary: "#1e3a5f" as const,
    accent: "#f59e0b" as const,
    chartLine: "#2563eb" as const,
    neutral: "#64748b" as const,
  },
  {
    name: "BlueGold" as const,
    label: "Blue/Gold" as const,
    category: "Colorblind Safe" as const,
    description: "Blue & gold - safe for deuteranopia" as const,
    bullish: "#0077bb" as const,
    bearish: "#ee7733" as const,
    primary: "#1e3a5f" as const,
    accent: "#f59e0b" as const,
    chartLine: "#0077bb" as const,
    neutral: "#64748b" as const,
  },
  {
    name: "BlueOrange" as const,
    label: "Blue/Orange" as const,
    category: "Colorblind Safe" as const,
    description: "Blue & orange - safe for protanopia" as const,
    bullish: "#0072b2" as const,
    bearish: "#d55e00" as const,
    primary: "#1e3a5f" as const,
    accent: "#f59e0b" as const,
    chartLine: "#0072b2" as const,
    neutral: "#64748b" as const,
  },
  {
    name: "TealRed" as const,
    label: "Teal/Red" as const,
    category: "High Contrast" as const,
    description: "High contrast teal & red" as const,
    bullish: "#14b8a6" as const,
    bearish: "#dc2626" as const,
    primary: "#0f172a" as const,
    accent: "#f59e0b" as const,
    chartLine: "#14b8a6" as const,
    neutral: "#94a3b8" as const,
  },
  {
    name: "LimeMagenta" as const,
    label: "Lime/Magenta" as const,
    category: "High Contrast" as const,
    description: "Lime green & magenta - very high contrast" as const,
    bullish: "#84cc16" as const,
    bearish: "#d946ef" as const,
    primary: "#1e3a5f" as const,
    accent: "#f59e0b" as const,
    chartLine: "#84cc16" as const,
    neutral: "#64748b" as const,
  },
  {
    name: "Midnight" as const,
    label: "Midnight" as const,
    category: "Dark" as const,
    description: "Dark theme with soft colors" as const,
    bullish: "#34d399" as const,
    bearish: "#f87171" as const,
    primary: "#0f172a" as const,
    accent: "#fbbf24" as const,
    chartLine: "#3b82f6" as const,
    neutral: "#94a3b8" as const,
  },
  {
    name: "Forest" as const,
    label: "Forest" as const,
    category: "Nature" as const,
    description: "Natural green tones" as const,
    bullish: "#16a34a" as const,
    bearish: "#dc2626" as const,
    primary: "#14532d" as const,
    accent: "#eab308" as const,
    chartLine: "#15803d" as const,
    neutral: "#65a30d" as const,
  },
];

interface AnalysisTabsProps {
  showSettings?: boolean;
}

export default function AnalysisTabs({ showSettings = false }: AnalysisTabsProps) {
  const { palette } = useColorPalette();
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [ticker, setTicker] = useState("SPY");
  const [refreshKey, setRefreshKey] = useState(0);
  const [activePalette, setActivePalette] = useState(0);

  const handleRefresh = () => setRefreshKey(k => k + 1);

  return (
    <div className="w-full relative">
      {/* Color Palette Options - Absolute Popup */}
      {showSettings && (
        <div className="absolute z-50 mt-2 p-4 border rounded-xl shadow-lg" style={{ backgroundColor: palette.background, borderColor: palette.gridLines, minWidth: '280px', right: '2rem', top: '100%' }}>
          <div className="text-sm font-semibold mb-1" style={{ color: palette.text }}>Color Palette</div>
          <div className="text-xs mb-3" style={{ color: palette.text, opacity: 0.6 }}>Choose colors for charts</div>

          {/* Category: Colorblind Safe */}
          <div className="text-xs font-semibold mb-2 mt-3" style={{ color: palette.text, opacity: 0.7 }}>Colorblind Safe</div>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {COLOR_PALETTES.filter(p => p.category === "Colorblind Safe").map((palette) => {
              const actualIndex = COLOR_PALETTES.indexOf(palette);
              return (
                <button
                  key={palette.name}
                  onClick={() => setActivePalette(actualIndex)}
                  className={`flex items-center gap-1.5 px-2 py-1 rounded border transition ${
                    activePalette === actualIndex ? "border-slate-800" : "border-slate-200 hover:border-slate-400"
                  }`}
                >
                  <div className="flex gap-0.5">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: palette.bullish }} />
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: palette.bearish }} />
                  </div>
                  <span className="text-xs">{palette.label}</span>
                </button>
              );
            })}
          </div>

          {/* Category: High Contrast */}
          <div className="text-xs font-semibold text-slate-600 mb-1.5">High Contrast</div>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {COLOR_PALETTES.filter(p => p.category === "High Contrast").map((palette) => {
              const actualIndex = COLOR_PALETTES.indexOf(palette);
              return (
                <button
                  key={palette.name}
                  onClick={() => setActivePalette(actualIndex)}
                  className={`flex items-center gap-1.5 px-2 py-1 rounded border transition ${
                    activePalette === actualIndex ? "border-slate-800" : "border-slate-200 hover:border-slate-400"
                  }`}
                >
                  <div className="flex gap-0.5">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: palette.bullish }} />
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: palette.bearish }} />
                  </div>
                  <span className="text-xs">{palette.label}</span>
                </button>
              );
            })}
          </div>

          {/* Category: Standard & Other */}
          <div className="text-xs font-semibold text-slate-600 mb-1.5">Standard</div>
          <div className="flex flex-wrap gap-1.5">
            {COLOR_PALETTES.filter(p => p.category === "Standard" || p.category === "Dark" || p.category === "Nature").map((palette) => {
              const actualIndex = COLOR_PALETTES.indexOf(palette);
              return (
                <button
                  key={palette.name}
                  onClick={() => setActivePalette(actualIndex)}
                  className={`flex items-center gap-1.5 px-2 py-1 rounded border transition ${
                    activePalette === actualIndex ? "border-slate-800" : "border-slate-200 hover:border-slate-400"
                  }`}
                >
                  <div className="flex gap-0.5">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: palette.bullish }} />
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: palette.bearish }} />
                  </div>
                  <span className="text-xs">{palette.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Big Picture - Above Tabs */}
      <div className="mb-6">
        <h3 className="text-lg font-bold mb-2" style={{ color: palette.text }}>{BIG_PICTURE[activeTab].title}</h3>
        <p className="leading-relaxed" style={{ color: palette.text, opacity: 0.7 }}>
          {BIG_PICTURE[activeTab].description}
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex overflow-x-auto gap-2 pb-4 mb-4">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex items-center gap-3 px-5 py-3 rounded-xl transition-all duration-300 whitespace-nowrap"
            style={{
              backgroundColor: activeTab === tab.id ? palette.primary : palette.background,
              color: activeTab === tab.id ? "#ffffff" : palette.text,
              border: `1px solid ${activeTab === tab.id ? palette.primary : palette.gridLines}`,
            }}
          >
            <div className="w-6 h-6 rounded-full border-2 flex items-center justify-center"
                 style={{ borderColor: activeTab === tab.id ? "#ffffff" : palette.gridLines }}>
              <div className="w-2 h-2 rounded-full bg-current" />
            </div>
            <div className="text-left">
              <div className="font-semibold text-sm">{tab.label}</div>
              <div className="text-xs" style={{ opacity: activeTab === tab.id ? 0.8 : 0.6 }}>
                {tab.description}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Ticker Search - Under Tabs */}
      <div className="flex gap-3 mb-6">
        <input
          type="text"
          value={ticker}
          onChange={(e) => setTicker(e.target.value.toUpperCase())}
          onKeyDown={(e) => e.key === "Enter" && handleRefresh()}
          className="flex-1 px-4 py-2 rounded-lg outline-none transition"
          style={{
            border: `1px solid ${palette.gridLines}`,
            color: palette.text,
            backgroundColor: palette.background,
          }}
          placeholder="SPY, AAPL, MSFT, GOOGL, etc."
        />
        <button
          onClick={handleRefresh}
          className="px-5 py-2 rounded-lg transition"
          style={{ backgroundColor: palette.primary, color: "#ffffff" }}
        >
          Update
        </button>
      </div>

      {/* Tab Content */}
      <div className="rounded-2xl shadow-sm border overflow-hidden" style={{ backgroundColor: palette.background, borderColor: palette.gridLines }}>
        {activeTab === "overview" && <MarketOverviewTab ticker={ticker} refreshKey={refreshKey} colors={COLOR_PALETTES[activePalette]} />}
        {activeTab === "trends" && <PriceTrendsTab ticker={ticker} refreshKey={refreshKey} colors={COLOR_PALETTES[activePalette]} />}
        {activeTab === "factors" && <MarketFactorsTab ticker={ticker} refreshKey={refreshKey} colors={COLOR_PALETTES[activePalette]} />}
        {activeTab === "signals" && <SignalsTab ticker={ticker} refreshKey={refreshKey} colors={COLOR_PALETTES[activePalette]} />}
        {activeTab === "strategy" && <StrategyTab ticker={ticker} refreshKey={refreshKey} colors={COLOR_PALETTES[activePalette]} />}
      </div>
    </div>
  );
}