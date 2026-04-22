"use client";

import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { fetchHistory, StockHistory } from "@/lib/client";
import { useColorPalette } from "../context/ColorPaletteContext";

interface BenchmarkData {
  symbol: string;
  name: string;
  color: string;
  data: { date: Date; value: number }[];
}

const BENCHMARKS = [
  { symbol: "^GSPC", name: "S&P 500", color: "#3b82f6" },
  { symbol: "^RUT", name: "Russell 2000", color: "#f97316" },
  { symbol: "^AGG", name: "Bond Index (AGG)", color: "#22c55e" },
  { symbol: "^MSCI", name: "International (EAFE)", color: "#a855f7" },
];

const TIME_RANGES = [
  { label: "1M", value: "1mo" },
  { label: "3M", value: "3mo" },
  { label: "6M", value: "6mo" },
  { label: "1Y", value: "1y" },
  { label: "2Y", value: "2y" },
];

export default function BenchmarkComparison() {
  const { palette } = useColorPalette();
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [period, setPeriod] = useState("1y");
  const [benchmarkData, setBenchmarkData] = useState<BenchmarkData[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedBenchmarks, setSelectedBenchmarks] = useState<string[]>(["^GSPC", "^RUT"]);
  const [hoveredBenchmark, setHoveredBenchmark] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);

    try {
      const results = await Promise.all(
        BENCHMARKS.map(async (bm) => {
          try {
            const data = await fetchHistory(bm.symbol, period, "1d");
            if (!data || data.length === 0) return null;

            // Normalize to percentage change from first value
            const firstValue = data[0].close;
            const normalizedData = data.map((d: StockHistory) => ({
              date: d.date,
              value: ((d.close - firstValue) / firstValue) * 100,
            }));

            return { ...bm, data: normalizedData };
          } catch (err) {
            console.error(`Failed to fetch ${bm.symbol}:`, err);
            return null;
          }
        })
      );

      setBenchmarkData(results.filter((r): r is BenchmarkData => r !== null));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [period]);

  // D3 Chart Rendering
  useEffect(() => {
    if (!svgRef.current || !containerRef.current || benchmarkData.length === 0) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = 400;
    const margin = { top: 30, right: 120, bottom: 50, left: 60 };

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    svg.attr("width", width).attr("height", height);

    // Flatten all data to find extents
    const allData = benchmarkData.flatMap((bm) => bm.data);
    const dateExtent = d3.extent(allData, (d) => d.date) as [Date, Date];
    const valueExtent = d3.extent(allData, (d) => d.value) as [number, number];

    // Add padding
    const yPadding = Math.abs(valueExtent[1] - valueExtent[0]) * 0.1 || 5;

    const xScale = d3.scaleTime()
      .domain(dateExtent)
      .range([margin.left, width - margin.right]);

    const yScale = d3.scaleLinear()
      .domain([valueExtent[0] - yPadding, valueExtent[1] + yPadding])
      .range([height - margin.bottom, margin.top]);

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
      .attr("stroke", "palette.gridLines")
      .attr("stroke-dasharray", "2,2");

    svg.selectAll(".grid .domain").remove();

    // Zero line
    const zeroY = yScale(0);
    if (zeroY >= margin.top && zeroY <= height - margin.bottom) {
      svg.append("line")
        .attr("x1", margin.left)
        .attr("x2", width - margin.right)
        .attr("y1", zeroY)
        .attr("y2", zeroY)
        .attr("stroke", "palette.text")
        .attr("stroke-width", 1.5)
        .attr("stroke-dasharray", "4,4");
    }

    // X Axis
    svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(xScale).ticks(6))
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
      .text("% Change");

    // Draw benchmark lines
    benchmarkData.forEach((bm) => {
      if (!selectedBenchmarks.includes(bm.symbol)) return;

      const isHighlighted = hoveredBenchmark === null || hoveredBenchmark === bm.symbol;
      const opacity = isHighlighted ? 1 : 0.2;

      const line = d3.line<{ date: Date; value: number }>()
        .x((d) => xScale(d.date))
        .y((d) => yScale(d.value))
        .curve(d3.curveMonotoneX);

      svg.append("path")
        .datum(bm.data)
        .attr("fill", "none")
        .attr("stroke", bm.color)
        .attr("stroke-width", isHighlighted ? 2.5 : 1.5)
        .attr("opacity", opacity)
        .attr("d", line)
        .style("cursor", "pointer")
        .on("mouseenter", () => setHoveredBenchmark(bm.symbol))
        .on("mouseleave", () => setHoveredBenchmark(null));
    });

    // Legend
    const legend = svg.append("g")
      .attr("transform", `translate(${width - margin.right + 10}, ${margin.top})`);

    selectedBenchmarks.forEach((symbol, i) => {
      const bm = benchmarkData.find((b) => b.symbol === symbol);
      if (!bm) return;

      const g = legend.append("g").attr("transform", `translate(0, ${i * 22})`);

      g.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", 12)
        .attr("height", 12)
        .attr("fill", bm.color)
        .style("cursor", "pointer")
        .on("click", () => {
          setSelectedBenchmarks(selectedBenchmarks.filter((s) => s !== symbol));
        });

      g.append("text")
        .attr("x", 18)
        .attr("y", 10)
        .attr("fill", "palette.text")
        .attr("font-size", "12px")
        .text(bm.name)
        .style("cursor", "pointer")
        .on("click", () => {
          setSelectedBenchmarks(selectedBenchmarks.filter((s) => s !== symbol));
        });
    });

    // Title
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", 15)
      .attr("text-anchor", "middle")
      .attr("fill", "palette.text")
      .attr("font-size", "14px")
      .attr("font-weight", "bold")
      .text("Benchmark Comparison - Percentage Change");

  }, [benchmarkData, selectedBenchmarks, hoveredBenchmark]);

  const toggleBenchmark = (symbol: string) => {
    if (selectedBenchmarks.includes(symbol)) {
      if (selectedBenchmarks.length > 1) {
        setSelectedBenchmarks(selectedBenchmarks.filter((s) => s !== symbol));
      }
    } else {
      setSelectedBenchmarks([...selectedBenchmarks, symbol]);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-6 rounded-xl shadow-lg" style={{ backgroundColor: palette.background, border: `1px solid ${palette.gridLines}` }}>
      <h2 className="text-2xl font-bold mb-2" style={{ color: palette.text }}>Benchmark Comparison</h2>
      <p className="mb-4" style={{ color: palette.text, opacity: 0.7 }}>
        Compare portfolio performance against major market indices to understand how your investments are doing relative to the broader market.
      </p>

      {/* Disclaimer */}
      <div className="mb-4 p-3 rounded-lg border" style={{ backgroundColor: palette.accent + "15", borderColor: palette.accent + "40" }}>
        <p className="text-sm" style={{ color: palette.text }}>
          <strong>Why Compare to Benchmarks?</strong> A return looks good or bad only in context. The S&P 500 represents large US stocks, Russell 2000 represents small US stocks, and AGG represents US bonds. Use these to understand if your portfolio is performing as expected.
        </p>
      </div>

      {/* Benchmark Selector */}
      <div className="flex flex-wrap gap-2 mb-4">
        <span className="text-sm font-medium mr-2" style={{ color: palette.text }}>Show:</span>
        {BENCHMARKS.map((bm) => (
          <button
            key={bm.symbol}
            onClick={() => toggleBenchmark(bm.symbol)}
            className="px-3 py-1 text-sm font-medium rounded-full transition-colors"
            style={selectedBenchmarks.includes(bm.symbol)
              ? { backgroundColor: bm.color, color: "#fff" }
              : { backgroundColor: palette.gridLines, color: palette.text }}
          >
            {bm.name}
          </button>
        ))}
      </div>

      {/* Time Period Selector */}
      <div className="flex flex-wrap gap-2 mb-4">
        <span className="text-sm font-medium mr-2" style={{ color: palette.text }}>Period:</span>
        {TIME_RANGES.map((range) => (
          <button
            key={range.value}
            onClick={() => setPeriod(range.value)}
            className="px-3 py-1 text-sm font-medium rounded-lg transition"
            style={{
              backgroundColor: period === range.value ? palette.primary : palette.background,
              color: period === range.value ? "#fff" : palette.text,
              border: `1px solid ${palette.gridLines}`
            }}
          >
            {range.label}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div ref={containerRef} className="relative w-full">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75">
            <p className="text-gray-500">Loading benchmark data...</p>
          </div>
        )}
        <svg ref={svgRef} className="w-full" />
      </div>

      {/* Performance Summary */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold text-gray-800 mb-3">How to Interpret This Chart</h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="font-medium text-gray-700">Above the Zero Line</p>
            <p className="text-gray-600">The benchmark has gained value since the start of the period.</p>
          </div>
          <div>
            <p className="font-medium text-gray-700">Below the Zero Line</p>
            <p className="text-gray-600">The benchmark has lost value since the start of the period.</p>
          </div>
          <div>
            <p className="font-medium text-gray-700">Steep Upward Slope</p>
            <p className="text-gray-600">Strong positive performance during that period.</p>
          </div>
          <div>
            <p className="font-medium text-gray-700">Comparing Lines</p>
            <p className="text-gray-600">Higher lines performed better; lower lines performed worse.</p>
          </div>
        </div>
      </div>

      {/* Reference Information */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-xs text-blue-700">
          <strong>Benchmark Reference:</strong> S&P 500 (^GSPC) - 500 large US companies; Russell 2000 (^RUT) - 2000 small US companies; AGG (^AGG) - US investment grade bonds; MSCI EAFE (^MSCI) - International developed market stocks.
        </p>
      </div>
    </div>
  );
}