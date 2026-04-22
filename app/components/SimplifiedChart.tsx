"use client";

import { useState, ReactNode } from "react";
import { useColorPalette } from "@/app/context/ColorPaletteContext";

interface SimplifiedChartProps {
  title: string;
  simpleLabel: string;
  detailedLabel?: string;
  children: ReactNode;
  detailedView?: ReactNode;
}

export default function SimplifiedChart({
  title,
  simpleLabel,
  detailedLabel = "Advanced",
  children,
  detailedView,
}: SimplifiedChartProps) {
  const { palette } = useColorPalette();
  const [isSimpleMode, setIsSimpleMode] = useState(true);

  return (
    <div className="rounded-xl shadow-sm border" style={{ backgroundColor: palette.background, borderColor: palette.gridLines }}>
      <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: palette.gridLines }}>
        <h3 className="font-semibold" style={{ color: palette.text }}>{title}</h3>
        <button
          onClick={() => setIsSimpleMode(!isSimpleMode)}
          className="text-xs px-3 py-1.5 rounded-full transition-colors"
          style={{
            backgroundColor: isSimpleMode ? palette.primary + "20" : palette.background,
            color: isSimpleMode ? palette.primary : palette.text,
            border: `1px solid ${palette.gridLines}`
          }}
        >
          {isSimpleMode ? simpleLabel : detailedLabel}
        </button>
      </div>

      <div className={isSimpleMode ? "opacity-100" : "opacity-100"}>
        {children}
      </div>

      {!isSimpleMode && detailedView && (
        <div className="border-t p-4" style={{ borderColor: palette.gridLines, backgroundColor: palette.background }}>
          {detailedView}
        </div>
      )}
    </div>
  );
}