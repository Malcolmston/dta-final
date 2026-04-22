"use client";

import { useState } from "react";
import { useColorPalette } from "../context/ColorPaletteContext";

export type DashboardSection =
  | "overview"
  | "trends"
  | "factors"
  | "sectors"
  | "analysis"
  | "portfolio"
  | "wealth";

interface DashboardTabsProps {
  activeSection: DashboardSection;
  onSectionChange: (section: DashboardSection) => void;
}

const sections: { id: DashboardSection; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "trends", label: "Trends" },
  { id: "factors", label: "Factors" },
  { id: "sectors", label: "Sectors" },
  { id: "analysis", label: "Analysis" },
  { id: "portfolio", label: "Portfolio" },
  { id: "wealth", label: "Wealth" },
];

export default function DashboardTabs({
  activeSection,
  onSectionChange,
}: DashboardTabsProps) {
  const { palette, isDarkMode } = useColorPalette();

  return (
    <nav
      className="fixed right-0 top-0 h-full w-48 border-l z-50 flex flex-col transition-colors duration-300"
      style={{
        backgroundColor: palette.background,
        borderColor: palette.gridLines,
      }}
    >
      <div className="p-4 border-b" style={{ borderColor: palette.gridLines }}>
        <h2 className="font-bold text-sm" style={{ color: palette.text }}>Dashboard</h2>
        <p className="text-xs mt-1" style={{ color: palette.text, opacity: 0.6 }}>Navigate sections</p>
      </div>

      <div className="flex-1 py-4">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => onSectionChange(section.id)}
            className="w-full px-4 py-3 text-left transition-colors"
            style={{
              backgroundColor: activeSection === section.id ? palette.primary + "20" : "transparent",
              color: activeSection === section.id ? palette.primary : palette.text,
              borderRight: activeSection === section.id ? `2px solid ${palette.primary}` : "2px solid transparent",
              opacity: activeSection === section.id ? 1 : 0.7,
            }}
          >
            <span className="text-sm font-medium">{section.label}</span>
          </button>
        ))}
      </div>

      <div className="p-4 border-t" style={{ borderColor: palette.gridLines }}>
        <p className="text-xs" style={{ color: palette.text, opacity: 0.4 }}>Stock Market Dashboard</p>
      </div>
    </nav>
  );
}

export { sections };