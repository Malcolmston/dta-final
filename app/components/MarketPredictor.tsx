"use client";

import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { fetchHistory, fetchGrowthEstimate, fetchForecast, StockHistory, GrowthEstimate, ForecastData } from "@/lib/client";
import { TIME_RANGES } from "@/lib/constants";
import { useColorPalette } from "../context/ColorPaletteContext";
import TickerInput from "./TickerInput";
import HelpPopup from "./HelpPopup";

interface StockDataMap {
  [symbol: string]: StockHistory[];
}

interface ForecastMap {
  [symbol: string]: ForecastData[];
}

interface GrowthDataMap {
  [symbol: string]: GrowthEstimate | null;
}

// Calculate stock-specific buy/sell thresholds based on actual performance
function calculateStockZones(stockData: StockHistory[]): { buyLine: number; sellLine: number } {
  if (!stockData || stockData.length === 0) {
    return { buyLine: -5, sellLine: 5 }; // defaults
  }

  const prices = stockData.map(d => d.close);
  const startPrice = prices[0];

  // Calculate min and max percentage change from the starting price
  let minPct = 0;
  let maxPct = 0;

  prices.forEach((price, i) => {
    if (i === 0) return;
    const pct = ((price - startPrice) / startPrice) * 100;
    if (pct < minPct) minPct = pct;
    if (pct > maxPct) maxPct = pct;
  });

  // Use the actual range of the data to set zones
  const dataRange = maxPct - minPct;

  // If stock only went up (no min), use 30% of max
  // If stock only went down (no max), use 30% of abs(min)
  const rangeToUse = dataRange > 0 ? dataRange : Math.abs(minPct) || 10;

  // Sell at top 30% of the range, Buy at bottom 30% of the range
  const sellLine = minPct + (rangeToUse * 0.7);
  const buyLine = minPct + (rangeToUse * 0.3);

  return { buyLine, sellLine };
}

