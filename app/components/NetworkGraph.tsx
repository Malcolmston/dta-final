"use client";

import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { fetchHistory, StockHistory } from "@/lib/client";
import { TIME_RANGES_EXTENDED } from "@/lib/constants";
import { useColorPalette } from "@/app/context/ColorPaletteContext";
import TickerInput from "./TickerInput";
import HelpPopup from "./HelpPopup";

interface StockDataMap {
  [symbol: string]: StockHistory[];
}

interface Node extends d3.SimulationNodeDatum {
  id: string;
  symbol: string;
  performance: number;
  marketCap?: number;
}

interface Link extends d3.SimulationLinkDatum<Node> {
  source: string | Node;
  target: string | Node;
  correlation: number;
}

const CORRELATION_THRESHOLD = 0.3;

// Custom force factory to keep nodes within bounded area (away from edges and legend)
function forceBoundingBox(nodeArray: Node[], centerX: number, centerY: number, boundsWidth: number, boundsHeight: number) {
  const halfW = boundsWidth / 2;
  const halfH = boundsHeight / 2;
  const minX = centerX - halfW;
  const maxX = centerX + halfW;
  const minY = centerY - halfH;
  const maxY = centerY + halfH;

  return (alpha: number) => {
    for (const node of nodeArray) {
      if (node.x !== undefined && node.y !== undefined && node.vx !== undefined && node.vy !== undefined) {
        // Keep away from legend area (bottom-right corner)
        const legendZoneX = maxX - 100;
        const legendZoneY = maxY - 120;
        if (node.x > legendZoneX && node.y > legendZoneY) {
          node.vx -= (node.x - legendZoneX) * alpha * 0.5;
          node.vy -= (node.y - legendZoneY) * alpha * 0.5;
        }
        // Keep within overall bounds
        if (node.x < minX) node.vx += (minX - node.x) * alpha;
        if (node.x > maxX) node.vx -= (node.x - maxX) * alpha;
        if (node.y < minY) node.vy += (minY - node.y) * alpha;
        if (node.y > maxY) node.vy -= (node.y - maxY) * alpha;
      }
    }
  };
}

