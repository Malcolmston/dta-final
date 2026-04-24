"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useColorPalette } from "../context/ColorPaletteContext";
import * as d3 from "d3";
import { fetchSignals, fetchMomentum, SignalsData, MomentumData } from "@/lib/client";
import TickerInput from "./TickerInput";

interface SignalsMap {
  [symbol: string]: SignalsData[];
}

interface MomentumMap {
  [symbol: string]: MomentumData[];
}

interface DataPoint {
  date: Date;
  value: number;
  signal?: string;
}

interface TooltipData {
  x: number;
  y: number;
  data: DataPoint[];
  ticker?: string;
}

const COLORS = {
  buy: "#22c55e",
  sell: "#ef4444",
  hold: "#eab308",
  line: "#3b82f6",
};

const TICKER_COLORS = [
  "#3b82f6", // blue
  "#f97316", // orange
  "#22c55e", // green
  "#a855f7", // purple
  "#ef4444", // red
  "#06b6d4", // cyan
];

type TabType = "signals" | "momentum";

type IndicatorKey = "rsi" | "willr" | "stoch_k" | "cci";

interface TechnicalAnalysisProps {
  isSimpleMode?: boolean;
}

interface IndicatorConfig {
  key: IndicatorKey;
  title: string;
  min: number;
  max: number;
  color: string;
  enabled: boolean;
}

const DEFAULT_INDICATORS: IndicatorConfig[] = [
  { key: "rsi", title: "RSI (14)", min: 0, max: 100, color: COLORS.line, enabled: true },
  { key: "willr", title: "Williams %R", min: -100, max: 0, color: "#a855f7", enabled: true },
  { key: "stoch_k", title: "Stochastic %K", min: 0, max: 100, color: "#f97316", enabled: true },
  { key: "cci", title: "CCI", min: -200, max: 200, color: "#22c55e", enabled: true },
];

// Simple Mode: show only RSI (simplified "is stock going up or down?")
const SIMPLE_INDICATORS: IndicatorConfig[] = [
  { key: "rsi", title: "RSI (14)", min: 0, max: 100, color: COLORS.line, enabled: true },
];

