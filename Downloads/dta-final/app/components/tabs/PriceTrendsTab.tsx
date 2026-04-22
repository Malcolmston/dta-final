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

interface PriceTrendsTabProps {
  ticker: string;
  refreshKey: number;
  colors: ColorPalette;
}

export default function PriceTrendsTab({ ticker, refreshKey, colors }: PriceTrendsTabProps) {
  const [stockData, setStockData] = useState<StockHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await fetchHistory(ticker, "1y", "1d");
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
    const height = 400;
    const margin = { top: 30, right: 80, bottom: 50, left: 60 };

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    svg.attr("width", width).attr("height", height);

    const xScale = d3.scaleTime()
      .domain(d3.extent(stockData, d => d.date) as [Date, Date])
      .range([margin.left, width - margin.right]);

    const yMin = d3.min(stockData, d => d.low)! * 0.95;
    const yMax = d3.max(stockData, d => d.high)! * 1.05;
    const yScale = d3.scaleLinear()
      .domain([yMin, yMax])
      .range([height - margin.bottom, margin.top]);

    // Calculate moving averages
    const calculateSMA = (data: StockHistory[], period: number) => {
      const result: { date: Date; value: number }[] = [];
      for (let i = period - 1; i < data.length; i++) {
        const sum = data.slice(i - period + 1, i + 1).reduce((acc, d) => acc + d.close, 0);
        result.push({ date: data[i].date, value: sum / period });
      }
      return result;
    };

    const sma20 = calculateSMA(stockData, 20);
    const sma50 = calculateSMA(stockData, 50);
    const sma200 = calculateSMA(stockData, 200);

    // Grid
    svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale).tickSize(-(width - margin.left - margin.right)).tickFormat(() => "").ticks(6))
      .selectAll("line")
      .attr("stroke", "#e2e8f0")
      .attr("stroke-dasharray", "3,3");
    svg.selectAll(".domain").remove();

    // Draw candlesticks
    const candleWidth = Math.max(2, (width - margin.left - margin.right) / stockData.length * 0.6);

    stockData.forEach((d) => {
      const x = xScale(d.date);
      const isBullish = d.close >= d.open;
      const color = isBullish ? colors.bullish : colors.bearish;

      // Wick
      svg.append("line")
        .attr("x1", x).attr("x2", x)
        .attr("y1", yScale(d.high)).attr("y2", yScale(d.low))
        .attr("stroke", color).attr("stroke-width", 1);

      // Body
      const bodyTop = yScale(Math.max(d.open, d.close));
      const bodyHeight = Math.max(1, yScale(Math.min(d.open, d.close)) - bodyTop);

      svg.append("rect")
        .attr("x", x - candleWidth / 2)
        .attr("y", bodyTop)
        .attr("width", candleWidth)
        .attr("height", bodyHeight)
        .attr("fill", color)
        .attr("stroke", color);
    });

    // Draw SMAs
    const drawSMA = (data: { date: Date; value: number }[], color: string, width: number, dash?: string) => {
      if (data.length < 2) return;
      const line = d3.line<{ date: Date; value: number }>()
        .x(d => xScale(d.date))
        .y(d => yScale(d.value))
        .curve(d3.curveMonotoneX);

      svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", color)
        .attr("stroke-width", width)
        .attr("stroke-dasharray", dash || "none")
        .attr("d", line);
    };

    drawSMA(sma20, "#8b5cf6", 2);
    drawSMA(sma50, "#f59e0b", 2, "5,3");
    drawSMA(sma200, "#06b6d4", 1.5, "2,2");

    // Axes
    svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(xScale).ticks(8))
      .selectAll("text").attr("fill", colors.neutral).attr("font-size", "11px");

    svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale).tickFormat(d => `$${d}`).ticks(6))
      .selectAll("text").attr("fill", colors.neutral).attr("font-size", "11px");

    // Legend
    const legend = svg.append("g").attr("transform", `translate(${margin.left}, 10)`);
    const legends = [
      { color: colors.bullish, label: "Price Candles" },
      { color: "#8b5cf6", label: "20-day SMA" },
      { color: "#f59e0b", label: "50-day SMA" },
      { color: "#06b6d4", label: "200-day SMA" },
    ];
    legends.forEach((l, i) => {
      const g = legend.append("g").attr("transform", `translate(${i * 110}, 0)`);
      g.append("line").attr("x1", 0).attr("x2", 15).attr("y1", 5).attr("y2", 5)
        .attr("stroke", l.color).attr("stroke-width", 2);
      g.append("text").attr("x", 20).attr("y", 9).attr("fill", colors.neutral).attr("font-size", "10px").text(l.label);
    });

  }, [stockData, colors]);

  if (loading) {
    return <div className="p-6 text-center text-slate-500">Loading price trend data...</div>;
  }

  // Calculate trend metrics
  const recentData = stockData.slice(-30);
  const sma20 = recentData.length >= 20
    ? recentData.slice(-20).reduce((acc, d) => acc + d.close, 0) / 20
    : 0;
  const sma50 = recentData.length >= 50
    ? recentData.slice(-50).reduce((acc, d) => acc + d.close, 0) / 50
    : 0;
  const currentPrice = stockData.length > 0 ? stockData[stockData.length - 1].close : 0;
  const trend = sma20 > sma50 ? "bullish" : "bearish";

  return (
    <div className="p-6">
      {/* Chart */}
      <div className="relative h-[400px] mb-6 border border-slate-200 rounded-lg p-4 bg-slate-50">
        <svg ref={svgRef} className="w-full h-full" />
      </div>

      {/* Trend Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
          <div className="text-xs text-slate-500 uppercase tracking-wide">Short-term (20-day)</div>
          <div className="text-xl font-bold text-slate-800">${sma20.toFixed(2)}</div>
        </div>
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
          <div className="text-xs text-slate-500 uppercase tracking-wide">Medium-term (50-day)</div>
          <div className="text-xl font-bold text-slate-800">${sma50.toFixed(2)}</div>
        </div>
        <div className={`rounded-xl p-4 border ${trend === "bullish" ? "bg-emerald-50 border-emerald-200" : "bg-red-50 border-red-200"}`}>
          <div className="text-xs uppercase tracking-wide">Trend Signal</div>
          <div className={`text-xl font-bold ${trend === "bullish" ? "text-emerald-600" : "text-red-600"}`}>
            {trend === "bullish" ? "BULLISH" : "BEARISH"}
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
            <span>When the 20-day SMA is above the 50-day SMA, short-term momentum is positive</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-500 mt-1">-</span>
            <span>The 200-day SMA is called the "life insurance line" - prices above it are generally considered healthy</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-500 mt-1">-</span>
            <span>Candlesticks show daily trading: green (bullish) means close higher than open, red (bearish) means close lower</span>
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
            <span>Use moving average crossovers as entry/exit signals - when fast SMA crosses above slow SMA, consider buying</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-500 mt-1">-</span>
            <span>Avoid making decisions based on a single day - trends take time to develop and reverse</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-500 mt-1">-</span>
            <span>The 200-day SMA is useful for long-term investment decisions - stay invested when above, consider defensive positions when below</span>
          </li>
        </ul>
      </div>
    </div>
  );
}