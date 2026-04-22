"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export interface ColorPalette {
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  positive: string;
  negative: string;
  background: string;
  text: string;
  gridLines: string;
  isDarkMode?: boolean;
}

export interface PaletteWithVariant {
  light: ColorPalette;
  dark: ColorPalette;
}

export const colorPalettes: Record<string, PaletteWithVariant> = {
  // Standard light mode - blue/green/red
  default: {
    light: {
      name: "Default Blue",
      primary: "#3b82f6",
      secondary: "#1e40af",
      accent: "#60a5fa",
      positive: "#22c55e",
      negative: "#ef4444",
      background: "#ffffff",
      text: "#1f2937",
      gridLines: "#e5e7eb",
    },
    dark: {
      name: "Default Blue Dark",
      primary: "#60a5fa",
      secondary: "#93c5fd",
      accent: "#3b82f6",
      positive: "#4ade80",
      negative: "#f87171",
      background: "#111827",
      text: "#f9fafb",
      gridLines: "#374151",
    },
  },
  // High contrast light mode
  highContrast: {
    light: {
      name: "High Contrast",
      primary: "#0066cc",
      secondary: "#003366",
      accent: "#3399ff",
      positive: "#009e73",
      negative: "#d55e00",
      background: "#ffffff",
      text: "#000000",
      gridLines: "#cccccc",
    },
    dark: {
      name: "High Contrast Dark",
      primary: "#3399ff",
      secondary: "#66b3ff",
      accent: "#0066cc",
      positive: "#00cc99",
      negative: "#ff8000",
      background: "#000000",
      text: "#ffffff",
      gridLines: "#404040",
    },
  },
  // Colorblind-safe palette (blue/orange instead of red/green)
  colorblind: {
    light: {
      name: "Colorblind Safe (Blue/Orange)",
      primary: "#0072b2",
      secondary: "#004488",
      accent: "#56b4e9",
      positive: "#e69f00",
      negative: "#d55e00",
      background: "#ffffff",
      text: "#1f2937",
      gridLines: "#e5e7eb",
    },
    dark: {
      name: "Colorblind Safe Dark",
      primary: "#56b4e9",
      secondary: "#89cff0",
      accent: "#0072b2",
      positive: "#f5b041",
      negative: "#ff9933",
      background: "#0d1b2a",
      text: "#e0e7ff",
      gridLines: "#1e3a5f",
    },
  },
  // Protanopia-safe (red-blind) - uses blue/purple instead of red
  protanopia: {
    light: {
      name: "Protanopia Safe",
      primary: "#0072b2",
      secondary: "#004488",
      accent: "#56b4e9",
      positive: "#009e73",
      negative: "#cc79a7",
      background: "#ffffff",
      text: "#1f2937",
      gridLines: "#e5e7eb",
    },
    dark: {
      name: "Protanopia Safe Dark",
      primary: "#56b4e9",
      secondary: "#89cff0",
      accent: "#0072b2",
      positive: "#00cc99",
      negative: "#e0a0c0",
      background: "#0d1b2a",
      text: "#e0e7ff",
      gridLines: "#1e3a5f",
    },
  },
  // Deuteranopia-safe (green-blind) - uses blue/orange instead of red/green
  deuteranopia: {
    light: {
      name: "Deuteranopia Safe",
      primary: "#0072b2",
      secondary: "#004488",
      accent: "#56b4e9",
      positive: "#e69f00",
      negative: "#d55e00",
      background: "#ffffff",
      text: "#1f2937",
      gridLines: "#e5e7eb",
    },
    dark: {
      name: "Deuteranopia Safe Dark",
      primary: "#56b4e9",
      secondary: "#89cff0",
      accent: "#0072b2",
      positive: "#f5b041",
      negative: "#ff9933",
      background: "#0d1b2a",
      text: "#e0e7ff",
      gridLines: "#1e3a5f",
    },
  },
  // Tritanopia-safe (blue-yellow blind)
  tritanopia: {
    light: {
      name: "Tritanopia Safe",
      primary: "#e69f00",
      secondary: "#b07d00",
      accent: "#f5b041",
      positive: "#009e73",
      negative: "#d55e00",
      background: "#ffffff",
      text: "#1f2937",
      gridLines: "#e5e7eb",
    },
    dark: {
      name: "Tritanopia Safe Dark",
      primary: "#f5b041",
      secondary: "#ffc44c",
      accent: "#e69f00",
      positive: "#00cc99",
      negative: "#ff9933",
      background: "#1a1510",
      text: "#fff3e0",
      gridLines: "#3d3425",
    },
  },
  // Achromatopsia - complete color blindness (grayscale)
  grayscale: {
    light: {
      name: "Grayscale",
      primary: "#4a4a4a",
      secondary: "#2d2d2d",
      accent: "#6b6b6b",
      positive: "#737373",
      negative: "#1a1a1a",
      background: "#ffffff",
      text: "#1f2937",
      gridLines: "#d1d5db",
    },
    dark: {
      name: "Grayscale Dark",
      primary: "#a3a3a3",
      secondary: "#d4d4d4",
      accent: "#737373",
      positive: "#525252",
      negative: "#e5e5e5",
      background: "#171717",
      text: "#f5f5f5",
      gridLines: "#404040",
    },
  },
  // Sepia - warm tones for reading comfort
  sepia: {
    light: {
      name: "Sepia",
      primary: "#704214",
      secondary: "#4a2c0a",
      accent: "#a06b3a",
      positive: "#6b8e23",
      negative: "#8b4513",
      background: "#f4ecd8",
      text: "#3d2914",
      gridLines: "#d4c4a8",
    },
    dark: {
      name: "Sepia Dark",
      primary: "#a06b3a",
      secondary: "#704214",
      accent: "#c49a5a",
      positive: "#8fbc5a",
      negative: "#b86b3a",
      background: "#2a1f14",
      text: "#f4ecd8",
      gridLines: "#4a3a28",
    },
  },
  // Blue-Yellow colorblind safe
  blueYellow: {
    light: {
      name: "Blue-Yellow Safe",
      primary: "#005f73",
      secondary: "#0a9396",
      accent: "#94d2bd",
      positive: "#ee9b00",
      negative: "#ae2012",
      background: "#ffffff",
      text: "#1f2937",
      gridLines: "#e5e7eb",
    },
    dark: {
      name: "Blue-Yellow Safe Dark",
      primary: "#0a9396",
      secondary: "#1db9bd",
      accent: "#5ee0d4",
      positive: "#f5b041",
      negative: "#d44a35",
      background: "#0a1a1f",
      text: "#e0f7fa",
      gridLines: "#1a3040",
    },
  },
  // Cyan-Magenta safe palette
  cyanMagenta: {
    light: {
      name: "Cyan-Magenta Safe",
      primary: "#7b2cbf",
      secondary: "#5a189a",
      accent: "#9d4edd",
      positive: "#00b4d8",
      negative: "#e63946",
      background: "#ffffff",
      text: "#1f2937",
      gridLines: "#e5e7eb",
    },
    dark: {
      name: "Cyan-Magenta Safe Dark",
      primary: "#9d4edd",
      secondary: "#b76ee8",
      accent: "#c77dff",
      positive: "#00d4f0",
      negative: "#ff5a67",
      background: "#0f0a1a",
      text: "#f3e5ff",
      gridLines: "#2a1a3a",
    },
  },
  // Low vision - high saturation, highly distinguishable colors
  lowVision: {
    light: {
      name: "Low Vision",
      primary: "#0000ff",
      secondary: "#000080",
      accent: "#0000cc",
      positive: "#008000",
      negative: "#ff0000",
      background: "#ffffff",
      text: "#000000",
      gridLines: "#808080",
    },
    dark: {
      name: "Low Vision Dark",
      primary: "#5555ff",
      secondary: "#5555aa",
      accent: "#7777ff",
      positive: "#00aa00",
      negative: "#ff5555",
      background: "#000000",
      text: "#ffffff",
      gridLines: "#404040",
    },
  },
  // Brown-Blue (alternative colorblind safe)
  brownBlue: {
    light: {
      name: "Brown-Blue Safe",
      primary: "#5e3c58",
      secondary: "#4a2c44",
      accent: "#7d5a75",
      positive: "#0072b2",
      negative: "#d55e00",
      background: "#f5f5f5",
      text: "#2d2d2d",
      gridLines: "#d1d1d1",
    },
    dark: {
      name: "Brown-Blue Safe Dark",
      primary: "#8a6b85",
      secondary: "#6b4a64",
      accent: "#a08898",
      positive: "#4090c2",
      negative: "#e89040",
      background: "#151518",
      text: "#e8e8e8",
      gridLines: "#2a2a30",
    },
  },
  // Teal-Orange (high contrast colorblind safe)
  tealOrange: {
    light: {
      name: "Teal-Orange",
      primary: "#008080",
      secondary: "#004d4d",
      accent: "#20b2aa",
      positive: "#ff8c00",
      negative: "#dc143c",
      background: "#ffffff",
      text: "#1f2937",
      gridLines: "#e5e7eb",
    },
    dark: {
      name: "Teal-Orange Dark",
      primary: "#20b2aa",
      secondary: "#40d4d4",
      accent: "#008080",
      positive: "#ffb040",
      negative: "#ff4060",
      background: "#0a1414",
      text: "#e0ffff",
      gridLines: "#1a3030",
    },
  },
};

type PaletteKey = keyof typeof colorPalettes;

interface ColorPaletteContextType {
  palette: ColorPalette;
  paletteKey: PaletteKey;
  setPaletteKey: (key: PaletteKey) => void;
  isDarkMode: boolean;
  setIsDarkMode: (dark: boolean) => void;
}

const ColorPaletteContext = createContext<ColorPaletteContextType | null>(null);

export function ColorPaletteProvider({ children }: { children: ReactNode }) {
  const [paletteKey, setPaletteKey] = useState<PaletteKey>("default");
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const paletteVariant = colorPalettes[paletteKey];

  // Use light or dark variant based on isDarkMode
  const palette = isDarkMode ? paletteVariant.dark : paletteVariant.light;

  return (
    <ColorPaletteContext.Provider value={{ palette, paletteKey, setPaletteKey, isDarkMode, setIsDarkMode }}>
      {children}
    </ColorPaletteContext.Provider>
  );
}

export function useColorPalette() {
  const context = useContext(ColorPaletteContext);
  if (!context) {
    throw new Error("useColorPalette must be used within ColorPaletteProvider");
  }
  return context;
}