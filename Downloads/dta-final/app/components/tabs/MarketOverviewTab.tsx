"use client";

import { useState, useEffect, useRef, useCallback } from "react";
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

interface MarketOverviewTabProps {
  ticker: string;
  refreshKey: number;
  colors: ColorPalette;
}

export default function MarketOverviewTab({ ticker, refreshKey, colors }: MarketOverviewTabProps) {
  const [stockData, setStockData] = useState<StockHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const svgRef = useRef<SVGSVGElement>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchHistory(ticker, "3mo", "1d");
      setStockData(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [ticker]);

  useEffect(() => {
    fetchData();
  }, [fetchData, refreshKey]);

  useEffect(() => {
    if (!svgRef.current || stockData.length === 0) return;

    const container = svgRef.current.parentElement;
    if (!container) return;

    const width = container.clientWidth;
    const height = 350;
    const margin = { top: 20, right: 80, bottom: 40, left: 60 };

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    svg.attr("width", width).attr("height", height);

    const xScale = d3.scaleTime()
      .domain(d3.extent(stockData, d => d.date) as [Date, Date])
      .range([margin.left, width - margin.right]);

    const yScale = d3.scaleLinear()
      .domain([
        d3.min(stockData, d => d.low)! * 0.98,
        d3.max(stockData, d => d.high)! * 1.02
      ])
      .range([height - margin.bottom, margin.top]);

    // Gradient definition
    const defs = svg.append("defs");
    const gradient = defs.append("linearGradient")
      .attr("id", "overviewAreaGradient")
      .attr("x1", "0%").attr("y1", "0%")
      .attr("x2", "0%").attr("y2", "100%");
    gradient.append("stop").attr("offset", "0%").attr("stop-color", colors.chartLine).attr("stop-opacity", 0.25);
    gradient.append("stop").attr("offset", "100%").attr("stop-color", colors.chartLine).attr("stop-opacity", 0.02);

    // Area fill
    const area = d3.area<StockHistory>()
      .x(d => xScale(d.date))
      .y0(height - margin.bottom)
      .y1(d => yScale(d.close))
      .curve(d3.curveMonotoneX);

    svg.append("path")
      .datum(stockData)
      .attr("fill", "url(#overviewAreaGradient)")
      .attr("d", area);

    // Line
    const line = d3.line<StockHistory>()
      .x(d => xScale(d.date))
      .y(d => yScale(d.close))
      .curve(d3.curveMonotoneX);

    svg.append("path")
      .datum(stockData)
      .attr("fill", "none")
      .attr("stroke", colors.chartLine)
      .attr("stroke-width", 2.5)
      .attr("d", line);

    // Grid lines
    svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale).tickSize(-(width - margin.left - margin.right)).tickFormat(() => "").ticks(5))
      .selectAll("line")
      .attr("stroke", "#e2e8f0")
      .attr("stroke-dasharray", "3,3");

    svg.selectAll(".domain").remove();

    // Axes
    svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(xScale).ticks(6))
      .selectAll("text").attr("fill", colors.neutral).attr("font-size", "11px");

    svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale).tickFormat(d => `$${d}`).ticks(5))
      .selectAll("text").attr("fill", colors.neutral).attr("font-size", "11px");

  }, [stockData, colors]);

  if (loading) {
    return <div className="p-6 text-center text-slate-500">Loading market data...</div>;
  }

  const latestData = stockData.length > 0 ? stockData[stockData.length - 1] : null;
  const firstData = stockData.length > 0 ? stockData[0] : null;
  const change = latestData && firstData ? ((latestData.close - firstData.close) / firstData.close) * 100 : 0;

  return (
    <div className="p-6">
      {/* Main Chart */}
      <div className="relative h-[350px] mb-6 border border-slate-200 rounded-lg p-4 bg-slate-50">
        <svg ref={svgRef} className="w-full h-full" />
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
          <div className="text-xs text-slate-500 uppercase tracking-wide">Current Price</div>
          <div className="text-2xl font-bold text-slate-800">${latestData?.close.toFixed(2) || "—"}</div>
        </div>
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
          <div className="text-xs text-slate-500 uppercase tracking-wide">3-Month Change</div>
          <div className={`text-2xl font-bold ${change >= 0 ? "text-emerald-600" : "text-red-600"}`}>
            {change >= 0 ? "+" : ""}{change.toFixed(2)}%
          </div>
        </div>
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
          <div className="text-xs text-slate-500 uppercase tracking-wide">Trading Range</div>
          <div className="text-xl font-bold text-slate-800">
            ${firstData?.close.toFixed(2)} - ${latestData?.close.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Market Overview Insights */}
      <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl p-5 border border-slate-200 mb-6">
        <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-slate-800 text-white text-xs flex items-center justify-center">i</span>
          Market Overview
        </h4>
        <p className="text-slate-600 text-sm">
          {change >= 0
            ? "The market has shown positive momentum over the past 3 months. The upward trend suggests continued investor confidence."
            : "The market has experienced a decline over the past 3 months. This could be due to various factors including earnings reports, economic data, or broader market sentiment."}
        </p>
      </div>

      {/* Educational Box */}
      <div className="bg-blue-50 rounded-xl p-5 border border-blue-200">
        <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center">?</span>
          Understanding This Chart
        </h4>
        <ul className="space-y-2 text-blue-700 text-sm">
          <li className="flex items-start gap-2">
            <span className="text-blue-500 mt-1">-</span>
            <span>The line shows the closing price over time - where the stock ended each day</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500 mt-1">-</span>
            <span>The shaded area shows the overall trend direction</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500 mt-1">-</span>
            <span>Green colors indicate positive performance, red indicates negative</span>
          </li>
        </ul>
      </div>
    </div>
  );
}