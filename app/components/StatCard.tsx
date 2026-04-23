"use client";

import { useColorPalette } from "../context/ColorPaletteContext";

interface StatCardProps {
  label: string;
  value: string;
  change?: string;
  trend?: "up" | "down" | "neutral";
}

export default function StatCard({ label, value, change, trend }: StatCardProps) {
  const { palette } = useColorPalette();

  const getTrendColor = (trend?: "up" | "down" | "neutral") => {
    switch (trend) {
      case "up":
        return { color: palette.positive, backgroundColor: palette.positive + "15" };
      case "down":
        return { color: palette.negative, backgroundColor: palette.negative + "15" };
      default:
        return { color: palette.text, backgroundColor: palette.gridLines };
    }
  };

  return (
    <div
      className="p-4 rounded-lg flex flex-col justify-between"
      style={{
        backgroundColor: palette.background,
        border: `1px solid ${palette.gridLines}`,
        minHeight: '90px'
      }}
    >
      <p className="text-sm" style={{ color: palette.text, opacity: 0.7 }}>{label}</p>
      <p className="text-xl font-bold" style={{ color: palette.text }}>{value}</p>
      {change && (
        <span
          className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full"
          style={getTrendColor(trend)}
        >
          {trend === "up" && "↑"}
          {trend === "down" && "↓"}
          {change}
        </span>
      )}
    </div>
  );
}