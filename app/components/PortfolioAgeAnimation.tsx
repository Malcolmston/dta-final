"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import * as d3 from "d3";

interface PortfolioData {
  id: string;
  age: number;
  basePortfolio: {
    stocks: number;
    cds: number;
    bonds: number;
    crypto: number;
  };
  totalValue: number;
}

// Animation and age constants
const ANIMATION_CYCLE_DURATION_MS = 12000;
const MIN_AGE = 20;
const MAX_AGE = 70;

type AssetType = "stocks" | "bonds" | "cds" | "crypto";

// Group configuration with positions
const GROUP_CONFIG: Record<AssetType, { x: number; y: number; color: string; label: string }> = {
  stocks: { x: 0.25, y: 0.25, color: "#3b82f6", label: "Stocks" },
  crypto: { x: 0.75, y: 0.25, color: "#f97316", label: "Crypto" },
  bonds: { x: 0.25, y: 0.75, color: "#22c55e", label: "Bonds" },
  cds: { x: 0.75, y: 0.75, color: "#8b5cf6", label: "CDs" },
};

// Generate portfolio allocation based on age
function getPortfolioForAge(baseAge: number, targetAge: number): { stocks: number; cds: number; bonds: number; crypto: number } {
  const youngFactor = (MAX_AGE - targetAge) / (MAX_AGE - MIN_AGE);
  const oldFactor = targetAge / MAX_AGE;

  let stocks = 30 + youngFactor * 40 + Math.random() * 15;
  let bonds = 10 + oldFactor * 50 + Math.random() * 15;
  let cds = 5 + oldFactor * 30 + Math.random() * 10;
  let crypto = Math.max(0, youngFactor * 25 + Math.random() * 10 - 5);

  const total = stocks + bonds + cds + crypto;
  stocks = (stocks / total) * 100;
  bonds = (bonds / total) * 100;
  cds = (cds / total) * 100;
  crypto = (crypto / total) * 100;

  return { stocks, bonds, cds, crypto };
}

// Generate mock data for ~300 people
function generateMockData(count: number = 300): PortfolioData[] {
  const data: PortfolioData[] = [];

  for (let i = 0; i < count; i++) {
    const baseAge = Math.floor(Math.random() * 51) + 20;
    const basePortfolio = getPortfolioForAge(baseAge, baseAge);
    const totalValue = 10000 + Math.random() * 500000 + baseAge * 5000;

    data.push({
      id: `person-${i}`,
      age: baseAge,
      basePortfolio,
      totalValue,
    });
  }

  return data;
}

// Age-based color scale: Age 20 = Cyan (#06b6d4), Age 70 = Pink (#ec4899)
function getAgeColor(age: number): string {
  const ageScale = d3.scaleLinear<string>()
    .domain([MIN_AGE, MAX_AGE])
    .range(["#06b6d4", "#ec4899"])
    .clamp(true);
  return ageScale(age);
}

// Get the dominant asset type (highest allocation)
function getDominantAsset(portfolio: { stocks: number; bonds: number; cds: number; crypto: number }): AssetType {
  const { stocks, bonds, cds, crypto } = portfolio;
  const max = Math.max(stocks, bonds, cds, crypto);

  if (max === stocks) return "stocks";
  if (max === bonds) return "bonds";
  if (max === cds) return "cds";
  return "crypto";
}

