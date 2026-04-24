"use client";

import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { useColorPalette } from "../context/ColorPaletteContext";
import { fetchHistory, StockHistory } from "@/lib/client";
import TickerInput from "./TickerInput";
import HelpPopup from "./HelpPopup";

interface LagCorrelationData {
  lag: number;
  correlation: number;
  significant: boolean;
}

/**
 * Calculate lag correlation between a series and itself shifted by different lags
 * Uses Pearson correlation coefficient
 */
function calculateLagCorrelation(
  values: number[],
  maxLag: number
): LagCorrelationData[] {
  const results: LagCorrelationData[] = [];
  const n = values.length;

  // Calculate significance threshold (approximate 95% CI for correlation)
  // Using standard error: SE = 1 / sqrt(n - k - 1)
  const significanceThreshold = 1.96 / Math.sqrt(n - 1);

  for (let lag = -maxLag; lag <= maxLag; lag++) {
    const xValues: number[] = [];
    const yValues: number[] = [];

    if (lag < 0) {
      // Negative lag: past values predict future (shifted left)
      // Compare values[:-lag] with values[-lag:]
      for (let i = 0; i < n + lag; i++) {
        xValues.push(values[i]);
        yValues.push(values[i - lag]);
      }
    } else if (lag > 0) {
      // Positive lag: future values compared to past (shifted right)
      // Compare values[lag:] with values[:-lag]
      for (let i = lag; i < n; i++) {
        xValues.push(values[i]);
        yValues.push(values[i - lag]);
      }
    } else {
      // Zero lag: correlation of series with itself = 1
      results.push({
        lag,
        correlation: 1,
        significant: true,
      });
      continue;
    }

    if (xValues.length < 10) {
      results.push({
        lag,
        correlation: 0,
        significant: false,
      });
      continue;
    }

    // Calculate Pearson correlation
    const correlation = calculatePearsonCorrelation(xValues, yValues);

    // Determine significance based on sample size
    const effectiveN = xValues.length;
    const threshold = 1.96 / Math.sqrt(effectiveN - 3);

    results.push({
      lag,
      correlation: isNaN(correlation) ? 0 : correlation,
      significant: Math.abs(correlation) > threshold,
    });
  }

  return results;
}

/**
 * Calculate Pearson correlation coefficient between two arrays
 */
function calculatePearsonCorrelation(x: number[], y: number[]): number {
  const n = x.length;
  if (n !== y.length || n === 0) return 0;

  const meanX = x.reduce((a, b) => a + b, 0) / n;
  const meanY = y.reduce((a, b) => a + b, 0) / n;

  let numerator = 0;
  let denomX = 0;
  let denomY = 0;

  for (let i = 0; i < n; i++) {
    const diffX = x[i] - meanX;
    const diffY = y[i] - meanY;
    numerator += diffX * diffY;
    denomX += diffX * diffX;
    denomY += diffY * diffY;
  }

  const denominator = Math.sqrt(denomX * denomY);
  if (denominator === 0) return 0;

  return numerator / denominator;
}

