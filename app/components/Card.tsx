"use client";

import { useColorPalette } from "../context/ColorPaletteContext";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
}

export default function Card({ children, className = "", title }: CardProps) {
  const { palette } = useColorPalette();

  return (
    <div
      className={`w-full max-w-5xl mx-auto p-6 rounded-xl shadow-lg ${className}`}
      style={{
        backgroundColor: palette.background,
        border: `1px solid ${palette.gridLines}`
      }}
    >
      {title && (
        <h2 className="text-2xl font-bold mb-2" style={{ color: palette.text }}>
          {title}
        </h2>
      )}
      {children}
    </div>
  );
}