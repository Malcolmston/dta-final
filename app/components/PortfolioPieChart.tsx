"use client";

import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { fetchHistory, StockHistory } from "@/lib/client";
import { useColorPalette } from "../context/ColorPaletteContext";
import TickerInput from "./TickerInput";

interface PortfolioCategory {
  category: string;
  value: number;
  percentage: number;
  color: string;
}

interface PortfolioData {
  stocks: number;
  cds: number;
  bonds: number;
  crypto: number;
}

// Default mock portfolio data for fallback
const DEFAULT_PORTFOLIO: PortfolioData = {
  stocks: 45,
  cds: 20,
  bonds: 25,
  crypto: 10,
};

// Mock tickers that map to categories for demonstration
const STOCK_TICKERS = ["AAPL", "GOOGL", "MSFT", "AMZN", "NVDA", "META", "TSLA", "BRK.B"];
const CD_TICKERS = ["CD1Y", "CD2Y", "CD3Y"]; // Simulated CD symbols
const BOND_TICKERS = ["TLT", "IEF", "AGG", "BND"]; // Bond ETFs
const CRYPTO_TICKERS = ["BTC", "ETH", "SOL", "XRP"]; // Crypto symbols

export default function PortfolioPieChart() {
  const { palette } = useColorPalette();
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Use palette colors for categories (colorblind-safe options)
  const CATEGORY_COLORS: Record<string, string> = {
    Stocks: palette.primary,
    CDs: palette.secondary,
    Bonds: palette.positive,
    Crypto: palette.negative,
  };

  const [ticker, setTicker] = useState("AAPL");
  const [portfolioData, setPortfolioData] = useState<PortfolioCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  // Generate portfolio data based on ticker or use fallback
  const generatePortfolio = async () => {
    setLoading(true);
    setError(null);

    try {
      // Try to fetch historical data for the given ticker
      const upperTicker = ticker.toUpperCase().trim();

      if (STOCK_TICKERS.includes(upperTicker)) {
        // For stocks, create a realistic portfolio allocation
        const history = await fetchHistory(upperTicker, "1mo", "1d");
        const hasData = history && history.length > 0;

        if (hasData) {
          // Generate realistic portfolio based on the ticker type
          const portfolio = generateMockPortfolio(upperTicker);
          setPortfolioData(portfolio);
        } else {
          throw new Error("No data available");
        }
      } else if (BOND_TICKERS.includes(upperTicker)) {
        // For bond ETFs, show bond-heavy portfolio
        setPortfolioData([
          { category: "Stocks", value: 20, percentage: 20, color: CATEGORY_COLORS.Stocks },
          { category: "CDs", value: 15, percentage: 15, color: CATEGORY_COLORS.CDs },
          { category: "Bonds", value: 55, percentage: 55, color: CATEGORY_COLORS.Bonds },
          { category: "Crypto", value: 10, percentage: 10, color: CATEGORY_COLORS.Crypto },
        ]);
      } else if (CRYPTO_TICKERS.includes(upperTicker)) {
        // For crypto, show crypto-heavy portfolio
        setPortfolioData([
          { category: "Stocks", value: 25, percentage: 25, color: CATEGORY_COLORS.Stocks },
          { category: "CDs", value: 10, percentage: 10, color: CATEGORY_COLORS.CDs },
          { category: "Bonds", value: 15, percentage: 15, color: CATEGORY_COLORS.Bonds },
          { category: "Crypto", value: 50, percentage: 50, color: CATEGORY_COLORS.Crypto },
        ]);
      } else {
        // Unknown ticker - use default portfolio with some variation
        const portfolio = generateMockPortfolio(upperTicker);
        setPortfolioData(portfolio);
      }
    } catch (err) {
      console.error("Failed to fetch data, using fallback:", err);
      // Use realistic mock data as fallback
      const portfolio = generateMockPortfolio(ticker);
      setPortfolioData(portfolio);
    } finally {
      setLoading(false);
    }
  };

  // Generate realistic mock portfolio based on ticker seed
  const generateMockPortfolio = (tickerStr: string): PortfolioCategory[] => {
    // Use ticker string to create consistent but varied allocation
    const seed = tickerStr.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const random = (seed % 100) / 100;

    // Create slight variations based on ticker
    let stocks = 35 + Math.floor(random * 25);
    let cds = 15 + Math.floor((seed % 20));
    let bonds = 20 + Math.floor((seed % 15));
    let crypto = Math.max(5, 30 - stocks - cds - bonds + Math.floor(random * 10));

    // Normalize to 100%
    const total = stocks + cds + bonds + crypto;
    stocks = Math.round((stocks / total) * 100);
    cds = Math.round((cds / total) * 100);
    bonds = Math.round((bonds / total) * 100);
    crypto = 100 - stocks - cds - bonds;

    return [
      { category: "Stocks", value: stocks, percentage: stocks, color: CATEGORY_COLORS.Stocks },
      { category: "CDs", value: cds, percentage: cds, color: CATEGORY_COLORS.CDs },
      { category: "Bonds", value: bonds, percentage: bonds, color: CATEGORY_COLORS.Bonds },
      { category: "Crypto", value: crypto, percentage: crypto, color: CATEGORY_COLORS.Crypto },
    ];
  };

  // Initial load
  useEffect(() => {
    generatePortfolio();
  }, []);

  // D3 pie chart rendering with animations
  useEffect(() => {
    if (!svgRef.current || !containerRef.current || portfolioData.length === 0) {
      return;
    }

    const container = containerRef.current;
    const containerWidth = container.clientWidth;
    const size = Math.min(containerWidth, 400);
    const width = size;
    const height = size;
    const radius = Math.min(width, height) / 2 - 40;
    const innerRadius = radius * 0.45; // For donut style

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    svg.attr("width", width).attr("height", height);

    const g = svg
      .append("g")
      .attr("transform", `translate(${width / 2},${height / 2})`);

    // Create pie generator
    const pie = d3
      .pie<PortfolioCategory>()
      .value((d) => d.value)
      .sort(null)
      .padAngle(0.02);

    // Create arc generator
    const arc = d3
      .arc<d3.PieArcDatum<PortfolioCategory>>()
      .innerRadius(innerRadius)
      .outerRadius(radius)
      .cornerRadius(4);

    // Create arc for hover/selected state
    const arcHover = d3
      .arc<d3.PieArcDatum<PortfolioCategory>>()
      .innerRadius(innerRadius)
      .outerRadius(radius + 12)
      .cornerRadius(4);

    // Create arc for hover/selected state (outer)
    const arcOuter = d3
      .arc<d3.PieArcDatum<PortfolioCategory>>()
      .innerRadius(radius + 4)
      .outerRadius(radius + 16)
      .cornerRadius(4);

    // Create the pie data
    const pieData = pie(portfolioData);

    // Draw the pie slices with animation
    const slices = g
      .selectAll(".slice")
      .data(pieData)
      .enter()
      .append("g")
      .attr("class", "slice");

    // Add the paths with initial animation
    slices
      .append("path")
      .attr("fill", (d) => d.data.color)
      .attr("stroke", "white")
      .attr("stroke-width", 2)
      .style("cursor", "pointer")
      .style("transition", "opacity 0.2s ease")
      .attr("d", arc as any)
      .each(function (d) {
        // Store initial angles for animation
        (this as any)._current = { startAngle: 0, endAngle: 0 };
      })
      .transition()
      .duration(800)
      .ease(d3.easeCubicOut)
      .attrTween("d", function (d) {
        const interpolate = d3.interpolate(
          { startAngle: d.startAngle, endAngle: d.startAngle },
          { startAngle: d.startAngle, endAngle: d.endAngle }
        );
        return function (t) {
          const interpolated = interpolate(t);
          return arc({ ...d, ...interpolated }) || "";
        };
      });

    // Add interactivity after animation
    setTimeout(() => {
      slices
        .selectAll("path")
        .on("mouseover", function (event, d: any) {
          const category = d.data.category;
          setHoveredCategory(category);

          d3.select(this)
            .transition()
            .duration(200)
            .attr("d", arcHover as any)
            .style("filter", "drop-shadow(0 4px 8px rgba(0,0,0,0.2))");
        })
        .on("mouseout", function (event, d) {
          setHoveredCategory(null);

          d3.select(this)
            .transition()
            .duration(200)
            .attr("d", arc as any)
            .style("filter", "none");
        })
        .on("click", function (event, d: any) {
          const category = d.data.category;
          setSelectedCategory((prev) => (prev === category ? null : category));
        });
    }, 800);

    // Add center text for total
    const total = portfolioData.reduce((sum, d) => sum + d.value, 0);

    g.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "-0.2em")
      .attr("fill", "#374151")
      .attr("font-size", "14px")
      .attr("font-weight", "600")
      .text("Total");

    g.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "1em")
      .attr("fill", "#374151")
      .attr("font-size", "24px")
      .attr("font-weight", "bold")
      .text(`${total}%`);

    // Add tooltips
    const tooltip = d3
      .select(container)
      .append("div")
      .attr("class", "pie-tooltip")
      .style("position", "absolute")
      .style("visibility", "hidden")
      .style("background", "white")
      .style("border", "1px solid #e5e7eb")
      .style("border-radius", "8px")
      .style("padding", "12px 16px")
      .style("font-size", "13px")
      .style("box-shadow", "0 4px 12px rgba(0,0,0,0.15)")
      .style("pointer-events", "none")
      .style("z-index", "10");

    slices
      .append("path")
      .attr("fill", "transparent")
      .style("cursor", "pointer")
      .attr("d", arc as any)
      .on("mouseover", (event, d) => {
        tooltip
          .style("visibility", "visible")
          .html(
            `<div style="font-weight: 600; font-size: 14px; margin-bottom: 4px; color: ${d.data.color}">
              ${d.data.category}
            </div>
            <div style="color: #374151;">
              Allocation: <span style="font-weight: 600;">${d.data.percentage}%</span>
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

    return () => {
      tooltip.remove();
    };
  }, [portfolioData, selectedCategory, hoveredCategory, palette]);

  return (
    <div className="w-full max-w-4xl mx-auto p-6 rounded-xl shadow-lg" style={{ backgroundColor: palette.background, border: `1px solid ${palette.gridLines}` }}>
      <h2 className="text-2xl font-bold mb-2" style={{ color: palette.text }}>Portfolio Allocation</h2>

      <div className="mb-6 p-4 rounded-lg border" style={{ backgroundColor: palette.background, borderColor: palette.gridLines }}>
        <p className="text-sm" style={{ color: palette.text }}>
          <strong>What this chart shows:</strong> This pie chart displays the allocation of a hypothetical investment portfolio across four asset categories.
          <span style={{ color: palette.primary }}> Stocks</span> represent equity investments in companies.
          <span style={{ color: palette.secondary }}> CDs</span> (Certificates of Deposit) are low-risk savings instruments.
          <span style={{ color: palette.positive }}> Bonds</span> are fixed-income securities.
          <span style={{ color: palette.accent }}> Crypto</span> represents digital currency investments.
          Enter a ticker symbol to see different portfolio allocations based on investment focus.
        </p>
      </div>

      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium mb-2" style={{ color: palette.text }}>
            Enter Ticker Symbol
          </label>
          <TickerInput
            value={ticker}
            onChange={setTicker}
            onSubmit={generatePortfolio}
            placeholder="Type ticker and press Enter"
            maxPills={1}
          />
        </div>
        <div className="flex items-end">
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 rounded-lg border" style={{ backgroundColor: palette.negative + "15", borderColor: palette.negative, color: palette.negative }}>
          {error}
        </div>
      )}

      <div className="flex flex-col md:flex-row items-center justify-center gap-8">
        <div ref={containerRef} className="relative flex-shrink-0">
          <svg ref={svgRef} className="w-full" style={{ maxWidth: "400px", minHeight: "300px" }} />
        </div>

        {/* Legend */}
        <div className="flex flex-col gap-3">
          {portfolioData.map((item) => (
            <div
              key={item.category}
              className={`flex items-center gap-3 p-3 rounded-lg transition cursor-pointer ${
                selectedCategory === item.category
                  ? "bg-gray-100 ring-2 ring-blue-500"
                  : "hover:bg-gray-50"
              }`}
              onClick={() =>
                setSelectedCategory((prev) =>
                  prev === item.category ? null : item.category
                )
              }
            >
              <div
                className="w-4 h-4 rounded-full flex-shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-800">{item.category}</div>
              </div>
              <div className="text-sm font-bold text-gray-700">
                {item.percentage}%
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Selected category details */}
      {selectedCategory && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Selected:</strong>{" "}
            {portfolioData.find((p) => p.category === selectedCategory)?.category} -{" "}
            {portfolioData.find((p) => p.category === selectedCategory)?.percentage}% of portfolio.
            {selectedCategory === "Stocks" &&
              " Equities offer growth potential but with higher volatility."}
            {selectedCategory === "CDs" &&
              " Certificates of Deposit provide stable, low-risk returns."}
            {selectedCategory === "Bonds" &&
              " Fixed-income securities offer steady income with moderate risk."}
            {selectedCategory === "Crypto" &&
              " Digital assets offer high growth potential with significant risk."}
          </p>
        </div>
      )}

      <p className="mt-6 text-sm text-gray-500 text-center">
        Click on a segment or legend item to select a category. Hover over segments for details.
        Data is simulated for demonstration purposes.
      </p>
    </div>
  );
}