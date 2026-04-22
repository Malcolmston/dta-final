"use client";

import { useColorPalette } from "../context/ColorPaletteContext";

interface CardGridProps {
  children: React.ReactNode;
  columns?: 2 | 3 | 4;
  className?: string;
}

export default function CardGrid({ children, columns = 4, className = "" }: CardGridProps) {
  const { palette } = useColorPalette();

  const gridCols = {
    2: "grid-cols-2",
    3: "grid-cols-3",
    4: "grid-cols-2 md:grid-cols-4"
  };

  return (
    <div className={`grid ${gridCols[columns]} gap-4 mb-6`}>
      {children}
    </div>
  );
}