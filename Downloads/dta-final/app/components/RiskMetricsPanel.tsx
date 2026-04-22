"use client";

import { useState, useEffect } from "react";
import { useColorPalette } from "../context/ColorPaletteContext";
import { fetchHistory, StockHistory } from "@/lib/client";

interface RiskMetrics {
  sharpeRatio: number;
  sortinoRatio: number;
  maxDrawdown: number;
  beta: number;
  standardDeviation: number;
  annualizedReturn: number;
  riskAdjustedScore: string;
}

// Calculate risk metrics from historical data
function calculateRiskMetrics(history: StockHistory[], riskFreeRate: number = 0.05): RiskMetrics {
  if (!history || history.length < 2) {
    return {
      sharpeRatio: 0,
      sortinoRatio: 0,
      maxDrawdown: 0,
      beta: 1,
      standardDeviation: 0,
      annualizedReturn: 0,
      riskAdjustedScore: "N/A",
    };
  }

  // Calculate daily returns
  const returns: number[] = [];
  for (let i = 1; i < history.length; i++) {
    const dailyReturn = (history[i].close - history[i - 1].close) / history[i - 1].close;
    returns.push(dailyReturn);
  }

  if (returns.length === 0) {
    return {
      sharpeRatio: 0,
      sortinoRatio: 0,
      maxDrawdown: 0,
      beta: 1,
      standardDeviation: 0,
      annualizedReturn: 0,
      riskAdjustedScore: "N/A",
    };
  }

  // Calculate annualized return
  const totalReturn = (history[history.length - 1].close - history[0].close) / history[0].close;
  const years = history.length / 252; // Trading days per year
  const annualizedReturn = Math.pow(1 + totalReturn, 1 / years) - 1;

  // Calculate standard deviation (annualized)
  const meanReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
  const variance = returns.reduce((sum, r) => sum + Math.pow(r - meanReturn, 2), 0) / returns.length;
  const dailyStdDev = Math.sqrt(variance);
  const standardDeviation = dailyStdDev * Math.sqrt(252); // Annualize

  // Calculate Sharpe Ratio
  const excessReturn = annualizedReturn - riskFreeRate;
  const sharpeRatio = standardDeviation > 0 ? excessReturn / standardDeviation : 0;

  // Calculate Sortino Ratio (using downside deviation)
  const negativeReturns = returns.filter(r => r < 0);
  const downsideVariance = negativeReturns.length > 0
    ? negativeReturns.reduce((sum, r) => sum + Math.pow(r, 2), 0) / returns.length
    : variance;
  const downsideDeviation = Math.sqrt(downsideVariance) * Math.sqrt(252);
  const sortinoRatio = downsideDeviation > 0 ? excessReturn / downsideDeviation : 0;

  // Calculate Maximum Drawdown
  let maxDrawdown = 0;
  let peak = history[0].close;
  for (const day of history) {
    if (day.close > peak) {
      peak = day.close;
    }
    const drawdown = (peak - day.close) / peak;
    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown;
    }
  }
  maxDrawdown = maxDrawdown * 100; // Convert to percentage

  // Beta estimation (simplified - compared to 1.0 market)
  // In a real app, you'd compare to SPY or similar index
  const beta = standardDeviation > 0 ? (standardDeviation / 0.20) : 1; // Assume 20% market vol

  // Risk-adjusted score
  let riskAdjustedScore: string;
  if (sharpeRatio > 1.5) riskAdjustedScore = "Excellent";
  else if (sharpeRatio > 1.0) riskAdjustedScore = "Good";
  else if (sharpeRatio > 0.5) riskAdjustedScore = "Fair";
  else if (sharpeRatio > 0) riskAdjustedScore = "Poor";
  else riskAdjustedScore = "Below Average";

  return {
    sharpeRatio: Math.round(sharpeRatio * 100) / 100,
    sortinoRatio: Math.round(sortinoRatio * 100) / 100,
    maxDrawdown: Math.round(maxDrawdown * 100) / 100,
    beta: Math.round(beta * 100) / 100,
    standardDeviation: Math.round(standardDeviation * 10000) / 100, // As percentage
    annualizedReturn: Math.round(annualizedReturn * 10000) / 100,
    riskAdjustedScore,
  };
}