export default function TechnicalAnalysis({ isSimpleMode = false }: TechnicalAnalysisProps) {
  const { palette } = useColorPalette();
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [tickers, setTickers] = useState("AAPL,MSFT");
  const [period, setPeriod] = useState("3mo");
  const [activeTab, setActiveTab] = useState<TabType>("signals");
  const [signalsData, setSignalsData] = useState<SignalsMap>({});
  const [momentumData, setMomentumData] = useState<MomentumMap>({});
  const [selectedTicker, setSelectedTicker] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Interactive features state
  const [tooltipData, setTooltipData] = useState<TooltipData | null>(null);
  const [selectedDataPoint, setSelectedDataPoint] = useState<DataPoint | null>(null);
  // Use simple indicators in Simple Mode, full indicators in Detailed Mode
  const [indicators, setIndicators] = useState<IndicatorConfig[]>(isSimpleMode ? SIMPLE_INDICATORS : DEFAULT_INDICATORS);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAnimationIndex, setCurrentAnimationIndex] = useState(0);
  const [dateRange, setDateRange] = useState<[Date, Date] | null>(null);
  const [hoveredTicker, setHoveredTicker] = useState<string | null>(null);
  const [zoomTransform, setZoomTransform] = useState<d3.ZoomTransform>(d3.zoomIdentity);

  const animationRef = useRef<NodeJS.Timeout | null>(null);

  // Update indicators when mode changes
  useEffect(() => {
    setIndicators(isSimpleMode ? SIMPLE_INDICATORS : DEFAULT_INDICATORS);
  }, [isSimpleMode]);

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
      const signalsResults = await Promise.all(
        symbols.map((symbol) =>
          fetchSignals(symbol, period).catch(() => [])
        )
      );

      const signalsMap: SignalsMap = {};
      symbols.forEach((symbol, i) => {
        signalsMap[symbol] = signalsResults[i];
      });

      const momentumResults = await Promise.all(
        symbols.map((symbol) =>
          fetchMomentum(symbol, period).catch(() => [])
        )
      );

      const momentumMap: MomentumMap = {};
      symbols.forEach((symbol, i) => {
        momentumMap[symbol] = momentumResults[i];
      });

      setSignalsData(signalsMap);
      setMomentumData(momentumMap);

      if (!selectedTicker && symbols.length > 0) {
        setSelectedTicker(symbols[0]);
      }

      // Reset animation state when new data is loaded
      setCurrentAnimationIndex(0);
      setIsPlaying(false);
      setDateRange(null);
      setZoomTransform(d3.zoomIdentity);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (Object.keys(signalsData).length > 0 || Object.keys(momentumData).length > 0) {
      fetchData();
    }
  }, [period]);

  // Animation effect
  useEffect(() => {
    if (isPlaying) {
      const displaySymbol = selectedTicker || Object.keys(momentumData)[0];
      const data = momentumData[displaySymbol];

      if (data && data.length > 0) {
        animationRef.current = setInterval(() => {
          setCurrentAnimationIndex((prev) => {
            if (prev >= data.length - 1) {
              setIsPlaying(false);
              return prev;
            }
            return prev + 1;
          });
        }, 100);
      }
    } else {
      if (animationRef.current) {
        clearInterval(animationRef.current);
        animationRef.current = null;
      }
    }

    return () => {
      if (animationRef.current) {
        clearInterval(animationRef.current);
      }
    };
  }, [isPlaying, momentumData, selectedTicker]);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const symbols = Object.keys(activeTab === "signals" ? signalsData : momentumData);
    if (symbols.length === 0) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = 400;
    const margin = { top: 30, right: 80, bottom: 50, left: 60 };

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    svg.attr("width", width).attr("height", height);

    if (activeTab === "signals") {
      renderSignalsChart(svg, symbols, signalsData, width, height, margin);
    } else {
      renderMomentumChart(svg, symbols, momentumData, width, height, margin);
    }
  }, [signalsData, momentumData, activeTab, indicators, currentAnimationIndex, dateRange, hoveredTicker, zoomTransform]);

  const toggleIndicator = (key: IndicatorKey) => {
    setIndicators((prev) =>
      prev.map((ind) => (ind.key === key ? { ...ind, enabled: !ind.enabled } : ind))
    );
  };

  const handleBrush = useCallback((event: d3.D3BrushEvent<unknown>) => {
    if (event.selection) {
      const [x0, x1] = event.selection as [number, number];
      const container = containerRef.current;
      if (!container) return;

      const width = container.clientWidth;
      const margin = { top: 30, right: 80, bottom: 50, left: 60 };

      const xScale = d3.scaleTime()
        .domain(d3.extent(getAllDataDates(), (d) => d) as [Date, Date])
        .range([margin.left, width - margin.right]);

      const newDateRange: [Date, Date] = [xScale.invert(x0), xScale.invert(x1)];
      setDateRange(newDateRange);
    } else {
      setDateRange(null);
    }
  }, []);

  const getAllDataDates = (): Date[] => {
    const data = activeTab === "signals" ? signalsData : momentumData;
    const symbols = Object.keys(data);
    const allDates: Date[] = [];

    symbols.forEach((symbol) => {
      const tickerData = data[symbol];
      if (tickerData && tickerData.length > 0) {
        tickerData.forEach((d) => {
          if (d.date) allDates.push(d.date);
        });
      }
    });

    return allDates.sort((a, b) => a.getTime() - b.getTime());
  };

  const renderSignalsChart = (
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    symbols: string[],
    data: SignalsMap,
    width: number,
    height: number,
    margin: { top: number; right: number; bottom: number; left: number }
  ) => {
    const firstSymbol = symbols[0];
    const firstData = data[firstSymbol];
    if (!firstData || firstData.length === 0) return;

    const validData = firstData.filter((d) => d.rsi !== null || d.cci !== null || d.willr !== null || d.stoch_k !== null);
    if (validData.length === 0) return;

    // Apply date range filter if set
    let filteredData = validData;
    if (dateRange) {
      filteredData = validData.filter(
        (d) => d.date >= dateRange[0] && d.date <= dateRange[1]
      );
    }

    // Create clipped area for zoom/pan
    const clipId = "signals-clip";
    svg.append("defs").append("clipPath").attr("id", clipId).append("rect")
      .attr("x", margin.left)
      .attr("y", margin.top)
      .attr("width", width - margin.left - margin.right)
      .attr("height", height - margin.top - margin.bottom);

    const chartArea = svg.append("g").attr("clip-path", `url(#${clipId})`);

    const xScaleOriginal = d3.scaleTime()
      .domain(d3.extent(validData, (d) => d.date) as [Date, Date])
      .range([margin.left, width - margin.right]);

    const xScale = xScaleOriginal.copy().range([margin.left, width - margin.right]);

    const yScale = d3.scaleLinear()
      .domain([0, 100])
      .range([height - margin.bottom, margin.top]);

    // Apply zoom transform to x scale
    const transformedXScale = zoomTransform.rescaleX(xScale);

    // RSI zones
    svg.append("rect")
      .attr("x", margin.left)
      .attr("y", yScale(70))
      .attr("width", width - margin.left - margin.right)
      .attr("height", yScale(30) - yScale(70))
      .attr("fill", "rgba(239, 68, 68, 0.1)")
      .style("pointer-events", "none");

    svg.append("rect")
      .attr("x", margin.left)
      .attr("y", yScale(30))
      .attr("width", width - margin.left - margin.right)
      .attr("height", yScale(0) - yScale(30))
      .attr("fill", "rgba(34, 197, 94, 0.1)")
      .style("pointer-events", "none");

    // Zone labels
    svg.append("text")
      .attr("x", width - margin.right + 5)
      .attr("y", yScale(85))
      .attr("fill", "#ef4444")
      .attr("font-size", "10px")
      .text("Overbought (70)")
      .style("pointer-events", "none");

    svg.append("text")
      .attr("x", width - margin.right + 5)
      .attr("y", yScale(15))
      .attr("fill", "#22c55e")
      .attr("font-size", "10px")
      .text("Oversold (30)")
      .style("pointer-events", "none");

    // Draw RSI lines for each ticker
    symbols.forEach((symbol, idx) => {
      const tickerData = data[symbol];
      if (!tickerData || tickerData.length === 0) return;

      let tickerValidData = tickerData.filter((d) => d.rsi !== null);
      if (dateRange) {
        tickerValidData = tickerValidData.filter(
          (d) => d.date >= dateRange[0] && d.date <= dateRange[1]
        );
      }

      if (tickerValidData.length === 0) return;

      const color = TICKER_COLORS[idx % TICKER_COLORS.length];
      const isHighlighted = hoveredTicker === null || hoveredTicker === symbol;
      const opacity = isHighlighted ? 1 : 0.2;

      const rsiLine = d3.line<SignalsData>()
        .x((d) => transformedXScale(d.date))
        .y((d) => yScale(d.rsi!))
        .defined((d) => d.rsi !== null)
        .curve(d3.curveMonotoneX);

      chartArea.append("path")
        .datum(tickerValidData)
        .attr("fill", "none")
        .attr("stroke", color)
        .attr("stroke-width", isHighlighted ? 2 : 1)
        .attr("opacity", opacity)
        .attr("d", rsiLine)
        .style("cursor", "pointer")
        .on("mouseenter", () => setHoveredTicker(symbol))
        .on("mouseleave", () => setHoveredTicker(null));
    });

    // Draw signals (dots)
    symbols.forEach((symbol, idx) => {
      const tickerData = data[symbol];
      if (!tickerData || tickerData.length === 0) return;

      let tickerValidData = tickerData.filter((d) => d.rsi !== null && d.rsi_signal);
      if (dateRange) {
        tickerValidData = tickerValidData.filter(
          (d) => d.date >= dateRange[0] && d.date <= dateRange[1]
        );
      }

      if (tickerValidData.length === 0) return;

      const color = TICKER_COLORS[idx % TICKER_COLORS.length];
      const isHighlighted = hoveredTicker === null || hoveredTicker === symbol;
      const opacity = isHighlighted ? 1 : 0.2;

      tickerValidData.forEach((d) => {
        const signalColor =
          d.rsi_signal === "BUY"
            ? COLORS.buy
            : d.rsi_signal === "SELL"
            ? COLORS.sell
            : COLORS.hold;

        chartArea.append("circle")
          .attr("cx", transformedXScale(d.date))
          .attr("cy", yScale(d.rsi!))
          .attr("r", 4)
          .attr("fill", signalColor)
          .attr("stroke", color)
          .attr("stroke-width", 2)
          .attr("opacity", opacity)
          .style("cursor", "pointer")
          .on("click", (event: MouseEvent) => {
            const rect = containerRef.current?.getBoundingClientRect();
            if (rect) {
              setSelectedDataPoint({
                date: d.date,
                value: d.rsi!,
                signal: d.rsi_signal || undefined,
              });
              setTooltipData({
                x: event.clientX - rect.left,
                y: event.clientY - rect.top,
                data: [{ date: d.date, value: d.rsi!, signal: d.rsi_signal || undefined }],
                ticker: symbol,
              });
            }
          })
          .on("mouseenter", function (this: SVGCircleElement) {
            d3.select(this).attr("r", 6);
          })
          .on("mouseleave", function (this: SVGCircleElement) {
            d3.select(this).attr("r", 4);
          });
      });
    });

    // X Axis
    svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(transformedXScale).ticks(5))
      .selectAll("text")
      .attr("fill", "#6b7280");

    // Y Axis
    svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale).ticks(5))
      .selectAll("text")
      .attr("fill", "#6b7280");

    // Legend
    const legend = svg.append("g").attr("transform", `translate(${margin.left}, 20)`);

    symbols.forEach((symbol, idx) => {
      const g = legend.append("g").attr("transform", `translate(${idx * 80}, 0)`);

      g.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", 12)
        .attr("height", 12)
        .attr("fill", TICKER_COLORS[idx % TICKER_COLORS.length]);

      g.append("text")
        .attr("x", 16)
        .attr("y", 10)
        .attr("fill", "palette.text")
        .attr("font-size", "11px")
        .text(symbol)
        .style("cursor", "pointer")
        .on("mouseenter", () => setHoveredTicker(symbol))
        .on("mouseleave", () => setHoveredTicker(null));
    });

    // Title - simplified in Simple Mode
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", 15)
      .attr("text-anchor", "middle")
      .attr("fill", "palette.text")
      .attr("font-size", "14px")
      .attr("font-weight", "bold")
      .text(isSimpleMode ? "Is Stock Going Up or Down?" : "RSI Signals - Multiple Tickers");

    // Zoom/Pan behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 10])
      .translateExtent([[margin.left, 0], [width - margin.right, height]])
      .extent([[margin.left, 0], [width - margin.right, height]])
      .on("zoom", (event) => {
        setZoomTransform(event.transform);
      });

    svg.call(zoom);

    // Reset zoom button
    svg.append("g")
      .attr("transform", `translate(${width - 120}, 10)`)
      .append("rect")
      .attr("width", 100)
      .attr("height", 24)
      .attr("rx", 4)
      .attr("fill", "#f3f4f6")
      .attr("stroke", "#d1d5db")
      .style("cursor", "pointer");

    svg.select("g:last-child")
      .append("text")
      .attr("x", 50)
      .attr("y", 16)
      .attr("text-anchor", "middle")
      .attr("fill", "palette.text")
      .attr("font-size", "11px")
      .text("Reset Zoom")
      .style("pointer-events", "none")
      .style("cursor", "pointer")
      .on("click", () => {
        setZoomTransform(d3.zoomIdentity);
      });

    // Brush for date range selection
    const brush = d3.brushX()
      .extent([[margin.left, height - margin.bottom - 30], [width - margin.right, height - margin.bottom]])
      .on("brush end", handleBrush);

    svg.append("g")
      .attr("class", "brush")
      .attr("transform", `translate(0, ${height - margin.bottom - 30})`)
      .call(brush);
  };

  const renderMomentumChart = (
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    symbols: string[],
    data: MomentumMap,
    width: number,
    height: number,
    margin: { top: number; right: number; bottom: number; left: number }
  ) => {
    const displaySymbol = selectedTicker || symbols[0];
    const displayData = data[displaySymbol];
    if (!displayData || displayData.length === 0) return;

    let validData = displayData.filter((d) => d.rsi !== null || d.cci !== null || d.willr !== null || d.stoch_k !== null);
    if (dateRange) {
      validData = validData.filter(
        (d) => d.date >= dateRange[0] && d.date <= dateRange[1]
      );
    }

    if (validData.length === 0) return;

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Filter enabled indicators
    const enabledIndicators = indicators.filter((ind) => ind.enabled);
    const numCharts = enabledIndicators.length;

    if (numCharts === 0) return;

    // Calculate grid layout based on number of enabled indicators
    const cols = numCharts <= 2 ? numCharts : 2;
    const rows = Math.ceil(numCharts / cols);
    const chartHeight = innerHeight / rows - 10;
    const chartWidth = innerWidth / cols - 10;

    const getValue = (d: MomentumData, key: IndicatorKey) => {
      if (key === "rsi") return d.rsi;
      if (key === "willr") return d.willr;
      if (key === "stoch_k") return d.stoch_k;
      if (key === "cci") return d.cci;
      return null;
    };

    enabledIndicators.forEach((chart, idx) => {
      const row = Math.floor(idx / cols);
      const col = idx % cols;
      const xOffset = margin.left + col * (chartWidth + 10);
      const yOffset = margin.top + row * (chartHeight + 20);

      const xScale = d3.scaleTime()
        .domain(d3.extent(validData, (d) => d.date) as [Date, Date])
        .range([xOffset, xOffset + chartWidth]);

      const yScale = d3.scaleLinear()
        .domain([chart.min, chart.max])
        .range([yOffset + chartHeight, yOffset]);

      // Draw line
      const line = d3.line<MomentumData>()
        .x((d) => xScale(d.date))
        .y((d) => yScale(getValue(d, chart.key)!))
        .defined((d) => getValue(d, chart.key) !== null)
        .curve(d3.curveMonotoneX);

      const isAnimated = currentAnimationIndex > 0;

      // Draw the line
      svg.append("path")
        .datum(validData)
        .attr("fill", "none")
        .attr("stroke", chart.color)
        .attr("stroke-width", 1.5)
        .attr("d", line)
        .style("cursor", "crosshair")
        .on("click", (event: MouseEvent) => {
          const [mx] = d3.pointer(event, svg.node());
          const date = xScale.invert(mx);
          const bisect = d3.bisector<MomentumData, Date>((d) => d.date).left;
          const idx = bisect(validData, date);
          const d = validData[Math.min(idx, validData.length - 1)];

          if (d) {
            const value = getValue(d, chart.key);
            setSelectedDataPoint({ date: d.date, value: value! });
            const rect = containerRef.current?.getBoundingClientRect();
            if (rect) {
              setTooltipData({
                x: event.clientX - rect.left,
                y: event.clientY - rect.top,
                data: [{ date: d.date, value: value! }],
                ticker: displaySymbol,
              });
            }
          }
        })
        .on("mousemove", (event: MouseEvent) => {
          const [mx] = d3.pointer(event, svg.node());
          const date = xScale.invert(mx);
          const bisect = d3.bisector<MomentumData, Date>((d) => d.date).left;
          const idx = bisect(validData, date);
          const d = validData[Math.min(idx, validData.length - 1)];

          if (d) {
            const value = getValue(d, chart.key);
            setSelectedDataPoint({ date: d.date, value: value! });
          }
        });

      // Highlight current animation point
      if (isAnimated && currentAnimationIndex < validData.length) {
        const currentData = validData[currentAnimationIndex];
        const currentValue = getValue(currentData, chart.key);

        if (currentValue !== null) {
          svg.append("circle")
            .attr("cx", xScale(currentData.date))
            .attr("cy", yScale(currentValue))
            .attr("r", 6)
            .attr("fill", chart.color)
            .attr("stroke", "#fff")
            .attr("stroke-width", 2)
            .attr("opacity", 0.8);
        }
      }

      // Zero line for CCI
      if (chart.key === "cci") {
        const zeroY = yScale(0);
        svg.append("line")
          .attr("x1", xOffset)
          .attr("x2", xOffset + chartWidth)
          .attr("y1", zeroY)
          .attr("y2", zeroY)
          .attr("stroke", "#9ca3af")
          .attr("stroke-dasharray", "2,2")
          .style("pointer-events", "none");
      }

      // Overbought/oversold lines for RSI
      if (chart.key === "rsi") {
        svg.append("line")
          .attr("x1", xOffset)
          .attr("x2", xOffset + chartWidth)
          .attr("y1", yScale(70))
          .attr("y2", yScale(70))
          .attr("stroke", "#ef4444")
          .attr("stroke-dasharray", "2,2")
          .attr("opacity", 0.5)
          .style("pointer-events", "none");

        svg.append("line")
          .attr("x1", xOffset)
          .attr("x2", xOffset + chartWidth)
          .attr("y1", yScale(30))
          .attr("y2", yScale(30))
          .attr("stroke", "#22c55e")
          .attr("stroke-dasharray", "2,2")
          .attr("opacity", 0.5)
          .style("pointer-events", "none");
      }

      // Title
      svg.append("text")
        .attr("x", xOffset + chartWidth / 2)
        .attr("y", yOffset - 5)
        .attr("text-anchor", "middle")
        .attr("fill", "palette.text")
        .attr("font-size", "11px")
        .attr("font-weight", "bold")
        .text(chart.title);

      // Y Axis
      svg.append("g")
        .attr("transform", `translate(${xOffset},0)`)
        .call(d3.axisLeft(yScale).ticks(4))
        .selectAll("text")
        .attr("fill", "#6b7280")
        .attr("font-size", "9px");

      // X Axis (only for bottom row)
      if (row === rows - 1) {
        svg.append("g")
          .attr("transform", `translate(0,${yOffset + chartHeight})`)
          .call(d3.axisBottom(xScale).ticks(4))
          .selectAll("text")
          .attr("fill", "#6b7280")
          .attr("font-size", "9px");
      }
    });

    // Ticker selector
    if (symbols.length > 1) {
      const tickerSelect = svg.append("g")
        .attr("transform", `translate(${width - margin.right - 100}, ${margin.top - 25})`);

      tickerSelect.append("text")
        .attr("fill", "palette.text")
        .attr("font-size", "11px")
        .text("Ticker:");

      const select = tickerSelect.append("foreignObject")
        .attr("x", 45)
        .attr("y", -12)
        .attr("width", 80)
        .attr("height", 24);

      const selectEl = select.append("xhtml:select")
        .attr("style", "width: 100%; font-size: 11px; padding: 2px; border: 1px solid #d1d5db; border-radius: 4px;")
        .on("change", (event) => {
          const target = event.target as HTMLSelectElement;
          setSelectedTicker(target.value);
          setCurrentAnimationIndex(0);
          setIsPlaying(false);
        });

      symbols.forEach((symbol) => {
        selectEl.append("xhtml:option")
          .attr("value", symbol)
          .text(symbol)
          .property("selected", symbol === displaySymbol);
      });
    }
  };

  const resetDateRange = () => {
    setDateRange(null);
    setZoomTransform(d3.zoomIdentity);
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-6 rounded-xl shadow-lg" style={{ backgroundColor: palette.background, border: `1px solid ${palette.gridLines}` }}>
      <h2 className="text-2xl font-bold mb-2" style={{ color: palette.text }}>
        {isSimpleMode ? "Simple Trend Analysis" : "Technical Analysis"}
      </h2>

      {/* Educational Disclaimer */}
      <div className="mb-4 p-4 rounded-lg border" style={{ backgroundColor: palette.accent + "15", borderColor: palette.accent + "40" }}>
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: palette.accent }} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div>
            <p className="font-medium" style={{ color: palette.accent }}>Educational Use Only</p>
            <p className="text-sm mt-1" style={{ color: palette.text, opacity: 0.8 }}>
              <strong>Technical analysis has no evidence-based track record of outperforming the market.</strong> These BUY/SELL/HOLD signals are for educational purposes only. They should NOT be interpreted as investment advice.
            </p>
          </div>
        </div>
      </div>

      {/* User-friendly description section - simplified for Simple Mode */}
      <div className="mb-6 p-4 rounded-lg border" style={{ backgroundColor: palette.background, borderColor: palette.gridLines }}>
        {isSimpleMode ? (
          <div className="text-center py-2">
            <p className="text-lg font-semibold" style={{ color: palette.text }}>
              Is this stock going up or down?
            </p>
            <p className="mt-2" style={{ color: palette.text, opacity: 0.7 }}>
              When the line is below 30 (green zone), the stock may be oversold and could go up.
              When above 70 (red zone), it may be overbought and could go down.
            </p>
          </div>
        ) : (
          <>
            <p className="text-sm mb-3" style={{ color: palette.text, opacity: 0.7 }}>
              Not sure what technical analysis means? Here&apos;s a simple breakdown:
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="font-bold text-lg palette.text">Trading Signals</p>
                <p className="palette.text">
                  Shows when to <em className="text-green-600 font-medium">BUY</em> (oversold), <em className="text-red-600 font-medium">SELL</em> (overbought), or <em className="text-yellow-600 font-medium">HOLD</em> based on RSI indicator.
                </p>
              </div>
              <div>
                <p className="font-bold text-lg palette.text">Momentum</p>
                <p className="palette.text">
                  Shows if a stock is gaining or losing momentum using 4 different indicators.
                </p>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="flex flex-wrap gap-4 mb-4">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium palette.text mb-2">
            Enter Ticker Symbols
          </label>
          <TickerInput
            value={tickers}
            onChange={setTickers}
            onSubmit={fetchData}
            placeholder="Type ticker and press Enter"
            defaultTickers={["AAPL", "MSFT"]}
            maxPills={2}
          />
        </div>
        <div className="flex items-end">
        </div>
      </div>

      {/* Hide detailed tabs in Simple Mode */}
      {!isSimpleMode && (
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setActiveTab("signals")}
            className="px-4 py-2 font-medium rounded-lg transition"
            style={{
              backgroundColor: activeTab === "signals" ? palette.primary : palette.background,
              color: activeTab === "signals" ? "#ffffff" : palette.text,
              border: `1px solid ${palette.gridLines}`,
            }}
          >
            Trading Signals
          </button>
          <button
            onClick={() => setActiveTab("momentum")}
            className="px-4 py-2 font-medium rounded-lg transition"
            style={{
              backgroundColor: activeTab === "momentum" ? palette.primary : palette.background,
              color: activeTab === "momentum" ? "#ffffff" : palette.text,
              border: `1px solid ${palette.gridLines}`,
            }}
          >
            Momentum
          </button>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-4 py-2 rounded-lg ml-auto"
            style={{ backgroundColor: palette.background, color: palette.text, border: `1px solid ${palette.gridLines}` }}
          >
            <option value="1mo">1 Month</option>
            <option value="3mo">3 Months</option>
            <option value="6mo">6 Months</option>
            <option value="1y">1 Year</option>
          </select>
        </div>
      )}

      {/* Indicator Toggles (for Momentum tab) - hide in Simple Mode */}
      {activeTab === "momentum" && !isSimpleMode && (
        <div className="flex flex-wrap gap-4 mb-4 p-3 bg-transparent rounded-lg">
          <span className="text-sm font-medium mr-2" style={{ color: palette.text }}>Indicators:</span>
          {indicators.map((ind) => (
            <div key={ind.key} className="flex items-center gap-2">
              <span className="text-xs" style={{ color: palette.text }}>{ind.title}</span>
              <button
                type="button"
                onClick={() => toggleIndicator(ind.key)}
                className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
                style={{
                  backgroundColor: ind.enabled ? ind.color : palette.gridLines,
                }}
              >
                <span
                  aria-hidden="true"
                  className="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                  style={{
                    transform: ind.enabled ? 'translateX(20px)' : 'translateX(0)',
                  }}
                />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Play/Pause Animation (for Momentum tab) - hide in Simple Mode */}
      {activeTab === "momentum" && !isSimpleMode && (
        <div className="flex items-center gap-3 mb-4 p-3 bg-transparent rounded-lg">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-4 py-2 font-medium rounded-lg ${
              isPlaying ? "bg-red-500 text-white" : "bg-green-500 text-white"
            }`}
          >
            {isPlaying ? "⏸ Pause" : "▶ Play"}
          </button>
          <button
            onClick={() => {
              setCurrentAnimationIndex(0);
              setIsPlaying(false);
            }}
            className="px-4 py-2 font-medium rounded-lg transition"
            style={{ backgroundColor: palette.gridLines, color: palette.text }}
          >
            ↺ Reset
          </button>
          <div className="flex-1">
            <input
              type="range"
              min={0}
              max={(momentumData[selectedTicker || Object.keys(momentumData)[0]]?.length || 1) - 1}
              value={currentAnimationIndex}
              onChange={(e) => {
                setCurrentAnimationIndex(parseInt(e.target.value));
                setIsPlaying(false);
              }}
              className="w-full"
            />
          </div>
          <span className="text-sm palette.text">
            {currentAnimationIndex + 1} / {momentumData[selectedTicker || Object.keys(momentumData)[0]]?.length || 0}
          </span>
        </div>
      )}

      {/* Date Range Reset */}
      {dateRange && (
        <div className="mb-4 p-2 bg-blue-50 rounded-lg flex items-center justify-between">
          <span className="text-sm text-blue-700">
            Date range: {dateRange[0].toLocaleDateString()} - {dateRange[1].toLocaleDateString()}
          </span>
          <button
            onClick={resetDateRange}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Clear Selection
          </button>
        </div>
      )}

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      <div ref={containerRef} className="relative w-full">
        <svg ref={svgRef} className="w-full" />

        {/* Tooltip */}
        {tooltipData && (
          <div
            className="absolute z-10 p-3 bg-white border border-gray-300 rounded-lg shadow-lg pointer-events-none"
            style={{
              left: tooltipData.x + 10,
              top: tooltipData.y - 10,
              maxWidth: "200px",
            }}
          >
            {tooltipData.ticker && (
              <p className="font-bold palette.text">{tooltipData.ticker}</p>
            )}
            {tooltipData.data.map((d, i) => (
              <div key={i} className="text-sm">
                <p className="palette.text">{d.date.toLocaleDateString()}</p>
                <p className="palette.text">
                  Value: <span className="font-medium">{d.value?.toFixed(2)}</span>
                </p>
                {d.signal && (
                  <p
                    className="font-medium"
                    style={{
                      color:
                        d.signal === "BUY"
                          ? COLORS.buy
                          : d.signal === "SELL"
                          ? COLORS.sell
                          : COLORS.hold,
                    }}
                  >
                    Signal: {d.signal}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Selected Data Point Display */}
        {selectedDataPoint && activeTab === "momentum" && (
          <div className="absolute top-2 right-2 p-2 bg-white border border-transparent rounded-lg shadow text-xs">
            <p className="palette.text">Selected:</p>
            <p className="font-medium palette.text">
              {selectedDataPoint.date.toLocaleDateString()}
            </p>
            <p className="text-blue-600 font-bold">
              {selectedDataPoint.value?.toFixed(2)}
            </p>
          </div>
        )}
      </div>

      {/* Simplified legend for Simple Mode */}
      {isSimpleMode ? (
        <div className="mt-4 flex gap-4 text-sm palette.text">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span>Going Up (Buy)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span>Going Down (Sell)</span>
          </div>
        </div>
      ) : (
        <div className="mt-4 flex gap-4 text-sm palette.text">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span>BUY (Educational Only)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <span>HOLD (Educational Only)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span>SELL (Educational Only)</span>
          </div>
          <div className="ml-auto text-xs palette.text">
            Click points for details • Drag to zoom • Use brush to select range
          </div>
        </div>
      )}
    </div>
  );
}