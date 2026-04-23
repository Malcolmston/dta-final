"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import * as d3 from "d3";
import { fetchHistory, StockHistory } from "@/lib/client";
import { TIME_RANGES_SHORT } from "@/lib/constants";
import { useColorPalette } from "@/app/context/ColorPaletteContext";
import TickerInput from "./TickerInput";

// Chart constants
const PRICE_AREA_HEIGHT_RATIO = 0.7;
const PADDING_RATIO = 0.1;

const SMA_COLOR = "#8b5cf6";

interface CandlestickChartProps {
  ticker?: string;
  period?: string;
}

export default function CandlestickChart({ ticker: initialTicker = "AAPL" }: CandlestickChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const { palette } = useColorPalette();

  const [ticker, setTicker] = useState(initialTicker);
  const [period, setPeriod] = useState("1y");
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
        throw new Error("No data found for the specified ticker");
      }
      setStockData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch stock data");
      setStockData([]);
    } finally {
      setLoading(false);
    }
  }, [ticker, period]);

  // Initial load
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Calculate 20-day SMA
  const calculateSMA = (data: StockHistory[], period: number): { date: Date; value: number }[] => {
    if (data.length < period) return [];

    const smaData: { date: Date; value: number }[] = [];

    for (let i = period - 1; i < data.length; i++) {
      const sum = data.slice(i - period + 1, i + 1).reduce((acc, d) => acc + d.close, 0);
      smaData.push({
        date: data[i].date,
        value: sum / period,
      });
    }

    return smaData;
  };

  // D3 chart rendering
  useEffect(() => {
    if (!svgRef.current || !containerRef.current || stockData.length === 0) {
      return;
    }

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = 500;
    const margin = { top: 20, right: 60, bottom: 50, left: 60 };

    // Clear previous chart
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    svg.attr("width", width).attr("height", height);

    // Price area and volume area
    const priceHeight = height * PRICE_AREA_HEIGHT_RATIO;
    const volumeHeight = height * 0.3;
    const volumeTop = priceHeight;

    // Calculate price domain with padding
    const lows = stockData.map(d => d.low);
    const highs = stockData.map(d => d.high);
    const priceMin = Math.min(...lows);
    const priceMax = Math.max(...highs);
    const pricePadding = (priceMax - priceMin) * PADDING_RATIO || 1;

    const xScale = d3.scaleTime()
      .domain(d3.extent(stockData, (d) => d.date) as [Date, Date])
      .range([margin.left, width - margin.right]);

    const yScale = d3.scaleLinear()
      .domain([priceMin - pricePadding, priceMax + pricePadding])
      .range([priceHeight - margin.bottom, margin.top]);

    // Volume scale
    const volumeScale = d3.scaleLinear()
      .domain([0, d3.max(stockData, (d) => d.volume) || 0])
      .range([height - margin.bottom, volumeTop + margin.bottom]);

    // Create clip path for zoom
    svg.append("defs")
      .append("clipPath")
      .attr("id", "chart-clip")
      .append("rect")
      .attr("x", margin.left)
      .attr("y", margin.top)
      .attr("width", width - margin.left - margin.right)
      .attr("height", priceHeight - margin.top - margin.bottom);

    // Chart group for zoom/pan
    const chartGroup = svg.append("g").attr("class", "chart-group");

    // Draw volume bars
    const volumeGroup = chartGroup.append("g").attr("class", "volume-bars");

    stockData.forEach((d) => {
      const x = xScale(d.date);
      const barWidth = Math.max(1, (width - margin.left - margin.right) / stockData.length * 0.8);

      volumeGroup.append("rect")
        .attr("x", x - barWidth / 2)
        .attr("y", volumeScale(d.volume))
        .attr("width", barWidth)
        .attr("height", height - margin.bottom - volumeScale(d.volume))
        .attr("fill", d.close >= d.open ? "rgba(34, 197, 94, 0.3)" : "rgba(239, 68, 68, 0.3)");
    });

    // Candlestick group (clipped)
    const candleGroup = chartGroup.append("g")
      .attr("clip-path", "url(#chart-clip)");

    // Draw candlesticks
    stockData.forEach((d) => {
      const x = xScale(d.date);
      const candleWidth = Math.max(2, (width - margin.left - margin.right) / stockData.length * 0.7);
      const isBullish = d.close >= d.open;

      const candleColor = isBullish ? palette.positive : palette.negative;

      // Wick (high to low)
      candleGroup.append("line")
        .attr("x1", x)
        .attr("x2", x)
        .attr("y1", yScale(d.high))
        .attr("y2", yScale(d.low))
        .attr("stroke", candleColor)
        .attr("stroke-width", 1);

      // Body (open to close)
      const bodyTop = yScale(Math.max(d.open, d.close));
      const bodyBottom = yScale(Math.min(d.open, d.close));
      const bodyHeight = Math.max(1, bodyBottom - bodyTop);

      candleGroup.append("rect")
        .attr("x", x - candleWidth / 2)
        .attr("y", bodyTop)
        .attr("width", candleWidth)
        .attr("height", bodyHeight)
        .attr("fill", candleColor)
        .attr("stroke", candleColor)
        .attr("stroke-width", 1);
    });

    // Calculate and draw SMA
    const smaData = calculateSMA(stockData, 20);

    if (smaData.length > 0) {
      const smaLine = d3.line<{ date: Date; value: number }>()
        .x((d) => xScale(d.date))
        .y((d) => yScale(d.value))
        .curve(d3.curveMonotoneX);

      candleGroup.append("path")
        .datum(smaData)
        .attr("fill", "none")
        .attr("stroke", SMA_COLOR)
        .attr("stroke-width", 2)
        .attr("d", smaLine as any);
    }

    // Grid lines
    const gridGroup = svg.append("g").attr("class", "grid");

    gridGroup.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(
        d3.axisLeft(yScale)
          .tickSize(-(width - margin.left - margin.right))
          .tickFormat(() => "")
      )
      .selectAll("line")
      .attr("stroke", "palette.gridLines")
      .attr("stroke-dasharray", "2,2");

    gridGroup.selectAll(".grid .domain").remove();

    // X Axis
    const xTicks = period === "1mo" || period === "3mo" ? 6 : 8;

    svg.append("g")
      .attr("transform", `translate(0,${priceHeight - margin.bottom})`)
      .call(d3.axisBottom(xScale).ticks(xTicks))
      .selectAll("text")
      .attr("fill", palette.text);

    // Y Axis (price)
    svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale).ticks(8).tickFormat((d) => `$${d}`))
      .selectAll("text")
      .attr("fill", palette.text);

    // Y Axis label for price
    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 15)
      .attr("x", -(priceHeight / 2))
      .attr("text-anchor", "middle")
      .attr("fill", "#6b7280")
      .attr("font-size", "12px")
      .text("Price ($)");

    // Volume Y axis
    svg.append("g")
      .attr("transform", `translate(${width - margin.right},0)`)
      .call(d3.axisRight(volumeScale).ticks(3).tickFormat((d) => `${(+d / 1000000).toFixed(0)}M`))
      .selectAll("text")
      .attr("fill", "#6b7280")
      .attr("font-size", "10px");

    // Legend
    const legend = svg.append("g")
      .attr("transform", `translate(${margin.left + 10}, ${margin.top})`);

    // Bullish legend
    const legendBullish = legend.append("g").attr("transform", "translate(0, 0)");
    legendBullish.append("rect")
      .attr("width", 12)
      .attr("height", 12)
      .attr("fill", palette.positive);
    legendBullish.append("text")
      .attr("x", 16)
      .attr("y", 10)
      .attr("fill", "palette.text")
      .attr("font-size", "11px")
      .text("Bullish (Close > Open)");

    // Bearish legend
    const legendBearish = legend.append("g").attr("transform", "translate(150, 0)");
    legendBearish.append("rect")
      .attr("width", 12)
      .attr("height", 12)
      .attr("fill", palette.negative);
    legendBearish.append("text")
      .attr("x", 16)
      .attr("y", 10)
      .attr("fill", "palette.text")
      .attr("font-size", "11px")
      .text("Bearish (Close < Open)");

    // SMA legend
    const legendSMA = legend.append("g").attr("transform", "translate(300, 0)");
    legendSMA.append("line")
      .attr("x1", 0)
      .attr("x2", 12)
      .attr("y1", 6)
      .attr("y2", 6)
      .attr("stroke", SMA_COLOR)
      .attr("stroke-width", 2);
    legendSMA.append("text")
      .attr("x", 16)
      .attr("y", 10)
      .attr("fill", "palette.text")
      .attr("font-size", "11px")
      .text("20-day SMA");

    // Tooltip
    const tooltip = d3
      .select(container)
      .append("div")
      .attr("class", "candlestick-tooltip")
      .style("position", "absolute")
      .style("visibility", "hidden")
      .style("background", "white")
      .style("border", "1px solid palette.gridLines")
      .style("border-radius", "6px")
      .style("padding", "10px 14px")
      .style("font-size", "12px")
      .style("box-shadow", "0 2px 8px rgba(0,0,0,0.15)")
      .style("pointer-events", "none")
      .style("z-index", "10");

    // Hover overlay
    svg.append("rect")
      .attr("class", "hover-overlay")
      .attr("transform", `translate(${margin.left},${margin.top})`)
      .attr("width", width - margin.left - margin.right)
      .attr("height", priceHeight - margin.top - margin.bottom)
      .attr("fill", "transparent")
      .style("cursor", "crosshair");

    d3.select(".hover-overlay")
      .on("mousemove", (event) => {
        const [mx, my] = d3.pointer(event);
        const x0 = xScale.invert(mx + margin.left);

        const bisect = d3.bisector((d: StockHistory) => d.date).left;
        const idx = bisect(stockData, x0, 1);
        const d0 = stockData[idx - 1];
        const d1 = stockData[idx];

        if (!d0 || !d1) return;

        const d =
          x0.getTime() - d0.date.getTime() >
          d1.date.getTime() - x0.getTime()
            ? d1
            : d0;

        const isBullish = d.close >= d.open;
        const change = d.close - d.open;
        const changePercent = ((change / d.open) * 100).toFixed(2);

        tooltip
          .style("visibility", "visible")
          .style("left", `${Math.min(event.offsetX + 15, width - 180)}px`)
          .style("top", `${Math.max(event.offsetY - 10, 10)}px`)
          .html(`
            <div style="font-weight: 600; margin-bottom: 6px; border-bottom: 1px solid palette.gridLines; padding-bottom: 6px;">
              ${d.date.toLocaleDateString()}
            </div>
            <div style="display: grid; grid-template-columns: auto auto; gap: 4px 12px;">
              <span style="color: #6b7280;">Open:</span>
              <span style="font-weight: 500;">$${d.open.toFixed(2)}</span>
              <span style="color: #6b7280;">High:</span>
              <span style="font-weight: 500;">$${d.high.toFixed(2)}</span>
              <span style="color: #6b7280;">Low:</span>
              <span style="font-weight: 500;">$${d.low.toFixed(2)}</span>
              <span style="color: #6b7280;">Close:</span>
              <span style="font-weight: 500; color: ${isBullish ? palette.positive : palette.negative};">$${d.close.toFixed(2)}</span>
            </div>
            <div style="margin-top: 6px; padding-top: 6px; border-top: 1px solid palette.gridLines; font-size: 11px;">
              <span style="color: ${isBullish ? palette.positive : palette.negative};">
                ${isBullish ? "+" : ""}${change.toFixed(2)} (${isBullish ? "+" : ""}${changePercent}%)
              </span>
            </div>
            <div style="margin-top: 4px; font-size: 11px; color: #6b7280;">
              Volume: ${(d.volume / 1000000).toFixed(2)}M
            </div>
          `);
      })
      .on("mouseout", () => {
        tooltip.style("visibility", "hidden");
      });

    // Zoom and pan
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 10])
      .translateExtent([[margin.left, margin.top], [width - margin.right, priceHeight - margin.bottom]])
      .extent([[margin.left, margin.top], [width - margin.right, priceHeight - margin.bottom]])
      .on("zoom", (event) => {
        const newXScale = event.transform.rescaleX(xScale);

        // Redraw candlesticks
        candleGroup.selectAll("*").remove();

        stockData.forEach((d) => {
          const x = newXScale(d.date);
          const candleWidth = Math.max(2, (width - margin.left - margin.right) / stockData.length * 0.7 * event.transform.k);
          const isBullish = d.close >= d.open;
          const candleColor = isBullish ? palette.positive : palette.negative;

          // Wick
          candleGroup.append("line")
            .attr("x1", x)
            .attr("x2", x)
            .attr("y1", yScale(d.high))
            .attr("y2", yScale(d.low))
            .attr("stroke", candleColor)
            .attr("stroke-width", 1);

          // Body
          const bodyTop = yScale(Math.max(d.open, d.close));
          const bodyBottom = yScale(Math.min(d.open, d.close));
          const bodyHeight = Math.max(1, bodyBottom - bodyTop);

          candleGroup.append("rect")
            .attr("x", x - candleWidth / 2)
            .attr("y", bodyTop)
            .attr("width", candleWidth)
            .attr("height", bodyHeight)
            .attr("fill", candleColor)
            .attr("stroke", candleColor)
            .attr("stroke-width", 1);
        });

        // Redraw SMA
        if (smaData.length > 0) {
          const smaLine = d3.line<{ date: Date; value: number }>()
            .x((d) => newXScale(d.date))
            .y((d) => yScale(d.value))
            .curve(d3.curveMonotoneX);

          candleGroup.append("path")
            .datum(smaData)
            .attr("fill", "none")
            .attr("stroke", SMA_COLOR)
            .attr("stroke-width", 2)
            .attr("d", smaLine as any);
        }

        // Redraw X axis
        svg.select<SVGGElement>("g:nth-child(5)").call(
          d3.axisBottom(newXScale).ticks(xTicks) as any
        );
      });

    svg.call(zoom);
    zoomRef.current = zoom;

    return () => {
      tooltip.remove();
    };
  }, [stockData, period]);

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      if (stockData.length > 0) {
        fetchData();
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [stockData.length, fetchData]);

  return (
    <div className="w-full max-w-6xl mx-auto p-6 rounded-xl shadow-lg" style={{ backgroundColor: palette.background, border: `1px solid ${palette.gridLines}` }}>
      <h2 className="text-2xl font-bold mb-6" style={{ color: palette.text }}>
        Candlestick Chart - {ticker.toUpperCase()}
      </h2>

      <div className="mb-6 p-4 rounded-lg border" style={{ backgroundColor: palette.background, borderColor: palette.gridLines }}>
        <p className="text-sm" style={{ color: palette.text, opacity: 0.8 }}>
          <strong>How to read this chart:</strong> A <span style={{ color: palette.positive, fontWeight: 500 }}>green candle</span> means the price went up (bullish), while a <span style={{ color: palette.negative, fontWeight: 500 }}>red candle</span> means the price went down (bearish). The thin line (wick) extending above and below each candle shows the high and low range for that period.
        </p>
      </div>

      <div className="flex flex-wrap gap-4 mb-4">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium mb-2" style={{ color: palette.text }}>
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
        <div className="flex items-end">
          <button
            onClick={fetchData}
            disabled={loading}
            className="px-6 py-2 font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: loading ? palette.gridLines : palette.primary,
              color: "#ffffff",
            }}
          >
            {loading ? "Loading..." : "Load Chart"}
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {TIME_RANGES_SHORT.map((range) => (
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
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      <div ref={containerRef} className="relative w-full overflow-hidden">
        <svg
          ref={svgRef}
          className="w-full block"
          style={{ height: "500px", display: "block" }}
          role="img"
          aria-label={`Candlestick chart for ${ticker} showing price movements over ${period}`}
        >
          <title>Candlestick Chart - {ticker}</title>
          <desc>A candlestick chart showing the Open, High, Low, Close (OHLC) prices for {ticker} over a {period} period. Green candles indicate bullish days where the close price is higher than the open price. Red candles indicate bearish days where the close price is lower than the open price.</desc>
        </svg>
      </div>

      <p className="mt-4 text-sm text-gray-500">
        Scroll to zoom, drag to pan. Hover over candles to see OHLC values. Green indicates bullish (close &gt; open), red indicates bearish (close &lt; open).
      </p>
    </div>
  );
}