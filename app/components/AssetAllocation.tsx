"use client";

import { useState } from "react";
import { useColorPalette } from "../context/ColorPaletteContext";

interface AllocationProfile {
  name: string;
  stocks: number;
  bonds: number;
  cash: number;
  description: string;
}

const ALLOCATION_PROFILES: AllocationProfile[] = [
  {
    name: "Aggressive Growth",
    stocks: 90,
    bonds: 5,
    cash: 5,
    description: "Maximum growth potential with higher risk. Suitable for young investors with long time horizons.",
  },
  {
    name: "Growth",
    stocks: 75,
    bonds: 20,
    cash: 5,
    description: "Focus on capital appreciation with some income. Good for investors with 10+ year horizons.",
  },
  {
    name: "Balanced",
    stocks: 60,
    bonds: 30,
    cash: 10,
    description: "Equal emphasis on growth and income. Suitable for mid-career investors.",
  },
  {
    name: "Conservative",
    stocks: 40,
    bonds: 50,
    cash: 10,
    description: "Focus on capital preservation with modest growth. Suitable for pre-retirees.",
  },
  {
    name: "Income",
    stocks: 25,
    bonds: 60,
    cash: 15,
    description: "Maximum income with minimal risk. Suitable for retirees.",
  },
];

const AGE_BASED_RECOMMENDATIONS: Record<number, string> = {
  20: "Aggressive Growth",
  30: "Aggressive Growth",
  40: "Growth",
  50: "Balanced",
  60: "Conservative",
  70: "Income",
};

export default function AssetAllocation() {
  const { palette } = useColorPalette();

  const [age, setAge] = useState(30);
  const [riskTolerance, setRiskTolerance] = useState<"low" | "medium" | "high">("medium");

  const getRecommendedProfile = (): AllocationProfile => {
    if (riskTolerance === "high") return ALLOCATION_PROFILES[0];
    if (riskTolerance === "low") return ALLOCATION_PROFILES[3];
    
    // Find based on age
    const ageKeys = Object.keys(AGE_BASED_RECOMMENDATIONS).map(Number).sort((a, b) => a - b);
    let recommended = ALLOCATION_PROFILES[2]; // Default to balanced
    
    for (const ageKey of ageKeys) {
      if (age >= ageKey) {
        recommended = ALLOCATION_PROFILES.find(p => p.name === AGE_BASED_RECOMMENDATIONS[ageKey]) || ALLOCATION_PROFILES[2];
      }
    }
    return recommended;
  };

  const recommended = getRecommendedProfile();

  const getRiskColor = (tolerance: string) => {
    switch (tolerance) {
      case "high":
        return palette.negative;
      case "low":
        return palette.positive;
      default:
        return palette.accent;
    }
  };

  return (
    <div className="rounded-xl shadow-sm border p-6" style={{ backgroundColor: palette.background, borderColor: palette.gridLines }}>
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: palette.text }}>
        <svg className="w-5 h-5" style={{ color: palette.primary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        Asset Allocation Recommendations
      </h3>

      <p className="text-sm mb-6" style={{ color: palette.text, opacity: 0.7 }}>
        Based on your age and risk tolerance, here are suggested portfolio allocations.
      </p>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: palette.text }}>Your Age</label>
          <input
            type="range"
            min="18"
            max="80"
            value={age}
            onChange={(e) => setAge(parseInt(e.target.value))}
            className="w-full h-2 rounded-lg appearance-none cursor-pointer"
            style={{ backgroundColor: palette.gridLines, accentColor: palette.primary }}
          />
          <div className="flex justify-between text-sm mt-1" style={{ color: palette.text, opacity: 0.6 }}>
            <span>18</span>
            <span className="font-semibold" style={{ color: palette.primary }}>{age} years</span>
            <span>80</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: palette.text }}>Risk Tolerance</label>
          <div className="flex gap-2">
            {(["low", "medium", "high"] as const).map((tolerance) => (
              <button
                key={tolerance}
                onClick={() => setRiskTolerance(tolerance)}
                className="flex-1 py-2 px-3 rounded-lg text-sm font-medium capitalize transition-all"
                style={{
                  backgroundColor: riskTolerance === tolerance ? palette.background : palette.background,
                  border: `1px solid ${riskTolerance === tolerance ? getRiskColor(tolerance) : palette.gridLines}`,
                  color: riskTolerance === tolerance ? getRiskColor(tolerance) : palette.text,
                }}
              >
                {tolerance}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Recommended Allocation */}
      <div className="mb-6 p-4 rounded-lg border-2" style={{ borderColor: palette.primary + "50", backgroundColor: palette.primary + "10" }}>
        <h4 className="font-semibold mb-2" style={{ color: palette.text }}>Recommended: {recommended.name}</h4>
        <p className="text-sm" style={{ color: palette.text, opacity: 0.7 }}>{recommended.description}</p>
      </div>

      {/* Allocation Visual */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-3 rounded-lg" style={{ backgroundColor: palette.primary + "15" }}>
          <p className="text-2xl font-bold" style={{ color: palette.primary }}>{recommended.stocks}%</p>
          <p className="text-sm" style={{ color: palette.text, opacity: 0.7 }}>Stocks</p>
        </div>
        <div className="text-center p-3 rounded-lg" style={{ backgroundColor: palette.positive + "15" }}>
          <p className="text-2xl font-bold" style={{ color: palette.positive }}>{recommended.bonds}%</p>
          <p className="text-sm" style={{ color: palette.text, opacity: 0.7 }}>Bonds</p>
        </div>
        <div className="text-center p-3 rounded-lg" style={{ backgroundColor: palette.gridLines }}>
          <p className="text-2xl font-bold" style={{ color: palette.text }}>{recommended.cash}%</p>
          <p className="text-sm" style={{ color: palette.text, opacity: 0.7 }}>Cash</p>
        </div>
      </div>

      {/* All Profiles */}
      <div>
        <h4 className="font-semibold palette.text mb-3">All Allocation Profiles</h4>
        <div className="space-y-2">
          {ALLOCATION_PROFILES.map((profile) => (
            <div
              key={profile.name}
              className="p-3 rounded-lg border transition-all"
              style={{
                borderColor: profile.name === recommended.name ? palette.primary : 'transparent',
                backgroundColor: profile.name === recommended.name ? palette.primary + '15' : 'transparent',
              }}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium" style={{ color: palette.text }}>{profile.name}</span>
                <span className="text-xs" style={{ color: palette.text, opacity: 0.7 }}>
                  {profile.stocks}% / {profile.bonds}% / {profile.cash}%
                </span>
              </div>
              <div className="flex h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: palette.gridLines }}>
                <div className="bg-blue-500" style={{ width: `${profile.stocks}%` }} />
                <div className="bg-green-500" style={{ width: `${profile.bonds}%` }} />
                <div className="bg-gray-400" style={{ width: `${profile.cash}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-transparent">
        <p className="text-xs" style={{ color: palette.text, opacity: 0.7 }}>
          <strong>Note:</strong> These are general guidelines. Consult a financial advisor for personalized advice.
          Asset allocation does not guarantee profits or protect against losses.
        </p>
      </div>
    </div>
  );
}