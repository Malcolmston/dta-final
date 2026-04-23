"use client";

import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { fetchHistory, StockHistory } from "@/lib/client";
import { TIME_RANGES_EXTENDED } from "@/lib/constants";
import { useColorPalette } from "@/app/context/ColorPaletteContext";
import TickerInput from "./TickerInput";

interface TreemapData {
  symbol: string;
  value: number;
  performance: number;
}

export default function Treemap() {
  const { palette, isDarkMode } = useColorPalette();
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [tickers, setTickers] = useState("AAPL,GOOGL,MSFT,AMZN,NVDA,META");
  const [period, setPeriod] = useState("1y");
  const [treemapData, setTreemapData] = useState<TreemapData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"chart" | "table">("chart");
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (treemapData.length === 0) return;

    switch (e.key) {
      case "ArrowRight":
        setSelectedIndex(Math.min(selectedIndex + 1, treemapData.length - 1));
        break;
      case "ArrowLeft":
        setSelectedIndex(Math.max(selectedIndex - 1, 0));
        break;
      case "ArrowDown":
        setSelectedIndex(Math.min(selectedIndex + 1, treemapData.length - 1));
        break;
      case "ArrowUp":
        setSelectedIndex(Math.max(selectedIndex - 1, 0));
        break;
      default:
        return;
    }
    e.preventDefault();
  };

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
      // Fetch historical data for all symbols
      const results = await Promise.all(
        symbols.map((symbol) =>
          fetchHistory(symbol, period, "1d").catch((err) => {
            console.error(`Failed to fetch ${symbol}:`, err);
            return null;
          })
        )
      );

      // Calculate performance and value for each symbol
      const data: TreemapData[] = [];
      symbols.forEach((symbol, i) => {
        const history = results[i];
        if (history && history.length > 0) {
          // Use current price as value (or calculate from volume if needed)
          const currentPrice = history[history.length - 1].close;
          const startPrice = history[0].close;

          // Calculate performance percentage
          const performance = startPrice > 0
            ? ((currentPrice - startPrice) / startPrice) * 100
            : 0;

          data.push({
            symbol,
            value: currentPrice,
            performance,
          });
        }
      });

      if (data.length === 0) {
        throw new Error("No data found for any of the specified tickers");
      }

      setTreemapData(data);
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

  // D3 treemap rendering
  useEffect(() => {
    if (!svgRef.current || !containerRef.current || treemapData.length === 0) {
      return;
    }

    const container = containerRef.current;
    const width = container.clientWidth;
    const margin = { top: 20, right: 20, bottom: 80, left: 20 };
    const legendHeight_px = 60;
    const height = 500;
    const treemapHeight = height - margin.top - margin.bottom - legendHeight_px;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    svg.attr("width", width).attr("height", height);

    // Create hierarchical data structure
    const root = d3.hierarchy({ children: treemapData } as any)
      .sum((d: any) => d.value)
      .sort((a, b) => (b.value || 0) - (a.value || 0));

    // Create treemap layout
    d3.treemap<any>()
      .size([width - margin.left - margin.right, treemapHeight])
      .paddingInner(2)
      .paddingOuter(4)
      .round(true)(root);

    // Apply margin translation to treemap group
    const treemapGroup = svg.append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Create color scale for performance (green for positive, red for negative)
    const minPerformance = d3.min(treemapData, (d) => d.performance) || -20;
    const maxPerformance = d3.max(treemapData, (d) => d.performance) || 20;
    const performanceRange = Math.max(Math.abs(minPerformance), Math.abs(maxPerformance), 5);

    // Get actual color values from palette
    const positiveColor = palette.positive || "#22c55e";
    const negativeColor = palette.negative || "#ef4444";
    const neutralColor = palette.gridLines || "#e5e7eb";

    // Color scale: red (negative) -> gray (neutral) -> green (positive)
    const colorScale = d3.scaleLinear<string>()
      .domain([-performanceRange, 0, performanceRange])
      .range([negativeColor, neutralColor, positiveColor])
      .clamp(true);

    // Create tooltip
    const tooltipBackground = isDarkMode ? "#1f2937" : "#ffffff";
    const tooltipBorder = palette.gridLines || "#e5e7eb";
    const tooltipText = palette.text || "#1f2937";

    const tooltip = d3
      .select(container)
      .append("div")
      .attr("class", "treemap-tooltip")
      .style("position", "absolute")
      .style("visibility", "hidden")
      .style("background", tooltipBackground)
      .style("border", `1px solid ${tooltipBorder}`)
      .style("border-radius", "6px")
      .style("padding", "8px 12px")
      .style("font-size", "12px")
      .style("color", tooltipText)
      .style("box-shadow", "0 2px 8px rgba(0,0,0,0.15)")
      .style("pointer-events", "none")
      .style("z-index", "10");

    // Draw treemap rectangles
    const leaves = root.leaves();

    const cells = treemapGroup
      .selectAll("g")
      .data(leaves)
      .join("g")
      .attr("transform", (d: any) => `translate(${d.x0},${d.y0})`);

    // Add rectangles
    cells
      .append("rect")
      .attr("width", (d: any) => Math.max(0, d.x1 - d.x0))
      .attr("height", (d: any) => Math.max(0, d.y1 - d.y0))
      .attr("fill", (d: any) => colorScale(d.data.performance))
      .attr("rx", 4)
      .attr("ry", 4)
      .attr("stroke", "#fff")
      .attr("stroke-width", 1)
      .style("cursor", "pointer")
      .on("mouseover", (event, d: any) => {
        const data = d.data;
        const performanceColor = data.performance >= 0 ? "#22c55e" : "#ef4444";
        const performanceSign = data.performance >= 0 ? "+" : "";

        tooltip
          .style("visibility", "visible")
          .html(
            `<div style="font-weight: 600; margin-bottom: 4px;">${data.symbol}</div>
             <div>Price: $${data.value.toFixed(2)}</div>
             <div style="color: ${performanceColor};">Performance: ${performanceSign}${data.performance.toFixed(2)}%</div>`
          );
      })
      .on("mousemove", (event) => {
        tooltip
          .style("left", `${event.offsetX + 15}px`)
          .style("top", `${event.offsetY - 10}px`);
      })
      .on("mouseout", () => {
        tooltip.style("visibility", "hidden");
      });

    // Add labels
    cells
      .append("text")
      .attr("x", 6)
      .attr("y", 18)
      .attr("fill", "#1f2937")
      .attr("font-size", "14px")
      .attr("font-weight", "600")
      .text((d: any) => {
        const width = d.x1 - d.x0;
        return width > 50 ? d.data.symbol : "";
      });

    cells
      .append("text")
      .attr("x", 6)
      .attr("y", 34)
      .attr("fill", "#4b5563")
      .attr("font-size", "11px")
      .text((d: any) => {
        const width = d.x1 - d.x0;
        const height = d.y1 - d.y0;
        if (width > 60 && height > 45) {
          const perf = d.data.performance;
          const sign = perf >= 0 ? "+" : "";
          return `${sign}${perf.toFixed(1)}%`;
        }
        return "";
      });

    // Add legend - positioned below the treemap
    const legendWidth = 150;
    const legendBoxHeight = 12;
    const legendX = (width - legendWidth) / 2; // Center the legend
    const legendY = margin.top + treemapHeight + 30;

    const legendGroup = svg
      .append("g")
      .attr("transform", `translate(${legendX}, ${legendY})`);

    // Gradient definition
    const gradient = svg
      .append("defs")
      .append("linearGradient")
      .attr("id", "treemap-gradient")
      .attr("x1", "0%")
      .attr("x2", "100%");

    gradient
      .append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#ef4444");

    gradient
      .append("stop")
      .attr("offset", "50%")
      .attr("stop-color", neutralColor);

    gradient
      .append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#22c55e");

    // Draw legend background
    legendGroup
      .append("rect")
      .attr("width", legendWidth)
      .attr("height", legendBoxHeight)
      .attr("rx", 3)
      .attr("fill", "url(#treemap-gradient)");

    // Get text color from palette
    const textColor = palette.text || "#1f2937";

    // Legend labels
    legendGroup
      .append("text")
      .attr("x", 0)
      .attr("y", legendBoxHeight + 12)
      .attr("font-size", "10px")
      .attr("fill", textColor)
      .text(`-${performanceRange.toFixed(0)}%`);

    legendGroup
      .append("text")
      .attr("x", legendWidth / 2)
      .attr("y", legendBoxHeight + 12)
      .attr("text-anchor", "middle")
      .attr("font-size", "10px")
      .attr("fill", textColor)
      .text("0%");

    legendGroup
      .append("text")
      .attr("x", legendWidth)
      .attr("y", legendBoxHeight + 12)
      .attr("text-anchor", "end")
      .attr("font-size", "10px")
      .attr("fill", textColor)
      .text(`+${performanceRange.toFixed(0)}%`);

    // Legend title
    legendGroup
      .append("text")
      .attr("x", legendWidth / 2)
      .attr("y", -6)
      .attr("text-anchor", "middle")
      .attr("font-size", "11px")
      .attr("font-weight", "500")
      .attr("fill", textColor)
      .text("Performance");

    return () => {
      tooltip.remove();
    };
  }, [treemapData]);

  return (
    <div className="w-full max-w-5xl mx-auto p-6 rounded-xl shadow-lg" style={{ backgroundColor: palette.background, border: `1px solid ${palette.gridLines}` }}>
      <h2 className="text-2xl font-bold mb-6" style={{ color: palette.text }}>Portfolio Allocation Treemap</h2>

      <div className="mb-6 p-4 rounded-lg border" style={{ backgroundColor: palette.background, borderColor: palette.gridLines }}>
        <p className="text-sm" style={{ color: palette.text, opacity: 0.8 }}>
          <strong>How to read this treemap:</strong> Rectangle size represents the stock price (larger = more valuable).
          Color indicates performance — <span style={{ color: palette.positive, fontWeight: 500 }}>green</span> = positive returns,
          <span style={{ color: palette.negative, fontWeight: 500, marginLeft: 8 }}>red</span> = negative returns. Hover over any rectangle for detailed information.
        </p>
      </div>

      <div className="flex flex-wrap gap-4 mb-4">
        <div className="flex-1 min-w-[250px]">
          <label className="block text-sm font-medium text-gray-800 mb-2">
            Enter Ticker Symbols
          </label>
          <TickerInput
            value={tickers}
            onChange={setTickers}
            onSubmit={fetchData}
            placeholder="Type ticker and press Enter"
            defaultTickers={["AAPL", "GOOGL", "MSFT", "AMZN", "NVDA", "META"]}
          />
        </div>
        <div className="flex items-end">
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {TIME_RANGES_EXTENDED.map((range) => (
          <button
            key={range.value}
            onClick={() => {
              setPeriod(range.value);
              // Fetch new data after period change
              setTimeout(fetchData, 0);
            }}
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

      {/* View Toggle */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setViewMode("chart")}
          className="px-3 py-1.5 text-sm font-medium rounded-lg transition"
          style={{
            backgroundColor: viewMode === "chart" ? palette.primary : palette.background,
            color: viewMode === "chart" ? "#ffffff" : palette.text,
            border: `1px solid ${palette.gridLines}`,
          }}
        >
          Chart View
        </button>
        <button
          onClick={() => setViewMode("table")}
          className="px-3 py-1.5 text-sm font-medium rounded-lg transition"
          style={{
            backgroundColor: viewMode === "table" ? palette.primary : palette.background,
            color: viewMode === "table" ? "#ffffff" : palette.text,
            border: `1px solid ${palette.gridLines}`,
          }}
        >
          Table View
        </button>
      </div>

      <p className="text-xs text-gray-500 mb-2">
        Use arrow keys to navigate between stocks.
      </p>

      {viewMode === "chart" ? (
        <div ref={containerRef} tabIndex={0} onKeyDown={handleKeyDown} className="relative w-full outline-none">
          <svg ref={svgRef} className="w-full" role="img" aria-label="Portfolio allocation treemap" />
        </div>
      ) : (
        <div className="overflow-x-auto" tabIndex={0} onKeyDown={handleKeyDown}>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr>
                <th className="p-2 text-left font-medium text-gray-600 border-b">Symbol</th>
                <th className="p-2 text-right font-medium text-gray-600 border-b">Price</th>
                <th className="p-2 text-right font-medium text-gray-600 border-b">Performance</th>
              </tr>
            </thead>
            <tbody>
              {treemapData.map((item, idx) => (
                <tr
                  key={item.symbol}
                  className={idx === selectedIndex ? "bg-blue-50" : ""}
                  tabIndex={0}
                  onClick={() => setSelectedIndex(idx)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") setSelectedIndex(idx);
                  }}
                >
                  <td className={`p-2 font-medium border-b ${idx === selectedIndex ? "ring-2 ring-blue-500" : ""}`}>
                    {item.symbol}
                  </td>
                  <td className="p-2 text-right border-b">${item.value.toFixed(2)}</td>
                  <td className={`p-2 text-right border-b ${item.performance >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {item.performance >= 0 ? "+" : ""}{item.performance.toFixed(2)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}