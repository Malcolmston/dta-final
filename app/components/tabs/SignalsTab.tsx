"use client";

import { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import { useColorPalette } from "@/app/context/ColorPaletteContext";
import { fetchHistory, StockHistory } from "@/lib/client";

interface SignalsTabProps {
  ticker: string;
  refreshKey: number;
  colors?: { chartLine: string; bullish: string; bearish: string; neutral: string };
}

export default function SignalsTab({ ticker, refreshKey, colors }: SignalsTabProps) {
  const { palette, isDarkMode } = useColorPalette();
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
        .attr("fill", histogram[i] >= 0 ? palette.positive : palette.negative)
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
      .attr("stroke", palette.primary)
      .attr("stroke-width", 2)
      .attr("d", line);

    // Signal line
    const signalData = stockData.map((d, i) => ({ date: d.date, value: signalLine[i] }));
    svg.append("path")
      .datum(signalData)
      .attr("fill", "none")
      .attr("stroke", palette.accent)
      .attr("stroke-width", 1.5)
      .attr("d", line);

    // Axes
    svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(xScale).ticks(6))
      .selectAll("text").attr("fill", palette.text).attr("font-size", "11px");

    svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale).ticks(5))
      .selectAll("text").attr("fill", palette.text).attr("font-size", "11px");

    // Legend
    const legend = svg.append("g").attr("transform", `translate(${margin.left}, 10)`);
    const legends = [
      { color: palette.primary, label: "MACD Line" },
      { color: palette.accent, label: "Signal Line" },
    ];
    legends.forEach((l, i) => {
      const g = legend.append("g").attr("transform", `translate(${i * 100}, 0)`);
      g.append("line").attr("x1", 0).attr("x2", 15).attr("y1", 5).attr("y2", 5)
        .attr("stroke", l.color).attr("stroke-width", 2);
      g.append("text").attr("x", 20).attr("y", 9).attr("fill", palette.text).attr("font-size", "10px").text(l.label);
    });

  }, [stockData, palette]);

  if (loading) {
    return <div className="p-6 text-center" style={{ color: palette.text }}>Loading signal data...</div>;
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
        <div className="rounded-xl p-4" style={{ backgroundColor: palette.positive + '15', border: `1px solid ${palette.gridLines}` }}>
          <div className="font-semibold mb-1" style={{ color: palette.positive }}>BUY SIGNAL</div>
          <div className="text-sm" style={{ color: palette.text, opacity: 0.7 }}>MACD line crosses above signal line</div>
        </div>
        <div className="rounded-xl p-4" style={{ backgroundColor: palette.negative + '15', border: `1px solid ${palette.gridLines}` }}>
          <div className="font-semibold mb-1" style={{ color: palette.negative }}>SELL SIGNAL</div>
          <div className="text-sm" style={{ color: palette.text, opacity: 0.7 }}>MACD line crosses below signal line</div>
        </div>
        <div className="rounded-xl p-4" style={{ backgroundColor: isDarkMode ? palette.background : '#f8fafc', border: `1px solid ${palette.gridLines}` }}>
          <div className="font-semibold mb-1" style={{ color: palette.text }}>HOLD</div>
          <div className="text-sm" style={{ color: palette.text, opacity: 0.7 }}>MACD and signal lines converge</div>
        </div>
      </div>

      {/* Chart */}
      <div className="relative h-[350px] mb-6 rounded-lg p-4" style={{ backgroundColor: isDarkMode ? palette.background : '#f8fafc', border: `1px solid ${palette.gridLines}` }}>
        <svg ref={svgRef} className="w-full h-full" />
      </div>

      {/* Current Signal */}
      <div className="rounded-xl p-6 mb-6" style={{ backgroundColor: signal === "BULLISH" ? palette.positive + '15' : signal === "BEARISH" ? palette.negative + '15' : (isDarkMode ? palette.background : '#f8fafc'), border: `1px solid ${palette.gridLines}` }}>
        <div className="text-center">
          <div className="text-sm uppercase tracking-wide mb-2" style={{ color: palette.text, opacity: 0.6 }}>Current Signal</div>
          <div className="text-3xl font-bold" style={{ color: signal === "BULLISH" ? palette.positive : signal === "BEARISH" ? palette.negative : palette.text }}>
            {signal}
          </div>
          <div className="text-sm mt-2" style={{ color: palette.text, opacity: 0.6 }}>
            MACD Value: {latestMACD.toFixed(4)}
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="rounded-xl p-5 mb-6" style={{ backgroundColor: palette.primary + '10', border: `1px solid ${palette.gridLines}` }}>
        <h4 className="font-semibold mb-3 flex items-center gap-2" style={{ color: palette.text }}>
          <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs" style={{ backgroundColor: palette.primary, color: '#ffffff' }}>i</span>
          Key Insights
        </h4>
        <ul className="space-y-2" style={{ color: palette.text, opacity: 0.7 }}>
          <li className="flex items-start gap-2">
            <span style={{ color: palette.positive, marginTop: '4px' }}>-</span>
            <span><strong>MACD Line</strong> (blue) is the difference between 12-day and 26-day exponential moving averages</span>
          </li>
          <li className="flex items-start gap-2">
            <span style={{ color: palette.positive, marginTop: '4px' }}>-</span>
            <span><strong>Signal Line</strong> (orange) is a 9-day EMA of the MACD - it acts as a trigger for buy/sell decisions</span>
          </li>
          <li className="flex items-start gap-2">
            <span style={{ color: palette.positive, marginTop: '4px' }}>-</span>
            <span>When MACD crosses above the signal line, it's a bullish signal; when it crosses below, it's bearish</span>
          </li>
        </ul>
      </div>

      {/* Recommendations */}
      <div className="rounded-xl p-5" style={{ backgroundColor: palette.positive + '15', border: `1px solid ${palette.gridLines}` }}>
        <h4 className="font-semibold mb-3 flex items-center gap-2" style={{ color: palette.text }}>
          <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs" style={{ backgroundColor: palette.positive, color: '#ffffff' }}>R</span>
          Recommendations
        </h4>
        <ul className="space-y-2" style={{ color: palette.text, opacity: 0.8 }}>
          <li className="flex items-start gap-2">
            <span style={{ color: palette.positive, marginTop: '4px' }}>-</span>
            <span>Use signals as one input among many - never rely on a single indicator for investment decisions</span>
          </li>
          <li className="flex items-start gap-2">
            <span style={{ color: palette.positive, marginTop: '4px' }}>-</span>
            <span>Wait for confirmation - a signal is more reliable when it aligns with the broader trend</span>
          </li>
          <li className="flex items-start gap-2">
            <span style={{ color: palette.positive, marginTop: '4px' }}>-</span>
            <span>Consider the 200-day SMA as a filter: only take buy signals when price is above the 200-day SMA</span>
          </li>
        </ul>
      </div>
    </div>
  );
}