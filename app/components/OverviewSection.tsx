"use client";

import { useState } from "react";
import { useColorPalette, colorPalettes } from "../context/ColorPaletteContext";
import MarketPredictor from "./MarketPredictor";
import PortfolioPieChart from "./PortfolioPieChart";
import SimplifiedChart from "./SimplifiedChart";
import CandlestickChart from "./CandlestickChart";

type PaletteKey = keyof typeof colorPalettes;

type PaletteCategory = {
  title: string;
  keys: PaletteKey[];
};

const paletteCategories: PaletteCategory[] = [
  {
    title: "Standard",
    keys: ["default", "highContrast"],
  },
  {
    title: "Color Blindness (Red-Green)",
    keys: ["colorblind", "protanopia", "deuteranopia", "brownBlue", "tealOrange"],
  },
  {
    title: "Color Blindness (Blue-Yellow)",
    keys: ["tritanopia", "blueYellow", "cyanMagenta"],
  },
  {
    title: "Total Color Blindness",
    keys: ["grayscale"],
  },
  {
    title: "Low Vision",
    keys: ["lowVision"],
  },
  {
    title: "Sepia",
    keys: ["sepia"],
  },
];

export default function OverviewSection() {
  const { palette, paletteKey, setPaletteKey, isDarkMode, setIsDarkMode } = useColorPalette();
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="space-y-6">
      {/* Settings Pill */}
      <div className="flex justify-end">
        <div className="relative">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center gap-2 px-4 py-2 rounded-full border shadow-sm hover:shadow-md transition-shadow text-sm font-medium"
            style={{
              backgroundColor: palette.background,
              borderColor: palette.gridLines,
              color: palette.text,
            }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Accessibility
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: palette.primary }}
            />
          </button>

          {showSettings && (
            <div
              className="absolute right-0 top-full mt-2 w-80 rounded-xl shadow-lg border p-4 z-50"
              style={{
                backgroundColor: palette.background,
                borderColor: palette.gridLines,
              }}
            >
              <div className="mb-3">
                <h4 className="font-semibold" style={{ color: palette.text }}>Accessibility Settings</h4>
                <p className="text-xs mt-1" style={{ color: palette.text, opacity: 0.6 }}>
                  Choose colors that work for your vision. Each circle shows light (top) and dark (bottom).
                </p>
              </div>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {paletteCategories.map((category) => (
                  <div key={category.title}>
                    <h5 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: palette.text, opacity: 0.5 }}>
                      {category.title}
                    </h5>
                    <div className="space-y-2">
                      {category.keys.map((key) => (
                        <button
                          key={key}
                          onClick={() => setPaletteKey(key)}
                          className={`w-full text-left px-3 py-2 rounded-lg border transition-all ${
                            paletteKey === key
                              ? "ring-2 ring-offset-1"
                              : "hover:border-gray-300"
                          }`}
                          style={{
                            backgroundColor: paletteKey === key ? palette.primary + "10" : "transparent",
                            borderColor: paletteKey === key ? palette.primary : palette.gridLines,
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium" style={{ color: palette.text }}>
                              {isDarkMode ? colorPalettes[key].dark.name : colorPalettes[key].light.name}
                            </span>
                            {/* Split circle - 50/50 gradient */}
                            <div
                              className="w-6 h-6 rounded-full"
                              style={{
                                background: `linear-gradient(to bottom, ${colorPalettes[key].light.background} 50%, ${colorPalettes[key].dark.background} 50%)`,
                                border: `2px solid ${paletteKey === key ? palette.primary : palette.gridLines}`,
                              }}
                              title="Light (top) / Dark (bottom)"
                            />
                          </div>
                          {/* Color swatches - split to show light/dark */}
                          <div className="flex gap-1 mt-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{
                                background: `linear-gradient(135deg, ${colorPalettes[key].light.primary} 50%, ${colorPalettes[key].dark.primary} 50%)`,
                              }}
                              title="Primary"
                            />
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{
                                background: `linear-gradient(135deg, ${colorPalettes[key].light.secondary} 50%, ${colorPalettes[key].dark.secondary} 50%)`,
                              }}
                              title="Secondary"
                            />
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{
                                background: `linear-gradient(135deg, ${colorPalettes[key].light.positive} 50%, ${colorPalettes[key].dark.positive} 50%)`,
                              }}
                              title="Positive"
                            />
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{
                                background: `linear-gradient(135deg, ${colorPalettes[key].light.negative} 50%, ${colorPalettes[key].dark.negative} 50%)`,
                              }}
                              title="Negative"
                            />
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{
                                background: `linear-gradient(135deg, ${colorPalettes[key].light.accent} 50%, ${colorPalettes[key].dark.accent} 50%)`,
                              }}
                              title="Accent"
                            />
                          </div>
                          {/* Toggle shown when this palette is selected */}
                          {paletteKey === key && (
                            <div className="mt-3 pt-2 border-t" style={{ borderColor: palette.gridLines }}>
                              <div className="flex items-center justify-between">
                                <span className="text-xs" style={{ color: palette.text }}>Mode:</span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setIsDarkMode(!isDarkMode);
                                  }}
                                  className="flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium transition-colors"
                                  style={{
                                    backgroundColor: isDarkMode ? palette.secondary : palette.gridLines,
                                    color: isDarkMode ? palette.background : palette.text,
                                  }}
                                >
                                  {isDarkMode ? (
                                    <>
                                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                                      </svg>
                                      Dark
                                    </>
                                  ) : (
                                    <>
                                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                                      </svg>
                                      Light
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Why This Matters */}
      <div className="rounded-xl shadow-sm border p-6 transition-colors duration-300" style={{ backgroundColor: palette.background, borderColor: palette.gridLines }}>
        <h2 className="text-xl font-bold" style={{ color: palette.text }}>Why Stock Analysis Matters</h2>
        <p className="mb-4" style={{ color: palette.text, opacity: 0.7 }}>
          Understanding the stock market helps you make informed decisions about your financial future.
          Whether you're planning for retirement, building wealth, or just curious about how the economy works,
          having the right tools makes all the difference.
        </p>
        <div className="grid md:grid-cols-3 gap-4 mt-6">
          <div className="p-4 rounded-lg border transition-colors duration-300" style={{ backgroundColor: palette.background, borderColor: palette.gridLines }}>
            <div className="w-10 h-10 rounded-lg mb-2 flex items-center justify-center" style={{ backgroundColor: palette.primary + '20' }}>
              <svg className="w-5 h-5" style={{ color: palette.primary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <h3 className="font-semibold" style={{ color: palette.text }}>Make Smarter Decisions</h3>
            <p className="text-sm mt-1" style={{ color: palette.text, opacity: 0.7 }}>
              Visual data helps you spot patterns and trends that are hard to see in raw numbers.
            </p>
          </div>
          <div className="p-4 rounded-lg border transition-colors duration-300" style={{ backgroundColor: palette.background, borderColor: palette.gridLines }}>
            <div className="w-10 h-10 rounded-lg mb-2 flex items-center justify-center" style={{ backgroundColor: palette.positive + '20' }}>
              <svg className="w-5 h-5" style={{ color: palette.positive }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="font-semibold" style={{ color: palette.text }}>Track Your Progress</h3>
            <p className="text-sm mt-1" style={{ color: palette.text, opacity: 0.7 }}>
              Monitor your portfolio performance and see how your investments are doing at a glance.
            </p>
          </div>
          <div className="p-4 rounded-lg border transition-colors duration-300" style={{ backgroundColor: palette.background, borderColor: palette.gridLines }}>
            <div className="w-10 h-10 rounded-lg mb-2 flex items-center justify-center" style={{ backgroundColor: palette.secondary + '20' }}>
              <svg className="w-5 h-5" style={{ color: palette.secondary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="font-semibold" style={{ color: palette.text }}>Understand the Market</h3>
            <p className="text-sm mt-1" style={{ color: palette.text, opacity: 0.7 }}>
              Learn how different sectors and factors influence the overall market behavior.
            </p>
          </div>
        </div>
      </div>

      {/* Who This Is For */}
      <div className="rounded-xl shadow-sm border p-6" style={{ backgroundColor: palette.background, borderColor: palette.gridLines }}>
        <h2 className="text-xl font-bold" style={{ color: palette.text }}>Who This Is For</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: palette.primary + '20' }}>
              <svg className="w-5 h-5" style={{ color: palette.primary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold" style={{ color: palette.text }}>Individual Investors</h4>
              <p className="text-sm palette.text, opacity: 0.7">Track and analyze your personal portfolio</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: palette.positive + '20' }}>
              <svg className="w-5 h-5" style={{ color: palette.positive }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold" style={{ color: palette.text }}>Financial Advisors</h4>
              <p className="text-sm palette.text, opacity: 0.7">Present market insights to clients</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: palette.secondary + '20' }}>
              <svg className="w-5 h-5" style={{ color: palette.secondary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold" style={{ color: palette.text }}>Students & Learners</h4>
              <p className="text-sm palette.text, opacity: 0.7">Understand how markets work</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: palette.accent + '20' }}>
              <svg className="w-5 h-5" style={{ color: palette.accent }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold" style={{ color: palette.text }}>Researchers</h4>
              <p className="text-sm palette.text, opacity: 0.7">Analyze market data and patterns</p>
            </div>
          </div>
        </div>
      </div>

      {/* Simple Charts */}
      <div className="rounded-xl shadow-sm border p-6" style={{ backgroundColor: palette.background, borderColor: palette.gridLines }}>
        <h2 className="text-xl font-bold" style={{ color: palette.text }}>Simple Charts for Everyone</h2>
        <p className="palette.text, opacity: 0.7 mb-6">
          Our charts are designed to be easy to understand while still providing valuable insights.
        </p>

        <div className="space-y-8">
          {/* Market Overview Chart */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2" style={{ color: palette.text }}>
              <span className="w-6 h-6 rounded flex items-center justify-center text-sm" style={{ backgroundColor: palette.primary + '20', color: palette.primary }}>
                1
              </span>
              Market Overview
            </h3>
            <MarketPredictor />
            <p className="text-sm palette.text mt-2">
              Shows whether the overall market is feeling bullish (positive) or bearish (negative).
              Green means positive sentiment, red means negative.
            </p>
          </div>

          {/* Portfolio Chart */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2" style={{ color: palette.text }}>
              <span className="w-6 h-6 rounded flex items-center justify-center text-sm" style={{ backgroundColor: palette.primary + '20', color: palette.primary }}>
                2
              </span>
              Your Portfolio
            </h3>
            <PortfolioPieChart />
            <p className="text-sm palette.text mt-2">
              See how your investments are distributed across different sectors.
              Bigger slice = more money in that area.
            </p>
          </div>

          {/* Simple Trend Chart */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2" style={{ color: palette.text }}>
              <span className="w-6 h-6 rounded flex items-center justify-center text-sm" style={{ backgroundColor: palette.primary + '20', color: palette.primary }}>
                3
              </span>
              Price Trend
            </h3>
            <CandlestickChart ticker="AAPL" />
            <p className="text-sm palette.text mt-2">
              A simple line showing how prices have changed over time.
              Going up = good! Use the buttons above to change the time period.
            </p>
          </div>
        </div>
      </div>

      {/* How to Use */}
      <div className="rounded-xl shadow-sm border p-6" style={{ backgroundColor: palette.background, borderColor: palette.gridLines }}>
        <h2 className="text-xl font-bold" style={{ color: palette.text }}>How to Use This Dashboard</h2>
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full text-white flex items-center justify-center font-bold flex-shrink-0" style={{ backgroundColor: palette.primary }}>
              1
            </div>
            <div>
              <h4 className="font-semibold" style={{ color: palette.text }}>Choose Your View</h4>
              <p className="palette.text, opacity: 0.7">Use the "Simple Mode" button for easy-to-understand charts, or "Detailed Mode" for more advanced analysis.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full text-white flex items-center justify-center font-bold flex-shrink-0" style={{ backgroundColor: palette.primary }}>
              2
            </div>
            <div>
              <h4 className="font-semibold" style={{ color: palette.text }}>Navigate Sections</h4>
              <p className="palette.text, opacity: 0.7">Use the tabs on the right to switch between Overview, Trends, Sectors, Analysis, and Portfolio views.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full text-white flex items-center justify-center font-bold flex-shrink-0" style={{ backgroundColor: palette.primary }}>
              3
            </div>
            <div>
              <h4 className="font-semibold" style={{ color: palette.text }}>Customize Colors</h4>
              <p className="palette.text, opacity: 0.7">Click the Accessibility button above to choose a color palette that works for your vision.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full text-white flex items-center justify-center font-bold flex-shrink-0" style={{ backgroundColor: palette.primary }}>
              4
            </div>
            <div>
              <h4 className="font-semibold" style={{ color: palette.text }}>Read the Explanations</h4>
              <p className="palette.text, opacity: 0.7">Each chart includes a simple explanation below it to help you understand what you're seeing.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Data Source Legend - Issue 10 */}
      <div className="rounded-xl shadow-sm border p-4" style={{ backgroundColor: palette.background, borderColor: palette.gridLines }}>
        <h3 className="font-semibold mb-3" style={{ color: palette.text }}>Data Source Legend</h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: palette.positive }}></span>
            <span className="text-sm" style={{ color: palette.text }}>Real Data (Yahoo Finance)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
            <span className="text-sm" style={{ color: palette.text }}>Simulated/Demo</span>
          </div>
        </div>
        <p className="text-xs mt-2" style={{ color: palette.text, opacity: 0.6 }}>
          Stock prices are real-time from Yahoo Finance. Portfolio allocations and projections are simulated for demonstration purposes.
        </p>
      </div>

      {/* Meaningful Summary Stats - Issue 11 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl shadow-sm border p-4" style={{ backgroundColor: palette.background, borderColor: palette.gridLines }}>
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            <h4 className="font-semibold palette.text">Market Trend</h4>
          </div>
          <p className="text-2xl font-bold" style={{ color: palette.positive }}>Bullish</p>
          <p className="text-sm palette.text">Major indices showing upward momentum over the past 30 days</p>
        </div>
        <div className="rounded-xl shadow-sm border p-4" style={{ backgroundColor: palette.background, borderColor: palette.gridLines }}>
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <h4 className="font-semibold palette.text">Volatility Level</h4>
          </div>
          <p className="text-2xl font-bold" style={{ color: palette.secondary }}>Moderate</p>
          <p className="text-sm palette.text">Market volatility is within normal ranges for this period</p>
        </div>
        <div className="rounded-xl shadow-sm border p-4" style={{ backgroundColor: palette.background, borderColor: palette.gridLines }}>
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h4 className="font-semibold palette.text">Best Outlook</h4>
          </div>
          <p className="text-2xl font-bold" style={{ color: palette.primary }}>6-12 Months</p>
          <p className="text-sm palette.text">Historical patterns suggest positive outlook for the medium term</p>
        </div>
      </div>
    </div>
  );
}