"use client";

import { useColorPalette } from "@/app/context/ColorPaletteContext";

interface StrategyTabProps {
  ticker: string;
  refreshKey: number;
  colors?: { chartLine: string; bullish: string; bearish: string; neutral: string };
}

export default function StrategyTab({ ticker, refreshKey, colors }: StrategyTabProps) {
  const { palette, isDarkMode } = useColorPalette();
  // The ticker and refreshKey props are kept for interface consistency but not used in this static component
  return (
    <div className="p-6">
      {/* Strategy Components - Diagram Style Boxes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="rounded-xl p-5 text-white" style={{ background: isDarkMode ? `linear-gradient(to bottom right, ${palette.secondary}, ${palette.primary})` : 'linear-gradient(to bottom right, #1e293b, #0f172a)' }}>
          <div className="text-lg font-semibold mb-3">Core Holdings (60-70%)</div>
          <p className="text-sm" style={{ opacity: 0.8 }}>
            Index funds (S&P 500, total market) provide broad market exposure with low fees. These are your
            stable, long-term investments.
          </p>
        </div>
        <div className="rounded-xl p-5 text-white" style={{ background: isDarkMode ? `linear-gradient(to bottom right, ${palette.secondary}, ${palette.primary})` : 'linear-gradient(to bottom right, #334155, #1e293b)' }}>
          <div className="text-lg font-semibold mb-3">Growth Assets (20-30%)</div>
          <p className="text-sm" style={{ opacity: 0.8 }}>
            Individual stocks or sector ETFs for higher growth potential. Limit to companies you understand
            and believe in for the long term.
          </p>
        </div>
        <div className="rounded-xl p-5 text-white" style={{ background: isDarkMode ? `linear-gradient(to bottom right, ${palette.accent}, ${palette.secondary})` : 'linear-gradient(to bottom right, #475569, #334155)' }}>
          <div className="text-lg font-semibold mb-3">Defensive Holdings (10-20%)</div>
          <p className="text-sm" style={{ opacity: 0.8 }}>
            Bonds, utilities, and consumer staples that perform relatively well during market downturns.
            These provide portfolio stability.
          </p>
        </div>
        <div className="rounded-xl p-5 text-white" style={{ background: isDarkMode ? `linear-gradient(to bottom right, #d97706, #b45309)` : 'linear-gradient(to bottom right, #f59e0b, #d97706)' }}>
          <div className="text-lg font-semibold mb-3">Cash Reserve (5-10%)</div>
          <p className="text-sm" style={{ opacity: 0.9 }}>
            Keep liquid cash for opportunities or emergencies. Money market funds offer better returns
            than regular savings accounts.
          </p>
        </div>
      </div>

      {/* Key Principles - Numbered Diagram */}
      <div className="rounded-xl p-5 mb-6" style={{ backgroundColor: isDarkMode ? palette.background : '#f8fafc', border: `1px solid ${palette.gridLines}` }}>
        <h4 className="font-semibold mb-4" style={{ color: palette.text }}>Key Principles for Large Portfolios</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="w-10 h-10 rounded-full text-white text-lg font-bold flex items-center justify-center mx-auto mb-2" style={{ backgroundColor: palette.primary }}>1</div>
            <div className="font-semibold" style={{ color: palette.text }}>Diversify</div>
            <div className="text-sm" style={{ color: palette.text, opacity: 0.6 }}>Don't put more than 5% in any single stock</div>
          </div>
          <div className="text-center">
            <div className="w-10 h-10 rounded-full text-white text-lg font-bold flex items-center justify-center mx-auto mb-2" style={{ backgroundColor: palette.primary }}>2</div>
            <div className="font-semibold" style={{ color: palette.text }}>Dollar-Cost Average</div>
            <div className="text-sm" style={{ color: palette.text, opacity: 0.6 }}>Invest regularly regardless of market conditions</div>
          </div>
          <div className="text-center">
            <div className="w-10 h-10 rounded-full text-white text-lg font-bold flex items-center justify-center mx-auto mb-2" style={{ backgroundColor: palette.primary }}>3</div>
            <div className="font-semibold" style={{ color: palette.text }}>Rebalance Annually</div>
            <div className="text-sm" style={{ color: palette.text, opacity: 0.6 }}>Review allocations once per year</div>
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="rounded-xl p-5 mb-6" style={{ backgroundColor: palette.primary + '10', border: `1px solid ${palette.gridLines}` }}>
        <h4 className="font-semibold mb-3 flex items-center gap-2" style={{ color: palette.text }}>
          <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs" style={{ backgroundColor: palette.primary, color: '#ffffff' }}>i</span>
          Key Insights
        </h4>
        <ul className="space-y-2" style={{ color: palette.text, opacity: 0.7 }}>
          <li className="flex items-start gap-2">
            <span style={{ color: palette.positive, marginTop: '4px' }}>-</span>
            <span>Larger portfolios benefit more from professional management - consider working with a fee-only fiduciary advisor</span>
          </li>
          <li className="flex items-start gap-2">
            <span style={{ color: palette.positive, marginTop: '4px' }}>-</span>
            <span>Tax efficiency becomes important - hold index funds in tax-advantaged accounts (401k, IRA)</span>
          </li>
          <li className="flex items-start gap-2">
            <span style={{ color: palette.positive, marginTop: '4px' }}>-</span>
            <span>Asset allocation (stocks vs bonds) is the primary driver of portfolio returns - more stocks = more risk and reward</span>
          </li>
        </ul>
      </div>

      {/* Recommendations */}
      <div className="rounded-xl p-5" style={{ backgroundColor: palette.positive + '15', border: `1px solid ${palette.gridLines}` }}>
        <h4 className="font-semibold mb-3 flex items-center gap-2" style={{ color: palette.text }}>
          <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs" style={{ backgroundColor: palette.positive, color: '#ffffff' }}>R</span>
          Actionable Recommendations
        </h4>
        <ul className="space-y-3" style={{ color: palette.text, opacity: 0.8 }}>
          <li className="flex items-start gap-2">
            <span style={{ color: palette.positive, marginTop: '4px' }}>[1]</span>
            <div>
              <span className="font-medium">Start with broad index funds</span>
              <p className="text-sm" style={{ color: palette.text, opacity: 0.7 }}>VTI (Total Stock Market), VOO (S&P 500), or BND (Total Bond Market) are excellent starting points</p>
            </div>
          </li>
          <li className="flex items-start gap-2">
            <span style={{ color: palette.positive, marginTop: '4px' }}>[2]</span>
            <div>
              <span className="font-medium">Set up automatic investments</span>
              <p className="text-sm" style={{ color: palette.text, opacity: 0.7 }}>Automate monthly contributions to remove emotion from investing decisions</p>
            </div>
          </li>
          <li className="flex items-start gap-2">
            <span style={{ color: palette.positive, marginTop: '4px' }}>[3]</span>
            <div>
              <span className="font-medium">Review and rebalance annually</span>
              <p className="text-sm" style={{ color: palette.text, opacity: 0.7 }}>Check if your allocation has drifted significantly from your target - rebalance if off by more than 5%</p>
            </div>
          </li>
          <li className="flex items-start gap-2">
            <span style={{ color: palette.positive, marginTop: '4px' }}>[4]</span>
            <div>
              <span className="font-medium">Consider professional help</span>
              <p className="text-sm" style={{ color: palette.text, opacity: 0.7 }}>For large portfolios (1M+), a fee-only fiduciary financial advisor can help optimize tax planning and estate considerations</p>
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
}