"use client";

import { useEffect, useRef, useState } from "react";
import { useColorPalette } from "../context/ColorPaletteContext";
import * as d3 from "d3";
import { fetchHistory, StockHistory } from "@/lib/client";
import { TIME_RANGES_EXTENDED } from "@/lib/constants";
import TickerInput from "./TickerInput";
import HelpPopup from "./HelpPopup";

interface PerformanceData {
  ticker: string;
  period: string;
  performance: number; // percentage change
}

// Calculate percentage change from start to end of data
function calculatePerformance(stockData: StockHistory[]): number {
  if (!stockData || stockData.length < 2) return 0;

  const startPrice = stockData[0].close;
  const endPrice = stockData[stockData.length - 1].close;

  if (startPrice === 0) return 0;

  return ((endPrice - startPrice) / startPrice) * 100;
}

export default function Heatmap() {
  const { palette } = useColorPalette();
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [tickers, setTickers] = useState("AAPL,GOOGL,MSFT,AMZN,NVDA");
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"chart" | "table">("chart");
  const [selectedCell, setSelectedCell] = useState<{ticker: string; period: string} | null>(null);

  // Extract unique tickers and periods for keyboard navigation
  const tickerList = [...new Set(performanceData.map((d) => d.ticker))];
  const periodList = [...new Set(performanceData.map((d) => d.period))];

  // Keyboard navigation handler
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (performanceData.length === 0) return;

    const currentTickerIdx = selectedCell ? tickerList.indexOf(selectedCell.ticker) : 0;
    const currentPeriodIdx = selectedCell ? periodList.indexOf(selectedCell.period) : 0;

    let newTickerIdx = currentTickerIdx;
    let newPeriodIdx = currentPeriodIdx;

    switch (e.key) {
      case "ArrowRight":
        newTickerIdx = Math.min(currentTickerIdx + 1, tickerList.length - 1);
        break;
      case "ArrowLeft":
        newTickerIdx = Math.max(currentTickerIdx - 1, 0);
        break;
      case "ArrowDown":
        newPeriodIdx = Math.min(currentPeriodIdx + 1, periodList.length - 1);
        break;
      case "ArrowUp":
        newPeriodIdx = Math.max(currentPeriodIdx - 1, 0);
        break;
      default:
        return;
    }

    e.preventDefault();
    setSelectedCell({
      ticker: tickerList[newTickerIdx],
      period: periodList[newPeriodIdx]
    });
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
      const results: PerformanceData[] = [];

      // Fetch data for each ticker and each time period
      for (const symbol of symbols) {
        for (const period of TIME_RANGES_EXTENDED) {
          try {
            const history = await fetchHistory(symbol, period.value, "1d");
            const performance = calculatePerformance(history);

            results.push({
              ticker: symbol,
              period: period.label,
              performance,
            });
          } catch (err) {
            console.error(`Failed to fetch ${symbol} for ${period.label}:`, err);
            // Add entry with 0 performance for failed fetches
            results.push({
              ticker: symbol,
              period: period.label,
              performance: 0,
            });
          }
        }
      }

      if (results.length === 0) {
        throw new Error("No data found for any of the specified tickers");
      }

      setPerformanceData(results);
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

  // D3 heatmap rendering
  useEffect(() => {
    if (!svgRef.current || !containerRef.current || performanceData.length === 0) {
      return;
    }

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = 400;
    const margin = { top: 80, right: 30, bottom: 60, left: 70 };

    // Legend dimensions - placed below the chart
    const legendWidth = 200;
    const legendHeight = 14;
    const legendMarginBottom = 30;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    svg.attr("width", width).attr("height", height);

    // Get unique tickers and periods
    const tickers = [...new Set(performanceData.map((d) => d.ticker))];
    const periods = [...new Set(performanceData.map((d) => d.period))];

    // Create scales
    const xScale = d3
      .scaleBand()
      .domain(tickers)
      .range([margin.left + 10, width - margin.right])
      .padding(0.05);

    const yScale = d3
      .scaleBand()
      .domain(periods)
      .range([margin.top, height - margin.bottom - legendMarginBottom])
      .padding(0.05);

    // Calculate color scale - green for positive, red for negative
    const maxAbsValue = d3.max(performanceData, (d) => Math.abs(d.performance)) || 10;
    const colorScale = d3
      .scaleLinear<string>()
      .domain([-maxAbsValue, 0, maxAbsValue])
      .range(["#ef4444", "#f3f4f6", "#22c55e"]);

    // Draw heatmap cells
    performanceData.forEach((d) => {
      const x = xScale(d.ticker);
      const y = yScale(d.period);

      if (x === undefined || y === undefined) return;

      svg
        .append("rect")
        .attr("x", x)
        .attr("y", y)
        .attr("width", xScale.bandwidth())
        .attr("height", yScale.bandwidth())
        .attr("fill", colorScale(d.performance))
        .attr("rx", 4)
        .attr("ry", 4)
        .style("cursor", "pointer")
        .on("mouseover", function (event) {
          d3.select(this)
            .attr("stroke", "palette.text")
            .attr("stroke-width", 2);
        })
        .on("mouseout", function () {
          d3.select(this)
            .attr("stroke", "none");
        });

      // Add percentage text
      svg
        .append("text")
        .attr("x", x + xScale.bandwidth() / 2)
        .attr("y", y + yScale.bandwidth() / 2)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("fill", Math.abs(d.performance) > maxAbsValue * 0.5 ? "white" : "palette.text")
        .attr("font-size", "11px")
        .attr("font-weight", "600")
        .text(`${d.performance >= 0 ? "+" : ""}${d.performance.toFixed(1)}%`);
    });

    // X Axis (tickers)
    svg
      .append("g")
      .attr("transform", `translate(0,${margin.top - 10})`)
      .call(d3.axisTop(xScale).tickSize(0))
      .select(".domain")
      .remove();

    svg
      .selectAll(".tick text")
      .attr("fill", "palette.text")
      .attr("font-size", "12px")
      .attr("font-weight", "600");

    // Y Axis (periods)
    svg
      .append("g")
      .attr("transform", `translate(${margin.left - 10},0)`)
      .call(d3.axisLeft(yScale).tickSize(0))
      .select(".domain")
      .remove();

    svg
      .selectAll(".tick text")
      .attr("fill", "#6b7280")
      .attr("font-size", "11px");

    // Legend - placed below the chart with proper margin
    const legendX = width / 2 - legendWidth / 2;
    const legendY = height - legendMarginBottom + 20;

    // Gradient definition
    const defs = svg.append("defs");
    const gradient = defs
      .append("linearGradient")
      .attr("id", "heatmap-gradient")
      .attr("x1", "0%")
      .attr("x2", "100%");

    gradient.append("stop").attr("offset", "0%").attr("stop-color", "#ef4444");
    gradient.append("stop").attr("offset", "50%").attr("stop-color", "#f3f4f6");
    gradient.append("stop").attr("offset", "100%").attr("stop-color", "#22c55e");

    // Legend background
    svg
      .append("rect")
      .attr("x", legendX)
      .attr("y", legendY)
      .attr("width", legendWidth)
      .attr("height", legendHeight)
      .attr("rx", 3)
      .attr("fill", "url(#heatmap-gradient)");

    // Legend labels
    svg
      .append("text")
      .attr("x", legendX)
      .attr("y", legendY + legendHeight + 12)
      .attr("fill", "#6b7280")
      .attr("font-size", "10px")
      .text(`-${maxAbsValue.toFixed(0)}%`);

    svg
      .append("text")
      .attr("x", legendX + legendWidth / 2)
      .attr("y", legendY + legendHeight + 12)
      .attr("text-anchor", "middle")
      .attr("fill", "#6b7280")
      .attr("font-size", "10px")
      .text("0%");

    svg
      .append("text")
      .attr("x", legendX + legendWidth)
      .attr("y", legendY + legendHeight + 12)
      .attr("text-anchor", "end")
      .attr("fill", "#6b7280")
      .attr("font-size", "10px")
      .text(`+${maxAbsValue.toFixed(0)}%`);

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

    // Add hover interactions to cells
    performanceData.forEach((d) => {
      const x = xScale(d.ticker);
      const y = yScale(d.period);

      if (x === undefined || y === undefined) return;

      svg
        .append("rect")
        .attr("x", x)
        .attr("y", y)
        .attr("width", xScale.bandwidth())
        .attr("height", yScale.bandwidth())
        .attr("fill", "transparent")
        .style("cursor", "pointer")
        .on("mouseover", (event) => {
          tooltip
            .style("visibility", "visible")
            .html(
              `<div style="font-weight: 600;">${d.ticker}</div>
               <div style="color: #6b7280;">${d.period}</div>
               <div style="color: ${d.performance >= 0 ? "#22c55e" : "#ef4444"}; font-weight: 600;">
                 ${d.performance >= 0 ? "+" : ""}${d.performance.toFixed(2)}%
               </div>`
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
    });

    return () => {
      tooltip.remove();
    };
  }, [performanceData, palette]);

  return (
    <div className="w-full max-w-5xl mx-auto p-6 rounded-xl shadow-lg relative" style={{ backgroundColor: palette.background, border: `1px solid ${palette.gridLines}` }}>
      <HelpPopup
        title="Sector Heatmap"
        whatItDoes="Displays performance of different stocks or sectors across multiple time periods. Each cell shows the percentage change in price, with color intensity indicating the magnitude."
        whyItMatters="Allows quick visual comparison of many securities at once, identifying top performers and underperformers. Helps spot sector rotation patterns and market trends."
        whoItMattersFor="Investors looking to diversify, traders scanning for opportunities, and analysts identifying sector trends."
        howToRead="Green = positive returns, Red = negative returns. Darker colors mean stronger performance. Read rows horizontally to compare timeframes, vertically to compare stocks."
      />
      <h2 className="text-2xl font-bold mb-6" style={{ color: palette.text }}>Stock Performance Heatmap</h2>

      <div className="mb-6 p-4 rounded-lg border" style={{ backgroundColor: palette.background, borderColor: palette.gridLines }}>
        <p className="text-sm" style={{ color: palette.text }}>
          <strong>How to read this heatmap:</strong> <span style={{ color: palette.positive }}>Green</span> cells show positive performance (gains), while <span style={{ color: palette.negative }}>red</span> cells show negative performance (losses). Rows represent different time periods (1W, 1M, 3M, etc.) and columns represent stock tickers. The <strong>intensity</strong> of the color indicates how strong the performance was — darker shades mean larger gains or losses.
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
            defaultTickers={["AAPL", "GOOGL", "MSFT", "AMZN", "NVDA"]}
          />
        </div>
        <div className="flex items-end">
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* View Toggle */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setViewMode("chart")}
          className={`px-3 py-1.5 text-sm font-medium rounded-lg transition focus:ring-2 focus:ring-blue-500 focus:outline-none ${
            viewMode === "chart" ? "bg-blue-600 text-white" : "bg-transparent palette.text hover:bg-gray-200"
          }`}
        >
          Chart View
        </button>
        <button
          onClick={() => setViewMode("table")}
          className={`px-3 py-1.5 text-sm font-medium rounded-lg transition focus:ring-2 focus:ring-blue-500 focus:outline-none ${
            viewMode === "table" ? "bg-blue-600 text-white" : "bg-transparent palette.text hover:bg-gray-200"
          }`}
        >
          Table View
        </button>
      </div>

      <p className="text-xs palette.text mb-2">
        Use arrow keys to navigate. Press Enter to select.
      </p>

      {viewMode === "chart" ? (
        <div ref={containerRef} tabIndex={0} onKeyDown={handleKeyDown} className="relative w-full outline-none">
          <svg ref={svgRef} className="w-full" style={{ minHeight: "400px" }} role="img" aria-label="Stock performance heatmap" />
        </div>
      ) : (
        <div className="overflow-x-auto" tabIndex={0} onKeyDown={handleKeyDown}>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr>
                <th className="p-2 text-left font-medium palette.text border-b">Ticker</th>
                {periodList.map(period => (
                  <th key={period} className="p-2 text-center font-medium palette.text border-b">{period}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tickerList.map(ticker => (
                <tr key={ticker}>
                  <td className="p-2 font-medium palette.text border-b">{ticker}</td>
                  {periodList.map(period => {
                    const data = performanceData.find(d => d.ticker === ticker && d.period === period);
                    const isPositive = data && data.performance >= 0;
                    const isSelected = selectedCell?.ticker === ticker && selectedCell?.period === period;
                    return (
                      <td
                        key={period}
                        className={`p-2 text-center border-b ${
                          isSelected ? "ring-2 ring-blue-500" : ""
                        } ${isPositive ? "text-green-600" : "text-red-600"}`}
                        tabIndex={0}
                        onClick={() => setSelectedCell({ ticker, period })}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            setSelectedCell({ ticker, period });
                          }
                        }}
                      >
                        {data ? `${data.performance >= 0 ? "+" : ""}${data.performance.toFixed(1)}%` : "-"}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-4 text-sm palette.text">
        Heatmap shows percentage change for each ticker across different time periods. Green indicates positive performance, red indicates negative performance.
      </p>
    </div>
  );
}