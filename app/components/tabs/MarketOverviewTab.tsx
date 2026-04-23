"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import * as d3 from "d3";
import { useColorPalette } from "@/app/context/ColorPaletteContext";
import { fetchHistory, StockHistory } from "@/lib/client";

interface MarketOverviewTabProps {
  ticker: string;
  refreshKey: number;
  colors?: { chartLine: string; bullish: string; bearish: string; neutral: string };
}

export default function MarketOverviewTab({ ticker, refreshKey, colors }: MarketOverviewTabProps) {
  const { palette, isDarkMode } = useColorPalette();
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
    gradient.append("stop").attr("offset", "0%").attr("stop-color", palette.primary).attr("stop-opacity", 0.25);
    gradient.append("stop").attr("offset", "100%").attr("stop-color", palette.primary).attr("stop-opacity", 0.02);

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
      .attr("stroke", palette.primary)
      .attr("stroke-width", 2.5)
      .attr("d", line);

    // Grid lines
    svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale).tickSize(-(width - margin.left - margin.right)).tickFormat(() => "").ticks(5))
      .selectAll("line")
      .attr("stroke", palette.gridLines)
      .attr("stroke-dasharray", "3,3");

    svg.selectAll(".domain").remove();

    // Axes
    svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(xScale).ticks(6))
      .selectAll("text").attr("fill", palette.text).attr("font-size", "11px");

    svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale).tickFormat(d => `$${d}`).ticks(5))
      .selectAll("text").attr("fill", palette.text).attr("font-size", "11px");

  }, [stockData, palette]);

  if (loading) {
    return <div className="p-6 text-center" style={{ color: palette.text }}>Loading market data...</div>;
  }

  const latestData = stockData.length > 0 ? stockData[stockData.length - 1] : null;
  const firstData = stockData.length > 0 ? stockData[0] : null;
  const change = latestData && firstData ? ((latestData.close - firstData.close) / firstData.close) * 100 : 0;

  return (
    <div className="p-6">
      {/* Main Chart */}
      <div className="relative h-[350px] mb-6 rounded-lg p-4" style={{ backgroundColor: isDarkMode ? palette.background : '#f8fafc', border: `1px solid ${palette.gridLines}` }}>
        <svg ref={svgRef} className="w-full h-full" />
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="rounded-xl p-4" style={{ backgroundColor: isDarkMode ? palette.background : '#f8fafc', border: `1px solid ${palette.gridLines}` }}>
          <div className="text-xs uppercase tracking-wide mb-1" style={{ color: palette.text, opacity: 0.6 }}>Current Price</div>
          <div className="text-2xl font-bold" style={{ color: palette.text }}>${latestData?.close.toFixed(2) || "—"}</div>
        </div>
        <div className="rounded-xl p-4" style={{ backgroundColor: isDarkMode ? palette.background : '#f8fafc', border: `1px solid ${palette.gridLines}` }}>
          <div className="text-xs uppercase tracking-wide mb-1" style={{ color: palette.text, opacity: 0.6 }}>3-Month Change</div>
          <div className="text-2xl font-bold" style={{ color: change >= 0 ? palette.positive : palette.negative }}>
            {change >= 0 ? "+" : ""}{change.toFixed(2)}%
          </div>
        </div>
        <div className="rounded-xl p-4" style={{ backgroundColor: isDarkMode ? palette.background : '#f8fafc', border: `1px solid ${palette.gridLines}` }}>
          <div className="text-xs uppercase tracking-wide mb-1" style={{ color: palette.text, opacity: 0.6 }}>Trading Range</div>
          <div className="text-xl font-bold" style={{ color: palette.text }}>
            ${firstData?.close.toFixed(2)} - ${latestData?.close.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Market Overview Insights */}
      <div className="rounded-xl p-5 mb-6" style={{ backgroundColor: palette.primary + '10', border: `1px solid ${palette.gridLines}` }}>
        <h4 className="font-semibold mb-3 flex items-center gap-2" style={{ color: palette.text }}>
          <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs" style={{ backgroundColor: palette.primary, color: '#ffffff' }}>i</span>
          Market Overview
        </h4>
        <p className="text-sm" style={{ color: palette.text, opacity: 0.7 }}>
          {change >= 0
            ? "The market has shown positive momentum over the past 3 months. The upward trend suggests continued investor confidence."
            : "The market has experienced a decline over the past 3 months. This could be due to various factors including earnings reports, economic data, or broader market sentiment."}
        </p>
      </div>

      {/* Educational Box */}
      <div className="rounded-xl p-5" style={{ backgroundColor: palette.accent + '15', border: `1px solid ${palette.gridLines}` }}>
        <h4 className="font-semibold mb-3 flex items-center gap-2" style={{ color: palette.text }}>
          <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs" style={{ backgroundColor: palette.accent, color: '#ffffff' }}>?</span>
          Understanding This Chart
        </h4>
        <ul className="space-y-2 text-sm" style={{ color: palette.text, opacity: 0.8 }}>
          <li className="flex items-start gap-2">
            <span style={{ color: palette.accent, marginTop: '4px' }}>-</span>
            <span>The line shows the closing price over time - where the stock ended each day</span>
          </li>
          <li className="flex items-start gap-2">
            <span style={{ color: palette.accent, marginTop: '4px' }}>-</span>
            <span>The shaded area shows the overall trend direction</span>
          </li>
          <li className="flex items-start gap-2">
            <span style={{ color: palette.accent, marginTop: '4px' }}>-</span>
            <span>Green colors indicate positive performance, red indicates negative</span>
          </li>
        </ul>
      </div>
    </div>
  );
}