export default function MarketPredictor() {
  const { palette } = useColorPalette();
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [tickers, setTickers] = useState("AAPL,GOOGL,MSFT");
  const [period, setPeriod] = useState("1y");
  const [stockData, setStockData] = useState<StockDataMap>({});
  const [growthData, setGrowthData] = useState<GrowthDataMap>({});
  const [forecastData, setForecastData] = useState<ForecastMap>({});
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
      const growthMap: GrowthDataMap = {};
      symbols.forEach((symbol, i) => {
        if (results[i] && results[i]!.length > 0) {
          dataMap[symbol] = results[i]!;
        }
      });

      const fetchedSymbols = Object.keys(dataMap);
      if (fetchedSymbols.length === 0) {
        throw new Error("No data found for any of the specified tickers");
      }

      // Fetch growth estimates for prediction line
      const growthResults = await Promise.all(
        fetchedSymbols.map((symbol) =>
          fetchGrowthEstimate(symbol).catch(() => null)
        )
      );

      fetchedSymbols.forEach((symbol, i) => {
        growthMap[symbol] = growthResults[i];
      });

      // Fetch forecast for the first symbol to get buy/sell/hold signals
      const forecastResults = await Promise.all(
        fetchedSymbols.slice(0, 1).map((symbol) =>
          fetchForecast(symbol, period).catch(() => [])
        )
      );

      const forecastMap: ForecastMap = {};
      fetchedSymbols.slice(0, 1).forEach((symbol, i) => {
        forecastMap[symbol] = forecastResults[i];
      });

      setStockData(dataMap);
      setGrowthData(growthMap);
      setForecastData(forecastMap);
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

  // D3 chart rendering
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

    // Normalize to percentage change
    const normalizedData: any[] = alignedData.map((d) => {
      const entry: any = { date: d.date };
      symbols.forEach((sym) => {
        const base = alignedData[0][sym];
        entry[sym] = base > 0 ? ((d[sym] - base) / base) * 100 : 0;
      });
      return entry;
    });

    const xScale = d3.scaleTime()
      .domain(d3.extent(normalizedData, (d) => d.date) as [Date, Date])
      .range([margin.left, width - margin.right]);

    const allValues = normalizedData.flatMap((d) => symbols.map((s) => d[s]));
    const yExtent = d3.extent(allValues) as [number, number];
    const yPadding = Math.abs(yExtent[1] - yExtent[0]) * 0.1 || 5;
    const yScale = d3.scaleLinear()
      .domain([yExtent[0] - yPadding, yExtent[1] + yPadding])
      .range([height - margin.bottom, margin.top]);

    // Draw buy/sell zones based on actual forecast signals
    // Use the first symbol's forecast data to get real buy/sell/hold recommendation
    const firstSymbol = symbols[0];
    const firstForecast = forecastData[firstSymbol];
    const latestForecast = firstForecast && firstForecast.length > 0
      ? firstForecast[firstForecast.length - 1]
      : null;

    // If we have forecast data, use the signal to determine zones
    // If BUY: highlight bottom (green), reduce top (red)
    // If SELL: highlight top (red), reduce bottom (green)
    // If HOLD: balanced zones
    let zones: { label: string; min: number; max: number; color: string }[];

    if (latestForecast) {
      const signal = latestForecast.signal;
      const dataRange = yExtent[1] - yExtent[0];

      if (signal === "BUY") {
        // Stock is oversold - recommend buying at lower prices
        zones = [
          { label: "Sell", min: yExtent[1] - dataRange * 0.2, max: Infinity, color: "rgba(239, 68, 68, 0.05)" },
          { label: "Hold", min: yExtent[0] + dataRange * 0.3, max: yExtent[1] - dataRange * 0.2, color: "rgba(234, 179, 8, 0.1)" },
          { label: "Buy", min: -Infinity, max: yExtent[0] + dataRange * 0.3, color: "rgba(34, 197, 94, 0.2)" },
        ];
      } else if (signal === "SELL") {
        // Stock is overbought - recommend selling at higher prices
        zones = [
          { label: "Sell", min: yExtent[0] + dataRange * 0.7, max: Infinity, color: "rgba(239, 68, 68, 0.2)" },
          { label: "Hold", min: yExtent[0] + dataRange * 0.3, max: yExtent[0] + dataRange * 0.7, color: "rgba(234, 179, 8, 0.1)" },
          { label: "Buy", min: -Infinity, max: yExtent[0] + dataRange * 0.3, color: "rgba(34, 197, 94, 0.05)" },
        ];
      } else {
        // HOLD - balanced
        zones = [
          { label: "Sell", min: yExtent[0] + dataRange * 0.66, max: Infinity, color: "rgba(239, 68, 68, 0.15)" },
          { label: "Hold", min: yExtent[0] + dataRange * 0.33, max: yExtent[0] + dataRange * 0.66, color: "rgba(234, 179, 8, 0.15)" },
          { label: "Buy", min: -Infinity, max: yExtent[0] + dataRange * 0.33, color: "rgba(34, 197, 94, 0.15)" },
        ];
      }
    } else {
      // Fallback to default zones if no forecast available
      const dataRange = yExtent[1] - yExtent[0];
      zones = [
        { label: "Sell", min: yExtent[0] + dataRange * 0.66, max: Infinity, color: "rgba(239, 68, 68, 0.15)" },
        { label: "Hold", min: yExtent[0] + dataRange * 0.33, max: yExtent[0] + dataRange * 0.66, color: "rgba(234, 179, 8, 0.15)" },
        { label: "Buy", min: -Infinity, max: yExtent[0] + dataRange * 0.33, color: "rgba(34, 197, 94, 0.15)" },
      ];
    }

    zones.forEach((zone) => {
      const topY = yScale(Math.min(zone.max, yExtent[1] + yPadding));
      const bottomY = yScale(Math.max(zone.min, yExtent[0] - yPadding));
      const rectHeight = bottomY - topY;

      if (rectHeight > 0) {
        svg
          .append("rect")
          .attr("x", margin.left)
          .attr("y", Math.max(topY, margin.top))
          .attr("width", width - margin.left - margin.right)
          .attr("height", Math.min(rectHeight, height - margin.top - margin.bottom))
          .attr("fill", zone.color);
      }
    });

    // Add zone labels on the right
    zones.forEach((zone) => {
      // Calculate middle of zone, handling Infinity values
      let midValue;
      if (zone.min === -Infinity) {
        midValue = yExtent[0] - yPadding * 0.5;
      } else if (zone.max === Infinity) {
        midValue = yExtent[1] + yPadding * 0.5;
      } else {
        midValue = (zone.min + zone.max) / 2;
      }
      const y = yScale(midValue);

      svg
        .append("text")
        .attr("x", width - margin.right + 5)
        .attr("y", y + 4)
        .attr("font-size", "10px")
        .attr("fill", zone.color === "rgba(239, 68, 68, 0.1)" ? "#ef4444" : zone.color === "rgba(234, 179, 8, 0.1)" ? "#eab308" : "#22c55e")
        .text(zone.label);
    });

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
        .attr("stroke", "#6b7280")
        .attr("stroke-width", 1.5)
        .attr("stroke-dasharray", "4,4");
    }

    // X Axis
    // Reduce ticks for short time periods (1D, 1W) to avoid clutter
    const xTicks = period === "1d" || period === "5d" ? 4 : 6;

    svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(xScale).ticks(xTicks))
      .selectAll("text")
      .attr("fill", "#6b7280");

    // Y Axis
    svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale).ticks(6).tickFormat((d) => `${d}%`))
      .selectAll("text")
      .attr("fill", "#6b7280");

    // Y Axis label
    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 15)
      .attr("x", -(height / 2))
      .attr("text-anchor", "middle")
      .attr("fill", "#6b7280")
      .text("% Change from Start");

    // Use palette colors for lines
    const lineColors = [palette.primary, palette.secondary, palette.accent, palette.negative, palette.positive, palette.text];

    // Draw lines for each ticker
    symbols.forEach((symbol, i) => {
      const line: any = d3
        .line()
        .x((d: any) => xScale(d.date))
        .y((d: any) => yScale(d[symbol]))
        .curve(d3.curveMonotoneX);

      svg
        .append("path")
        .datum(normalizedData)
        .attr("fill", "none")
        .attr("stroke", lineColors[i % lineColors.length])
        .attr("stroke-width", 2)
        .attr("d", line as any);

      // OHLC markers removed for cleaner view
    });

    // Draw prediction line based on growth estimates
    const firstSymbolGrowth = growthData[firstSymbol];
    if (firstSymbolGrowth) {
      const lastDate = normalizedData[normalizedData.length - 1].date;
      const startValue = normalizedData[0][firstSymbol];
      const growthRate = firstSymbolGrowth.growthNext5Years || firstSymbolGrowth.growthNextYear || 0;

      // Calculate predicted values
      const predictionYears = 1; // 1 year forward projection
      const predictedEndValue = startValue * (1 + (growthRate / 100) * predictionYears);

      // Create prediction data points
      const predictionData = [
        { date: lastDate, value: startValue },
        { date: new Date(lastDate.getTime() + predictionYears * 365 * 24 * 60 * 60 * 1000), value: predictedEndValue },
      ];

      // Draw dashed prediction line
      const predictionLine: any = d3
        .line()
        .x((d: any) => xScale(d.date))
        .y((d: any) => yScale(d.value))
        .curve(d3.curveLinear);

      svg
        .append("path")
        .datum(predictionData)
        .attr("fill", "none")
        .attr("stroke", "#9ca3af")
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "6,4")
        .attr("d", predictionLine as any);

      // Add "Prediction" label
      svg
        .append("text")
        .attr("x", xScale(predictionData[1].date) - 10)
        .attr("y", yScale(predictedEndValue) - 8)
        .attr("text-anchor", "end")
        .attr("fill", "#9ca3af")
        .attr("font-size", "11px")
        .text(`Hypothetical: ${growthRate > 0 ? "+" : ""}${growthRate.toFixed(1)}%/yr (Educational Only)`);
    }

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
        .attr("fill", lineColors[i % lineColors.length]);

      g.append("text")
        .attr("x", 18)
        .attr("y", 10)
        .attr("fill", "#374151")
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
              `<div style="color: ${lineColors[i % lineColors.length]};">${sym}: ${d[sym].toFixed(2)}%</div>`
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
        title="Market Predictor"
        whatItDoes="Analyzes market sentiment by combining multiple technical indicators ( RSI, MACD, moving averages) to generate a bullish/bearish score for major market indices."
        whyItMatters="Provides a quick overview of market conditions without analyzing individual stocks. Helps understand overall market sentiment and potential direction."
        whoItMattersFor="Investors wanting a quick market health check before making trading decisions."
        howToRead="Green bar = bullish sentiment, Red bar = bearish sentiment. The gauge shows the overall score from very bearish to very bullish. Use for educational purposes only - not financial advice."
      />
      <div className="flex items-center gap-3 mb-4">
        <h2 className="text-2xl font-bold" style={{ color: palette.text }}>Market Predictor</h2>
        <span className="px-3 py-1 text-xs font-bold rounded-full" style={{ backgroundColor: palette.accent + "20", color: palette.accent }}>
          EDUCATIONAL USE ONLY
        </span>
      </div>
      <p className="text-sm mb-6" style={{ color: palette.text, opacity: 0.7 }}>
        This tool is for educational purposes only. It does not constitute financial advice.
        Past performance does not guarantee future results.
      </p>

      {/* Market timing warning */}
      <div className="mb-6 p-4 rounded-lg border" style={{ backgroundColor: palette.accent + "15", borderColor: palette.accent + "40" }}>
        <div className="flex items-start gap-3">
          <span className="text-amber-600 text-xl">!</span>
          <div>
            <p className="font-semibold text-amber-800 mb-1">Important Warning: Avoid Market Timing</p>
            <p className="text-sm text-amber-700">
              Studies consistently show that trying to time the market underperforms buy-and-hold strategies.
              The signals below are based on technical indicators which have no proven track record of predicting future performance.
              These are for educational purposes only - do not use them as investment advice.
            </p>
          </div>
        </div>
      </div>

      {/* User-friendly description section */}
      <div className="mb-6 p-4 bg-transparent rounded-lg border border-transparent">
        <p className="text-sm palette.text mb-3">
          Not sure what this chart shows? Here's a simple breakdown:
        </p>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <p className="font-bold text-lg palette.text">*Percentage Change*</p>
            <p className="palette.text">
              Shows how much each stock has gained or lost from the start of the period.
            </p>
          </div>
          <div>
            <p className="font-bold text-lg palette.text">*Historical Zones*</p>
            <p className="palette.text">
              Colored areas showing historical price ranges. <span className="text-amber-600 font-medium">Not recommendations to buy or sell.</span>
            </p>
          </div>
          <div>
            <p className="font-bold text-lg palette.text">*Growth Estimate*</p>
            <p className="palette.text">
              The dashed line shows analyst growth estimates - <span className="text-amber-600 font-medium">not a prediction</span>.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-4">
        <div className="flex-1 min-w-[250px]">
          <label className="block text-sm font-medium palette.text mb-2">
            Enter Ticker Symbol
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
        Chart shows percentage change from the start of the period. Enter multiple tickers separated by commas. Hover over the chart to see exact values.
      </p>
    </div>
  );
}