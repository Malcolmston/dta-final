"use client";

import { useColorPalette } from "../context/ColorPaletteContext";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  children: React.ReactNode;
}

export default function Button({ variant = "primary", children, className = "", style, ...props }: ButtonProps) {
  const { palette } = useColorPalette();

  const getVariantStyles = () => {
    switch (variant) {
      case "primary":
        return {
          backgroundColor: palette.primary,
          color: "#ffffff",
          borderColor: palette.primary,
        };
      case "secondary":
        return {
          backgroundColor: palette.gridLines,
          color: palette.text,
          borderColor: palette.gridLines,
        };
      case "danger":
        return {
          backgroundColor: palette.negative,
          color: "#ffffff",
          borderColor: palette.negative,
        };
      case "ghost":
        return {
          backgroundColor: "transparent",
          color: palette.text,
          borderColor: "transparent",
        };
    }
  };

  const baseStyle: React.CSSProperties = {
    ...getVariantStyles(),
    padding: "0.5rem 1rem",
    borderRadius: "0.5rem",
    fontSize: "0.875rem",
    fontWeight: 500,
    cursor: "pointer",
    transition: "all 0.2s",
    border: "1px solid",
    ...style,
  };

  return (
    <button
      {...props}
      style={baseStyle}
      className={className}
      onMouseEnter={(e) => {
        e.currentTarget.style.opacity = "0.9";
        if (props.onMouseEnter) props.onMouseEnter(e);
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.opacity = "1";
        if (props.onMouseLeave) props.onMouseLeave(e);
      }}
    >
      {children}
    </button>
  );
}