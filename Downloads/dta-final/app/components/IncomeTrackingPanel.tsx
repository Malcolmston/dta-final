"use client";

import { useState, useEffect } from "react";
import { useColorPalette } from "../context/ColorPaletteContext";
import { fetchStockInfo, StockInfo } from "@/lib/client";

interface IncomeEntry {
  id: string;
  symbol: string;
  shares: number;
  dividendPerShare: number;
  frequency: "monthly" | "quarterly" | "annually";
  yield?: number;
}

interface IncomeTrackingPanelProps {
  onClose?: () => void;
}

export default function IncomeTrackingPanel({ onClose }: IncomeTrackingPanelProps) {
  const { palette } = useColorPalette();
  const [entries, setEntries] = useState<IncomeEntry[]>([]);
  const [newSymbol, setNewSymbol] = useState("");
  const [newShares, setNewShares] = useState("");
  const [newDividend, setNewDividend] = useState("");
  const [newFrequency, setNewFrequency] = useState<"monthly" | "quarterly" | "annually">("quarterly");
  const [loading, setLoading] = useState(false);
  const [stockInfo, setStockInfo] = useState<Record<string, StockInfo>>({});

  useEffect(() => {
    const saved = localStorage.getItem("incomeEntries");
    if (saved) {
      try {
        setEntries(JSON.parse(saved));
      } catch (e) {
        // Use defaults
      }
    }
  }, []);

  const saveEntries = (newEntries: IncomeEntry[]) => {
    setEntries(newEntries);
    localStorage.setItem("incomeEntries", JSON.stringify(newEntries));
  };

  const addEntry = async () => {
    if (!newSymbol || !newShares || !newDividend) return;

    const symbol = newSymbol.toUpperCase().trim();

    let dividendPerShare = parseFloat(newDividend);
    if (isNaN(dividendPerShare)) {
      // Try to fetch from stock info
      if (stockInfo[symbol]?.dividendYield) {
        // This would require current price to calculate
        dividendPerShare = 0;
      }
    }

    const entry: IncomeEntry = {
      id: Date.now().toString(),
      symbol,
      shares: parseFloat(newShares),
      dividendPerShare,
      frequency: newFrequency,
    };

    const newEntries = [...entries, entry];
    saveEntries(newEntries);

    // Try to fetch stock info for yield calculation
    setLoading(true);
    try {
      const info = await fetchStockInfo(symbol);
      setStockInfo(prev => ({ ...prev, [symbol]: info }));
    } catch (e) {
      // Ignore errors
    }
    setLoading(false);

    setNewSymbol("");
    setNewShares("");
    setNewDividend("");
  };

  const removeEntry = (id: string) => {
    const newEntries = entries.filter(e => e.id !== id);
    saveEntries(newEntries);
  };

  const calculateAnnualIncome = (entry: IncomeEntry): number => {
    let annualDividend = entry.dividendPerShare * entry.shares;
    if (entry.frequency === "monthly") {
      annualDividend *= 12;
    } else if (entry.frequency === "quarterly") {
      annualDividend *= 4;
    }
    return annualDividend;
  };

  const totalAnnualIncome = entries.reduce((sum, entry) => sum + calculateAnnualIncome(entry), 0);
  const totalMonthlyIncome = totalAnnualIncome / 12;

  return (
    <div className="w-full max-w-4xl mx-auto p-6 rounded-xl shadow-lg border" style={{ backgroundColor: palette.background, borderColor: palette.gridLines }}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold" style={{ color: palette.text }}>Income Tracking</h2>
        {onClose && (
          <button onClick={onClose} style={{ color: palette.text, opacity: 0.6 }}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      <div className="mb-6 p-4 rounded-lg border" style={{ backgroundColor: palette.primary + "10", borderColor: palette.primary + "30" }}>
        <p className="text-sm" style={{ color: palette.text }}>
          <strong>What this shows:</strong> Track dividend income, interest payments, and distribution yields from your investments.
          Enter your holdings with their dividend rates to see your expected income.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-4 rounded-lg border" style={{ borderColor: palette.positive + '50', backgroundColor: palette.positive + '10' }}>
          <div className="text-sm" style={{ color: palette.text, opacity: 0.7 }}>Annual Income</div>
          <div className="text-2xl font-bold" style={{ color: palette.positive }}>
            ${totalAnnualIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
        <div className="p-4 rounded-lg border" style={{ borderColor: palette.primary + '50', backgroundColor: palette.primary + '10' }}>
          <div className="text-sm" style={{ color: palette.text, opacity: 0.7 }}>Monthly Income</div>
          <div className="text-2xl font-bold" style={{ color: palette.primary }}>
            ${totalMonthlyIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {/* Add New Entry */}
      <div className="mb-6 p-4 rounded-lg border" style={{ backgroundColor: palette.background, borderColor: palette.gridLines }}>
        <h3 className="font-semibold mb-3" style={{ color: palette.text }}>Add Income Source</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: palette.text }}>Symbol</label>
            <input
              type="text"
              value={newSymbol}
              onChange={(e) => setNewSymbol(e.target.value)}
              placeholder="AAPL"
              className="w-full px-3 py-2 border rounded-lg text-sm"
              style={{ borderColor: palette.gridLines, backgroundColor: palette.background, color: palette.text }}
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: palette.text }}>Shares</label>
            <input
              type="number"
              value={newShares}
              onChange={(e) => setNewShares(e.target.value)}
              placeholder="100"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Div/Share ($)</label>
            <input
              type="number"
              value={newDividend}
              onChange={(e) => setNewDividend(e.target.value)}
              placeholder="0.24"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Frequency</label>
            <select
              value={newFrequency}
              onChange={(e) => setNewFrequency(e.target.value as "monthly" | "quarterly" | "annually")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="annually">Annually</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={addEntry}
              disabled={loading || !newSymbol || !newShares}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              Add
            </button>
          </div>
        </div>
      </div>

      {/* Entries Table */}
      {entries.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b" style={{ borderColor: palette.gridLines }}>
                <th className="text-left py-3 px-2 text-sm font-semibold" style={{ color: palette.text }}>Symbol</th>
                <th className="text-right py-3 px-2 text-sm font-semibold" style={{ color: palette.text }}>Shares</th>
                <th className="text-right py-3 px-2 text-sm font-semibold" style={{ color: palette.text }}>Div/Share</th>
                <th className="text-center py-3 px-2 text-sm font-semibold" style={{ color: palette.text }}>Frequency</th>
                <th className="text-right py-3 px-2 text-sm font-semibold" style={{ color: palette.text }}>Annual Income</th>
                <th className="py-3 px-2"></th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id} className="border-b" style={{ borderColor: palette.gridLines + '50' }}>
                  <td className="py-3 px-2 font-medium" style={{ color: palette.text }}>{entry.symbol}</td>
                  <td className="py-3 px-2 text-right" style={{ color: palette.text }}>{entry.shares.toLocaleString()}</td>
                  <td className="py-3 px-2 text-right" style={{ color: palette.text }}>${entry.dividendPerShare.toFixed(2)}</td>
                  <td className="py-3 px-2 text-center capitalize" style={{ color: palette.text, opacity: 0.7 }}>{entry.frequency}</td>
                  <td className="py-3 px-2 text-right font-medium" style={{ color: palette.positive }}>
                    ${calculateAnnualIncome(entry).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-2">
                    <button
                      onClick={() => removeEntry(entry.id)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          No income sources added yet. Add your dividend-paying stocks above.
        </div>
      )}

      <p className="mt-4 text-xs text-gray-500 text-center">
        Note: Dividends are not guaranteed and may change. This is for estimation purposes only.
      </p>
    </div>
  );
}