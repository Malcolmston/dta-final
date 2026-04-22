"use client";

import { useState } from "react";
import { useColorPalette } from "../context/ColorPaletteContext";

interface SurvivorshipBiasDisclaimerProps {
  children?: React.ReactNode;
  compact?: boolean;
}

export default function SurvivorshipBiasDisclaimer({ children, compact = false }: SurvivorshipBiasDisclaimerProps) {
  const { palette } = useColorPalette();
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) {
    return <>{children}</>;
  }

  const content = (
    <div
      className={`rounded-lg border ${
        compact ? "p-3 mb-4" : "p-4 mb-6"
      }`}
      style={{
        borderColor: palette.negative + '50',
        backgroundColor: palette.negative + '08',
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex-shrink-0 rounded-full flex items-center justify-center font-bold ${
            compact ? "w-6 h-6 text-xs" : "w-8 h-8 text-sm"
          }`}
          style={{ backgroundColor: palette.negative + '20', color: palette.negative }}
        >
          !
        </div>
        <div className="flex-1">
          <h4
            className={`font-semibold ${
              compact ? "text-sm" : "text-base"
            }`}
            style={{ color: palette.text }}
          >
            Important: Survivorship Bias Disclaimer
          </h4>
          {!compact && (
            <p className="text-sm mt-1" style={{ color: palette.text, opacity: 0.8 }}>
              This dashboard only shows <strong>existing, publicly traded companies</strong>. It does NOT include:
            </p>
          )}
          <ul
            className={`list-disc list-inside ${
              compact ? "text-xs mt-1 space-y-0.5" : "text-sm mt-2 space-y-1"
            }`}
            style={{ color: palette.text, opacity: compact ? 0.9 : 0.8 }}
          >
            {compact ? (
              <>
                <li>Companies that went bankrupt</li>
                <li>Companies that were acquired</li>
                <li>Delisted or bankrupt stocks</li>
              </>
            ) : (
              <>
                <li><strong>Bankrupt companies</strong> - Stocks that fell to $0 (e.g., Enron, Lehman Brothers)</li>
                <li><strong>Acquired companies</strong> - Taken private at any price (good or bad deals)</li>
                <li><strong>Delisted companies</strong> - No longer trading on major exchanges</li>
                <li><strong>Failed IPOs</strong> - Companies that withdrew or failed to go public</li>
              </>
            )}
          </ul>
          <p
            className={`${
              compact ? "text-xs mt-2" : "text-sm mt-3"
            }`}
            style={{ color: palette.text, opacity: 0.9 }}
          >
            <strong>This creates survivorship bias</strong> - the "performance" shown inflates actual market returns
            because it excludes the losers. A balanced view of the market would include these failures.
          </p>
          <button
            onClick={() => {
              setIsDismissed(true);
              localStorage.setItem("survivorshipBiasDismissed", "true");
            }}
            className={`mt-2 ${
              compact ? "text-xs" : "text-sm"
            } underline`}
            style={{ color: palette.primary }}
          >
            Dismiss this notice
          </button>
        </div>
      </div>
    </div>
  );

  // Check if previously dismissed
  if (typeof window !== "undefined") {
    const wasDismissed = localStorage.getItem("survivorshipBiasDismissed") === "true";
    if (wasDismissed && !isDismissed) {
      return <>{children}</>;
    }
  }

  if (children) {
    return (
      <>
        {content}
        {children}
      </>
    );
  }

  return content;
}

// Standalone disclaimer banner for use in portfolio or analysis sections
export function SurvivorshipBiasBanner() {
  const { palette } = useColorPalette();

  return (
    <div
      className="p-3 rounded-lg border mb-4"
      style={{
        borderColor: palette.negative + '30',
        backgroundColor: palette.negative + '08',
      }}
    >
      <div className="flex items-center gap-2 text-sm">
        <span className="font-medium" style={{ color: palette.negative }}>Note:</span>
        <span style={{ color: palette.text, opacity: 0.8 }}>
          Only existing stocks are shown. Excludes bankrupt/acquired companies - this may inflate perceived returns.
        </span>
      </div>
    </div>
  );
}