interface MetricCardProps {
  label: string;
  value: string | number;
  description: string;
  status?: "good" | "bad" | "neutral";
}

function MetricCard({ label, value, description, status }: MetricCardProps) {
  const { palette } = useColorPalette();
  const getStatusColor = () => {
    if (status === "good") return palette.positive;
    if (status === "bad") return palette.negative;
    return palette.text;
  };

  return (
    <div className="p-4 rounded-lg" style={{ backgroundColor: palette.background, border: `1px solid ${palette.gridLines}` }}>
      <div className="text-sm mb-1" style={{ color: palette.text, opacity: 0.7 }}>{label}</div>
      <div
        className="text-2xl font-bold mb-1"
        style={{ color: status ? getStatusColor() : palette.text }}
      >
        {value}
      </div>
      <div className="text-xs" style={{ color: palette.text, opacity: 0.5 }}>{description}</div>
    </div>
  );
}

export default function RiskMetricsPanel() {
  const { palette, isDarkMode } = useColorPalette();

  const [ticker, setTicker] = useState("AAPL");
  const [period, setPeriod] = useState("1y");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<RiskMetrics | null>(null);
  const [inputTicker, setInputTicker] = useState("AAPL");

  const fetchMetrics = async () => {
    setLoading(true);
    setError(null);

    try {
      const history = await fetchHistory(ticker, period, "1d");
      if (!history || history.length === 0) {
        throw new Error("No data available");
      }
      const calculated = calculateRiskMetrics(history);
      setMetrics(calculated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to calculate metrics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, [ticker, period]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTicker(inputTicker.toUpperCase());
  };

  const getStatusForMetric = (metric: string, value: number): "good" | "bad" | "neutral" | undefined => {
    switch (metric) {
      case "sharpeRatio":
        return value > 1 ? "good" : value > 0.5 ? "neutral" : "bad";
      case "sortinoRatio":
        return value > 1.5 ? "good" : value > 1 ? "neutral" : "bad";
      case "maxDrawdown":
        return value < 10 ? "good" : value < 20 ? "neutral" : "bad";
      case "beta":
        return value < 1 ? "good" : value > 1.5 ? "bad" : "neutral";
      case "standardDeviation":
        return value < 15 ? "good" : value < 25 ? "neutral" : "bad";
      default:
        return undefined;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 rounded-xl shadow-lg" style={{ backgroundColor: palette.background, border: `1px solid ${palette.gridLines}` }}>
      <h2 className="text-2xl font-bold mb-2" style={{ color: palette.text }}>Risk Metrics Panel</h2>
      <p className="text-sm mb-6" style={{ color: palette.text, opacity: 0.7 }}>
        Calculate proper risk metrics: Sharpe ratio, Sortino ratio, Maximum drawdown, Beta, Standard deviation.
      </p>

      {/* Input form */}
      <div className="flex flex-wrap gap-4 mb-6">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={inputTicker}
            onChange={(e) => setInputTicker(e.target.value.toUpperCase())}
            placeholder="Ticker symbol"
            className="px-4 py-2 border rounded-lg focus:ring-2 w-32"
            style={{ borderColor: palette.gridLines, backgroundColor: palette.background, color: palette.text }}
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-lg transition"
            style={{ backgroundColor: palette.primary, color: "#fff" }}
          >
            Analyze
          </button>
        </form>

        <div className="flex gap-2">
          {["1mo", "3mo", "6mo", "1y", "2y"].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className="px-3 py-2 text-sm rounded-lg transition"
              style={{
                backgroundColor: period === p ? palette.primary : palette.background,
                color: period === p ? "#fff" : palette.text,
                border: `1px solid ${palette.gridLines}`
              }}
            >
              {p.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 rounded-lg" style={{ backgroundColor: palette.negative + "20", border: `1px solid ${palette.negative}`, color: palette.negative }}>
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-8" style={{ color: palette.text, opacity: 0.6 }}>Calculating metrics...</div>
      ) : metrics ? (
        <>
          {/* Risk-adjusted score */}
          <div className="mb-6">
            <div className="flex items-center justify-between p-4 rounded-lg" style={{ backgroundColor: palette.background, border: `1px solid ${palette.gridLines}` }}>
              <div>
                <div className="text-sm" style={{ color: palette.text, opacity: 0.7 }}>Risk-Adjusted Performance</div>
                <div className="text-3xl font-bold" style={{ color: palette.text }}>{metrics.riskAdjustedScore}</div>
              </div>
              <div className="text-right">
                <div className="text-sm" style={{ color: palette.text, opacity: 0.7 }}>Annualized Return</div>
                <div className="text-2xl font-bold" style={{ color: metrics.annualizedReturn >= 0 ? palette.positive : palette.negative }}>
                  {metrics.annualizedReturn >= 0 ? "+" : ""}{metrics.annualizedReturn}%
                </div>
              </div>
            </div>
          </div>

          {/* Metrics grid */}
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <MetricCard
              label="Sharpe Ratio"
              value={metrics.sharpeRatio.toFixed(2)}
              description="Risk-adjusted return (>1 = good, >2 = excellent)"
              status={getStatusForMetric("sharpeRatio", metrics.sharpeRatio)}
            />
            <MetricCard
              label="Sortino Ratio"
              value={metrics.sortinoRatio.toFixed(2)}
              description="Downside risk-adjusted return (>1.5 = good)"
              status={getStatusForMetric("sortinoRatio", metrics.sortinoRatio)}
            />
            <MetricCard
              label="Maximum Drawdown"
              value={`-${metrics.maxDrawdown.toFixed(1)}%`}
              description="Largest peak-to-trough decline"
              status={getStatusForMetric("maxDrawdown", metrics.maxDrawdown)}
            />
            <MetricCard
              label="Beta"
              value={metrics.beta.toFixed(2)}
              description="Market sensitivity (<1 = less volatile, >1 = more volatile)"
              status={getStatusForMetric("beta", metrics.beta)}
            />
            <MetricCard
              label="Standard Deviation"
              value={`${metrics.standardDeviation.toFixed(1)}%`}
              description="Annualized volatility (<15% = low, >25% = high)"
              status={getStatusForMetric("standardDeviation", metrics.standardDeviation)}
            />
            <MetricCard
              label="Risk-Free Rate"
              value="5.0%"
              description="Assumed risk-free rate for calculations"
              status="neutral"
            />
          </div>

          {/* Educational note */}
          <div className="p-4 rounded-lg border" style={{ backgroundColor: palette.primary + "10", borderColor: palette.primary + "40" }}>
            <h4 className="font-semibold mb-2" style={{ color: palette.text }}>Understanding Risk Metrics</h4>
            <div className="grid md:grid-cols-2 gap-4 text-sm" style={{ color: palette.text, opacity: 0.8 }}>
              <div>
                <strong>Sharpe Ratio:</strong> Measures excess return per unit of risk. Higher is better.
              </div>
              <div>
                <strong>Sortino Ratio:</strong> Similar to Sharpe, but only considers downside risk.
              </div>
              <div>
                <strong>Max Drawdown:</strong> The largest loss from a peak. Lower is better.
              </div>
              <div>
                <strong>Beta:</strong> How much the stock moves vs the market. 1 = market movement.
              </div>
            </div>
          </div>
        </>
      ) : null}

      <p className="mt-4 text-xs text-center" style={{ color: palette.text, opacity: 0.5 }}>
        Metrics are calculated from historical data and don&apos;t guarantee future performance.
      </p>
    </div>
  );
}