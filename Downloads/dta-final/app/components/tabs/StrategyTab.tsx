"use client";

const COLOR_PALETTES = [
  { name: "Ocean", label: "Default", category: "Standard", description: "Classic blue/green/red", bullish: "#10b981", bearish: "#ef4444", primary: "#1e3a5f", accent: "#f59e0b", chartLine: "#2563eb", neutral: "#64748b" },
  { name: "BlueGold", label: "Blue/Gold", category: "Colorblind Safe", description: "Blue & gold - safe for deuteranopia", bullish: "#0077bb", bearish: "#ee7733", primary: "#1e3a5f", accent: "#f59e0b", chartLine: "#0077bb", neutral: "#64748b" },
  { name: "BlueOrange", label: "Blue/Orange", category: "Colorblind Safe", description: "Blue & orange - safe for protanopia", bullish: "#0072b2", bearish: "#d55e00", primary: "#1e3a5f", accent: "#f59e0b", chartLine: "#0072b2", neutral: "#64748b" },
  { name: "TealRed", label: "Teal/Red", category: "High Contrast", description: "High contrast teal & red", bullish: "#14b8a6", bearish: "#dc2626", primary: "#0f172a", accent: "#f59e0b", chartLine: "#14b8a6", neutral: "#94a3b8" },
  { name: "LimeMagenta", label: "Lime/Magenta", category: "High Contrast", description: "Lime green & magenta - very high contrast", bullish: "#84cc16", bearish: "#d946ef", primary: "#1e3a5f", accent: "#f59e0b", chartLine: "#84cc16", neutral: "#64748b" },
  { name: "Midnight", label: "Midnight", category: "Dark", description: "Dark theme with soft colors", bullish: "#34d399", bearish: "#f87171", primary: "#0f172a", accent: "#fbbf24", chartLine: "#3b82f6", neutral: "#94a3b8" },
  { name: "Forest", label: "Forest", category: "Nature", description: "Natural green tones", bullish: "#16a34a", bearish: "#dc2626", primary: "#14532d", accent: "#eab308", chartLine: "#15803d", neutral: "#65a30d" },
] as const;

type ColorPalette = typeof COLOR_PALETTES[number];

interface StrategyTabProps {
  ticker: string;
  refreshKey: number;
  colors: ColorPalette;
}

export default function StrategyTab({ ticker, refreshKey, colors }: StrategyTabProps) {
  // The ticker and refreshKey props are kept for interface consistency but not used in this static component
  return (
    <div className="p-6">
      {/* Strategy Components - Diagram Style Boxes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-5 text-white">
          <div className="text-lg font-semibold mb-3">Core Holdings (60-70%)</div>
          <p className="text-slate-300 text-sm">
            Index funds (S&P 500, total market) provide broad market exposure with low fees. These are your
            stable, long-term investments.
          </p>
        </div>
        <div className="bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl p-5 text-white">
          <div className="text-lg font-semibold mb-3">Growth Assets (20-30%)</div>
          <p className="text-slate-300 text-sm">
            Individual stocks or sector ETFs for higher growth potential. Limit to companies you understand
            and believe in for the long term.
          </p>
        </div>
        <div className="bg-gradient-to-br from-slate-600 to-slate-700 rounded-xl p-5 text-white">
          <div className="text-lg font-semibold mb-3">Defensive Holdings (10-20%)</div>
          <p className="text-slate-300 text-sm">
            Bonds, utilities, and consumer staples that perform relatively well during market downturns.
            These provide portfolio stability.
          </p>
        </div>
        <div className="bg-gradient-to-br from-amber-600 to-amber-700 rounded-xl p-5 text-white">
          <div className="text-lg font-semibold mb-3">Cash Reserve (5-10%)</div>
          <p className="text-amber-100 text-sm">
            Keep liquid cash for opportunities or emergencies. Money market funds offer better returns
            than regular savings accounts.
          </p>
        </div>
      </div>

      {/* Key Principles - Numbered Diagram */}
      <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 mb-6">
        <h4 className="font-semibold text-slate-800 mb-4">Key Principles for Large Portfolios</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="w-10 h-10 rounded-full bg-slate-800 text-white text-lg font-bold flex items-center justify-center mx-auto mb-2">1</div>
            <div className="font-semibold text-slate-700">Diversify</div>
            <div className="text-sm text-slate-500">Don't put more than 5% in any single stock</div>
          </div>
          <div className="text-center">
            <div className="w-10 h-10 rounded-full bg-slate-800 text-white text-lg font-bold flex items-center justify-center mx-auto mb-2">2</div>
            <div className="font-semibold text-slate-700">Dollar-Cost Average</div>
            <div className="text-sm text-slate-500">Invest regularly regardless of market conditions</div>
          </div>
          <div className="text-center">
            <div className="w-10 h-10 rounded-full bg-slate-800 text-white text-lg font-bold flex items-center justify-center mx-auto mb-2">3</div>
            <div className="font-semibold text-slate-700">Rebalance Annually</div>
            <div className="text-sm text-slate-500">Review allocations once per year</div>
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl p-5 border border-slate-200 mb-6">
        <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-slate-800 text-white text-xs flex items-center justify-center">i</span>
          Key Insights
        </h4>
        <ul className="space-y-2 text-slate-600">
          <li className="flex items-start gap-2">
            <span className="text-emerald-500 mt-1">-</span>
            <span>Larger portfolios benefit more from professional management - consider working with a fee-only fiduciary advisor</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-500 mt-1">-</span>
            <span>Tax efficiency becomes important - hold index funds in tax-advantaged accounts (401k, IRA)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-500 mt-1">-</span>
            <span>Asset allocation (stocks vs bonds) is the primary driver of portfolio returns - more stocks = more risk and reward</span>
          </li>
        </ul>
      </div>

      {/* Recommendations */}
      <div className="bg-emerald-50 rounded-xl p-5 border border-emerald-200">
        <h4 className="font-semibold text-emerald-800 mb-3 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs flex items-center justify-center">R</span>
          Actionable Recommendations
        </h4>
        <ul className="space-y-3 text-emerald-700">
          <li className="flex items-start gap-2">
            <span className="text-emerald-500 mt-1 text-lg">[1]</span>
            <div>
              <span className="font-medium">Start with broad index funds</span>
              <p className="text-sm text-emerald-600">VTI (Total Stock Market), VOO (S&P 500), or BND (Total Bond Market) are excellent starting points</p>
            </div>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-500 mt-1 text-lg">[2]</span>
            <div>
              <span className="font-medium">Set up automatic investments</span>
              <p className="text-sm text-emerald-600">Automate monthly contributions to remove emotion from investing decisions</p>
            </div>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-500 mt-1 text-lg">[3]</span>
            <div>
              <span className="font-medium">Review and rebalance annually</span>
              <p className="text-sm text-emerald-600">Check if your allocation has drifted significantly from your target - rebalance if off by more than 5%</p>
            </div>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-500 mt-1 text-lg">[4]</span>
            <div>
              <span className="font-medium">Consider professional help</span>
              <p className="text-sm text-emerald-600">For large portfolios (1M+), a fee-only fiduciary financial advisor can help optimize tax planning and estate considerations</p>
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
}