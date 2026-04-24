"use client";

import { useColorPalette } from "../context/ColorPaletteContext";
import MarketPredictor from "./MarketPredictor";
import PortfolioPieChart from "./PortfolioPieChart";
import SimplifiedChart from "./SimplifiedChart";
import CandlestickChart from "./CandlestickChart";

export default function OverviewSection() {
  const { palette } = useColorPalette();

  return (
    <div className="space-y-6">
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
              <p className="palette.text, opacity: 0.7">Click the Accessibility button in the toolbar to choose a color palette that works for your vision.</p>
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