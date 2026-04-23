"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import * as d3 from "d3";
import TickerInput from "./TickerInput";

interface SectorData {
  name: string;
  value: number;
  color: string;
}

function generateSectorData(ticker: string): SectorData[] {
  const sectors = [
    { name: "Technology", base: 0.28 },
    { name: "Healthcare", base: 0.15 },
    { name: "Financial", base: 0.12 },
    { name: "Consumer", base: 0.18 },
    { name: "Industrial", base: 0.10 },
    { name: "Energy", base: 0.08 },
    { name: "Utilities", base: 0.05 },
    { name: "Materials", base: 0.04 },
  ];

  const colors = ["#6366f1", "#ec4899", "#14b8a6", "#f59e0b", "#8b5cf6", "#06b6d4", "#84cc16", "#f43f5e"];

  return sectors.map((sector, i) => {
    const variance = (Math.random() - 0.5) * 0.1;
    return {
      name: sector.name,
      value: Math.max(0.02, sector.base + variance),
      color: colors[i % colors.length],
    };
  });
}

export default function Treemap3DBoxes({ ticker: initialTicker = "AAPL" }: { ticker?: string }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [ticker, setTicker] = useState(initialTicker);
  const [sectorData, setSectorData] = useState<SectorData[]>([]);
  const [loading, setLoading] = useState(false);

  const generateData = useCallback(async () => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    const data = generateSectorData(ticker);
    setSectorData(data);
    setLoading(false);
  }, [ticker]);

  useEffect(() => {
    generateData();
  }, [generateData]);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || sectorData.length === 0) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = 400;
    const margin = { top: 20, right: 20, bottom: 20, left: 20 };

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    svg.attr("width", width).attr("height", height);

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const root = d3
      .hierarchy({ children: sectorData } as any)
      .sum((d: any) => d.value)
      .sort((a, b) => (b.value || 0) - (a.value || 0));

    const treemap = d3.treemap<any>().size([innerWidth, innerHeight]).padding(2).round(true);
    treemap(root as any);

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    // Draw treemap cells
    (root as any).leaves().forEach((leaf: any) => {
      const data = leaf.data;
      const x0 = leaf.x0;
      const y0 = leaf.y0;
      const x1 = leaf.x1;
      const y1 = leaf.y1;
      const boxWidth = x1 - x0;
      const boxHeight = y1 - y0;

      if (boxWidth < 20 || boxHeight < 15) return;

      // Cell
      g.append("rect")
        .attr("x", x0)
        .attr("y", y0)
        .attr("width", boxWidth)
        .attr("height", boxHeight)
        .attr("fill", data.color)
        .attr("rx", 4)
        .attr("stroke", "#fff")
        .attr("stroke-width", 1);

      // Label
      if (boxWidth > 50 && boxHeight > 25) {
        g.append("text")
          .attr("x", x0 + boxWidth / 2)
          .attr("y", y0 + boxHeight / 2 - 4)
          .attr("text-anchor", "middle")
          .attr("fill", "#fff")
          .attr("font-size", Math.min(12, boxWidth / 7))
          .attr("font-weight", "600")
          .text(data.name);

        g.append("text")
          .attr("x", x0 + boxWidth / 2)
          .attr("y", y0 + boxHeight / 2 + 10)
          .attr("text-anchor", "middle")
          .attr("fill", "rgba(255,255,255,0.8)")
          .attr("font-size", Math.min(10, boxWidth / 9))
          .text(`${(data.value * 100).toFixed(1)}%`);
      }
    });
  }, [sectorData]);

  return (
    <div ref={containerRef} className="w-full max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold palette.text">Sector Allocation</h2>
          <p className="text-sm palette.text">Portfolio breakdown by sector</p>
        </div>
        <span className="px-3 py-1 bg-violet-100 text-violet-700 text-sm font-medium rounded-full">
          {ticker} Portfolio
        </span>
      </div>

      <div className="mb-4 p-4 bg-transparent rounded-lg border border-transparent">
        <p className="text-sm palette.text">Box size indicates allocation percentage for each sector.</p>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium palette.text mb-2">
            Enter Ticker Symbol
          </label>
          <TickerInput
            value={ticker}
            onChange={setTicker}
            onSubmit={generateData}
            placeholder="Type ticker and press Enter"
            maxPills={1}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-transparent overflow-hidden">
        <svg ref={svgRef} className="w-full" style={{ height: "400px" }} />
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {sectorData.map((sector, i) => (
          <div key={i} className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-transparent">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: sector.color }}></div>
            <span className="text-xs font-medium palette.text">{sector.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}