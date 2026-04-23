"use client";

import { useState } from "react";
import { useColorPalette } from "../context/ColorPaletteContext";

interface TargetAllocation {
  category: string;
  current: number;
  target: number;
}

interface RebalanceAlert {
  category: string;
  current: number;
  target: number;
  drift: number;
  action: "buy" | "sell" | "hold";
  priority: "high" | "medium" | "low";
}

const DEFAULT_PORTFOLIO: TargetAllocation[] = [
  { category: "US Stocks", current: 35, target: 40 },
  { category: "International Stocks", current: 15, target: 20 },
  { category: "Bonds", current: 30, target: 25 },
  { category: "Cash", current: 10, target: 10 },
  { category: "Real Estate", current: 5, target: 5 },
  { category: "Crypto", current: 5, target: 0 },
];

const DRIFT_THRESHOLD = 5; // Trigger rebalance when allocations drift 5%+

export default function RebalancingAlerts() {
  const { palette, isDarkMode } = useColorPalette();

  const [portfolio, setPortfolio] = useState<TargetAllocation[]>(DEFAULT_PORTFOLIO);
  const [threshold, setThreshold] = useState(DRIFT_THRESHOLD);

  // Calculate rebalancing alerts
  const calculateAlerts = (): RebalanceAlert[] => {
    const alerts: RebalanceAlert[] = [];

    for (const asset of portfolio) {
      const drift = asset.current - asset.target;
      const absDrift = Math.abs(drift);

      if (absDrift >= threshold) {
        let action: "buy" | "sell" | "hold";
        let priority: "high" | "medium" | "low";

        if (absDrift >= 10) {
          priority = "high";
        } else if (absDrift >= 7) {
          priority = "medium";
        } else {
          priority = "low";
        }

        if (drift > 0) {
          action = "sell";
        } else if (drift < 0) {
          action = "buy";
        } else {
          action = "hold";
        }

        alerts.push({
          category: asset.category,
          current: asset.current,
          target: asset.target,
          drift,
          action,
          priority,
        });
      }
    }

    // Sort by priority
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    alerts.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

    return alerts;
  };

  const alerts = calculateAlerts();

  // Handle manual updates
  const updateAllocation = (category: string, value: number) => {
    setPortfolio(prev =>
      prev.map(a => a.category === category ? { ...a, current: value } : a)
    );
  };

  const getActionColor = (action: string) => {
    if (action === "buy") return "#22c55e";
    if (action === "sell") return "#ef4444";
    return "#6b7280";
  };

  const getActionLabel = (action: string) => {
    if (action === "buy") return "BUY MORE";
    if (action === "sell") return "SELL";
    return "On Target";
  };

  const getPriorityBadge = (priority: string) => {
    if (priority === "high") {
      return { bg: "#ef444420", text: "#ef4444", label: "HIGH PRIORITY" };
    }
    if (priority === "medium") {
      return { bg: "#eab30820", text: "#eab308", label: "MEDIUM" };
    }
    return { bg: "#6b728010", text: "#6b7280", label: "LOW" };
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 rounded-xl shadow-lg" style={{ backgroundColor: palette.background, border: `1px solid ${palette.gridLines}` }}>
      <h2 className="text-2xl font-bold mb-2" style={{ color: palette.text }}>Rebalancing Alerts</h2>
      <p className="text-sm mb-6" style={{ color: palette.text, opacity: 0.7 }}>
        Show when to rebalance (when allocations drift 5%+ from targets).
      </p>

      {/* Threshold setting */}
      <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: palette.background, border: `1px solid ${palette.gridLines}` }}>
        <label className="block text-sm font-medium mb-2" style={{ color: palette.text }}>
          Rebalance Trigger Threshold: {threshold}%
        </label>
        <input
          type="range"
          min="3"
          max="10"
          value={threshold}
          onChange={(e) => setThreshold(Number(e.target.value))}
          className="w-full"
          style={{ accentColor: palette.primary }}
        />
        <p className="text-xs mt-1" style={{ color: palette.text, opacity: 0.6 }}>
          Standard advice: rebalance when allocations drift 5%+ from targets
        </p>
      </div>

      {/* Alerts section */}
      <div className="mb-6">
        <h3 className="font-semibold mb-3" style={{ color: palette.text }}>
          {alerts.length > 0 ? `Action Needed: ${alerts.length} alert(s)` : "Portfolio Balanced"}
        </h3>

        {alerts.length === 0 ? (
          <div className="p-4 rounded-lg" style={{ backgroundColor: palette.positive + "20", border: `1px solid ${palette.positive}` }}>
            <div className="flex items-center gap-2">
              <span className="text-xl" style={{ color: palette.positive }}>✓</span>
              <span className="font-medium" style={{ color: palette.positive }}>
                Your portfolio is within {threshold}% of target allocations. No rebalancing needed.
              </span>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert, index) => {
              const badge = getPriorityBadge(alert.priority);
              return (
                <div
                  key={alert.category}
                  className="p-4 border rounded-lg flex items-center justify-between"
                  style={{
                    borderColor: alert.priority === "high" ? palette.negative :
                      alert.priority === "medium" ? palette.accent : palette.gridLines,
                    backgroundColor: palette.background,
                  }}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium" style={{ color: palette.text }}>{alert.category}</span>
                      <span
                        className="px-2 py-0.5 text-xs rounded-full font-medium"
                        style={{ backgroundColor: badge.bg, color: badge.text }}
                      >
                        {badge.label}
                      </span>
                    </div>
                    <div className="text-sm" style={{ color: palette.text, opacity: 0.7 }}>
                      Current: {alert.current}% → Target: {alert.target}% (Drift: {alert.drift > 0 ? "+" : ""}{alert.drift}%)
                    </div>
                  </div>
                  <div
                    className="px-4 py-2 rounded-lg font-bold text-white"
                    style={{ backgroundColor: getActionColor(alert.action) }}
                  >
                    {getActionLabel(alert.action)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Allocation editor */}
      <div className="mb-6">
        <h3 className="font-semibold mb-3" style={{ color: palette.text }}>Current vs Target Allocations</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b" style={{ borderColor: palette.gridLines }}>
                <th className="text-left py-2 px-3 font-medium" style={{ color: palette.text }}>Asset Class</th>
                <th className="text-right py-2 px-3 font-medium" style={{ color: palette.text }}>Current %</th>
                <th className="text-right py-2 px-3 font-medium" style={{ color: palette.text }}>Target %</th>
                <th className="text-right py-2 px-3 font-medium" style={{ color: palette.text }}>Drift</th>
                <th className="text-center py-2 px-3 font-medium" style={{ color: palette.text }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {portfolio.map((asset) => {
                const drift = asset.current - asset.target;
                const needsRebalance = Math.abs(drift) >= threshold;
                return (
                  <tr
                    key={asset.category}
                    className="border-b"
                    style={{ borderColor: palette.gridLines }}
                  >
                    <td className="py-2 px-3 font-medium" style={{ color: palette.text }}>{asset.category}</td>
                    <td className="text-right py-2 px-3">
                      <input
                        type="number"
                        value={asset.current}
                        onChange={(e) => updateAllocation(asset.category, Number(e.target.value))}
                        className="w-16 text-right px-2 py-1 rounded border"
                        style={{ borderColor: palette.gridLines, color: palette.text, backgroundColor: palette.background }}
                        min="0"
                        max="100"
                      />
                    </td>
                    <td className="text-right py-2 px-3" style={{ color: palette.text, opacity: 0.6 }}>{asset.target}%</td>
                    <td
                      className="text-right py-2 px-3 font-medium"
                      style={{
                        color: drift > 0 ? palette.negative : drift < 0 ? palette.positive : palette.text,
                      }}
                    >
                      {drift > 0 ? "+" : ""}{drift}%
                    </td>
                    <td className="text-center py-2 px-3" style={{ color: needsRebalance ? palette.negative : palette.positive }}>
                      {needsRebalance ? "Rebalance" : "OK"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="font-bold" style={{ color: palette.text }}>
                <td className="py-2 px-3">Total</td>
                <td className="text-right py-2 px-3">
                  {portfolio.reduce((sum, a) => sum + a.current, 0)}%
                </td>
                <td className="text-right py-2 px-3">
                  {portfolio.reduce((sum, a) => sum + a.target, 0)}%
                </td>
                <td colSpan={2}></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Important note */}
      <div className="p-4 rounded-lg border" style={{ backgroundColor: palette.background, borderColor: palette.gridLines }}>
        <h4 className="font-semibold mb-2" style={{ color: palette.text }}>Important: Why Rebalance?</h4>
        <ul className="text-sm space-y-1" style={{ color: palette.text, opacity: 0.8 }}>
          <li>• <strong style={{ color: palette.text }}>Risk Management:</strong> Maintains your intended risk level over time</li>
          <li>• <strong style={{ color: palette.text }}>Buy Low, Sell High:</strong> Automatically sells appreciated assets and buys underweighted ones</li>
          <li>• <strong style={{ color: palette.text }}>Discipline:</strong> Prevents your portfolio from drifting into inappropriate risk levels</li>
          <li>• <strong style={{ color: palette.text }}>Tax Efficiency:</strong> In taxable accounts, rebalancing can minimize capital gains</li>
        </ul>
      </div>

      <p className="mt-4 text-xs text-center" style={{ color: palette.text, opacity: 0.6 }}>
        This is for educational purposes. Consult a financial advisor for personalized rebalancing advice.
      </p>
    </div>
  );
}