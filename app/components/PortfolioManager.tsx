"use client";

import { useState, useEffect, useMemo } from "react";
import { fetchQuote } from "@/lib/client";
import { useColorPalette } from "../context/ColorPaletteContext";
import Card from "./Card";
import StatCard from "./StatCard";

interface Holding {
  id: string;
  ticker: string;
  shares: number;
  avgCostBasis: number;
}

interface Transaction {
  id: string;
  ticker: string;
  type: "buy" | "sell";
  shares: number;
  price: number;
  date: string;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

const PORTFOLIO_HOLDINGS_KEY = "portfolio_holdings";
const PORTFOLIO_TRANSACTIONS_KEY = "portfolio_transactions";

const loadFromStorage = <T,>(key: string, defaultValue: T): T => {
  if (typeof window === "undefined") return defaultValue;
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch {
    return defaultValue;
  }
};

const saveToStorage = <T,>(key: string, value: T): void => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error("Failed to save to localStorage:", e);
  }
};

export default function PortfolioManager() {
  const { palette } = useColorPalette();

  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const [newTicker, setNewTicker] = useState("");
  const [newShares, setNewShares] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [transactionType, setTransactionType] = useState<"buy" | "sell">("buy");
  const [transactionShares, setTransactionShares] = useState("");
  const [transactionPrice, setTransactionPrice] = useState("");
  const [transactionDate, setTransactionDate] = useState(new Date().toISOString().split("T")[0]);

  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"holdings" | "transactions" | "performance">("holdings");
  const [showAddHolding, setShowAddHolding] = useState(false);
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [prices, setPrices] = useState<Record<string, number>>({});

  useEffect(() => {
    const storedHoldings = loadFromStorage<Holding[]>(PORTFOLIO_HOLDINGS_KEY, []);
    const storedTransactions = loadFromStorage<Transaction[]>(PORTFOLIO_TRANSACTIONS_KEY, []);
    setHoldings(storedHoldings);
    setTransactions(storedTransactions);

    const fetchPrices = async () => {
      const priceMap: Record<string, number> = {};
      for (const h of storedHoldings) {
        try {
          const quote = await fetchQuote(h.ticker);
          priceMap[h.ticker] = quote.price;
        } catch {
          priceMap[h.ticker] = h.avgCostBasis;
        }
      }
      setPrices(priceMap);
    };
    fetchPrices();
  }, []);

  useEffect(() => {
    if (holdings.length > 0) {
      saveToStorage(PORTFOLIO_HOLDINGS_KEY, holdings);
    }
  }, [holdings]);

  useEffect(() => {
    if (transactions.length > 0) {
      saveToStorage(PORTFOLIO_TRANSACTIONS_KEY, transactions);
    }
  }, [transactions]);

  const totals = useMemo(() => {
    const totalCostBasis = holdings.reduce((sum, h) => sum + (h.shares * h.avgCostBasis), 0);
    const totalCurrentValue = holdings.reduce((sum, h) => {
      const currentPrice = prices[h.ticker] || h.avgCostBasis;
      return sum + (h.shares * currentPrice);
    }, 0);
    return {
      totalCostBasis,
      totalCurrentValue,
      totalGain: totalCurrentValue - totalCostBasis,
      totalGainPercent: totalCostBasis > 0 ? ((totalCurrentValue - totalCostBasis) / totalCostBasis) * 100 : 0,
    };
  }, [holdings, prices]);

  const addHolding = async () => {
    if (!newTicker.trim() || !newShares || !newPrice) return;

    const ticker = newTicker.toUpperCase().trim();
    const shares = parseFloat(newShares);
    const price = parseFloat(newPrice);

    if (isNaN(shares) || isNaN(price) || shares <= 0 || price <= 0) return;

    setLoading(true);
    try {
      let currentPrice = price;
      try {
        const quote = await fetchQuote(ticker);
        currentPrice = quote.price;
        setPrices(prev => ({ ...prev, [ticker]: currentPrice }));
      } catch {
        currentPrice = price;
      }

      const existingIndex = holdings.findIndex((h) => h.ticker === ticker);
      if (existingIndex >= 0) {
        const existing = holdings[existingIndex];
        const totalShares = existing.shares + shares;
        const totalCost = (existing.shares * existing.avgCostBasis) + (shares * price);
        const newAvgCost = totalCost / totalShares;

        const updated = [...holdings];
        updated[existingIndex] = {
          ...existing,
          shares: totalShares,
          avgCostBasis: newAvgCost,
        };
        setHoldings(updated);
      } else {
        const newHolding: Holding = {
          id: generateId(),
          ticker,
          shares,
          avgCostBasis: price,
        };
        setHoldings([...holdings, newHolding]);
      }

      const newTransaction: Transaction = {
        id: generateId(),
        ticker,
        type: "buy",
        shares,
        price,
        date: transactionDate,
      };
      setTransactions([...transactions, newTransaction]);

      setNewTicker("");
      setNewShares("");
      setNewPrice("");
      setShowAddHolding(false);
    } catch (error) {
      console.error("Failed to add holding:", error);
    } finally {
      setLoading(false);
    }
  };

  const addTransaction = () => {
    if (!newTicker.trim() || !transactionShares || !transactionPrice) return;

    const ticker = newTicker.toUpperCase().trim();
    const shares = parseFloat(transactionShares);
    const price = parseFloat(transactionPrice);

    if (isNaN(shares) || isNaN(price) || shares <= 0 || price <= 0) return;

    const existingHolding = holdings.find((h) => h.ticker === ticker);

    if (transactionType === "sell") {
      if (!existingHolding || existingHolding.shares < shares) {
        alert("Not enough shares to sell");
        return;
      }

      const updated = holdings.map((h) => {
        if (h.ticker === ticker) {
          const newShares = h.shares - shares;
          if (newShares <= 0) {
            return null;
          }
          return { ...h, shares: newShares };
        }
        return h;
      }).filter(Boolean) as Holding[];
      setHoldings(updated);
    } else {
      if (existingHolding) {
        const totalShares = existingHolding.shares + shares;
        const totalCost = (existingHolding.shares * existingHolding.avgCostBasis) + (shares * price);
        const newAvgCost = totalCost / totalShares;

        const updated = holdings.map((h) => {
          if (h.ticker === ticker) {
            return { ...h, shares: totalShares, avgCostBasis: newAvgCost };
          }
          return h;
        });
        setHoldings(updated);
      } else {
        const newHolding: Holding = {
          id: generateId(),
          ticker,
          shares,
          avgCostBasis: price,
        };
        setHoldings([...holdings, newHolding]);
      }
    }

    const newTransaction: Transaction = {
      id: generateId(),
      ticker,
      type: transactionType,
      shares,
      price,
      date: transactionDate,
    };
    setTransactions([...transactions, newTransaction]);

    setNewTicker("");
    setTransactionShares("");
    setTransactionPrice("");
    setShowAddTransaction(false);
  };

  const removeHolding = (id: string) => {
    const updated = holdings.filter((h) => h.id !== id);
    setHoldings(updated);
    saveToStorage(PORTFOLIO_HOLDINGS_KEY, updated);
  };

  const clearAllData = () => {
    if (confirm("Are you sure you want to clear all portfolio data?")) {
      setHoldings([]);
      setTransactions([]);
      localStorage.removeItem(PORTFOLIO_HOLDINGS_KEY);
      localStorage.removeItem(PORTFOLIO_TRANSACTIONS_KEY);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "percent",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value / 100);
  };

  const getTransactionsForTicker = (ticker: string) => {
    return transactions.filter((t) => t.ticker === ticker);
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-6 rounded-xl shadow-lg" style={{ backgroundColor: palette.background, border: `1px solid ${palette.gridLines}` }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: palette.text }}>My Portfolio</h2>
          <p className="text-sm" style={{ color: palette.text, opacity: 0.7 }}>Track your actual investments with dollar amounts</p>
        </div>
        <button
          onClick={clearAllData}
          className="text-sm"
          style={{ color: palette.negative }}
        >
          Clear All Data
        </button>
      </div>

      <div className="flex border-b mb-6" style={{ borderColor: palette.gridLines }}>
        <button
          onClick={() => setActiveTab("holdings")}
          className="px-4 py-2 font-medium"
          style={{
            color: activeTab === "holdings" ? palette.primary : palette.text,
            borderBottom: activeTab === "holdings" ? `2px solid ${palette.primary}` : "none",
          }}
        >
          Holdings
        </button>
        <button
          onClick={() => setActiveTab("transactions")}
          className="px-4 py-2 font-medium"
          style={{
            color: activeTab === "transactions" ? palette.primary : palette.text,
            borderBottom: activeTab === "transactions" ? `2px solid ${palette.primary}` : "none",
          }}
        >
          Transactions
        </button>
        <button
          onClick={() => setActiveTab("performance")}
          className={`px-4 py-2 font-medium ${
            activeTab === "performance"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "palette.text hover:palette.text"
          }`}
        >
          Performance
        </button>
      </div>

      {activeTab === "holdings" && (
        <div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <StatCard
              label="Total Cost Basis"
              value={formatCurrency(totals.totalCostBasis)}
            />
            <StatCard
              label="Current Value"
              value={formatCurrency(totals.totalCurrentValue)}
            />
            <StatCard
              label="Total Gain/Loss"
              value={formatCurrency(totals.totalGain)}
              change={formatCurrency(totals.totalGain)}
              trend={totals.totalGain >= 0 ? "up" : "down"}
            />
            <StatCard
              label="Return"
              value={formatPercent(totals.totalGainPercent)}
              change={formatPercent(totals.totalGainPercent)}
              trend={totals.totalGainPercent >= 0 ? "up" : "down"}
            />
          </div>

          <div className="mb-4">
            {!showAddHolding ? (
              <button
                onClick={() => setShowAddHolding(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                + Add Holding
              </button>
            ) : (
              <div className="p-4 bg-transparent rounded-lg border border-transparent">
                <h3 className="font-medium palette.text mb-3">Add New Holding</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-sm palette.text mb-1">Ticker</label>
                    <input
                      type="text"
                      value={newTicker}
                      onChange={(e) => setNewTicker(e.target.value)}
                      placeholder="AAPL"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm palette.text mb-1">Shares</label>
                    <input
                      type="number"
                      value={newShares}
                      onChange={(e) => setNewShares(e.target.value)}
                      placeholder="100"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm palette.text mb-1">Price per Share</label>
                    <input
                      type="number"
                      value={newPrice}
                      onChange={(e) => setNewPrice(e.target.value)}
                      placeholder="150.00"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div className="flex items-end gap-2">
                    <button
                      onClick={addHolding}
                      disabled={loading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      {loading ? "Adding..." : "Add"}
                    </button>
                    <button
                      onClick={() => {
                        setShowAddHolding(false);
                        setNewTicker("");
                        setNewShares("");
                        setNewPrice("");
                      }}
                      className="px-4 py-2 bg-gray-200 palette.text rounded-lg hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {holdings.length === 0 ? (
            <div className="text-center py-8 palette.text">
              <p>No holdings yet. Add your first holding to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-transparent">
                    <th className="text-left py-3 px-2 text-sm font-medium palette.text">Ticker</th>
                    <th className="text-right py-3 px-2 text-sm font-medium palette.text">Shares</th>
                    <th className="text-right py-3 px-2 text-sm font-medium palette.text">Avg Cost</th>
                    <th className="text-right py-3 px-2 text-sm font-medium palette.text">Cost Basis</th>
                    <th className="text-right py-3 px-2 text-sm font-medium palette.text">Current Price</th>
                    <th className="text-right py-3 px-2 text-sm font-medium palette.text">Current Value</th>
                    <th className="text-right py-3 px-2 text-sm font-medium palette.text">Gain/Loss</th>
                    <th className="text-right py-3 px-2 text-sm font-medium palette.text">Return</th>
                    <th className="py-3 px-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {holdings.map((holding) => {
                    const currentPrice = prices[holding.ticker] || holding.avgCostBasis;
                    const currentValue = holding.shares * currentPrice;
                    const costBasis = holding.shares * holding.avgCostBasis;
                    const gain = currentValue - costBasis;
                    const gainPercent = costBasis > 0 ? (gain / costBasis) * 100 : 0;

                    return (
                      <tr key={holding.id} className="border-b border-transparent hover:bg-transparent">
                        <td className="py-3 px-2 font-medium palette.text">{holding.ticker}</td>
                        <td className="py-3 px-2 text-right palette.text">{holding.shares.toLocaleString()}</td>
                        <td className="py-3 px-2 text-right palette.text">{formatCurrency(holding.avgCostBasis)}</td>
                        <td className="py-3 px-2 text-right palette.text">{formatCurrency(costBasis)}</td>
                        <td className="py-3 px-2 text-right palette.text">{formatCurrency(currentPrice)}</td>
                        <td className="py-3 px-2 text-right palette.text">{formatCurrency(currentValue)}</td>
                        <td className={`py-3 px-2 text-right ${gain >= 0 ? "text-green-600" : "text-red-600"}`}>
                          {formatCurrency(gain)}
                        </td>
                        <td className={`py-3 px-2 text-right ${gainPercent >= 0 ? "text-green-600" : "text-red-600"}`}>
                          {formatPercent(gainPercent)}
                        </td>
                        <td className="py-3 px-2">
                          <button onClick={() => removeHolding(holding.id)} className="text-red-600 hover:text-red-800 text-sm">
                            Remove
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === "transactions" && (
        <div>
          <div className="mb-4">
            {!showAddTransaction ? (
              <button onClick={() => setShowAddTransaction(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                + Add Transaction
              </button>
            ) : (
              <div className="p-4 bg-transparent rounded-lg border border-transparent">
                <h3 className="font-medium palette.text mb-3">Add Transaction</h3>
                <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                  <div>
                    <label className="block text-sm palette.text mb-1">Type</label>
                    <select
                      value={transactionType}
                      onChange={(e) => setTransactionType(e.target.value as "buy" | "sell")}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="buy">Buy</option>
                      <option value="sell">Sell</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm palette.text mb-1">Ticker</label>
                    <input
                      type="text"
                      value={newTicker}
                      onChange={(e) => setNewTicker(e.target.value)}
                      placeholder="AAPL"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm palette.text mb-1">Shares</label>
                    <input
                      type="number"
                      value={transactionShares}
                      onChange={(e) => setTransactionShares(e.target.value)}
                      placeholder="100"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm palette.text mb-1">Price</label>
                    <input
                      type="number"
                      value={transactionPrice}
                      onChange={(e) => setTransactionPrice(e.target.value)}
                      placeholder="150.00"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm palette.text mb-1">Date</label>
                    <input
                      type="date"
                      value={transactionDate}
                      onChange={(e) => setTransactionDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div className="flex items-end gap-2">
                    <button onClick={addTransaction} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                      Add
                    </button>
                    <button
                      onClick={() => {
                        setShowAddTransaction(false);
                        setNewTicker("");
                        setTransactionShares("");
                        setTransactionPrice("");
                      }}
                      className="px-4 py-2 bg-gray-200 palette.text rounded-lg hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {transactions.length === 0 ? (
            <div className="text-center py-8 palette.text">
              <p>No transactions yet. Add your first transaction.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-transparent">
                    <th className="text-left py-3 px-2 text-sm font-medium palette.text">Date</th>
                    <th className="text-left py-3 px-2 text-sm font-medium palette.text">Type</th>
                    <th className="text-left py-3 px-2 text-sm font-medium palette.text">Ticker</th>
                    <th className="text-right py-3 px-2 text-sm font-medium palette.text">Shares</th>
                    <th className="text-right py-3 px-2 text-sm font-medium palette.text">Price</th>
                    <th className="text-right py-3 px-2 text-sm font-medium palette.text">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {[...transactions].reverse().map((tx) => (
                    <tr key={tx.id} className="border-b border-transparent">
                      <td className="py-3 px-2 palette.text">{tx.date}</td>
                      <td className="py-3 px-2">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            tx.type === "buy" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                          }`}
                        >
                          {tx.type.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-2 font-medium palette.text">{tx.ticker}</td>
                      <td className="py-3 px-2 text-right palette.text">{tx.shares.toLocaleString()}</td>
                      <td className="py-3 px-2 text-right palette.text">{formatCurrency(tx.price)}</td>
                      <td className="py-3 px-2 text-right palette.text">{formatCurrency(tx.shares * tx.price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === "performance" && (
        <div>
          {holdings.length === 0 ? (
            <div className="text-center py-8 palette.text">
              <p>Add holdings to see performance tracking.</p>
            </div>
          ) : (
            <div>
              <h3 className="font-medium palette.text mb-4">Performance Summary</h3>
              <div className="space-y-4">
                {holdings.map((holding) => {
                  const holdingTransactions = getTransactionsForTicker(holding.ticker);
                  const buys = holdingTransactions.filter((t) => t.type === "buy");
                  const sells = holdingTransactions.filter((t) => t.type === "sell");

                  const currentPrice = prices[holding.ticker] || holding.avgCostBasis;
                  const currentValue = holding.shares * currentPrice;
                  const costBasis = holding.shares * holding.avgCostBasis;
                  const gain = currentValue - costBasis;
                  const gainPercent = costBasis > 0 ? (gain / costBasis) * 100 : 0;

                  return (
                    <div key={holding.id} className="p-4 bg-transparent rounded-lg border border-transparent">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium palette.text">{holding.ticker}</h4>
                        <span className={`text-sm font-medium ${gain >= 0 ? "text-green-600" : "text-red-600"}`}>
                          {formatCurrency(gain)} ({formatPercent(gainPercent)})
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="palette.text">Shares</p>
                          <p className="font-medium palette.text">{holding.shares.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="palette.text">Cost Basis</p>
                          <p className="font-medium palette.text">{formatCurrency(costBasis)}</p>
                        </div>
                        <div>
                          <p className="palette.text">Current Value</p>
                          <p className="font-medium palette.text">{formatCurrency(currentValue)}</p>
                        </div>
                      </div>
                      <div className="mt-2 pt-2 border-t border-transparent grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="palette.text">Total Bought</p>
                          <p className="font-medium palette.text">{buys.reduce((sum, t) => sum + t.shares, 0)} shares</p>
                        </div>
                        <div>
                          <p className="palette.text">Total Sold</p>
                          <p className="font-medium palette.text">{sells.reduce((sum, t) => sum + t.shares, 0)} shares</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-800 mb-2">Overall P&L</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-blue-600">Total Invested</p>
                    <p className="text-lg font-bold text-blue-800">{formatCurrency(totals.totalCostBasis)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-blue-600">Current Value</p>
                    <p className="text-lg font-bold text-blue-800">{formatCurrency(totals.totalCurrentValue)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-blue-600">Gain/Loss</p>
                    <p className={`text-lg font-bold ${totals.totalGain >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {formatCurrency(totals.totalGain)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-blue-600">Return</p>
                    <p className={`text-lg font-bold ${totals.totalGainPercent >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {formatPercent(totals.totalGainPercent)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <p className="mt-6 text-sm palette.text text-center">
        Your portfolio data is saved locally in your browser. No data is sent to any server.
      </p>
    </div>
  );
}