export default function NetworkGraph() {
  const { palette } = useColorPalette();
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [tickers, setTickers] = useState("AAPL,GOOGL,MSFT,AMZN,NVDA,META,TSLA,JPM,JNJ,V,PFE,XOM,KO,PEP,WMT,UNH,HD,BAC");
  const [period, setPeriod] = useState("6mo");
  const [stockData, setStockData] = useState<StockDataMap>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [correlationThreshold, setCorrelationThreshold] = useState(CORRELATION_THRESHOLD);
  const [viewMode, setViewMode] = useState<"chart" | "table">("chart");
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  // Get list of all tickers
  const tickerList = Object.keys(stockData);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (tickerList.length === 0) return;

    const currentIdx = selectedNode ? tickerList.indexOf(selectedNode) : 0;

    switch (e.key) {
      case "ArrowRight":
      case "ArrowDown":
        setSelectedNode(tickerList[Math.min(currentIdx + 1, tickerList.length - 1)]);
        break;
      case "ArrowLeft":
      case "ArrowUp":
        setSelectedNode(tickerList[Math.max(currentIdx - 1, 0)]);
        break;
      default:
        return;
    }
    e.preventDefault();
  };

  // Calculate daily returns from stock data
  const calculateReturns = (data: StockHistory[]): number[] => {
    const closes = data.map(d => d.close);
    const returns: number[] = [];
    for (let i = 1; i < closes.length; i++) {
      if (closes[i - 1] !== 0) {
        returns.push((closes[i] - closes[i - 1]) / closes[i - 1]);
      }
    }
    return returns;
  };

  // Calculate Pearson correlation between two return series
  const calculateCorrelation = (returns1: number[], returns2: number[]): number => {
    const minLen = Math.min(returns1.length, returns2.length);
    if (minLen === 0) return 0;

    const r1 = returns1.slice(0, minLen);
    const r2 = returns2.slice(0, minLen);

    const mean1 = r1.reduce((a, b) => a + b, 0) / minLen;
    const mean2 = r2.reduce((a, b) => a + b, 0) / minLen;

    let numerator = 0;
    let sum1Sq = 0;
    let sum2Sq = 0;

    for (let i = 0; i < minLen; i++) {
      const diff1 = r1[i] - mean1;
      const diff2 = r2[i] - mean2;
      numerator += diff1 * diff2;
      sum1Sq += diff1 * diff1;
      sum2Sq += diff2 * diff2;
    }

    const denominator = Math.sqrt(sum1Sq * sum2Sq);
    if (denominator === 0) return 0;

    return numerator / denominator;
  };

  // Calculate correlation matrix for all tickers
  const calculateCorrelationMatrix = (data: StockDataMap): Map<string, number> => {
    const symbols = Object.keys(data);
    const correlations = new Map<string, number>();

    for (let i = 0; i < symbols.length; i++) {
      for (let j = i + 1; j < symbols.length; j++) {
        const sym1 = symbols[i];
        const sym2 = symbols[j];

        const returns1 = calculateReturns(data[sym1]);
        const returns2 = calculateReturns(data[sym2]);

        const corr = calculateCorrelation(returns1, returns2);
        const key = `${sym1}-${sym2}`;
        correlations.set(key, corr);
      }
    }

    return correlations;
  };

  // Calculate performance (percentage change over period)
  const calculatePerformance = (data: StockHistory[]): number => {
    if (!data || data.length < 2) return 0;
    const start = data[0].close;
    const end = data[data.length - 1].close;
    return ((end - start) / start) * 100;
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    const symbols = tickers
      .split(",")
      .map((s) => s.trim().toUpperCase())
      .filter((s) => s.length > 0);

    if (symbols.length < 2) {
      setError("Please enter at least 2 tickers");
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
      if (fetchedSymbols.length < 2) {
        throw new Error("Need at least 2 tickers with valid data");
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

  // D3 force-directed graph rendering
  useEffect(() => {
    if (!svgRef.current || !containerRef.current || Object.keys(stockData).length < 2) {
      return;
    }

    const symbols = Object.keys(stockData);
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = 500;

    // Calculate correlations
    const correlations = calculateCorrelationMatrix(stockData);

    // Create nodes with performance data
    const nodes: Node[] = symbols.map((symbol) => ({
      id: symbol,
      symbol,
      performance: calculatePerformance(stockData[symbol]),
    }));

    // Create links for correlations above threshold
    const links: Link[] = [];
    symbols.forEach((sym1, i) => {
      symbols.slice(i + 1).forEach((sym2) => {
        const key = `${sym1}-${sym2}`;
        const corr = correlations.get(key) || 0;

        if (Math.abs(corr) >= correlationThreshold) {
          links.push({
            source: sym1,
            target: sym2,
            correlation: corr,
          });
        }
      });
    });

    if (links.length === 0) {
      setError(`No correlations above ${correlationThreshold} threshold. Try lowering the threshold.`);
      return;
    }

    // Legend dimensions
    const legendWidth = 160;
    const legendHeight = 100;
    const legendPadding = 20;
    const legendX = width - legendWidth - legendPadding;
    const legendY = height - legendHeight - legendPadding;

    // Clear previous SVG
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    svg.attr("width", width).attr("height", height);

    // Performance range for node sizing
    const performances = nodes.map(n => n.performance);
    const perfMin = Math.min(...performances);
    const perfMax = Math.max(...performances);
    const perfRange = perfMax - perfMin || 1;

    // Scale for node sizes (15-40px radius based on performance)
    const nodeSizeScale = d3.scaleLinear()
      .domain([perfMin, perfMax])
      .range([15, 40]);

    // Scale for link thickness based on correlation strength
    const linkWidthScale = d3.scaleLinear()
      .domain([correlationThreshold, 1])
      .range([1, 6]);

    // Color scale for performance (red to green)
    const perfColorScale = d3.scaleLinear<string>()
      .domain([perfMin, (perfMin + perfMax) / 2, perfMax])
      .range(["#ef4444", "#eab308", "#22c55e"]);

    // Create force simulation with bounded center to avoid legend area
    const centerX = width / 2;
    const centerY = height / 2;
    const simulation = d3.forceSimulation<Node>(nodes)
      .force("link", d3.forceLink<Node, Link>(links).id(d => d.id).distance(150))
      .force("charge", d3.forceManyBody().strength(-400))
      .force("center", d3.forceCenter(centerX, centerY))
      .force("collision", d3.forceCollide().radius((d: any) => nodeSizeScale(d.performance) + 10))
      .force("boundary", forceBoundingBox(nodes, centerX, centerY, width - 80, height - 120));

    // Create container group for zoom
    const g = svg.append("g");

    // Create separate group for legend (not affected by zoom)
    const legendGroup = svg.append("g")
      .attr("class", "legend-group")
      .style("pointer-events", "none");

    // Add zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 3])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    svg.call(zoom);

    // Draw legend in bottom-right corner (in separate group to avoid zoom)
    const legend = legendGroup.append("g")
      .attr("transform", `translate(${legendX}, ${legendY})`);

    // Legend background
    legend.append("rect")
      .attr("width", legendWidth)
      .attr("height", legendHeight)
      .attr("fill", "white")
      .attr("stroke", palette.gridLines)
      .attr("rx", 8)
      .attr("opacity", 0.95);

    // Legend title
    legend.append("text")
      .attr("x", 12)
      .attr("y", 20)
      .attr("font-size", "12px")
      .attr("font-weight", "600")
      .attr("fill", "palette.text")
      .text("Legend");

    // Positive correlation line
    legend.append("line")
      .attr("x1", 12)
      .attr("y1", 40)
      .attr("x2", 32)
      .attr("y2", 40)
      .attr("stroke", "#22c55e")
      .attr("stroke-width", 3);
    legend.append("text")
      .attr("x", 38)
      .attr("y", 44)
      .attr("font-size", "10px")
      .attr("fill", "palette.text")
      .text("Positive correlation");

    // Negative correlation line
    legend.append("line")
      .attr("x1", 12)
      .attr("y1", 58)
      .attr("x2", 32)
      .attr("y2", 58)
      .attr("stroke", "#ef4444")
      .attr("stroke-width", 3);
    legend.append("text")
      .attr("x", 38)
      .attr("y", 62)
      .attr("font-size", "10px")
      .attr("fill", "palette.text")
      .text("Negative correlation");

    // Positive performance node
    legend.append("circle")
      .attr("cx", 22)
      .attr("cy", 80)
      .attr("r", 8)
      .attr("fill", "#22c55e")
      .attr("stroke", "#fff")
      .attr("stroke-width", 1);
    legend.append("text")
      .attr("x", 38)
      .attr("y", 84)
      .attr("font-size", "10px")
      .attr("fill", "palette.text")
      .text("Positive performance");

    // Draw links
    const link = g.append("g")
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke", d => d.correlation >= 0 ? "#22c55e" : "#ef4444")
      .attr("stroke-opacity", 0.6)
      .attr("stroke-width", d => linkWidthScale(Math.abs(d.correlation)));

    // Draw nodes
    const node = g.append("g")
      .selectAll("g")
      .data(nodes)
      .join("g")
      .call(d3.drag<any, Node>()
        .on("start", (event: any, d: Node) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on("drag", (event: any, d: Node) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on("end", (event: any, d: Node) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        })
      );

    // Node circles
    node.append("circle")
      .attr("r", d => nodeSizeScale(d.performance))
      .attr("fill", d => perfColorScale(d.performance))
      .attr("stroke", "#fff")
      .attr("stroke-width", 2)
      .attr("cursor", "grab");

    // Node labels
    node.append("text")
      .text(d => d.symbol)
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .attr("fill", "#fff")
      .attr("font-size", "11px")
      .attr("font-weight", "600")
      .attr("pointer-events", "none");

    // Performance labels below nodes
    node.append("text")
      .text(d => `${d.performance >= 0 ? "+" : ""}${d.performance.toFixed(1)}%`)
      .attr("text-anchor", "middle")
      .attr("dy", d => nodeSizeScale(d.performance) + 14)
      .attr("fill", "palette.text")
      .attr("font-size", "10px")
      .attr("pointer-events", "none");

    // Tooltip
    const tooltip = d3
      .select(container)
      .append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("visibility", "hidden")
      .style("background", palette.background)
      .style("border", `1px solid ${palette.gridLines}`)
      .style("border-radius", "6px")
      .style("padding", "8px 12px")
      .style("font-size", "12px")
      .style("box-shadow", "0 2px 8px rgba(0,0,0,0.15)")
      .style("pointer-events", "none")
      .style("z-index", "10")
      .style("color", palette.text);

    // Node hover
    node.on("mouseover", (event, d) => {
      const connectedLinks = links.filter(
        l => (l.source as Node).id === d.id || (l.target as Node).id === d.id
      );

      const corrInfo = connectedLinks.map(l => {
        const other = (l.source as Node).id === d.id ? (l.target as Node).id : (l.source as Node).id;
        return `${other}: ${l.correlation >= 0 ? "+" : ""}${l.correlation.toFixed(2)}`;
      }).join("<br/>");

      tooltip
        .style("visibility", "visible")
        .style("left", `${event.offsetX + 15}px`)
        .style("top", `${event.offsetY - 10}px`)
        .html(
          `<div style="font-weight: 600; margin-bottom: 4px; color: ${palette.text};">${d.symbol}</div>
           <div style="color: ${palette.text};">Performance: ${d.performance >= 0 ? "+" : ""}${d.performance.toFixed(2)}%</div>
           ${corrInfo ? `<div style="margin-top: 4px; border-top: 1px solid ${palette.gridLines}; padding-top: 4px;"><strong style="color: ${palette.text};">Correlations:</strong><br/>${corrInfo}</div>` : ""}`
        );
    })
    .on("mouseout", () => {
      tooltip.style("visibility", "hidden");
    });

    // Link hover
    link.on("mouseover", (event, d) => {
      const sourceNode = typeof d.source === "object" ? d.source.id : d.source;
      const targetNode = typeof d.target === "object" ? d.target.id : d.target;

      tooltip
        .style("visibility", "visible")
        .style("left", `${event.offsetX + 15}px`)
        .style("top", `${event.offsetY - 10}px`)
        .html(
          `<div style="font-weight: 600;">${sourceNode} ↔ ${targetNode}</div>
           <div>Correlation: <span style="color: ${d.correlation >= 0 ? "#22c55e" : "#ef4444"}">${d.correlation >= 0 ? "+" : ""}${d.correlation.toFixed(2)}</span></div>`
        );
    })
    .on("mouseout", () => {
      tooltip.style("visibility", "hidden");
    });

    // Update positions on tick
    simulation.on("tick", () => {
      link
        .attr("x1", d => (d.source as Node).x!)
        .attr("y1", d => (d.source as Node).y!)
        .attr("x2", d => (d.target as Node).x!)
        .attr("y2", d => (d.target as Node).y!);

      node.attr("transform", d => `translate(${d.x},${d.y})`);
    });

    return () => {
      simulation.stop();
      tooltip.remove();
    };
  }, [stockData, correlationThreshold, palette]);

  return (
    <div className="w-full max-w-5xl mx-auto p-6 rounded-xl shadow-lg relative" style={{ backgroundColor: palette.background, border: `1px solid ${palette.gridLines}` }}>
      <HelpPopup
        title="Stock Network Graph"
        whatItDoes="Shows relationships between stocks based on how similarly they move. Each node is a stock, and lines represent correlation strength and direction."
        whyItMatters="Helps identify stocks that move together (for diversification) or opposite (for hedging). Understanding correlations improves portfolio risk management."
        whoItMattersFor="Traders and investors building diversified portfolios or looking for hedging opportunities."
        howToRead="Nodes = stocks, Lines = correlations. Green lines = positive correlation (move together), Red lines = negative correlation (move opposite). Thicker lines = stronger correlation. Drag nodes to rearrange."
      />
      <h2 className="text-2xl font-bold mb-6" style={{ color: palette.text }}>Stock Correlation Network</h2>

      <div className="mb-6 p-4 rounded-lg border" style={{ backgroundColor: palette.background, borderColor: palette.gridLines }}>
        <p className="text-sm" style={{ color: palette.text, opacity: 0.8 }}>
          <strong>What is this?</strong> Each node (circle) represents a stock. Lines connecting them show how correlated the stocks are.
          A <span style={{ color: palette.positive, fontWeight: 500 }}>green line</span> means stocks move together, while a <span style={{ color: palette.negative, fontWeight: 500, marginLeft: 8 }}>red line</span> means they move opposite.
        </p>
      </div>

      <div className="flex flex-wrap gap-4 mb-4">
        <div className="flex-1 min-w-[250px]">
          <label className="block text-sm font-medium palette.text mb-2">
            Enter Ticker Symbols
          </label>
          <TickerInput
            value={tickers}
            onChange={setTickers}
            onSubmit={fetchData}
            placeholder="Type ticker and press Enter"
            defaultTickers={["AAPL", "GOOGL", "MSFT", "AMZN", "NVDA", "META", "TSLA", "JPM"]}
          />
        </div>
        <div className="w-full sm:w-auto">
          <label className="block text-sm font-medium palette.text mb-2">
            Correlation Threshold
          </label>
          <input
            type="number"
            min="0"
            max="1"
            step="0.1"
            value={correlationThreshold}
            onChange={(e) => setCorrelationThreshold(Math.min(1, Math.max(0, parseFloat(e.target.value) || 0)))}
            className="w-full sm:w-24 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
          />
        </div>
        <div className="flex items-end">
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {TIME_RANGES_EXTENDED.map((range) => (
          <button
            key={range.value}
            onClick={() => setPeriod(range.value)}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition focus:ring-2 focus:ring-blue-500 focus:outline-none ${
              period === range.value
                ? "bg-blue-600 text-white"
                : "bg-transparent palette.text hover:bg-gray-200"
            }`}
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
        Use arrow keys to navigate between nodes. Press Enter to select.
      </p>

      {viewMode === "chart" ? (
        <div ref={containerRef} tabIndex={0} onKeyDown={handleKeyDown} className="relative w-full outline-none" style={{ minHeight: "500px" }}>
          <svg ref={svgRef} className="w-full" role="img" aria-label="Stock correlation network graph" />
        </div>
      ) : (
        <div className="overflow-x-auto" tabIndex={0} onKeyDown={handleKeyDown}>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr>
                <th className="p-2 text-left font-medium palette.text border-b">Symbol</th>
                <th className="p-2 text-right font-medium palette.text border-b">Performance</th>
                <th className="p-2 text-center font-medium palette.text border-b">Correlations</th>
              </tr>
            </thead>
            <tbody>
              {tickerList.map((ticker) => {
                const perf = stockData[ticker]?.length ? ((stockData[ticker][stockData[ticker].length - 1].close - stockData[ticker][0].close) / stockData[ticker][0].close * 100) : 0;
                const correlations = tickerList.filter(t => t !== ticker).length;

                return (
                  <tr
                    key={ticker}
                    className={selectedNode === ticker ? "bg-blue-50" : ""}
                    tabIndex={0}
                    onClick={() => setSelectedNode(ticker)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") setSelectedNode(ticker);
                    }}
                  >
                    <td className={`p-2 font-medium border-b ${selectedNode === ticker ? "ring-2 ring-blue-500" : ""}`}>
                      {ticker}
                    </td>
                    <td className={`p-2 text-right border-b ${perf >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {perf >= 0 ? "+" : ""}{perf.toFixed(2)}%
                    </td>
                    <td className="p-2 text-center border-b palette.text">
                      {correlations} stocks
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-6 text-sm palette.text">
        <div className="flex items-center gap-2">
          <div className="w-4 h-1 bg-green-500 rounded"></div>
          <span>Positive Correlation</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-1 bg-red-500 rounded"></div>
          <span>Negative Correlation</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-green-500"></div>
          <span>Positive Performance</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-red-500"></div>
          <span>Negative Performance</span>
        </div>
      </div>

      <p className="mt-4 text-sm palette.text">
        Drag nodes to rearrange. Scroll to zoom. Hover over nodes/edges for details.
      </p>
    </div>
  );
}