export default function LagCorrelationPlot() {
  const { palette, isDarkMode } = useColorPalette();
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [ticker, setTicker] = useState("AAPL");
  const [lagRange, setLagRange] = useState(10);
  const [correlationData, setCorrelationData] = useState<LagCorrelationData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch enough data for lag correlation analysis (1 year minimum)
      const history = await fetchHistory(ticker, "1y", "1d");

      if (!history || history.length < 30) {
        throw new Error("Not enough historical data for lag correlation analysis");
      }

      // Use closing prices for correlation
      const closePrices = history.map((d) => d.close);

      // Calculate lag correlations
      const correlations = calculateLagCorrelation(closePrices, lagRange);
      setCorrelationData(correlations);
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

  // D3 chart rendering
  useEffect(() => {
    if (!svgRef.current || !containerRef.current || correlationData.length === 0) {
      return;
    }

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = 400;
    const margin = { top: 40, right: 30, bottom: 50, left: 60 };

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    svg.attr("width", width).attr("height", height);

    // Create scales
    const xScale = d3
      .scaleLinear()
      .domain([-lagRange, lagRange])
      .range([margin.left, width - margin.right]);

    const yScale = d3
      .scaleLinear()
      .domain([-1, 1])
      .range([height - margin.bottom, margin.top]);

    // Draw significance zones (95% confidence band)
    const significanceThreshold = 1.96 / Math.sqrt(correlationData.length - 3);
    const bandHeight = yScale(significanceThreshold) - yScale(1);

    // Positive significance zone
    svg
      .append("rect")
      .attr("x", margin.left)
      .attr("y", margin.top)
      .attr("width", width - margin.left - margin.right)
      .attr("height", bandHeight)
      .attr("fill", "#22c55e")
      .attr("opacity", 0.1);

    // Negative significance zone
    svg
      .append("rect")
      .attr("x", margin.left)
      .attr("y", yScale(-significanceThreshold) - bandHeight)
      .attr("width", width - margin.left - margin.right)
      .attr("height", bandHeight)
      .attr("fill", "#ef4444")
      .attr("opacity", 0.1);

    // Add gridlines
    svg
      .append("g")
      .attr("class", "grid")
      .attr("transform", `translate(${margin.left},0)`)
      .call(
        d3
          .axisLeft(yScale)
          .tickSize(-(width - margin.left - margin.right))
          .tickFormat(() => "")
          .ticks(5)
      )
      .select(".domain")
      .remove();

    svg.selectAll(".grid line").attr("stroke", palette.gridLines).attr("stroke-dasharray", "3,3");

    // Zero line (y = 0)
    svg
      .append("line")
      .attr("x1", margin.left)
      .attr("x2", width - margin.right)
      .attr("y1", yScale(0))
      .attr("y2", yScale(0))
      .attr("stroke", palette.text)
      .attr("stroke-width", 2);

    // Significance threshold lines
    svg
      .append("line")
      .attr("x1", margin.left)
      .attr("x2", width - margin.right)
      .attr("y1", yScale(significanceThreshold))
      .attr("y2", yScale(significanceThreshold))
      .attr("stroke", "#22c55e")
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "4,4")
      .attr("opacity", 0.6);

    svg
      .append("line")
      .attr("x1", margin.left)
      .attr("x2", width - margin.right)
      .attr("y1", yScale(-significanceThreshold))
      .attr("y2", yScale(-significanceThreshold))
      .attr("stroke", "#ef4444")
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "4,4")
      .attr("opacity", 0.6);

    // Create line generator
    const line = d3
      .line<LagCorrelationData>()
      .x((d) => xScale(d.lag))
      .y((d) => yScale(d.correlation))
      .curve(d3.curveMonotoneX);

    // Draw the correlation line with gradient
    const lineGradient = svg
      .append("defs")
      .append("linearGradient")
      .attr("id", "correlation-line-gradient")
      .attr("x1", "0%")
      .attr("x2", "100%");

    lineGradient.append("stop").attr("offset", "0%").attr("stop-color", "#3b82f6");
    lineGradient.append("stop").attr("offset", "50%").attr("stop-color", "#8b5cf6");
    lineGradient.append("stop").attr("offset", "100%").attr("stop-color", "#ec4899");

    // Draw main line
    svg
      .append("path")
      .datum(correlationData)
      .attr("fill", "none")
      .attr("stroke", "url(#correlation-line-gradient)")
      .attr("stroke-width", 3)
      .attr("d", line);

    // Draw points for significant correlations
    svg
      .selectAll(".correlation-point")
      .data(correlationData.filter((d) => d.significant))
      .enter()
      .append("circle")
      .attr("class", "correlation-point")
      .attr("cx", (d) => xScale(d.lag))
      .attr("cy", (d) => yScale(d.correlation))
      .attr("r", 6)
      .attr("fill", (d) => (d.correlation > 0 ? "#22c55e" : "#ef4444"))
      .attr("stroke", "white")
      .attr("stroke-width", 2)
      .style("cursor", "pointer");

    // Draw all points (smaller)
    svg
      .selectAll(".correlation-point-all")
      .data(correlationData)
      .enter()
      .append("circle")
      .attr("class", "correlation-point-all")
      .attr("cx", (d) => xScale(d.lag))
      .attr("cy", (d) => yScale(d.correlation))
      .attr("r", 4)
      .attr("fill", (d) => (d.significant ? (d.correlation > 0 ? "#22c55e" : "#ef4444") : "#6b7280"))
      .attr("opacity", 0.8)
      .style("cursor", "pointer");

    // X Axis
    svg
      .append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(xScale).ticks(lagRange * 2 + 1))
      .select(".domain")
      .attr("stroke", palette.text);

    svg.selectAll(".tick line").attr("stroke", palette.gridLines);
    svg.selectAll(".tick text").attr("fill", palette.text).attr("font-size", "11px");

    // X Axis label
    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", height - 10)
      .attr("text-anchor", "middle")
      .attr("fill", "#6b7280")
      .attr("font-size", "12px")
      .text("Lag (days)");

    // Y Axis
    svg
      .append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale).ticks(5))
      .select(".domain")
      .attr("stroke", palette.text);

    svg.selectAll(".tick line").attr("stroke", palette.gridLines);
    svg.selectAll(".tick text").attr("fill", palette.text).attr("font-size", "11px");

    // Y Axis label
    svg
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -(height / 2))
      .attr("y", 15)
      .attr("text-anchor", "middle")
      .attr("fill", "#6b7280")
      .attr("font-size", "12px")
      .text("Correlation Coefficient");

    // Tooltip
    const tooltip = d3
      .select(container)
      .append("div")
      .attr("class", "lag-tooltip")
      .style("position", "absolute")
      .style("visibility", "hidden")
      .style("background", palette.background)
      .style("border", `1px solid ${palette.gridLines}`)
      .style("border-radius", "6px")
      .style("padding", "10px 14px")
      .style("font-size", "12px")
      .style("box-shadow", "0 4px 12px rgba(0,0,0,0.15)")
      .style("pointer-events", "none")
      .style("z-index", "10")
      .style("color", palette.text);

    // Add hover interactions
    svg
      .selectAll(".correlation-point-all")
      .on("mouseover", (event, d: any) => {
        const data = d as LagCorrelationData;
        tooltip
          .style("visibility", "visible")
          .html(
            `<div style="font-weight: 600; margin-bottom: 4px;">Lag: ${data.lag} days</div>
             <div style="color: ${data.correlation >= 0 ? "#22c55e" : "#ef4444"}; font-weight: 600; font-size: 14px;">
               r = ${data.correlation.toFixed(4)}
             </div>
             <div style="color: ${palette.text}; font-size: 11px; margin-top: 4px; opacity: 0.7;">
               ${data.significant ? "Statistically significant (p < 0.05)" : "Not significant"}
             </div>
             <div style="color: ${palette.text}; font-size: 10px; margin-top: 4px; opacity: 0.6;">
               ${data.lag < 0 ? "Past values → Future" : data.lag > 0 ? "Future values → Past" : "Autocorrelation (lag 0)"}
             </div>`
          );

        // Highlight the point
        d3.select(event.target).attr("r", 8).attr("opacity", 1);
      })
      .on("mousemove", (event) => {
        const containerRect = container.getBoundingClientRect();
        tooltip
          .style("left", `${event.clientX - containerRect.left + 15}px`)
          .style("top", `${event.clientY - containerRect.top - 10}px`);
      })
      .on("mouseout", (event) => {
        tooltip.style("visibility", "hidden");
        d3.select(event.target).attr("r", 4).attr("opacity", 0.8);
      });

    return () => {
      tooltip.remove();
    };
  }, [correlationData, lagRange, palette]);

  return (
    <div className="w-full max-w-5xl mx-auto p-6 rounded-xl shadow-lg relative" style={{ backgroundColor: palette.background, border: `1px solid ${palette.gridLines}` }}>
      <HelpPopup
        title="Lag Correlation Plot"
        whatItDoes="Measures how a stock's price correlates with itself at different time lags. Shows whether past prices can predict future prices (autocorrelation)."
        whyItMatters="Helps identify potential predictive patterns in price movements. Significant correlations at certain lags might indicate exploitable patterns for forecasting."
        whoItMattersFor="Traders and analysts exploring predictive relationships and time series analysis."
        howToRead="Center (lag 0) = correlation with itself. Positive lags = past vs current. Negative lags = current vs future. Green zones = statistically significant. Look for peaks/troughs outside the zones."
      />
      <h2 className="text-2xl font-bold mb-2" style={{ color: palette.text }}>Lag Correlation Plot</h2>
      <p className="text-sm mb-6" style={{ color: palette.text, opacity: 0.7 }}>Autocorrelation analysis for time series forecasting</p>

      <div className="mb-6 p-4 rounded-lg">
        <p className="text-sm" style={{ color: palette.text, opacity: 0.8 }}>
          <strong>What is lag correlation?</strong> This plot shows how each day&apos;s price correlates with prices at different time lags.
          <span className="font-medium" style={{ color: palette.positive }}> Positive lags</span> (right side) show how past prices relate to current price,
          while <span className="font-medium" style={{ color: palette.primary }}> negative lags</span> (left side) show how current price relates to future prices.
          <span className="font-medium" style={{ color: palette.positive }}> Green zones</span> indicate statistically significant correlations (p &lt; 0.05).
          Look for patterns that might suggest predictive relationships for forecasting.
        </p>
      </div>

      <div className="flex flex-wrap gap-4 mb-4">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium mb-2" style={{ color: palette.text }}>
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
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium mb-2" style={{ color: palette.text }}>
            Lag Range (days)
          </label>
          <select
            value={lagRange}
            onChange={(e) => setLagRange(Number(e.target.value))}
            className="w-full px-4 py-2 rounded-lg outline-none transition"
            style={{ border: `1px solid ${palette.gridLines}`, color: palette.text, backgroundColor: palette.background }}
          >
            <option value={5}>±5 days</option>
            <option value={10}>±10 days</option>
            <option value={15}>±15 days</option>
            <option value={20}>±20 days</option>
            <option value={30}>±30 days</option>
          </select>
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
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      <div ref={containerRef} className="relative w-full">
        <svg ref={svgRef} className="w-full" style={{ minHeight: "400px" }} />
      </div>

      <div className="mt-4 flex flex-wrap gap-4 text-sm palette.text">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500 opacity-60"></div>
          <span>Significant positive correlation</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500 opacity-60"></div>
          <span>Significant negative correlation</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gray-400 opacity-60"></div>
          <span>Not statistically significant</span>
        </div>
      </div>
    </div>
  );
}