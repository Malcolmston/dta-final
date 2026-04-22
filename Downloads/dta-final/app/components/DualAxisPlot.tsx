"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import * as d3 from "d3";
import { fetchHistory, StockHistory } from "@/lib/client";
import { TIME_RANGES_SHORT } from "@/lib/constants";
import { useColorPalette } from "@/app/context/ColorPaletteContext";
import TickerInput from "./TickerInput";

const PREDICTED_COLOR = "#8b5cf6"; // purple
const ACTUAL_COLOR = "#10b981"; // green
const PEAK_COLOR = "#ef4444"; // red
const TROUGH_COLOR = "#3b82f6"; // blue
const BUY_COLOR = "#22c55e"; // green
const SELL_COLOR = "#ef4444"; // red

interface DualAxisPlotProps {
  ticker?: string;
}

interface DataPoint {
  date: Date;
  actual: number;
  predicted: number;
}

interface PeakTrough {
  date: Date;
  value: number;
  type: "peak" | "trough";
}

interface TradingSignal {
  date: Date;
  price: number;
  type: "BUY" | "SELL";
}

export default function DualAxisPlot({ ticker: initialTicker = "AAPL" }: DualAxisPlotProps) {
  const { palette } = useColorPalette();
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [ticker, setTicker] = useState(initialTicker);
  const [period, setPeriod] = useState("3mo");
  const [stockData, setStockData] = useState<StockHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generate prediction using linear trend projection
  const generatePrediction = useCallback((data: StockHistory[]): DataPoint[] => {
    if (data.length < 5) return [];

    const prices = data.map(d => d.close);
    const n = prices.length;

    // Calculate linear regression
    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
    for (let i = 0; i < n; i++) {
      sumX += i;
      sumY += prices[i];
      sumXY += i * prices[i];
      sumXX += i * i;
    }

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Calculate moving average for smoothing
    const windowSize = Math.min(10, Math.floor(n / 5));
    const smoothedPrices: number[] = [];

    for (let i = 0; i < n; i++) {
      const start = Math.max(0, i - windowSize + 1);
      const window = prices.slice(start, i + 1);
      const avg = window.reduce((a, b) => a + b, 0) / window.length;
      smoothedPrices.push(avg);
    }

    // Combine linear trend with moving average for prediction
    const prediction: DataPoint[] = [];
    for (let i = 0; i < n; i++) {
      const linearValue = slope * i + intercept;
      // Weight towards moving average for more recent data
      const weight = i / (n - 1);
      const predicted = linearValue * (1 - weight * 0.5) + smoothedPrices[i] * (weight * 0.5);
      prediction.push({
        date: data[i].date,
        actual: data[i].close,
        predicted: Math.max(0, predicted),
      });
    }

    return prediction;
  }, []);

  // Find peaks and troughs
  const findPeaksAndTroughs = useCallback((data: DataPoint[]): PeakTrough[] => {
    if (data.length < 3) return [];

    const peaksTroughs: PeakTrough[] = [];
    const threshold = 0.02; // 2% change threshold

    for (let i = 1; i < data.length - 1; i++) {
      const prev = data[i - 1].actual;
      const curr = data[i].actual;
      const next = data[i + 1].actual;

      // Check for peak
      if (curr > prev && curr > next && (curr - Math.min(prev, next)) / curr > threshold) {
        peaksTroughs.push({ date: data[i].date, value: curr, type: "peak" });
      }
      // Check for trough
      else if (curr < prev && curr < next && (Math.max(prev, next) - curr) / curr > threshold) {
        peaksTroughs.push({ date: data[i].date, value: curr, type: "trough" });
      }
    }

    return peaksTroughs;
  }, []);

  // Generate trading signals based on moving average crossovers
  const generateSignals = useCallback((data: DataPoint[]): TradingSignal[] => {
    if (data.length < 20) return [];

    const signals: TradingSignal[] = [];
    const shortWindow = 5;
    const longWindow = 20;

    // Calculate moving averages
    const shortMA: number[] = [];
    const longMA: number[] = [];

    for (let i = 0; i < data.length; i++) {
      const shortStart = Math.max(0, i - shortWindow + 1);
      const shortSlice = data.slice(shortStart, i + 1).map(d => d.actual);
      shortMA.push(shortSlice.reduce((a, b) => a + b, 0) / shortSlice.length);

      const longStart = Math.max(0, i - longWindow + 1);
      const longSlice = data.slice(longStart, i + 1).map(d => d.actual);
      longMA.push(longSlice.reduce((a, b) => a + b, 0) / longSlice.length);
    }

    // Find crossover signals
    for (let i = 1; i < data.length; i++) {
      const prevShort = shortMA[i - 1];
      const prevLong = longMA[i - 1];
      const currShort = shortMA[i];
      const currLong = longMA[i];

      // Golden cross (buy signal) - short MA crosses above long MA
      if (prevShort <= prevLong && currShort > currLong) {
        signals.push({ date: data[i].date, price: data[i].actual, type: "BUY" });
      }
      // Death cross (sell signal) - short MA crosses below long MA
      else if (prevShort >= prevLong && currShort < currLong) {
        signals.push({ date: data[i].date, price: data[i].actual, type: "SELL" });
      }
    }

    return signals;
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (!ticker.trim()) {
      setError("Please enter a ticker symbol");
      setLoading(false);
      return;
    }

    try {
      const data = await fetchHistory(ticker.trim().toUpperCase(), period, "1d");
      if (!data || data.length === 0) {
        throw new Error("No data found for the specified ticker");
      }
      setStockData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch stock data");
      setStockData([]);
    } finally {
      setLoading(false);
    }
  }, [ticker, period]);

  // Initial load
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // D3 chart rendering
  useEffect(() => {
    if (!svgRef.current || !containerRef.current || stockData.length === 0) {
      return;
    }

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = 450;
    const margin = { top: 40, right: 70, bottom: 50, left: 70 };

    // Clear previous chart
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    svg.attr("width", width).attr("height", height);

    // Generate prediction data
    const predictionData = generatePrediction(stockData);
    const peaksTroughs = findPeaksAndTroughs(predictionData);
    const signals = generateSignals(predictionData);

    if (predictionData.length === 0) return;

    // Calculate domains
    const allPrices = [
      ...predictionData.map(d => d.actual),
      ...predictionData.map(d => d.predicted),
    ];
    const priceMin = Math.min(...allPrices);
    const priceMax = Math.max(...allPrices);
    const pricePadding = (priceMax - priceMin) * 0.15 || 1;

    // X Scale (time)
    const xScale = d3.scaleTime()
      .domain(d3.extent(predictionData, (d) => d.date) as [Date, Date])
      .range([margin.left, width - margin.right]);

    // Y Scale for actual prices (left axis)
    const yScaleActual = d3.scaleLinear()
      .domain([priceMin - pricePadding, priceMax + pricePadding])
      .range([height - margin.bottom, margin.top]);

    // Y Scale for predicted prices (right axis)
    const yScalePredicted = d3.scaleLinear()
      .domain([priceMin - pricePadding, priceMax + pricePadding])
      .range([height - margin.bottom, margin.top]);

    // Grid lines
    const gridGroup = svg.append("g").attr("class", "grid");

    gridGroup.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(
        d3.axisLeft(yScaleActual)
          .tickSize(-(width - margin.left - margin.right))
          .tickFormat(() => "")
      )
      .selectAll("line")
      .attr("stroke", "palette.gridLines")
      .attr("stroke-dasharray", "2,2");

    gridGroup.selectAll(".grid .domain").remove();

    // Draw actual price line (solid blue)
    const actualLine = d3.line<DataPoint>()
      .x((d) => xScale(d.date))
      .y((d) => yScaleActual(d.actual))
      .curve(d3.curveMonotoneX);

    svg.append("path")
      .datum(predictionData)
      .attr("fill", "none")
      .attr("stroke", ACTUAL_COLOR)
      .attr("stroke-width", 2.5)
      .attr("d", actualLine);

    // Draw predicted price line (dashed purple)
    const predictedLine = d3.line<DataPoint>()
      .x((d) => xScale(d.date))
      .y((d) => yScalePredicted(d.predicted))
      .curve(d3.curveMonotoneX);

    svg.append("path")
      .datum(predictionData)
      .attr("fill", "none")
      .attr("stroke", PREDICTED_COLOR)
      .attr("stroke-width", 2.5)
      .attr("stroke-dasharray", "6,4")
      .attr("d", predictedLine);

    // Draw peaks (red circles)
    svg.selectAll(".peak")
      .data(peaksTroughs.filter(p => p.type === "peak"))
      .enter()
      .append("circle")
      .attr("class", "peak")
      .attr("cx", (d) => xScale(d.date))
      .attr("cy", (d) => yScaleActual(d.value))
      .attr("r", 5)
      .attr("fill", PEAK_COLOR)
      .attr("stroke", "white")
      .attr("stroke-width", 1.5);

    // Draw troughs (green circles)
    svg.selectAll(".trough")
      .data(peaksTroughs.filter(p => p.type === "trough"))
      .enter()
      .append("circle")
      .attr("class", "trough")
      .attr("cx", (d) => xScale(d.date))
      .attr("cy", (d) => yScaleActual(d.value))
      .attr("r", 5)
      .attr("fill", TROUGH_COLOR)
      .attr("stroke", "white")
      .attr("stroke-width", 1.5);

    // Draw buy signals (green triangles pointing up)
    signals.filter(s => s.type === "BUY").forEach((signal) => {
      const x = xScale(signal.date);
      const y = yScaleActual(signal.price) - 12;

      svg.append("path")
        .attr("d", d3.symbol().type(d3.symbolTriangle).size(100))
        .attr("transform", `translate(${x}, ${y})`)
        .attr("fill", BUY_COLOR)
        .attr("stroke", "white")
        .attr("stroke-width", 1);
    });

    // Draw sell signals (red triangles pointing down)
    signals.filter(s => s.type === "SELL").forEach((signal) => {
      const x = xScale(signal.date);
      const y = yScaleActual(signal.price) + 12;

      svg.append("path")
        .attr("d", d3.symbol().type(d3.symbolTriangle).size(100))
        .attr("transform", `translate(${x}, ${y}) rotate(180)`)
        .attr("fill", SELL_COLOR)
        .attr("stroke", "white")
        .attr("stroke-width", 1);
    });

    // X Axis
    const xTicks = period === "1mo" ? 4 : 6;

    svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(xScale).ticks(xTicks))
      .selectAll("text")
      .attr("fill", "palette.text");

    // Y Axis (actual price - left)
    svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScaleActual).ticks(8).tickFormat((d) => `$${d}`))
      .selectAll("text")
      .attr("fill", "palette.text");

    // Y Axis label for actual (left)
    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 20)
      .attr("x", -(height / 2))
      .attr("text-anchor", "middle")
      .attr("fill", ACTUAL_COLOR)
      .attr("font-size", "12px")
      .attr("font-weight", "600")
      .text("Actual Price ($)");

    // Y Axis (predicted price - right)
    svg.append("g")
      .attr("transform", `translate(${width - margin.right},0)`)
      .call(d3.axisRight(yScalePredicted).ticks(8).tickFormat((d) => `$${d}`))
      .selectAll("text")
      .attr("fill", "palette.text");

    // Y Axis label for predicted (right)
    svg.append("text")
      .attr("transform", "rotate(90)")
      .attr("y", -(width - margin.right + 15))
      .attr("x", height / 2)
      .attr("text-anchor", "middle")
      .attr("fill", PREDICTED_COLOR)
      .attr("font-size", "12px")
      .attr("font-weight", "600")
      .text("Predicted Price ($)");

    // Legend
    const legend = svg.append("g")
      .attr("transform", `translate(${margin.left + 10}, ${margin.top})`);

    // Actual line legend
    const legendActual = legend.append("g").attr("transform", "translate(0, 0)");
    legendActual.append("line")
      .attr("x1", 0)
      .attr("x2", 20)
      .attr("y1", 6)
      .attr("y2", 6)
      .attr("stroke", ACTUAL_COLOR)
      .attr("stroke-width", 2.5);
    legendActual.append("text")
      .attr("x", 24)
      .attr("y", 10)
      .attr("fill", "palette.text")
      .attr("font-size", "11px")
      .text("Actual Price");

    // Predicted line legend
    const legendPredicted = legend.append("g").attr("transform", "translate(110, 0)");
    legendPredicted.append("line")
      .attr("x1", 0)
      .attr("x2", 20)
      .attr("y1", 6)
      .attr("y2", 6)
      .attr("stroke", PREDICTED_COLOR)
      .attr("stroke-width", 2.5)
      .attr("stroke-dasharray", "6,4");
    legendPredicted.append("text")
      .attr("x", 24)
      .attr("y", 10)
      .attr("fill", "palette.text")
      .attr("font-size", "11px")
      .text("Predicted");

    // Peak/Trough legend
    const legendPoints = legend.append("g").attr("transform", "translate(220, 0)");
    legendPoints.append("circle")
      .attr("cx", 6)
      .attr("cy", 6)
      .attr("r", 4)
      .attr("fill", PEAK_COLOR);
    legendPoints.append("text")
      .attr("x", 14)
      .attr("y", 10)
      .attr("fill", "palette.text")
      .attr("font-size", "11px")
      .text("Peak");

    legendPoints.append("circle")
      .attr("cx", 50)
      .attr("cy", 6)
      .attr("r", 4)
      .attr("fill", TROUGH_COLOR);
    legendPoints.append("text")
      .attr("x", 58)
      .attr("y", 10)
      .attr("fill", "palette.text")
      .attr("font-size", "11px")
      .text("Trough");

    // Buy/Sell legend
    const legendSignals = legend.append("g").attr("transform", "translate(300, 0)");
    legendSignals.append("path")
      .attr("d", d3.symbol().type(d3.symbolTriangle).size(60))
      .attr("transform", "translate(6, 6)")
      .attr("fill", BUY_COLOR);
    legendSignals.append("text")
      .attr("x", 14)
      .attr("y", 10)
      .attr("fill", "palette.text")
      .attr("font-size", "11px")
      .text("Buy");

    legendSignals.append("path")
      .attr("d", d3.symbol().type(d3.symbolTriangle).size(60))
      .attr("transform", "translate(40, 6) rotate(180)")
      .attr("fill", SELL_COLOR);
    legendSignals.append("text")
      .attr("x", 48)
      .attr("y", 10)
      .attr("fill", "palette.text")
      .attr("font-size", "11px")
      .text("Sell");

    // Tooltip
    const tooltip = d3
      .select(container)
      .append("div")
      .attr("class", "dual-axis-tooltip")
      .style("position", "absolute")
      .style("visibility", "hidden")
      .style("background", "white")
      .style("border", "1px solid palette.gridLines")
      .style("border-radius", "6px")
      .style("padding", "10px 14px")
      .style("font-size", "12px")
      .style("box-shadow", "0 2px 8px rgba(0,0,0,0.15)")
      .style("pointer-events", "none")
      .style("z-index", "10");

    // Hover overlay
    svg.append("rect")
      .attr("class", "hover-overlay")
      .attr("transform", `translate(${margin.left},${margin.top})`)
      .attr("width", width - margin.left - margin.right)
      .attr("height", height - margin.top - margin.bottom)
      .attr("fill", "transparent")
      .style("cursor", "crosshair");

    d3.select(".hover-overlay")
      .on("mousemove", (event) => {
        const [mx, my] = d3.pointer(event);
        const x0 = xScale.invert(mx + margin.left);

        const bisect = d3.bisector((d: DataPoint) => d.date).left;
        const idx = bisect(predictionData, x0, 1);
        const d0 = predictionData[idx - 1];
        const d1 = predictionData[idx];

        if (!d0 || !d1) return;

        const d =
          x0.getTime() - d0.date.getTime() >
          d1.date.getTime() - x0.getTime()
            ? d1
            : d0;

        const diff = d.predicted - d.actual;
        const diffPercent = ((diff / d.actual) * 100).toFixed(2);
        const diffSign = diff >= 0 ? "+" : "";

        tooltip
          .style("visibility", "visible")
          .style("left", `${Math.min(event.offsetX + 15, width - 200)}px`)
          .style("top", `${Math.max(event.offsetY - 10, 10)}px`)
          .html(`
            <div style="font-weight: 600; margin-bottom: 6px; border-bottom: 1px solid palette.gridLines; padding-bottom: 6px;">
              ${d.date.toLocaleDateString()}
            </div>
            <div style="display: grid; grid-template-columns: auto auto; gap: 4px 12px;">
              <span style="color: ${ACTUAL_COLOR};">Actual:</span>
              <span style="font-weight: 500;">$${d.actual.toFixed(2)}</span>
              <span style="color: ${PREDICTED_COLOR};">Predicted:</span>
              <span style="font-weight: 500;">$${d.predicted.toFixed(2)}</span>
            </div>
            <div style="margin-top: 6px; padding-top: 6px; border-top: 1px solid palette.gridLines; font-size: 11px;">
              <span style="color: ${diff >= 0 ? "#22c55e" : "#ef4444"};">
                ${diffSign}$${diff.toFixed(2)} (${diffSign}${diffPercent}%)
              </span>
            </div>
          `);
      })
      .on("mouseout", () => {
        tooltip.style("visibility", "hidden");
      });

    return () => {
      tooltip.remove();
    };
  }, [stockData, period, generatePrediction, findPeaksAndTroughs, generateSignals]);

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      if (stockData.length > 0) {
        fetchData();
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [stockData.length, fetchData]);

  return (
    <div className="w-full max-w-6xl mx-auto p-6 rounded-xl shadow-lg" style={{ backgroundColor: palette.background, border: `1px solid ${palette.gridLines}` }}>
      <h2 className="text-2xl font-bold mb-2" style={{ color: palette.text }}>
        Prediction vs Reality - {ticker.toUpperCase()}
      </h2>

      <div className="mb-6 p-4 rounded-lg border" style={{ backgroundColor: palette.background, borderColor: palette.gridLines }}>
        <p className="text-sm" style={{ color: palette.text, opacity: 0.8 }}>
          <strong>How to read this chart:</strong> This dual-axis plot compares actual stock prices with predicted prices.
          <span style={{ color: palette.negative, fontWeight: 500, marginLeft: 8 }}>Red circles</span> mark price peaks, while
          <span style={{ color: palette.positive, fontWeight: 500, marginLeft: 8 }}>green circles</span> mark price troughs.
        </p>
      </div>

      <div className="flex flex-wrap gap-4 mb-4">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-800 mb-2">
            Enter Ticker Symbol
          </label>
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
            {loading ? "Loading..." : "Load Chart"}
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {TIME_RANGES_SHORT.map((range) => (
          <button
            key={range.value}
            onClick={() => setPeriod(range.value)}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition ${
              period === range.value
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {range.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      <div ref={containerRef} className="relative w-full">
        <svg ref={svgRef} className="w-full" style={{ minHeight: "450px" }} />
      </div>

      <p className="mt-4 text-sm text-gray-500">
        Hover over the chart to see actual vs predicted values at each point.
      </p>
    </div>
  );
}