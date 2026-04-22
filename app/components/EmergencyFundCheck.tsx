"use client";

import { useState } from "react";
import { useColorPalette } from "../context/ColorPaletteContext";

interface EmergencyFundData {
  monthlyExpenses: number;
  currentSavings: number;
  monthsCovered: number;
  status: "insufficient" | "adequate" | "excellent";
  recommendation: string;
}

export default function EmergencyFundCheck() {
  const { palette, isDarkMode } = useColorPalette();

  const [monthlyExpenses, setMonthlyExpenses] = useState<number>(3000);
  const [currentSavings, setCurrentSavings] = useState<number>(10000);
  const [riskProfile, setRiskProfile] = useState<"conservative" | "moderate" | "aggressive">("moderate");

  // Calculate emergency fund status
  const calculateStatus = (): EmergencyFundData => {
    const monthsCovered = currentSavings / monthlyExpenses;
    const minMonths = riskProfile === "conservative" ? 6 : riskProfile === "moderate" ? 4 : 3;
    const maxMonths = riskProfile === "conservative" ? 12 : riskProfile === "moderate" ? 6 : 6;

    let status: "insufficient" | "adequate" | "excellent";
    let recommendation: string;

    if (monthsCovered < minMonths) {
      status = "insufficient";
      recommendation = `Your emergency fund is below the recommended ${minMonths}-${maxMonths} months. Consider building up your liquid reserves before making additional investments. Focus on saving at least $${(monthlyExpenses * minMonths).toLocaleString()} (${minMonths} months of expenses) before investing in the stock market.`;
    } else if (monthsCovered >= minMonths && monthsCovered < maxMonths) {
      status = "adequate";
      recommendation = `You have an adequate emergency fund covering ${monthsCovered.toFixed(1)} months. This meets the minimum recommendation for a ${riskProfile} investor. Consider increasing to ${maxMonths}+ months for additional safety.`;
    } else {
      status = "excellent";
      recommendation = `Excellent! Your emergency fund covers ${monthsCovered.toFixed(1)} months of expenses, well above the recommended ${minMonths}-${maxMonths} months. You have strong financial security to weather unexpected expenses.`;
    }

    return {
      monthlyExpenses,
      currentSavings,
      monthsCovered,
      status,
      recommendation,
    };
  };

  const fundData = calculateStatus();

  const getStatusColor = (status: string) => {
    if (status === "insufficient") return "#ef4444";
    if (status === "adequate") return "#eab308";
    return "#22c55e";
  };

  const getStatusLabel = (status: string) => {
    if (status === "insufficient") return "Needs Attention";
    if (status === "adequate") return "Adequate";
    return "Excellent";
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 rounded-xl shadow-lg" style={{ backgroundColor: palette.background, border: `1px solid ${palette.gridLines}` }}>
      <h2 className="text-2xl font-bold mb-2" style={{ color: palette.text }}>Emergency Fund Check</h2>
      <p className="text-sm mb-6" style={{ color: palette.text, opacity: 0.7 }}>
        Verify you have adequate liquid reserves before investing.
      </p>

      {/* Educational note */}
      <div className="mb-6 p-4 rounded-lg border" style={{ backgroundColor: palette.primary + "15", borderColor: palette.primary + "40" }}>
        <p className="text-sm" style={{ color: palette.text }}>
          <strong>Why this matters:</strong> Financial experts recommend having 3-6 months of expenses in savings
          BEFORE investing in the stock market. This ensures you won&apos;t need to sell investments prematurely
          during emergencies.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Input fields */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: palette.text }}>
              Monthly Expenses ($)
            </label>
            <input
              type="number"
              value={monthlyExpenses}
              onChange={(e) => setMonthlyExpenses(Number(e.target.value))}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2"
              style={{ borderColor: palette.gridLines, backgroundColor: palette.background, color: palette.text }}
              min="0"
              step="100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: palette.text }}>
              Current Savings ($)
            </label>
            <input
              type="number"
              value={currentSavings}
              onChange={(e) => setCurrentSavings(Number(e.target.value))}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2"
              style={{ borderColor: palette.gridLines, backgroundColor: palette.background, color: palette.text }}
              min="0"
              step="100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: palette.text }}>
              Risk Profile
            </label>
            <div className="flex gap-2">
              {(["conservative", "moderate", "aggressive"] as const).map((profile) => (
                <button
                  key={profile}
                  onClick={() => setRiskProfile(profile)}
                  className="px-3 py-2 text-sm rounded-lg transition"
                  style={{
                    backgroundColor: riskProfile === profile ? palette.primary : palette.background,
                    color: riskProfile === profile ? "#fff" : palette.text,
                    border: `1px solid ${palette.gridLines}`
                  }}
                >
                  {profile.charAt(0).toUpperCase() + profile.slice(1)}
                </button>
              ))}
            </div>
            <p className="text-xs mt-1" style={{ color: palette.text, opacity: 0.6 }}>
              Conservative: 6-12 months | Moderate: 4-6 months | Aggressive: 3-6 months
            </p>
          </div>
        </div>

        {/* Results */}
        <div className="flex flex-col justify-center">
          <div
            className="p-6 rounded-xl border-2"
            style={{
              borderColor: getStatusColor(fundData.status),
              backgroundColor: `${getStatusColor(fundData.status)}10`,
            }}
          >
            <div className="text-center">
              <div
                className="text-lg font-semibold mb-2"
                style={{ color: getStatusColor(fundData.status) }}
              >
                {getStatusLabel(fundData.status)}
              </div>
              <div className="text-4xl font-bold mb-1" style={{ color: palette.text }}>
                {fundData.monthsCovered.toFixed(1)}
              </div>
              <div className="text-sm" style={{ color: palette.text, opacity: 0.7 }}>months covered</div>
            </div>

            {/* Progress bar */}
            <div className="mt-4">
              <div className="flex justify-between text-xs mb-1" style={{ color: palette.text, opacity: 0.6 }}>
                <span>0</span>
                <span>3</span>
                <span>6</span>
                <span>12</span>
              </div>
              <div className="w-full h-3 rounded-full overflow-hidden" style={{ backgroundColor: palette.gridLines }}>
                <div
                  className="h-full transition-all duration-500"
                  style={{
                    width: `${Math.min((fundData.monthsCovered / 12) * 100, 100)}%`,
                    backgroundColor: getStatusColor(fundData.status),
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendation */}
      <div
        className="p-4 rounded-lg"
        style={{
          backgroundColor: `${getStatusColor(fundData.status)}10`,
          borderLeft: `4px solid ${getStatusColor(fundData.status)}`,
        }}
      >
        <h4 className="font-semibold mb-2" style={{ color: palette.text }}>Recommendation</h4>
        <p className="text-sm" style={{ color: palette.text, opacity: 0.8 }}>{fundData.recommendation}</p>
      </div>

      <p className="mt-4 text-xs text-center" style={{ color: palette.text, opacity: 0.5 }}>
        This is a general guideline. Consult a financial advisor for personalized recommendations.
      </p>
    </div>
  );
}