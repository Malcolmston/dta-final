"use client";

import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { useColorPalette } from "../context/ColorPaletteContext";
import { fetchHistory, StockHistory } from "@/lib/client";
import TickerInput from "./TickerInput";

interface SignalData {
  date: Date;
  signal: "BUY" | "SELL" | "HOLD";
  price: number;
  rsi: number;
  actualOutcome: "PROFIT" | "LOSS";
}

interface ConfusionMatrixCell {
  predicted: "BUY" | "SELL";
  actual: "PROFIT" | "LOSS";
  count: number;
}

// Calculate RSI (Relative Strength Index)
function calculateRSI(prices: number[], period: number = 14): number[] {
  if (prices.length < period + 1) return [];

  const rsi: number[] = [];
  const gains: number[] = [];
  const losses: number[] = [];

  for (let i = 1; i < prices.length; i++) {
    const change = prices[i] - prices[i - 1];
    gains.push(change > 0 ? change : 0);
    losses.push(change < 0 ? -change : 0);
  }

  for (let i = period; i < gains.length; i++) {
    const avgGain = gains.slice(i - period, i).reduce((a, b) => a + b, 0) / period;
    const avgLoss = losses.slice(i - period, i).reduce((a, b) => a + b, 0) / period;

    if (avgLoss === 0) {
      rsi.push(100);
    } else {
      const rs = avgGain / avgLoss;
      rsi.push(100 - 100 / (1 + rs));
    }
  }

  return rsi;
}

// Generate trading signals based on RSI
function generateSignals(history: StockHistory[], period: number = 14): SignalData[] {
  if (history.length < period + 1) return [];

  const prices = history.map((d) => d.close);
  const rsiValues = calculateRSI(prices, period);
  const signals: SignalData[] = [];

  // Use a look-ahead window to determine actual outcome
  const lookAheadPeriod = 5;

  for (let i = period; i < history.length - lookAheadPeriod; i++) {
    const rsi = rsiValues[i - period];
    const currentPrice = history[i].close;
    const futurePrice = history[i + lookAheadPeriod].close;

    let signal: "BUY" | "SELL" | "HOLD";

    if (rsi < 30) {
      signal = "BUY"; // Oversold - buy signal
    } else if (rsi > 70) {
      signal = "SELL"; // Overbought - sell signal
    } else {
      signal = "HOLD";
    }

    const actualOutcome: "PROFIT" | "LOSS" = futurePrice > currentPrice ? "PROFIT" : "LOSS";

    signals.push({
      date: new Date(history[i].date),
      signal,
      price: currentPrice,
      rsi,
      actualOutcome,
    });
  }

  return signals;
}

// Calculate confusion matrix
function calculateConfusionMatrix(signals: SignalData[]): ConfusionMatrixCell[] {
  const matrix: ConfusionMatrixCell[] = [
    { predicted: "BUY", actual: "PROFIT", count: 0 }, // True Positive
    { predicted: "BUY", actual: "LOSS", count: 0 }, // False Positive
    { predicted: "SELL", actual: "PROFIT", count: 0 }, // False Negative
    { predicted: "SELL", actual: "LOSS", count: 0 }, // True Negative
  ];

  signals.forEach((s) => {
    if (s.signal === "BUY") {
      if (s.actualOutcome === "PROFIT") {
        matrix[0].count++;
      } else {
        matrix[1].count++;
      }
    } else if (s.signal === "SELL") {
      if (s.actualOutcome === "PROFIT") {
        matrix[2].count++;
      } else {
        matrix[3].count++;
      }
    }
  });

  return matrix;
}

