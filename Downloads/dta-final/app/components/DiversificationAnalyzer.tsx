"use client";

import { useState } from "react";
import { useColorPalette } from "../context/ColorPaletteContext";

interface SectorAllocation {
  sector: string;
  percentage: number;
  targetPercentage: number;
  deviation: number;
  risk: "low" | "medium" | "high";
}

interface DiversificationResult {
  herfindahlIndex: number;
  concentrationRisk: "low" | "medium" | "high";
  techConcentration: number;
  isTooTechHeavy: boolean;
  recommendations: string[];
}

const SECTOR_RISK: Record<string, "low" | "medium" | "high"> = {
  "Technology": "high",
  "Healthcare": "medium",
  "Financials": "medium",
  "Consumer Discretionary": "medium",
  "Communication Services": "medium",
  "Industrials": "medium",
  "Consumer Staples": "low",
  "Energy": "high",
  "Utilities": "low",
  "Real Estate": "medium",
  "Materials": "medium",
  "Other": "medium",
};

const DEFAULT_SECTORS = [
  { sector: "Technology", percentage: 30, targetPercentage: 25 },
  { sector: "Healthcare", percentage: 15, targetPercentage: 15 },
  { sector: "Financials", percentage: 15, targetPercentage: 15 },
  { sector: "Consumer Discretionary", percentage: 12, targetPercentage: 12 },
  { sector: "Communication Services", percentage: 10, targetPercentage: 10 },
  { sector: "Industrials", percentage: 8, targetPercentage: 10 },
  { sector: "Consumer Staples", percentage: 5, targetPercentage: 8 },
  { sector: "Energy", percentage: 3, targetPercentage: 5 },
  { sector: "Other", percentage: 2, targetPercentage: 0 },
];

