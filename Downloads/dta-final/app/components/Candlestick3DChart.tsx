"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import * as d3 from "d3";
import { fetchHistory, StockHistory } from "@/lib/client";
import TickerInput from "./TickerInput";

interface CandlestickData {
  date: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

const TIME_RANGES = [
  { label: "1M", value: "1mo" },
  { label: "3M", value: "3mo" },
  { label: "6M", value: "6mo" },
  { label: "1Y", value: "1y" },
];

function processCandlestickData(data: StockHistory[]): CandlestickData[] {
  if (data.length < 2) return [];

  return data.map((item, index) => {
    const prevClose = index > 0 ? data[index - 1].close : item.close;
    return {
      date: item.date,
      open: prevClose,
      high: Math.max(item.close, prevClose),
      low: Math.min(item.close, prevClose),
      close: item.close,
      volume: item.volume || 0,
    };
  });
}

export default function Candlestick3DChart({ ticker: initialTicker = "AAPL" }: { ticker?: string }) {
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

  const candlestickData = useMemo(() => processCandlestickData(stockData), [stockData]);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || candlestickData.length === 0) return;

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
      .scaleBand()
      .domain(candlestickData.map((_, i) => i.toString()))
      .range([0, innerWidth])
      .padding(0.3);

    const yExtent = d3.extent(candlestickData.flatMap((d) => [d.high, d.low])) as [number, number];
    const yPadding = (yExtent[1] - yExtent[0]) * 0.1;
    const yScale = d3.scaleLinear().domain([yExtent[0] - yPadding, yExtent[1] + yPadding]).range([innerHeight, 0]);

    const maxVolume = d3.max(candlestickData, (d) => d.volume) || 1;
    const volumeScale = d3.scaleLinear().domain([0, maxVolume]).range([0, innerHeight * 0.25]);

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

    const barWidth = xScale.bandwidth();

    // Draw candlesticks
    candlestickData.forEach((d, i) => {
      const isGreen = d.close >= d.open;
      const color = isGreen ? "#22c55e" : "#ef4444";
      const x = (xScale(i.toString()) || 0) + barWidth / 2;

      // Wick
      g.append("line")
        .attr("x1", x)
        .attr("x2", x)
        .attr("y1", yScale(d.high))
        .attr("y2", yScale(d.low))
        .attr("stroke", color)
        .attr("stroke-width", 1.5);

      // Body
      const bodyTop = yScale(Math.max(d.open, d.close));
      const bodyBottom = yScale(Math.min(d.open, d.close));
      const bodyHeight = Math.max(bodyBottom - bodyTop, 2);

      g.append("rect")
        .attr("x", x - barWidth / 2)
        .attr("y", bodyTop)
        .attr("width", barWidth)
        .attr("height", bodyHeight)
        .attr("fill", color)
        .attr("rx", 2);

      // Volume bar
      const volumeHeight = volumeScale(d.volume);
      g.append("rect")
        .attr("x", x - barWidth / 2)
        .attr("y", innerHeight - volumeHeight)
        .attr("width", barWidth)
        .attr("height", volumeHeight)
        .attr("fill", color)
        .attr("rx", 1)
        .attr("opacity", 0.3);
    });

    // X Axis
    const xAxis = d3.axisBottom(xScale).tickValues(
      xScale.domain().filter((_, i) => i % Math.ceil(candlestickData.length / 8) === 0)
    );

    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(xAxis)
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
  }, [candlestickData]);

  return (
    <div ref={containerRef} className="w-full max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Candlestick Chart</h2>
          <p className="text-sm text-gray-500">OHLCV data</p>
        </div>
        <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-sm font-medium rounded-full">
          {ticker}
        </span>
      </div>

      <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-sm text-gray-600">
          <span className="text-green-600 font-medium">Green</span> = Bullish (close ≥ open) |{" "}
          <span className="text-red-600 font-medium">Red</span> = Bearish (close &lt; open). Bottom bars show volume.
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
          {TIME_RANGES.map((range) => (
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

      <div className="mt-3 flex items-center gap-6 text-sm text-gray-500">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded-sm"></div>
          <span>Bullish</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded-sm"></div>
          <span>Bearish</span>
        </div>
      </div>
    </div>
  );
}