export default function ConfusionMatrixPlot() {
  const { palette, isDarkMode } = useColorPalette();
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [ticker, setTicker] = useState("AAPL");
  const [signals, setSignals] = useState<SignalData[]>([]);
  const [matrix, setMatrix] = useState<ConfusionMatrixCell[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const history = await fetchHistory(ticker.toUpperCase(), "3mo", "1d");

      if (!history || history.length === 0) {
        throw new Error("No data found for the specified ticker");
      }

      const generatedSignals = generateSignals(history);
      const confusionMatrix = calculateConfusionMatrix(generatedSignals);

      setSignals(generatedSignals);
      setMatrix(confusionMatrix);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch stock data");
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchData();
  }, []);

  // D3 confusion matrix rendering
  useEffect(() => {
    if (!svgRef.current || !containerRef.current || matrix.length === 0) {
      return;
    }

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = 380;
    const margin = { top: 60, right: 30, bottom: 80, left: 100 };

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    svg.attr("width", width).attr("height", height);

    // Calculate totals for percentages
    const totalBuy = matrix[0].count + matrix[1].count;
    const totalSell = matrix[2].count + matrix[3].count;
    const totalProfit = matrix[0].count + matrix[2].count;
    const totalLoss = matrix[1].count + matrix[3].count;
    const totalSignals = totalBuy + totalSell;

    const overallAccuracy =
      totalSignals > 0 ? ((matrix[0].count + matrix[3].count) / totalSignals) * 100 : 0;

    // Create matrix data with labels
    const matrixData = [
      {
        row: "BUY",
        col: "PROFIT",
        count: matrix[0].count,
        label: "True Positive",
        isCorrect: true,
      },
      {
        row: "BUY",
        col: "LOSS",
        count: matrix[1].count,
        label: "False Positive",
        isCorrect: false,
      },
      {
        row: "SELL",
        col: "PROFIT",
        count: matrix[2].count,
        label: "False Negative",
        isCorrect: false,
      },
      {
        row: "SELL",
        col: "LOSS",
        count: matrix[3].count,
        label: "True Negative",
        isCorrect: true,
      },
    ];

    // Scales
    const xLabels = ["PROFIT", "LOSS"];
    const yLabels = ["BUY", "SELL"];

    const xScale = d3
      .scaleBand()
      .domain(xLabels)
      .range([margin.left + 30, width - margin.right - 30])
      .padding(0.15);

    const yScale = d3
      .scaleBand()
      .domain(yLabels)
      .range([margin.top, height - margin.bottom])
      .padding(0.15);

    // Color scale based on accuracy (intensity)
    const maxCount = d3.max(matrixData, (d) => d.count) || 1;
    const colorScaleCorrect = d3
      .scaleLinear<string>()
      .domain([0, maxCount])
      .range(["#dcfce7", "#16a34a"]); // Light green to dark green

    const colorScaleIncorrect = d3
      .scaleLinear<string>()
      .domain([0, maxCount])
      .range(["#fee2e2", "#dc2626"]); // Light red to dark red

    // Draw cells
    matrixData.forEach((d) => {
      const x = xScale(d.col);
      const y = yScale(d.row);

      if (x === undefined || y === undefined) return;

      const cellWidth = xScale.bandwidth();
      const cellHeight = yScale.bandwidth();

      // Cell background
      svg
        .append("rect")
        .attr("x", x)
        .attr("y", y)
        .attr("width", cellWidth)
        .attr("height", cellHeight)
        .attr("fill", d.isCorrect ? colorScaleCorrect(d.count) : colorScaleIncorrect(d.count))
        .attr("rx", 6)
        .attr("ry", 6)
        .attr("stroke", d.isCorrect ? "#16a34a" : "#dc2626")
        .attr("stroke-width", 2);

      // Count text
      svg
        .append("text")
        .attr("x", x + cellWidth / 2)
        .attr("y", y + cellHeight / 2 - 8)
        .attr("text-anchor", "middle")
        .attr("fill", d.count > maxCount * 0.5 ? "white" : "#1f2937")
        .attr("font-size", "24px")
        .attr("font-weight", "bold")
        .text(d.count);

      // Percentage text
      const percentage = totalSignals > 0 ? ((d.count / totalSignals) * 100).toFixed(1) : "0.0";
      svg
        .append("text")
        .attr("x", x + cellWidth / 2)
        .attr("y", y + cellHeight / 2 + 14)
        .attr("text-anchor", "middle")
        .attr("fill", d.count > maxCount * 0.5 ? "white" : "#4b5563")
        .attr("font-size", "12px")
        .text(`${percentage}%`);
    });

    // X Axis labels (column headers)
    xLabels.forEach((label) => {
      const x = xScale(label);
      if (x === undefined) return;

      svg
        .append("text")
        .attr("x", x + xScale.bandwidth() / 2)
        .attr("y", margin.top - 15)
        .attr("text-anchor", "middle")
        .attr("fill", "#374151")
        .attr("font-size", "14px")
        .attr("font-weight", "600")
        .text(`Actual: ${label}`);

      // Add count below
      const colCount = label === "PROFIT" ? totalProfit : totalLoss;
      svg
        .append("text")
        .attr("x", x + xScale.bandwidth() / 2)
        .attr("y", margin.top - 2)
        .attr("text-anchor", "middle")
        .attr("fill", "#6b7280")
        .attr("font-size", "11px")
        .text(`(n=${colCount})`);
    });

    // Y Axis labels (row headers)
    yLabels.forEach((label) => {
      const y = yScale(label);
      if (y === undefined) return;

      svg
        .append("text")
        .attr("x", margin.left - 15)
        .attr("y", y + yScale.bandwidth() / 2)
        .attr("text-anchor", "end")
        .attr("dominant-baseline", "middle")
        .attr("fill", "#374151")
        .attr("font-size", "14px")
        .attr("font-weight", "600")
        .text(`Predicted: ${label}`);

      // Add count
      const rowCount = label === "BUY" ? totalBuy : totalSell;
      svg
        .append("text")
        .attr("x", margin.left - 2)
        .attr("y", y + yScale.bandwidth() / 2)
        .attr("text-anchor", "start")
        .attr("dominant-baseline", "middle")
        .attr("fill", "#6b7280")
        .attr("font-size", "11px")
        .text(`(${rowCount})`);
    });

    // Legend
    const legendY = height - 30;
    const legendWidth = 180;

    // Correct predictions legend
    svg
      .append("rect")
      .attr("x", width / 2 - legendWidth / 2 - 100)
      .attr("y", legendY)
      .attr("width", 16)
      .attr("height", 16)
      .attr("rx", 3)
      .attr("fill", "#16a34a");

    svg
      .append("text")
      .attr("x", width / 2 - legendWidth / 2 - 80)
      .attr("y", legendY + 12)
      .attr("fill", "#374151")
      .attr("font-size", "11px")
      .text("Correct Prediction");

    // Incorrect predictions legend
    svg
      .append("rect")
      .attr("x", width / 2 + 80)
      .attr("y", legendY)
      .attr("width", 16)
      .attr("height", 16)
      .attr("rx", 3)
      .attr("fill", "#dc2626");

    svg
      .append("text")
      .attr("x", width / 2 + 100)
      .attr("y", legendY + 12)
      .attr("fill", "#374151")
      .attr("font-size", "11px")
      .text("Incorrect Prediction");

    // Overall accuracy display
    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", 30)
      .attr("text-anchor", "middle")
      .attr("fill", overallAccuracy >= 50 ? "#16a34a" : "#dc2626")
      .attr("font-size", "18px")
      .attr("font-weight", "bold")
      .text(`Overall Accuracy: ${overallAccuracy.toFixed(1)}%`);

    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", 48)
      .attr("text-anchor", "middle")
      .attr("fill", "#6b7280")
      .attr("font-size", "11px")
      .text(`Based on ${totalSignals} total signals (RSI-based)`);
  }, [matrix]);

  return (
    <div className="w-full max-w-4xl mx-auto p-4 rounded-xl shadow-lg overflow-x-auto" style={{ backgroundColor: palette.background, border: `1px solid ${palette.gridLines}` }}>
      <h2 className="text-2xl font-bold mb-2" style={{ color: palette.text }}>Signal Accuracy / Confusion Matrix</h2>
      <p className="text-sm mb-6" style={{ color: palette.text, opacity: 0.7 }}>
        Evaluating trading strategy predictions using RSI indicator
      </p>

      <div className="mb-6 p-4 bg-transparent rounded-lg border border-transparent">
        <p className="text-sm" style={{ color: palette.text, opacity: 0.8 }}>
          <strong>How to read this matrix:</strong> This confusion matrix evaluates trading signals
          (BUY/SELL) against actual stock outcomes (PROFIT/LOSS).{" "}
          <span className="font-medium" style={{ color: palette.positive }}>Green cells</span> show correct predictions
          (True Positive / True Negative), while{" "}
          <span className="font-medium" style={{ color: palette.negative }}>red cells</span> show incorrect predictions
          (False Positive / False Negative). The signal is generated using RSI:{" "}
          <strong>BUY</strong> when RSI &lt; 30 (oversold), <strong>SELL</strong> when RSI &gt; 70
          (overbought).
        </p>
      </div>

      <div className="flex flex-wrap gap-4 mb-4">
        <div className="min-w-[200px]">
          <label className="block text-sm font-medium mb-2" style={{ color: palette.text }}>Enter Ticker Symbol</label>
          <TickerInput
            value={ticker}
            onChange={setTicker}
            onSubmit={fetchData}
            placeholder="Type ticker and press Enter"
            maxPills={1}
          />
        </div>
        <div className="flex items-end">
          <button
            onClick={fetchData}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
          >
            {loading ? "Loading..." : "Analyze"}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 rounded-lg" style={{ backgroundColor: palette.negative + '15', border: `1px solid ${palette.negative}`, color: palette.negative }}>{error}</div>
      )}

      <div ref={containerRef} className="relative w-full">
        <svg ref={svgRef} className="w-full" style={{ minHeight: "380px" }} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
        <div className="p-3 rounded-lg" style={{ backgroundColor: palette.positive + '15', border: `1px solid ${palette.gridLines}` }}>
          <h4 className="font-semibold mb-1" style={{ color: palette.positive }}>True Positive (TP)</h4>
          <p style={{ color: palette.text }}>Predicted BUY, actual PROFIT - Correct buy signal</p>
        </div>
        <div className="p-3 rounded-lg" style={{ backgroundColor: palette.negative + '15', border: `1px solid ${palette.gridLines}` }}>
          <h4 className="font-semibold mb-1" style={{ color: palette.negative }}>False Positive (FP)</h4>
          <p style={{ color: palette.text }}>Predicted BUY, actual LOSS - Wrong buy signal</p>
        </div>
        <div className="p-3 rounded-lg" style={{ backgroundColor: palette.negative + '15', border: `1px solid ${palette.gridLines}` }}>
          <h4 className="font-semibold mb-1" style={{ color: palette.negative }}>False Negative (FN)</h4>
          <p style={{ color: palette.text }}>Predicted SELL, actual PROFIT - Missed profit opportunity</p>
        </div>
        <div className="p-3 rounded-lg" style={{ backgroundColor: palette.positive + '15', border: `1px solid ${palette.gridLines}` }}>
          <h4 className="font-semibold mb-1" style={{ color: palette.positive }}>True Negative (TN)</h4>
          <p style={{ color: palette.text }}>Predicted SELL, actual LOSS - Correct sell signal</p>
        </div>
      </div>
    </div>
  );
}