export default function DiversificationAnalyzer() {
  const { palette, isDarkMode } = useColorPalette();

  const [userRiskProfile, setUserRiskProfile] = useState<"conservative" | "moderate" | "aggressive">("moderate");
  const [sectors, setSectors] = useState<SectorAllocation[]>(
    DEFAULT_SECTORS.map(s => ({
      ...s,
      deviation: s.percentage - s.targetPercentage,
      risk: SECTOR_RISK[s.sector] || "medium",
    }))
  );

  // Calculate diversification metrics
  const calculateDiversification = (): DiversificationResult => {
    // Herfindahl-Hirschman Index (HHI) - measures market concentration
    // HHI < 0.15 = low concentration, 0.15-0.25 = medium, > 0.25 = high
    const hhi = sectors.reduce((sum, s) => sum + Math.pow(s.percentage / 100, 2), 0);

    // Tech concentration
    const techSector = sectors.find(s => s.sector === "Technology");
    const techConcentration = techSector?.percentage || 0;

    // Check if tech is too heavy for user's risk profile
    const techLimit = userRiskProfile === "conservative" ? 20 : userRiskProfile === "moderate" ? 30 : 40;
    const isTooTechHeavy = techConcentration > techLimit;

    // Determine concentration risk
    let concentrationRisk: "low" | "medium" | "high";
    if (hhi < 0.15) concentrationRisk = "low";
    else if (hhi < 0.25) concentrationRisk = "medium";
    else concentrationRisk = "high";

    // Generate recommendations
    const recommendations: string[] = [];

    if (isTooTechHeavy) {
      recommendations.push(`Your ${techConcentration}% tech allocation exceeds the ${techLimit}% recommended for a ${userRiskProfile} investor. Consider reducing tech exposure.`);
    }

    const overweightSectors = sectors.filter(s => s.deviation > 5);
    const underweightSectors = sectors.filter(s => s.deviation < -5);

    if (overweightSectors.length > 0) {
      recommendations.push(`Consider reducing: ${overweightSectors.map(s => s.sector).join(", ")}`);
    }

    if (underweightSectors.length > 0) {
      recommendations.push(`Consider increasing: ${underweightSectors.map(s => s.sector).join(", ")}`);
    }

    if (concentrationRisk === "high") {
      recommendations.push("Your portfolio is highly concentrated. Consider diversifying across more sectors.");
    }

    if (concentrationRisk === "medium" && recommendations.length === 0) {
      recommendations.push("Your portfolio has moderate diversification. Consider reviewing allocations periodically.");
    }

    if (recommendations.length === 0) {
      recommendations.push("Your portfolio is well-diversified. Continue monitoring allocations periodically.");
    }

    return {
      herfindahlIndex: hhi,
      concentrationRisk,
      techConcentration,
      isTooTechHeavy,
      recommendations,
    };
  };

  const result = calculateDiversification();

  const getRiskColor = (risk: string) => {
    if (risk === "low") return "#22c55e";
    if (risk === "medium") return "#eab308";
    return "#ef4444";
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 rounded-xl shadow-lg" style={{ backgroundColor: palette.background, border: `1px solid ${palette.gridLines}` }}>
      <h2 className="text-2xl font-bold mb-2" style={{ color: palette.text }}>Diversification Analysis</h2>
      <p className="text-sm mb-6" style={{ color: palette.text, opacity: 0.7 }}>
        Analyze portfolio concentration risk and sector allocation.
      </p>

      {/* Risk profile selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2" style={{ color: palette.text }}>
          Your Risk Profile
        </label>
        <div className="flex gap-2">
          {(["conservative", "moderate", "aggressive"] as const).map((profile) => (
            <button
              key={profile}
              onClick={() => setUserRiskProfile(profile)}
              className="px-4 py-2 text-sm rounded-lg transition"
              style={{
                backgroundColor: userRiskProfile === profile ? palette.primary : palette.background,
                color: userRiskProfile === profile ? "#fff" : palette.text,
                border: `1px solid ${palette.gridLines}`
              }}
            >
              {profile.charAt(0).toUpperCase() + profile.slice(1)}
            </button>
          ))}
        </div>
        <p className="text-xs mt-1" style={{ color: palette.text, opacity: 0.6 }}>
          Conservative: Lower tech allocation recommended | Moderate: Balanced approach | Aggressive: Higher risk tolerance
        </p>
      </div>

      {/* Metrics summary */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 rounded-lg" style={{ backgroundColor: palette.background, border: `1px solid ${palette.gridLines}` }}>
          <div className="text-sm" style={{ color: palette.text, opacity: 0.7 }}>Concentration Risk</div>
          <div
            className="text-2xl font-bold"
            style={{ color: getRiskColor(result.concentrationRisk) }}
          >
            {result.concentrationRisk.charAt(0).toUpperCase() + result.concentrationRisk.slice(1)}
          </div>
        </div>
        <div className="p-4 rounded-lg" style={{ backgroundColor: palette.background, border: `1px solid ${palette.gridLines}` }}>
          <div className="text-sm" style={{ color: palette.text, opacity: 0.7 }}>Tech Sector Allocation</div>
          <div
            className="text-2xl font-bold"
            style={{
              color: result.isTooTechHeavy ? palette.negative : getRiskColor(result.concentrationRisk),
            }}
          >
            {result.techConcentration}%
            {result.isTooTechHeavy && " (High)"}
          </div>
        </div>
        <div className="p-4 rounded-lg" style={{ backgroundColor: palette.background, border: `1px solid ${palette.gridLines}` }}>
          <div className="text-sm" style={{ color: palette.text, opacity: 0.7 }}>Diversification Index (HHI)</div>
          <div className="text-2xl font-bold" style={{ color: palette.text }}>
            {result.herfindahlIndex.toFixed(3)}
          </div>
          <div className="text-xs" style={{ color: palette.text, opacity: 0.5 }}>
            &lt;0.15 = well-diversified
          </div>
        </div>
      </div>

      {/* Sector allocation table */}
      <div className="mb-6">
        <h3 className="font-semibold mb-3" style={{ color: palette.text }}>Sector Allocations</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: `1px solid ${palette.gridLines}` }}>
                <th className="text-left py-2 px-3" style={{ color: palette.text }}>Sector</th>
                <th className="text-right py-2 px-3" style={{ color: palette.text }}>Current</th>
                <th className="text-right py-2 px-3" style={{ color: palette.text }}>Target</th>
                <th className="text-right py-2 px-3" style={{ color: palette.text }}>Deviation</th>
                <th className="text-center py-2 px-3" style={{ color: palette.text }}>Risk</th>
              </tr>
            </thead>
            <tbody>
              {sectors.map((sector) => (
                <tr
                  key={sector.sector}
                  style={{ borderBottom: `1px solid ${palette.gridLines}`, backgroundColor: palette.background }}
                  className="hover:opacity-90"
                >
                  <td className="py-2 px-3 font-medium" style={{ color: palette.text }}>{sector.sector}</td>
                  <td className="text-right py-2 px-3" style={{ color: palette.text }}>{sector.percentage}%</td>
                  <td className="text-right py-2 px-3" style={{ color: palette.text, opacity: 0.6 }}>{sector.targetPercentage}%</td>
                  <td
                    className="text-right py-2 px-3 font-medium"
                    style={{
                      color: sector.deviation > 0 ? palette.negative : sector.deviation < 0 ? palette.positive : palette.text,
                    }}
                  >
                    {sector.deviation > 0 ? "+" : ""}{sector.deviation}%
                  </td>
                  <td className="text-center py-2 px-3">
                    <span
                      className="px-2 py-1 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: `${getRiskColor(sector.risk)}20`,
                        color: getRiskColor(sector.risk),
                      }}
                    >
                      {sector.risk.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recommendations */}
      <div className="p-4 rounded-lg border" style={{ backgroundColor: palette.accent + "20", borderColor: palette.accent }}>
        <h4 className="font-semibold mb-3" style={{ color: palette.text }}>Recommendations</h4>
        <ul className="space-y-2">
          {result.recommendations.map((rec, index) => (
            <li key={index} className="flex items-start gap-2 text-sm" style={{ color: palette.text }}>
              <span className="mt-1" style={{ color: palette.accent }}>•</span>
              {rec}
            </li>
          ))}
        </ul>
      </div>

      <p className="mt-4 text-xs text-center" style={{ color: palette.text, opacity: 0.5 }}>
        This analysis is for educational purposes. Consult a financial advisor for personalized advice.
      </p>
    </div>
  );
}