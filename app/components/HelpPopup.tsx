"use client";

import { useState } from "react";
import { useColorPalette } from "../context/ColorPaletteContext";

interface HelpPopupProps {
  title: string;
  whatItDoes: string;
  whyItMatters: string;
  whoItMattersFor: string;
  howToRead: string;
}

export default function HelpPopup({
  title,
  whatItDoes,
  whyItMatters,
  whoItMattersFor,
  howToRead,
}: HelpPopupProps) {
  const { palette } = useColorPalette();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="absolute top-4 right-4 z-10">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-6 h-6 rounded-full border flex items-center justify-center text-xs font-bold hover:opacity-80 transition"
        style={{
          backgroundColor: palette.background,
          borderColor: palette.gridLines,
          color: palette.text,
        }}
        title="Help"
      >
        ?
      </button>

      {isOpen && (
        <div
          className="absolute right-0 top-full mt-2 w-80 rounded-xl shadow-lg border p-4 z-50"
          style={{
            backgroundColor: palette.background,
            borderColor: palette.gridLines,
          }}
        >
          <h4 className="font-semibold mb-3" style={{ color: palette.text }}>
            {title}
          </h4>

          <div className="space-y-3 text-sm">
            <div>
              <h5 className="font-medium" style={{ color: palette.primary }}>
                What it does
              </h5>
              <p style={{ color: palette.text, opacity: 0.8 }}>{whatItDoes}</p>
            </div>

            <div>
              <h5 className="font-medium" style={{ color: palette.primary }}>
                Why it matters
              </h5>
              <p style={{ color: palette.text, opacity: 0.8 }}>{whyItMatters}</p>
            </div>

            <div>
              <h5 className="font-medium" style={{ color: palette.primary }}>
                Who it matters for
              </h5>
              <p style={{ color: palette.text, opacity: 0.8 }}>{whoItMattersFor}</p>
            </div>

            <div>
              <h5 className="font-medium" style={{ color: palette.primary }}>
                How to read
              </h5>
              <p style={{ color: palette.text, opacity: 0.8 }}>{howToRead}</p>
            </div>
          </div>

          <button
            onClick={() => setIsOpen(false)}
            className="mt-3 w-full py-1.5 rounded-lg text-sm font-medium"
            style={{
              backgroundColor: palette.primary,
              color: "#ffffff",
            }}
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}