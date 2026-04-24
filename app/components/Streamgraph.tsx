"use client";

import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { fetchHistory, StockHistory } from "@/lib/client";
import { TIME_RANGES } from "@/lib/constants";
import { useColorPalette } from "@/app/context/ColorPaletteContext";
import TickerInput from "./TickerInput";
import HelpPopup from "./HelpPopup";

interface StockDataMap {
  [symbol: string]: StockHistory[];
}

const COLORS = [
  "#3b82f6", // blue
  "#f97316", // orange
  "#22c55e", // green
  "#a855f7", // purple
  "#ef4444", // red
  "#06b6d4", // cyan
  "#eab308", // yellow
  "#ec4899", // pink
  "#8b5cf6", // violet
  "#14b8a6", // teal
];

export default function Streamgraph() {
  const { palette } = useColorPalette();
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [tickers, setTickers] = useState("AAPL,GOOGL,MSFT");
  const [period, setPeriod] = useState("1y");
  const [stockData, setStockData] = useState<StockDataMap>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    const symbols = tickers
      .split(",")
      .map((s) => s.trim().toUpperCase())
      .filter((s) => s.length > 0);

    if (symbols.length === 0) {
      setError("Please enter at least one ticker");
      setLoading(false);
      return;
    }

    try {
      const results = await Promise.all(
        symbols.map((symbol) =>
          fetchHistory(symbol, period, "1d").catch((err) => {
            console.error(`Failed to fetch ${symbol}:`, err);
            return null;
          })
        )
      );

      const dataMap: StockDataMap = {};
      symbols.forEach((symbol, i) => {
        if (results[i] && results[i]!.length > 0) {
          dataMap[symbol] = results[i]!;
        }
      });

      const fetchedSymbols = Object.keys(dataMap);
      if (fetchedSymbols.length === 0) {
        throw new Error("No data found for any of the specified tickers");
      }

      setStockData(dataMap);
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

  // Auto-fetch when period changes
  useEffect(() => {
    if (Object.keys(stockData).length > 0) {
      fetchData();
    }
  }, [period]);

  // D3 streamgraph rendering
  useEffect(() => {
    if (!svgRef.current || !containerRef.current || Object.keys(stockData).length === 0) {
      return;
    }

    const symbols = Object.keys(stockData);
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = 450;
    const margin = { top: 20, right: 120, bottom: 40, left: 60 };

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    svg.attr("width", width).attr("height", height);

    // Align all data by date
    const dateMaps = symbols.map((sym) => ({
      symbol: sym,
      map: new Map(stockData[sym].map((d) => [d.date.toISOString(), d.close])),
    }));

    const allDates = [
      ...new Set(
        dateMaps.flatMap((dm) => Array.from(dm.map.keys()))
      ),
    ].sort();

    const alignedData: any[] = allDates
      .map((date) => {
        const entry: any = { date: new Date(date) };
        symbols.forEach((sym) => {
          const map = dateMaps.find((dm) => dm.symbol === sym)!;
          entry[sym] = map.map.get(date) || 0;
        });
        return entry;
      })
      .filter((d: any) => symbols.some((sym) => d[sym] > 0));

    if (alignedData.length === 0) return;

    // Normalize to percentage change from start
    const normalizedData: any[] = alignedData.map((d) => {
      const entry: any = { date: d.date };
      symbols.forEach((sym) => {
        const base = alignedData[0][sym];
        entry[sym] = base > 0 ? ((d[sym] - base) / base) * 100 : 0;
      });
      return entry;
    });

    // Create stacked data for streamgraph
    const stack = d3.stack<any>()
      .keys(symbols)
      .order(d3.stackOrderNone)
      .offset(d3.stackOffsetSilhouette);

    const stackedData = stack(normalizedData);

    // X scale
    const xScale = d3.scaleTime()
      .domain(d3.extent(normalizedData, (d) => d.date) as [Date, Date])
      .range([margin.left, width - margin.right]);

    // Y scale - for stacked data, find the overall extent
    const yExtent = [
      d3.min(stackedData, (layer) => d3.min(layer, (d) => d[0])) || 0,
      d3.max(stackedData, (layer) => d3.max(layer, (d) => d[1])) || 0,
    ];
    const yPadding = Math.abs(yExtent[1] - yExtent[0]) * 0.1 || 5;

    const yScale = d3.scaleLinear()
      .domain([yExtent[0] - yPadding, yExtent[1] + yPadding])
      .range([height - margin.bottom, margin.top]);

    // Area generator with curveBasis for smooth curves
    const area = d3.area<any>()
      .x((d) => xScale(d.data.date))
      .y0((d) => yScale(d[0]))
      .y1((d) => yScale(d[1]))
      .curve(d3.curveBasis);

    // Grid lines
    svg.append("g")
      .attr("class", "grid")
      .attr("transform", `translate(${margin.left},0)`)
      .call(
        d3.axisLeft(yScale)
          .tickSize(-(width - margin.left - margin.right))
          .tickFormat(() => "")
      )
      .selectAll("line")
      .attr("stroke", "#e5e7eb")
      .attr("stroke-dasharray", "2,2");

    svg.selectAll(".grid .domain").remove();

    // Zero line (0% reference)
    const zeroY = yScale(0);
    if (zeroY >= margin.top && zeroY <= height - margin.bottom) {
      svg
        .append("line")
        .attr("x1", margin.left)
        .attr("x2", width - margin.right)
        .attr("y1", zeroY)
        .attr("y2", zeroY)
        .attr("stroke", "palette.text")
        .attr("stroke-width", 1.5)
        .attr("stroke-dasharray", "4,4");
    }

    // X Axis
    const xTicks = period === "1d" || period === "5d" ? 4 : 6;

    svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(xScale).ticks(xTicks))
      .selectAll("text")
      .attr("fill", "palette.text");

    // Y Axis
    svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale).ticks(6).tickFormat((d) => `${d}%`))
      .selectAll("text")
      .attr("fill", "palette.text");

    // Y Axis label
    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 15)
      .attr("x", -(height / 2))
      .attr("text-anchor", "middle")
      .attr("fill", "palette.text")
      .text("Cumulative % Change");

    // Draw stream layers (stacked areas with smooth curves)
    stackedData.forEach((layer, i) => {
      svg
        .append("path")
        .datum(layer)
        .attr("fill", COLORS[i % COLORS.length])
        .attr("fill-opacity", 0.7)
        .attr("stroke", COLORS[i % COLORS.length])
        .attr("stroke-width", 1)
        .attr("d", area);
    });

    // Legend
    const legend = svg
      .append("g")
      .attr("transform", `translate(${width - margin.right + 10}, ${margin.top})`);

    symbols.forEach((symbol, i) => {
      const g = legend.append("g").attr("transform", `translate(0, ${i * 22})`);

      g.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", 12)
        .attr("height", 12)
        .attr("fill", COLORS[i % COLORS.length])
        .attr("fill-opacity", 0.7)
        .attr("stroke", COLORS[i % COLORS.length])
        .attr("stroke-width", 1);

      g.append("text")
        .attr("x", 18)
        .attr("y", 10)
        .attr("fill", "palette.text")
        .attr("font-size", "12px")
        .text(symbol);
    });

    // Tooltip
    const tooltip = d3
      .select(container)
      .append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("visibility", "hidden")
      .style("background", "white")
      .style("border", "1px solid #e5e7eb")
      .style("border-radius", "6px")
      .style("padding", "8px 12px")
      .style("font-size", "12px")
      .style("box-shadow", "0 2px 8px rgba(0,0,0,0.1)")
      .style("pointer-events", "none")
      .style("z-index", "10");

    // Hover overlay
    svg
      .append("rect")
      .attr("transform", `translate(${margin.left},${margin.top})`)
      .attr("width", width - margin.left - margin.right)
      .attr("height", height - margin.top - margin.bottom)
      .attr("fill", "transparent")
      .on("mousemove", (event) => {
        const [mx] = d3.pointer(event);
        const x0 = xScale.invert(mx + margin.left);

        const bisect = d3.bisector((d: { date: Date }) => d.date).left;
        const idx = bisect(normalizedData, x0, 1);
        const d0 = normalizedData[idx - 1];
        const d1 = normalizedData[idx];

        if (!d0 || !d1) return;

        const d =
          x0.getTime() - d0.date.getTime() >
          d1.date.getTime() - x0.getTime()
            ? d1
            : d0;

        const tooltipContent = symbols
          .map(
            (sym, i) =>
              `<div style="color: ${COLORS[i % COLORS.length]};">${sym}: ${d[sym].toFixed(2)}%</div>`
          )
          .join("");

        tooltip
          .style("visibility", "visible")
          .style("left", `${event.offsetX + 15}px`)
          .style("top", `${event.offsetY - 10}px`)
          .html(
            `<div style="font-weight: 600; margin-bottom: 4px;">${d.date.toLocaleDateString()}</div>${tooltipContent}`
          );
      })
      .on("mouseout", () => {
        tooltip.style("visibility", "hidden");
      });

    return () => {
      tooltip.remove();
    };
  }, [stockData, period, palette]);

  return (
    <div className="w-full max-w-5xl mx-auto p-6 rounded-xl shadow-lg relative" style={{ backgroundColor: palette.background, border: `1px solid ${palette.gridLines}` }}>
      <HelpPopup
        title="Streamgraph"
        whatItDoes="Shows how multiple stocks' performance changes over time. Each colored stream represents a stock, with width indicating relative performance."
        whyItMatters="Reveals how leadership changes over time - which stocks dominate different periods and how trends emerge and fade."
        whoItMattersFor="Investors tracking sector rotation and wanting to see historical performance trends."
        howToRead="Wider stream = better relative performance. Colors distinguish stocks. Overlapping streams show similar performance. Use time range buttons to change the view."
      />
      <h2 className="text-2xl font-bold mb-2" style={{ color: palette.text }}>Sector/Stock Performance</h2>

      <div className="mb-6 p-4 rounded-lg border" style={{ backgroundColor: palette.background, borderColor: palette.gridLines }}>
        <p className="text-sm" style={{ color: palette.text, opacity: 0.8 }}>
          <strong>What you're looking at:</strong> Each colored layer represents a different stock—the wider the layer, the better the stock is performing relative to others. Overlapping areas show where stocks are moving together.
        </p>
      </div>

      <div className="flex flex-wrap gap-4 mb-4">
        <div className="flex-1 min-w-[250px]">
          <label className="block text-sm font-medium mb-2" style={{ color: palette.text }}>
            Enter Ticker Symbols
          </label>
          <TickerInput
            value={tickers}
            onChange={setTickers}
            onSubmit={fetchData}
            placeholder="Type ticker and press Enter"
            defaultTickers={["AAPL", "GOOGL", "MSFT"]}
          />
        </div>
        <div className="flex items-end">
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {TIME_RANGES.map((range) => (
          <button
            key={range.value}
            onClick={() => setPeriod(range.value)}
            className="px-3 py-1.5 text-sm font-medium rounded-lg transition"
            style={{
              backgroundColor: period === range.value ? palette.primary : palette.background,
              color: period === range.value ? "#ffffff" : palette.text,
              border: `1px solid ${palette.gridLines}`,
            }}
          >
            {range.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-4 p-4 rounded-lg" style={{ backgroundColor: palette.negative + "20", border: `1px solid ${palette.negative}` }}>
          <span style={{ color: palette.negative }}>{error}</span>
        </div>
      )}

      <div ref={containerRef} className="relative w-full">
        <svg ref={svgRef} className="w-full" />
      </div>

      <p className="mt-4 text-sm palette.text">
        Streamgraph shows stacked cumulative performance of each ticker over time. Values are normalized as percentage change from the start of the period. Hover over the chart to see exact values.
      </p>
    </div>
  );
}