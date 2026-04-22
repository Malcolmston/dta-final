"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useColorPalette } from "../context/ColorPaletteContext";

interface TickerInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  defaultTickers?: string[];
  maxPills?: number;
}

const POPULAR_TICKERS = [
  "AAPL", "GOOGL", "MSFT", "AMZN", "NVDA", "META", "TSLA", "JPM",
  "V", "UNH", "JNJ", "WMT", "PG", "HD", "PEP", "KO", "COST",
  "DIS", "NFLX", "ADBE", "CRM", "NKE", "VZ", "INTC", "AMD",
  "SPY", "QQQ", "IWM", "DIA", "TLT", "GLD",
  "BTC", "ETH", "SOL", "XRP", "ADA", "DOGE"
];

// Validate ticker symbol (1-5 uppercase letters)
const isValidTicker = (ticker: string): boolean => {
  return /^[A-Z]{1,5}$/.test(ticker);
};

export default function TickerInput({
  value,
  onChange,
  onSubmit,
  placeholder,
  defaultTickers = ["AAPL"],
  maxPills = 10
}: TickerInputProps) {
  const { palette } = useColorPalette();
  const [pills, setPills] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const initialized = useRef(false);
  const [inputValue, setInputValue] = useState("");

  // Initialize on mount
  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;

      let pillsToUse: string[];
      if (defaultTickers && defaultTickers.length > 0) {
        pillsToUse = defaultTickers.slice(0, maxPills);
      } else {
        pillsToUse = ["AAPL"];
      }

      setPills(pillsToUse);
      // Update parent but keep local input empty
      onChange(pillsToUse.join(","));
      setTimeout(() => onSubmit(), 0);
    }
  }, []);

  useEffect(() => {
    if (inputValue.trim().length > 0 && pills.length < maxPills) {
      const filtered = POPULAR_TICKERS
        .filter(t => t.toLowerCase().startsWith(inputValue.toLowerCase()))
        .filter(t => !pills.includes(t))
        .slice(0, 5);
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
    }
  }, [inputValue, pills, maxPills]);

  const addPill = (ticker?: string) => {
    const t = (ticker || inputValue).toUpperCase().trim();
    if (t && isValidTicker(t) && !pills.includes(t) && pills.length < maxPills) {
      const newPills = [...pills, t];
      setPills(newPills);
      setInputValue("");
      onChange(newPills.join(","));
      onSubmit();
    } else if (t) {
      setInputValue("");
    }
  };

  const removePill = (ticker: string) => {
    const newPills = pills.filter(p => p !== ticker);
    setPills(newPills);
    onChange(newPills.join(","));
    onSubmit();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.trim()) {
      e.preventDefault();
      e.stopPropagation();
      addPill();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Validate: only allow A-Z characters, max 5
    const val = e.target.value.toUpperCase();
    if (/^[A-Z]{0,5}$/.test(val)) {
      setInputValue(val);
      onChange(val);
    }
  };

  return (
    <div className="w-full relative">
      <div className="flex flex-wrap items-center gap-2 p-2 border rounded-lg min-h-[44px]" style={{ borderColor: palette.gridLines, backgroundColor: palette.background }}>
        {pills.map((ticker) => (
          <span
            key={ticker}
            className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium shrink-0"
            style={{ backgroundColor: palette.primary + "20", color: palette.primary }}
          >
            {ticker}
            <button
              type="button"
              onClick={() => removePill(ticker)}
              className="w-4 h-4 flex items-center justify-center rounded-full focus:ring-2 focus:outline-none"
              style={{ backgroundColor: palette.primary + "30", color: palette.primary }}
              aria-label={`Remove ${ticker}`}
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          placeholder={pills.length === 0 ? placeholder : ""}
          className="flex-1 min-w-25 px-2 py-1 outline-none bg-transparent"
          style={{ color: palette.text }}
        />
        {inputValue.trim() && pills.length < maxPills && (
          <button
            type="button"
            onClick={() => addPill()}
            className="px-3 py-1 text-sm rounded-lg shrink-0"
            style={{ backgroundColor: palette.primary, color: "#fff" }}
          >
            Add
          </button>
        )}
      </div>

      {showSuggestions && pills.length < maxPills && (
        <div className="absolute z-50 w-full mt-1 border rounded-lg shadow-lg" style={{ backgroundColor: palette.background, borderColor: palette.gridLines }}>
          {suggestions.map((ticker) => (
            <button
              key={ticker}
              type="button"
              onClick={() => addPill(ticker)}
              className="w-full px-4 py-2 text-left text-sm hover:bg-blue-50"
            >
              {ticker}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