export default function PortfolioAgeAnimation() {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const [data] = useState<PortfolioData[]>(() => generateMockData(300));
  const [currentAge, setCurrentAge] = useState(20);
  const [selectedPoint, setSelectedPoint] = useState<PortfolioData | null>(null);
  const [isAnimating, setIsAnimating] = useState(true);
  const animationRef = useRef<number | undefined>(undefined);

  // Pre-generate random seeds for consistent dot positioning within groups
  const dotSeeds = useMemo(() => {
    return data.map((person) => ({
      id: person.id,
      randomAngle: Math.random() * Math.PI * 2,
      randomRadius: Math.random(),
    }));
  }, [data]);

  // Track the previous dominant asset for each dot to detect group changes
  const prevDominantRef = useRef<Record<string, AssetType>>({});

  // Calculate portfolio for a specific age with deterministic randomness
  const getPersonPortfolio = (person: PortfolioData, age: number) => {
    const youngFactor = (70 - age) / 50;
    const oldFactor = age / 70;

    // Use person id hash for deterministic randomness
    const hash = person.id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const seededRandom = (factor: number) => {
      const seed = (hash * factor) % 100 / 100;
      return seed * 15;
    };

    let stocks = 30 + youngFactor * 40 + seededRandom(1);
    let bonds = 10 + oldFactor * 50 + seededRandom(2);
    let cds = 5 + oldFactor * 30 + seededRandom(3);
    let crypto = Math.max(0, youngFactor * 25 + seededRandom(4) - 5);

    const total = stocks + bonds + cds + crypto;
    stocks = (stocks / total) * 100;
    bonds = (bonds / total) * 100;
    cds = (cds / total) * 100;
    crypto = (crypto / total) * 100;

    return { stocks, bonds, cds, crypto };
  };

  // Calculate position based on DOMINANT asset group (discrete positions)
  const calculateGroupPosition = (
    portfolio: { stocks: number; bonds: number; cds: number; crypto: number },
    width: number,
    height: number,
    seed: { randomAngle: number; randomRadius: number }
  ): { x: number; y: number; dominant: AssetType } => {
    const margin = 120;
    const usableWidth = width - margin * 2;
    const usableHeight = height - margin * 2;

    const dominant = getDominantAsset(portfolio);
    const group = GROUP_CONFIG[dominant];

    // Calculate the center of the dominant group
    const centerX = margin + usableWidth * group.x;
    const centerY = margin + usableHeight * group.y;

    // Spread dots around the group center (not too tightly clustered)
    const maxSpread = Math.min(usableWidth, usableHeight) * 0.18;
    const radius = maxSpread * Math.sqrt(seed.randomRadius);

    let x = centerX + Math.cos(seed.randomAngle) * radius;
    let y = centerY + Math.sin(seed.randomAngle) * radius;

    // Clamp to bounds
    x = Math.max(margin + 25, Math.min(width - margin - 25, x));
    y = Math.max(margin + 25, Math.min(height - margin - 25, y));

    return { x, y, dominant };
  };

  // Animation effect - continuous cycling through ages 20-70
  useEffect(() => {
    if (!isAnimating) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      return;
    }

    let startTime: number;
    const duration = ANIMATION_CYCLE_DURATION_MS;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;

      const cyclePosition = (elapsed % duration) / duration;
      const newAge = 20 + cyclePosition * 50;

      setCurrentAge(Math.round(newAge));

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isAnimating]);

  // D3 rendering with smooth transitions between groups
  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = 550;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    svg.attr("width", width).attr("height", height);

    // Draw group background areas (visible group regions)
    const groupAreas = svg.append("g").attr("class", "group-areas");

    const margin = 120;
    const usableWidth = width - margin * 2;
    const usableHeight = height - margin * 2;
    const groupRadius = Math.min(usableWidth, usableHeight) * 0.22;

    (Object.keys(GROUP_CONFIG) as AssetType[]).forEach((asset) => {
      const group = GROUP_CONFIG[asset];
      const centerX = margin + usableWidth * group.x;
      const centerY = margin + usableHeight * group.y;

      // Draw subtle background circle for each group
      groupAreas
        .append("circle")
        .attr("cx", centerX)
        .attr("cy", centerY)
        .attr("r", groupRadius)
        .attr("fill", group.color)
        .attr("opacity", 0.08);

      // Draw group label
      groupAreas
        .append("text")
        .attr("x", centerX)
        .attr("y", centerY - groupRadius - 15)
        .attr("text-anchor", "middle")
        .attr("font-size", "14px")
        .attr("font-weight", "600")
        .attr("fill", group.color)
        .text(group.label);

      // Add allocation percentage text below
      groupAreas
        .append("text")
        .attr("x", centerX)
        .attr("y", centerY + groupRadius + 20)
        .attr("text-anchor", "middle")
        .attr("font-size", "12px")
        .attr("fill", "#6b7280")
        .attr("class", `allocation-${asset}`)
        .text(`${asset.charAt(0).toUpperCase() + asset.slice(1)}`);
    });

    // Calculate positions for all dots based on current age
    const displayData = data.map((person, idx) => {
      const portfolio = getPersonPortfolio(person, currentAge);
      const seed = dotSeeds[idx];
      const pos = calculateGroupPosition(portfolio, width, height, seed);

      return {
        ...person,
        x: pos.x,
        y: pos.y,
        portfolio,
        dominant: pos.dominant,
      };
    });

    // Create a group for all dots
    const dotsGroup = svg.append("g").attr("class", "dots-group");

    // Create dots with age-based coloring
    const dots = dotsGroup
      .selectAll<SVGCircleElement, typeof displayData[0]>("circle.dot")
      .data(displayData, (d) => d.id);

    // Enter: create new dots
    const dotsEnter = dots
      .enter()
      .append("circle")
      .attr("class", "dot")
      .attr("r", 0)
      .attr("fill", (d) => getAgeColor(d.age))
      .attr("opacity", 0.7)
      .attr("cx", (d) => d.x)
      .attr("cy", (d) => d.y)
      .style("cursor", "pointer");

    // Update: animate to new positions with smooth transitions
    // When moving to a different group, use longer transition
    const dotsUpdate = dotsEnter.merge(dots as any);

    dotsUpdate.each(function (d: any) {
      const prevDominant = prevDominantRef.current[d.id];
      const isGroupChange = prevDominant && prevDominant !== d.dominant;

      d3.select(this)
        .transition()
        .duration(isGroupChange ? 600 : 300)
        .ease(isGroupChange ? d3.easeCubicInOut : d3.easeQuadOut)
        .attr("cx", d.x)
        .attr("cy", d.y)
        .attr("fill", getAgeColor(d.age))
        .attr("r", 5);
    });

    // Update previous dominant for next render
    displayData.forEach((d) => {
      prevDominantRef.current[d.id] = d.dominant;
    });

    // Add hover interactions
    dotsUpdate
      .on("mouseover", function (event, d: any) {
        d3.select(this)
          .transition()
          .duration(100)
          .attr("r", 9)
          .attr("opacity", 1)
          .attr("stroke", "#fff")
          .attr("stroke-width", 2);

        if (tooltipRef.current) {
          const tooltip = tooltipRef.current;
          tooltip.style.visibility = "visible";
          const assetColors: Record<string, string> = {
            stocks: "#3b82f6",
            cds: "#8b5cf6",
            bonds: "#22c55e",
            crypto: "#f97316",
          };
          const dominant = getDominantAsset(d.portfolio);
          tooltip.innerHTML = `
            <div style="font-weight: 600; margin-bottom: 4px;">Age: ${d.age}</div>
            <div style="font-size: 11px; color: #6b7280; margin-bottom: 4px;">
              Stocks: <span style="color: ${assetColors.stocks}">${d.portfolio.stocks.toFixed(1)}%</span> |
              Bonds: <span style="color: ${assetColors.bonds}">${d.portfolio.bonds.toFixed(1)}%</span> |
              CDs: <span style="color: ${assetColors.cds}">${d.portfolio.cds.toFixed(1)}%</span> |
              Crypto: <span style="color: ${assetColors.crypto}">${d.portfolio.crypto.toFixed(1)}%</span>
            </div>
            <div style="font-size: 11px; color: #6b7280;">
              Dominant: <strong style="color: ${GROUP_CONFIG[dominant].color}">${GROUP_CONFIG[dominant].label}</strong>
            </div>
            <div style="font-size: 11px; color: #6b7280;">
              Total: $${d.totalValue.toLocaleString()}
            </div>
          `;
        }
      })
      .on("mousemove", (event) => {
        if (tooltipRef.current) {
          tooltipRef.current.style.left = `${event.offsetX + 15}px`;
          tooltipRef.current.style.top = `${event.offsetY - 10}px`;
        }
      })
      .on("mouseout", function () {
        d3.select(this)
          .transition()
          .duration(100)
          .attr("r", 5)
          .attr("opacity", 0.7)
          .attr("stroke", "none");

        if (tooltipRef.current) {
          tooltipRef.current.style.visibility = "hidden";
        }
      })
      .on("click", (_, d: any) => {
        setSelectedPoint(d);
      });

    // Exit: fade out removed dots
    dots
      .exit()
      .transition()
      .duration(300)
      .attr("r", 0)
      .remove();
  }, [data, currentAge, dotSeeds]);

  return (
    <div className="w-full max-w-5xl mx-auto p-6 bg-white rounded-xl shadow-lg">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold palette.text">Portfolio Allocation by Age</h2>
          <p className="text-sm palette.text mt-1">
            Watch how portfolio allocations shift as people age
          </p>
        </div>
        <div className="flex items-center gap-3 mt-4 sm:mt-0">
          <button
            onClick={() => setIsAnimating(!isAnimating)}
            className="px-4 py-2 bg-transparent palette.text font-medium rounded-lg hover:bg-gray-200 transition flex items-center gap-2"
          >
            {isAnimating ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            {isAnimating ? "Pause" : "Play"}
          </button>
        </div>
      </div>

      {/* Age Indicator with Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium palette.text">Age</span>
            <span className="text-3xl font-bold palette.text">{currentAge}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs palette.text">20</span>
            <div className="relative w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="absolute top-0 left-0 h-full rounded-full transition-all duration-300 ease-out"
                style={{
                  width: `${((currentAge - 20) / 50) * 100}%`,
                  backgroundColor: getAgeColor(currentAge),
                }}
              />
            </div>
            <span className="text-xs palette.text">70</span>
          </div>
        </div>

        {/* Manual Slider */}
        <input
          type="range"
          min="20"
          max="70"
          value={currentAge}
          onChange={(e) => {
            setIsAnimating(false);
            setCurrentAge(Number(e.target.value));
          }}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #06b6d4 0%, #ec4899 100%)`,
          }}
        />
      </div>

      {/* Color Legend */}
      <div className="flex items-center justify-center gap-6 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#06b6d4" }} />
          <span className="text-xs palette.text">Age 20 (Young)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#ec4899" }} />
          <span className="text-xs palette.text">Age 70 (Older)</span>
        </div>
      </div>

      {/* Chart Container */}
      <div ref={containerRef} className="relative w-full">
        <svg ref={svgRef} className="w-full" style={{ minHeight: "550px" }} />

        {/* Tooltip */}
        <div
          ref={tooltipRef}
          className="absolute bg-white border border-transparent rounded-lg px-3 py-2 shadow-lg text-xs pointer-events-none z-10"
          style={{ visibility: "hidden" }}
        />
      </div>

      {/* Selected Point Details */}
      {selectedPoint && (
        <div className="mt-4 p-4 bg-transparent rounded-lg border border-transparent">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold palette.text">Selected Portfolio</h3>
              <p className="text-sm palette.text">Age: {selectedPoint.age}</p>
            </div>
            <button
              onClick={() => setSelectedPoint(null)}
              className="palette.text hover:palette.text"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          {(() => {
            const portfolio = getPersonPortfolio(selectedPoint, currentAge);
            const dominant = getDominantAsset(portfolio);
            return (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-3">
                <div>
                  <div className="text-xs palette.text">Stocks</div>
                  <div className="text-lg font-semibold" style={{ color: "#3b82f6" }}>
                    {portfolio.stocks.toFixed(1)}%
                  </div>
                </div>
                <div>
                  <div className="text-xs palette.text">CDs</div>
                  <div className="text-lg font-semibold" style={{ color: "#8b5cf6" }}>
                    {portfolio.cds.toFixed(1)}%
                  </div>
                </div>
                <div>
                  <div className="text-xs palette.text">Bonds</div>
                  <div className="text-lg font-semibold" style={{ color: "#22c55e" }}>
                    {portfolio.bonds.toFixed(1)}%
                  </div>
                </div>
                <div>
                  <div className="text-xs palette.text">Crypto</div>
                  <div className="text-lg font-semibold" style={{ color: "#f97316" }}>
                    {portfolio.crypto.toFixed(1)}%
                  </div>
                </div>
              </div>
            );
          })()}
          <div className="mt-3 pt-3 border-t border-transparent">
            <span className="text-sm palette.text">Total Value: </span>
            <span className="text-sm font-semibold palette.text">
              ${selectedPoint.totalValue.toLocaleString()}
            </span>
          </div>
        </div>
      )}

      {/* Description */}
      <div className="mt-4 text-sm palette.text">
        <p>
          Each dot represents one person. Dots are colored by age: cyan (young) to pink (older).
          Dots cluster in group areas based on their dominant allocation (highest %). As age increases,
          dots fly between group areas when their dominant allocation shifts from growth-oriented
          (Stocks, Crypto) to income-focused (Bonds, CDs). Watch the animation to see dots
          &quot;switch teams&quot; in real-time.
        </p>
      </div>
    </div>
  );
}