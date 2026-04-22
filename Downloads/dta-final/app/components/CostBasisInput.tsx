"use client";

import { useState, useEffect } from "react";
import { useColorPalette } from "../context/ColorPaletteContext";
import { fetchQuote, fetchHistory, StockQuote, StockHistory } from "@/lib/client";

interface CostBasisEntry {
  id: string;
  symbol: string;
  shares: number;
  purchasePrice: number;
  purchaseDate: string;
  currentPrice?: number;
  currentValue?: number;
  gainLoss?: number;
  gainLossPercent?: number;
  taxEstimate?: number;
}

interface CostBasisInputProps {
  onClose?: () => void;
}

const TAX_RATES = [
  { label: "Long-term (>1 year)", rate: 0.15, shortLabel: "15%" },
  { label: "Short-term (<1 year)", rate: 0.22, shortLabel: "22%" },
  { label: "High income", rate: 0.20, shortLabel: "20%" },
];

export default function CostBasisInput({ onClose }: CostBasisInputProps) {
  const { palette } = useColorPalette();
  const [entries, setEntries] = useState<CostBasisEntry[]>([]);
  const [newSymbol, setNewSymbol] = useState("");
  const [newShares, setNewShares] = useState("");
  const [newPurchasePrice, setNewPurchasePrice] = useState("");
  const [newPurchaseDate, setNewPurchaseDate] = useState("");
  const [selectedTaxRate, setSelectedTaxRate] = useState(0.15);
  const [loading, setLoading] = useState(false);
  const [quotes, setQuotes] = useState<Record<string, StockQuote>>({});

  useEffect(() => {
    const saved = localStorage.getItem("costBasisEntries");
    if (saved) {
      try {
        setEntries(JSON.parse(saved));
      } catch (e) {
        // Use defaults
      }
    }

    const savedTaxRate = localStorage.getItem("taxRate");
    if (savedTaxRate) {
      setSelectedTaxRate(parseFloat(savedTaxRate));
    }
  }, []);

  useEffect(() => {
    // Fetch current prices for all symbols
    const fetchPrices = async () => {
      const symbols = [...new Set(entries.map(e => e.symbol))];
      if (symbols.length === 0) return;

      setLoading(true);
      const newQuotes: Record<string, StockQuote> = {};

      for (const symbol of symbols) {
        try {
          const quote = await fetchQuote(symbol);
          newQuotes[symbol] = quote;
        } catch (e) {
          // Ignore errors
        }
      }

      setQuotes(newQuotes);
      setLoading(false);
    };

    if (entries.length > 0) {
      fetchPrices();
    }
  }, [entries.length > 0]);

  const saveEntries = (newEntries: CostBasisEntry[]) => {
    setEntries(newEntries);
    localStorage.setItem("costBasisEntries", JSON.stringify(newEntries));
  };

  const addEntry = () => {
    if (!newSymbol || !newShares || !newPurchasePrice || !newPurchaseDate) return;

    const symbol = newSymbol.toUpperCase().trim();
    const entry: CostBasisEntry = {
      id: Date.now().toString(),
      symbol,
      shares: parseFloat(newShares),
      purchasePrice: parseFloat(newPurchasePrice),
      purchaseDate: newPurchaseDate,
    };

    const newEntries = [...entries, entry];
    saveEntries(newEntries);

    setNewSymbol("");
    setNewShares("");
    setNewPurchasePrice("");
    setNewPurchaseDate("");
  };

  const removeEntry = (id: string) => {
    const newEntries = entries.filter(e => e.id !== id);
    saveEntries(newEntries);
  };

  const setTaxRate = (rate: number) => {
    setSelectedTaxRate(rate);
    localStorage.setItem("taxRate", rate.toString());
  };

  const calculateMetrics = (entry: CostBasisEntry) => {
    const currentQuote = quotes[entry.symbol];
    const currentPrice = currentQuote?.price || 0;
    const currentValue = entry.shares * currentPrice;
    const costBasis = entry.shares * entry.purchasePrice;
    const gainLoss = currentValue - costBasis;
    const gainLossPercent = costBasis > 0 ? (gainLoss / costBasis) * 100 : 0;

    // Calculate estimated taxes on gains
    let taxEstimate = 0;
    if (gainLoss > 0) {
      const purchaseDate = new Date(entry.purchaseDate);
      const now = new Date();
      const yearsDiff = (now.getTime() - purchaseDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000);

      if (yearsDiff > 1) {
        // Long-term capital gains
        taxEstimate = gainLoss * 0.15; // Simplified
      } else {
        // Short-term - treated as income
        taxEstimate = gainLoss * selectedTaxRate;
      }
    }

    return {
      currentPrice,
      currentValue,
      gainLoss,
      gainLossPercent,
      taxEstimate,
    };
  };

  const totalCostBasis = entries.reduce((sum, e) => sum + (e.shares * e.purchasePrice), 0);
  const totalCurrentValue = entries.reduce((sum, e) => {
    const { currentValue } = calculateMetrics(e);
    return sum + currentValue;
  }, 0);
  const totalGainLoss = totalCurrentValue - totalCostBasis;
  const totalGainLossPercent = totalCostBasis > 0 ? (totalGainLoss / totalCostBasis) * 100 : 0;
  const totalTaxEstimate = entries.reduce((sum, e) => {
    const { taxEstimate } = calculateMetrics(e);
    return sum + taxEstimate;
  }, 0);

  return (
    <div className="w-full max-w-5xl mx-auto p-6 rounded-xl shadow-lg border" style={{ backgroundColor: palette.background, borderColor: palette.gridLines }}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold" style={{ color: palette.text }}>Cost Basis & P&L Tracking</h2>
        {onClose && (
          <button onClick={onClose} style={{ color: palette.text, opacity: 0.6 }} className="hover:opacity-100">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      <div className="mb-6 p-4 rounded-lg border" style={{ backgroundColor: palette.primary + "10", borderColor: palette.primary + "30" }}>
        <p className="text-sm" style={{ color: palette.text }}>
          <strong>What this shows:</strong> Track your purchase prices to calculate true profit/loss including estimated taxes.
          This helps you understand your actual returns after tax implications.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="p-4 rounded-lg border" style={{ borderColor: palette.gridLines }}>
          <div className="text-sm" style={{ color: palette.text, opacity: 0.7 }}>Total Cost Basis</div>
          <div className="text-xl font-bold" style={{ color: palette.text }}>
            ${totalCostBasis.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
        <div className="p-4 rounded-lg border" style={{ borderColor: palette.gridLines }}>
          <div className="text-sm" style={{ color: palette.text, opacity: 0.7 }}>Current Value</div>
          <div className="text-xl font-bold" style={{ color: palette.text }}>
            ${totalCurrentValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
        <div className="p-4 rounded-lg border" style={{ borderColor: palette.positive + '50' }}>
          <div className="text-sm" style={{ color: palette.text, opacity: 0.7 }}>Total Gain/Loss</div>
          <div className="text-xl font-bold" style={{ color: totalGainLoss >= 0 ? palette.positive : palette.negative }}>
            {totalGainLoss >= 0 ? "+" : ""}${totalGainLoss.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            <span className="text-xs ml-1">({totalGainLossPercent >= 0 ? "+" : ""}{totalGainLossPercent.toFixed(1)}%)</span>
          </div>
        </div>
        <div className="p-4 rounded-lg border" style={{ borderColor: palette.negative + '50', backgroundColor: palette.negative + '10' }}>
          <div className="text-sm" style={{ color: palette.text, opacity: 0.7 }}>Est. Tax on Gains</div>
          <div className="text-xl font-bold" style={{ color: palette.negative }}>
            ${totalTaxEstimate.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {/* Tax Rate Selection */}
      <div className="mb-6 p-4 rounded-lg border" style={{ backgroundColor: palette.background, borderColor: palette.gridLines }}>
        <h3 className="font-semibold mb-3" style={{ color: palette.text }}>Tax Rate for Calculations</h3>
        <div className="flex flex-wrap gap-3">
          {TAX_RATES.map(({ label, rate, shortLabel }) => (
            <button
              key={rate}
              onClick={() => setTaxRate(rate)}
              className="px-4 py-2 rounded-lg border text-sm font-medium transition"
              style={{
                borderColor: selectedTaxRate === rate ? palette.primary : palette.gridLines,
                backgroundColor: selectedTaxRate === rate ? palette.primary + "15" : palette.background,
                color: selectedTaxRate === rate ? palette.primary : palette.text,
              }}
            >
              {shortLabel} - {label}
            </button>
          ))}
        </div>
      </div>

      {/* Add New Entry */}
      <div className="mb-6 p-4 rounded-lg border" style={{ backgroundColor: palette.background, borderColor: palette.gridLines }}>
        <h3 className="font-semibold mb-3" style={{ color: palette.text }}>Add Purchase</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: palette.text }}>Symbol</label>
            <input
              type="text"
              value={newSymbol}
              onChange={(e) => setNewSymbol(e.target.value)}
              placeholder="AAPL"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
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
            <label className="block text-xs font-medium mb-1" style={{ color: palette.text }}>Purchase Price</label>
            <input
              type="number"
              value={newPurchasePrice}
              onChange={(e) => setNewPurchasePrice(e.target.value)}
              placeholder="150.00"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: palette.text }}>Purchase Date</label>
            <input
              type="date"
              value={newPurchaseDate}
              onChange={(e) => setNewPurchaseDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={addEntry}
              disabled={loading || !newSymbol || !newShares || !newPurchasePrice || !newPurchaseDate}
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
                <th className="text-right py-3 px-2 text-sm font-semibold" style={{ color: palette.text }}>Cost/Share</th>
                <th className="text-right py-3 px-2 text-sm font-semibold" style={{ color: palette.text }}>Cost Basis</th>
                <th className="text-right py-3 px-2 text-sm font-semibold" style={{ color: palette.text }}>Current</th>
                <th className="text-right py-3 px-2 text-sm font-semibold" style={{ color: palette.text }}>Gain/Loss</th>
                <th className="text-right py-3 px-2 text-sm font-semibold" style={{ color: palette.negative }}>Est. Tax</th>
                <th className="py-3 px-2"></th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => {
                const { currentPrice, currentValue, gainLoss, gainLossPercent, taxEstimate } = calculateMetrics(entry);
                return (
                  <tr key={entry.id} className="border-b" style={{ borderColor: palette.gridLines + '50' }}>
                    <td className="py-3 px-2 font-medium" style={{ color: palette.text }}>{entry.symbol}</td>
                    <td className="py-3 px-2 text-right" style={{ color: palette.text }}>{entry.shares.toLocaleString()}</td>
                    <td className="py-3 px-2 text-right" style={{ color: palette.text }}>${entry.purchasePrice.toFixed(2)}</td>
                    <td className="py-3 px-2 text-right" style={{ color: palette.text, opacity: 0.7 }}>
                      ${(entry.shares * entry.purchasePrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-2 text-right" style={{ color: palette.text }}>
                      ${currentPrice.toFixed(2)} x {entry.shares} = ${currentValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-2 text-right font-medium" style={{ color: gainLoss >= 0 ? palette.positive : palette.negative }}>
                      {gainLoss >= 0 ? "+" : ""}${gainLoss.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      <span className="text-xs ml-1">({gainLossPercent >= 0 ? "+" : ""}{gainLossPercent.toFixed(1)}%)</span>
                    </td>
                    <td className="py-3 px-2 text-right" style={{ color: palette.negative }}>
                      ${taxEstimate.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-8" style={{ color: palette.text, opacity: 0.6 }}>
          No holdings added yet. Add your purchases above to track cost basis and P&L.
        </div>
      )}

      <p className="mt-4 text-xs text-center" style={{ color: palette.text, opacity: 0.5 }}>
        Note: Tax estimates are simplified and based on holding period. Consult a tax professional for accurate tax calculations.
        This is for educational purposes only, not financial advice.
      </p>
    </div>
  );
}