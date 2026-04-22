"use client";

import { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import { fetchHistory, StockHistory } from "@/lib/client";

const COLOR_PALETTES = [
  { name: "Ocean", label: "Default", category: "Standard", description: "Classic blue/green/red", bullish: "#10b981", bearish: "#ef4444", primary: "#1e3a5f", accent: "#f59e0b", chartLine: "#2563eb", neutral: "#64748b" },
  { name: "BlueGold", label: "Blue/Gold", category: "Colorblind Safe", description: "Blue & gold - safe for deuteranopia", bullish: "#0077bb", bearish: "#ee7733", primary: "#1e3a5f", accent: "#f59e0b", chartLine: "#0077bb", neutral: "#64748b" },
  { name: "BlueOrange", label: "Blue/Orange", category: "Colorblind Safe", description: "Blue & orange - safe for protanopia", bullish: "#0072b2", bearish: "#d55e00", primary: "#1e3a5f", accent: "#f59e0b", chartLine: "#0072b2", neutral: "#64748b" },
  { name: "TealRed", label: "Teal/Red", category: "High Contrast", description: "High contrast teal & red", bullish: "#14b8a6", bearish: "#dc2626", primary: "#0f172a", accent: "#f59e0b", chartLine: "#14b8a6", neutral: "#94a3b8" },
  { name: "LimeMagenta", label: "Lime/Magenta", category: "High Contrast", description: "Lime green & magenta - very high contrast", bullish: "#84cc16", bearish: "#d946ef", primary: "#1e3a5f", accent: "#f59e0b", chartLine: "#84cc16", neutral: "#64748b" },
  { name: "Midnight", label: "Midnight", category: "Dark", description: "Dark theme with soft colors", bullish: "#34d399", bearish: "#f87171", primary: "#0f172a", accent: "#fbbf24", chartLine: "#3b82f6", neutral: "#94a3b8" },
  { name: "Forest", label: "Forest", category: "Nature", description: "Natural green tones", bullish: "#16a34a", bearish: "#dc2626", primary: "#14532d", accent: "#eab308", chartLine: "#15803d", neutral: "#65a30d" },
] as const;

type ColorPalette = typeof COLOR_PALETTES[number];

interface SignalsTabProps {
  ticker: string;
  refreshKey: number;
  colors: ColorPalette;
}

export default function SignalsTab({ ticker, refreshKey, colors }: SignalsTabProps) {
  const [stockData, setStockData] = useState<StockHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await fetchHistory(ticker, "6mo", "1d");
        setStockData(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [ticker, refreshKey]);

  useEffect(() => {
    if (!svgRef.current || stockData.length === 0) return;

    const container = svgRef.current.parentElement;
    if (!container) return;

    const width = container.clientWidth;
    const height = 350;
    const margin = { top: 30, right: 80, bottom: 50, left: 60 };

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    svg.attr("width", width).attr("height", height);

    // Calculate MACD
    const calculateEMA = (data: number[], period: number) => {
      const k = 2 / (period + 1);
      const ema: number[] = [data[0]];
      for (let i = 1; i < data.length; i++) {
        ema.push(data[i] * k + ema[i - 1] * (1 - k));
      }
      return ema;
    };

    const closePrices = stockData.map(d => d.close);
    const ema12 = calculateEMA(closePrices, 12);
    const ema26 = calculateEMA(closePrices, 26);
    const macd = ema12.map((v, i) => v - ema26[i]);
    const signalLine = calculateEMA(macd, 9);
    const histogram = macd.map((v, i) => v - signalLine[i]);

    const xScale = d3.scaleTime()
      .domain(d3.extent(stockData, d => d.date) as [Date, Date])
      .range([margin.left, width - margin.right]);

    // MACD scale
    const macdMin = d3.min(macd) || 0;
    const macdMax = d3.max(macd) || 0;
    const yScale = d3.scaleLinear()
      .domain([macdMin * 1.1, macdMax * 1.1])
      .range([height - margin.bottom, margin.top]);

    // Grid
    svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale).tickSize(-(width - margin.left - margin.right)).tickFormat(() => "").ticks(5))
      .selectAll("line")
      .attr("stroke", "#e2e8f0")
      .attr("stroke-dasharray", "3,3");
    svg.selectAll(".domain").remove();

    // Zero line
    svg.append("line")
      .attr("x1", margin.left).attr("x2", width - margin.right)
      .attr("y1", yScale(0)).attr("y2", yScale(0))
      .attr("stroke", "#374151").attr("stroke-width", 1);

    // Histogram bars
    stockData.slice(-histogram.length).forEach((d, i) => {
      const barHeight = Math.abs(yScale(histogram[i]) - yScale(0));
      svg.append("rect")
        .attr("x", xScale(d.date) - 2)
        .attr("y", histogram[i] >= 0 ? yScale(histogram[i]) : yScale(0))
        .attr("width", 4)
        .attr("height", barHeight)
        .attr("fill", histogram[i] >= 0 ? colors.bullish : colors.bearish)
        .attr("fill-opacity", 0.5);
    });

    // MACD line
    const macdData = stockData.map((d, i) => ({ date: d.date, value: macd[i] }));
    const line = d3.line<{ date: Date; value: number }>()
      .x(d => xScale(d.date))
      .y(d => yScale(d.value))
      .curve(d3.curveMonotoneX);

    svg.append("path")
      .datum(macdData)
      .attr("fill", "none")
      .attr("stroke", colors.chartLine)
      .attr("stroke-width", 2)
      .attr("d", line);

    // Signal line
    const signalData = stockData.map((d, i) => ({ date: d.date, value: signalLine[i] }));
    svg.append("path")
      .datum(signalData)
      .attr("fill", "none")
      .attr("stroke", colors.accent)
      .attr("stroke-width", 1.5)
      .attr("d", line);

    // Axes
    svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(xScale).ticks(6))
      .selectAll("text").attr("fill", colors.neutral).attr("font-size", "11px");

    svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale).ticks(5))
      .selectAll("text").attr("fill", colors.neutral).attr("font-size", "11px");

    // Legend
    const legend = svg.append("g").attr("transform", `translate(${margin.left}, 10)`);
    const legends = [
      { color: colors.chartLine, label: "MACD Line" },
      { color: colors.accent, label: "Signal Line" },
    ];
    legends.forEach((l, i) => {
      const g = legend.append("g").attr("transform", `translate(${i * 100}, 0)`);
      g.append("line").attr("x1", 0).attr("x2", 15).attr("y1", 5).attr("y2", 5)
        .attr("stroke", l.color).attr("stroke-width", 2);
      g.append("text").attr("x", 20).attr("y", 9).attr("fill", colors.neutral).attr("font-size", "10px").text(l.label);
    });

  }, [stockData, colors]);

  if (loading) {
    return <div className="p-6 text-center text-slate-500">Loading signal data...</div>;
  }

  // Signal analysis
  const latestMACD = stockData.length > 26
    ? (() => {
        const closePrices = stockData.map(d => d.close);
        const ema12 = closePrices.slice(0, 12).reduce((a, b) => a + b, 0) / 12;
        const ema26 = closePrices.slice(0, 26).reduce((a, b) => a + b, 0) / 26;
        return ema12 - ema26;
      })()
    : 0;

  const signal = latestMACD > 0 ? "BULLISH" : latestMACD < 0 ? "BEARISH" : "NEUTRAL";

  return (
    <div className="p-6">
      {/* Signal Explanation - Diagram Boxes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
          <div className="text-emerald-700 font-semibold mb-1">BUY SIGNAL</div>
          <div className="text-sm text-emerald-600">MACD line crosses above signal line</div>
        </div>
        <div className="bg-red-50 rounded-xl p-4 border border-red-200">
          <div className="text-red-700 font-semibold mb-1">SELL SIGNAL</div>
          <div className="text-sm text-red-600">MACD line crosses below signal line</div>
        </div>
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
          <div className="text-slate-700 font-semibold mb-1">HOLD</div>
          <div className="text-sm text-slate-600">MACD and signal lines converge</div>
        </div>
      </div>

      {/* Chart */}
      <div className="relative h-[350px] mb-6 border border-slate-200 rounded-lg p-4 bg-slate-50">
        <svg ref={svgRef} className="w-full h-full" />
      </div>

      {/* Current Signal */}
      <div className={`rounded-xl p-6 mb-6 ${signal === "BULLISH" ? "bg-emerald-50 border border-emerald-200" : signal === "BEARISH" ? "bg-red-50 border border-red-200" : "bg-slate-50 border border-slate-200"}`}>
        <div className="text-center">
          <div className="text-sm text-slate-500 uppercase tracking-wide mb-2">Current Signal</div>
          <div className={`text-3xl font-bold ${signal === "BULLISH" ? "text-emerald-600" : signal === "BEARISH" ? "text-red-600" : "text-slate-600"}`}>
            {signal}
          </div>
          <div className="text-sm text-slate-500 mt-2">
            MACD Value: {latestMACD.toFixed(4)}
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl p-5 border border-slate-200 mb-6">
        <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-slate-800 text-white text-xs flex items-center justify-center">i</span>
          Key Insights
        </h4>
        <ul className="space-y-2 text-slate-600">
          <li className="flex items-start gap-2">
            <span className="text-emerald-500 mt-1">-</span>
            <span><strong>MACD Line</strong> (blue) is the difference between 12-day and 26-day exponential moving averages</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-500 mt-1">-</span>
            <span><strong>Signal Line</strong> (orange) is a 9-day EMA of the MACD - it acts as a trigger for buy/sell decisions</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-500 mt-1">-</span>
            <span>When MACD crosses above the signal line, it's a bullish signal; when it crosses below, it's bearish</span>
          </li>
        </ul>
      </div>

      {/* Recommendations */}
      <div className="bg-emerald-50 rounded-xl p-5 border border-emerald-200">
        <h4 className="font-semibold text-emerald-800 mb-3 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs flex items-center justify-center">R</span>
          Recommendations
        </h4>
        <ul className="space-y-2 text-emerald-700">
          <li className="flex items-start gap-2">
            <span className="text-emerald-500 mt-1">-</span>
            <span>Use signals as one input among many - never rely on a single indicator for investment decisions</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-500 mt-1">-</span>
            <span>Wait for confirmation - a signal is more reliable when it aligns with the broader trend</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-500 mt-1">-</span>
            <span>Consider the 200-day SMA as a filter: only take buy signals when price is above the 200-day SMA</span>
          </li>
        </ul>
      </div>
    </div>
  );
}