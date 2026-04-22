"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import * as d3 from "d3";
import { fetchHistory, StockHistory } from "@/lib/client";
import { TIME_RANGES_SHORT } from "@/lib/constants";
import TickerInput from "./TickerInput";

interface PricePoint {
  date: Date;
  close: number;
}

function processPriceData(data: StockHistory[]): PricePoint[] {
  return data.map((item) => ({
    date: item.date,
    close: item.close || 0,
  }));
}

export default function PriceRibbon3D({ ticker: initialTicker = "AAPL" }: { ticker?: string }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [ticker, setTicker] = useState(initialTicker);
  const [period, setPeriod] = useState("3mo");
  const [stockData, setStockData] = useState<StockHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        throw new Error("No data found");
      }
      setStockData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch data");
      setStockData([]);
    } finally {
      setLoading(false);
    }
  }, [ticker, period]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const priceData = useMemo(() => processPriceData(stockData), [stockData]);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || priceData.length < 2) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = 400;
    const margin = { top: 30, right: 30, bottom: 50, left: 60 };

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    svg.attr("width", width).attr("height", height);

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    const xScale = d3
      .scaleTime()
      .domain(d3.extent(priceData, (d) => d.date) as [Date, Date])
      .range([0, innerWidth]);

    const yExtent = d3.extent(priceData, (d) => d.close) as [number, number];
    const yPadding = (yExtent[1] - yExtent[0]) * 0.1;
    const yScale = d3.scaleLinear().domain([yExtent[0] - yPadding, yExtent[1] + yPadding]).range([innerHeight, 0]);

    // Grid lines
    g.append("g")
      .selectAll("line")
      .data(yScale.ticks(6))
      .enter()
      .append("line")
      .attr("x1", 0)
      .attr("x2", innerWidth)
      .attr("y1", (d) => yScale(d))
      .attr("y2", (d) => yScale(d))
      .attr("stroke", "#e5e7eb")
      .attr("stroke-dasharray", "3,3");

    // Area fill
    const area = d3
      .area<PricePoint>()
      .x((d) => xScale(d.date))
      .y0(innerHeight)
      .y1((d) => yScale(d.close))
      .curve(d3.curveMonotoneX);

    g.append("path")
      .datum(priceData)
      .attr("fill", "#6366f1")
      .attr("opacity", 0.15)
      .attr("d", area);

    // Line
    const line = d3
      .line<PricePoint>()
      .x((d) => xScale(d.date))
      .y((d) => yScale(d.close))
      .curve(d3.curveMonotoneX);

    g.append("path")
      .datum(priceData)
      .attr("fill", "none")
      .attr("stroke", "#6366f1")
      .attr("stroke-width", 2.5)
      .attr("d", line);

    // Data points at intervals
    const pointInterval = Math.floor(priceData.length / 8);
    const points = priceData.filter((_, i) => i % pointInterval === 0 || i === priceData.length - 1);

    points.forEach((d) => {
      const x = xScale(d.date);
      const y = yScale(d.close);

      g.append("circle")
        .attr("cx", x)
        .attr("cy", y)
        .attr("r", 4)
        .attr("fill", "#6366f1")
        .attr("stroke", "#fff")
        .attr("stroke-width", 2);

      g.append("text")
        .attr("x", x)
        .attr("y", y - 10)
        .attr("text-anchor", "middle")
        .attr("fill", "#6b7280")
        .attr("font-size", "10px")
        .attr("font-weight", "500")
        .text(`$${d.close.toFixed(2)}`);
    });

    // X Axis
    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale).ticks(6))
      .selectAll("text")
      .attr("fill", "#6b7280")
      .attr("font-size", "11px");

    // Y Axis
    g.append("g")
      .call(d3.axisLeft(yScale).ticks(6).tickFormat((d) => `$${d}`))
      .selectAll("text")
      .attr("fill", "#6b7280")
      .attr("font-size", "11px");

    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -45)
      .attr("x", -innerHeight / 2)
      .attr("text-anchor", "middle")
      .attr("fill", "#6b7280")
      .attr("font-size", "12px")
      .text("Price ($)");
  }, [priceData]);

  return (
    <div ref={containerRef} className="w-full max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Price Chart</h2>
          <p className="text-sm text-gray-500">Price history over time</p>
        </div>
        <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-sm font-medium rounded-full">
          {ticker}
        </span>
      </div>

      <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-sm text-gray-600">
          Line chart showing price movement over time. Area fill shows the price range.
        </p>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
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
        <div className="flex gap-2 items-end">
          {TIME_RANGES_SHORT.map((range) => (
            <button
              key={range.value}
              onClick={() => setPeriod(range.value)}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition ${
                period === range.value ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">{error}</div>}

      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <svg ref={svgRef} className="w-full" style={{ height: "400px" }} />
      </div>
    </div>
  );
}