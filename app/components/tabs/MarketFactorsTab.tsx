"use client";

import { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import { useColorPalette } from "@/app/context/ColorPaletteContext";
import { fetchHistory, StockHistory } from "@/lib/client";

interface MarketFactorsTabProps {
  ticker: string;
  refreshKey: number;
  colors?: { chartLine: string; bullish: string; bearish: string; neutral: string };
}

export default function MarketFactorsTab({ ticker, refreshKey, colors }: MarketFactorsTabProps) {
  const { palette, isDarkMode } = useColorPalette();
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
    const height = 350;
    const margin = { top: 40, right: 30, bottom: 50, left: 60 };

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    svg.attr("width", width).attr("height", height);

    // Calculate daily returns
    const returns = stockData.slice(1).map((d, i) => ({
      date: d.date,
      return: (d.close - stockData[i].close) / stockData[i].close,
      volume: d.volume,
    }));

    const xScale = d3.scaleTime()
      .domain(d3.extent(returns, d => d.date) as [Date, Date])
      .range([margin.left, width - margin.right]);

    const yScale = d3.scaleLinear()
      .domain([
        d3.min(returns, d => d.return)! * 1.1,
        d3.max(returns, d => d.return)! * 1.1
      ])
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
      .attr("stroke", "#374151").attr("stroke-width", 2);

    // Draw daily returns as bars
    returns.forEach((d) => {
      const barHeight = Math.abs(yScale(d.return) - yScale(0));
      svg.append("rect")
        .attr("x", xScale(d.date) - 1)
        .attr("y", d.return >= 0 ? yScale(d.return) : yScale(0))
        .attr("width", 2)
        .attr("height", barHeight)
        .attr("fill", d.return >= 0 ? palette.positive : palette.negative)
        .attr("fill-opacity", 0.7);
    });

    // Axes
    svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(xScale).ticks(8))
      .selectAll("text").attr("fill", palette.text).attr("font-size", "11px");

    svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale).tickFormat(d => `${(+d * 100).toFixed(1)}%`).ticks(5))
      .selectAll("text").attr("fill", palette.text).attr("font-size", "11px");

  }, [stockData, palette]);

  if (loading) {
    return <div className="p-6 text-center text-slate-500">Loading market factor data...</div>;
  }

  // Factor analysis
  const returns = stockData.length > 1
    ? stockData.slice(1).map((d, i) => (d.close - stockData[i].close) / stockData[i].close)
    : [];
  const avgReturn = returns.length > 0 ? returns.reduce((a, b) => a + b, 0) / returns.length : 0;
  const volatility = returns.length > 0 ? d3.deviation(returns) || 0 : 0;
  const positiveDays = returns.filter(r => r > 0).length;
  const negativeDays = returns.filter(r => r < 0).length;

  return (
    <div className="p-6">
      {/* Factors Grid - Diagram Style Boxes */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
          <div className="text-xs text-slate-500 uppercase tracking-wide mb-1 font-semibold">Economic</div>
          <div className="text-sm text-slate-700">Interest rates, inflation, GDP growth, employment data</div>
        </div>
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
          <div className="text-xs text-slate-500 uppercase tracking-wide mb-1 font-semibold">Corporate</div>
          <div className="text-sm text-slate-700">Company profits, revenue growth, earnings guidance</div>
        </div>
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
          <div className="text-xs text-slate-500 uppercase tracking-wide mb-1 font-semibold">Sentiment</div>
          <div className="text-sm text-slate-700">Fear/greed index, investor confidence, news cycles</div>
        </div>
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
          <div className="text-xs text-slate-500 uppercase tracking-wide mb-1 font-semibold">Global</div>
          <div className="text-sm text-slate-700">Geopolitics, pandemics, trade agreements, regulations</div>
        </div>
      </div>

      {/* Chart */}
      <div className="relative h-[350px] mb-6 border border-slate-200 rounded-lg p-4 bg-slate-50">
        <svg ref={svgRef} className="w-full h-full" />
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
          <div className="text-xs text-slate-500 uppercase tracking-wide">Avg Daily Return</div>
          <div className={`text-xl font-bold ${avgReturn >= 0 ? "text-emerald-600" : "text-red-600"}`}>
            {(avgReturn * 100).toFixed(3)}%
          </div>
        </div>
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
          <div className="text-xs text-slate-500 uppercase tracking-wide">Volatility</div>
          <div className="text-xl font-bold text-slate-800">{(volatility * 100).toFixed(2)}%</div>
        </div>
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
          <div className="text-xs text-slate-500 uppercase tracking-wide">Up Days</div>
          <div className="text-xl font-bold text-emerald-600">{positiveDays}</div>
        </div>
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
          <div className="text-xs text-slate-500 uppercase tracking-wide">Down Days</div>
          <div className="text-xl font-bold text-red-600">{negativeDays}</div>
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
            <span><strong>Economic factors</strong> like interest rates have the broadest market impact - when rates rise, stocks often decline</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-500 mt-1">-</span>
            <span><strong>Corporate earnings</strong> are the primary driver of individual stock prices - companies that grow profits tend to see their stocks rise</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-500 mt-1">-</span>
            <span><strong>Market volatility</strong> ({(volatility * 100).toFixed(1)}%) measures price swings - higher volatility means more risk but also more opportunity</span>
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
            <span>Stay informed about major economic indicators - Fed rate decisions, CPI inflation reports, and employment data</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-500 mt-1">-</span>
            <span>Diversify across sectors to reduce exposure to any single factor - don't put all your eggs in one basket</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-500 mt-1">-</span>
            <span>During high volatility periods, consider holding more cash or defensive stocks (utilities, consumer staples)</span>
          </li>
        </ul>
      </div>
    </div>
  );
}