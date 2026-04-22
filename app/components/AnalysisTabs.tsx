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

export default function AnalysisTabs() {
  const { palette } = useColorPalette();
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [ticker, setTicker] = useState("SPY");
  const [refreshKey, setRefreshKey] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [activePalette, setActivePalette] = useState(0);

  const handleRefresh = () => setRefreshKey(k => k + 1);

  return (
    <div className="w-full">
      {/* Settings Pill */}
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="flex items-center gap-2 px-4 py-2 border rounded-full transition shadow-sm"
          style={{ backgroundColor: palette.background, borderColor: palette.gridLines, color: palette.text }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="text-sm font-medium">Settings</span>
        </button>
      </div>

      {/* Color Palette Options */}
      {showSettings && (
        <div className="mb-6 p-4 border rounded-xl" style={{ backgroundColor: palette.background, borderColor: palette.gridLines }}>
          <div className="text-sm font-semibold mb-1" style={{ color: palette.text }}>Color Palette</div>
          <div className="text-xs mb-4" style={{ color: palette.text, opacity: 0.6 }}>Choose colors that work best for your vision</div>

          {/* Category: Colorblind Safe */}
          <div className="text-xs font-semibold mb-2 mt-4" style={{ color: palette.text, opacity: 0.7 }}>Colorblind Safe</div>
          <div className="flex flex-wrap gap-2 mb-3">
            {COLOR_PALETTES.filter(p => p.category === "Colorblind Safe").map((palette) => {
              const actualIndex = COLOR_PALETTES.indexOf(palette);
              return (
                <button
                  key={palette.name}
                  onClick={() => setActivePalette(actualIndex)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition ${
                    activePalette === actualIndex ? "border-slate-800" : "border-slate-200 hover:border-slate-400"
                  }`}
                >
                  <div className="flex gap-1">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: palette.bullish }} />
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: palette.bearish }} />
                  </div>
                  <span className="text-xs font-medium">{palette.label}</span>
                </button>
              );
            })}
          </div>

          {/* Category: High Contrast */}
          <div className="text-xs font-semibold text-slate-600 mb-2">High Contrast</div>
          <div className="flex flex-wrap gap-2 mb-3">
            {COLOR_PALETTES.filter(p => p.category === "High Contrast").map((palette) => {
              const actualIndex = COLOR_PALETTES.indexOf(palette);
              return (
                <button
                  key={palette.name}
                  onClick={() => setActivePalette(actualIndex)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition ${
                    activePalette === actualIndex ? "border-slate-800" : "border-slate-200 hover:border-slate-400"
                  }`}
                >
                  <div className="flex gap-1">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: palette.bullish }} />
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: palette.bearish }} />
                  </div>
                  <span className="text-xs font-medium">{palette.label}</span>
                </button>
              );
            })}
          </div>

          {/* Category: Standard & Other */}
          <div className="text-xs font-semibold text-slate-600 mb-2">Standard</div>
          <div className="flex flex-wrap gap-2">
            {COLOR_PALETTES.filter(p => p.category === "Standard" || p.category === "Dark" || p.category === "Nature").map((palette) => {
              const actualIndex = COLOR_PALETTES.indexOf(palette);
              return (
                <button
                  key={palette.name}
                  onClick={() => setActivePalette(actualIndex)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition ${
                    activePalette === actualIndex ? "border-slate-800" : "border-slate-200 hover:border-slate-400"
                  }`}
                >
                  <div className="flex gap-1">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: palette.bullish }} />
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: palette.bearish }} />
                  </div>
                  <span className="text-xs font-medium">{palette.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Big Picture - Above Tabs */}
      <div className="mb-6">
        <h3 className="text-lg font-bold text-slate-800 mb-2">{BIG_PICTURE[activeTab].title}</h3>
        <p className="text-slate-600 leading-relaxed">
          {BIG_PICTURE[activeTab].description}
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex overflow-x-auto gap-2 pb-4 mb-4">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-3 px-5 py-3 rounded-xl transition-all duration-300 whitespace-nowrap ${
              activeTab === tab.id
                ? "bg-slate-800 text-white shadow-lg"
                : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
            }`}
          >
            <div className="w-6 h-6 rounded-full border-2 flex items-center justify-center"
                 style={{ borderColor: activeTab === tab.id ? "white" : "#94a3b8" }}>
              <div className="w-2 h-2 rounded-full bg-current" />
            </div>
            <div className="text-left">
              <div className="font-semibold text-sm">{tab.label}</div>
              <div className={`text-xs ${activeTab === tab.id ? "text-slate-300" : "text-slate-400"}`}>
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
          className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none"
          placeholder="SPY, AAPL, MSFT, GOOGL, etc."
        />
        <button
          onClick={handleRefresh}
          className="px-5 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition"
        >
          Update
        </button>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {activeTab === "overview" && <MarketOverviewTab ticker={ticker} refreshKey={refreshKey} colors={COLOR_PALETTES[activePalette]} />}
        {activeTab === "trends" && <PriceTrendsTab ticker={ticker} refreshKey={refreshKey} colors={COLOR_PALETTES[activePalette]} />}
        {activeTab === "factors" && <MarketFactorsTab ticker={ticker} refreshKey={refreshKey} colors={COLOR_PALETTES[activePalette]} />}
        {activeTab === "signals" && <SignalsTab ticker={ticker} refreshKey={refreshKey} colors={COLOR_PALETTES[activePalette]} />}
        {activeTab === "strategy" && <StrategyTab ticker={ticker} refreshKey={refreshKey} colors={COLOR_PALETTES[activePalette]} />}
      </div>
    </div>
  );
}