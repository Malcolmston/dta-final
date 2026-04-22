"use client";

import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { fetchHistory, StockHistory } from "@/lib/client";

interface VolumeChartProps {
  ticker?: string;
}

export default function VolumeChart({ ticker = "AAPL" }: VolumeChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<StockHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const history = await fetchHistory(ticker, "3mo", "1d");
        setData(history);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [ticker]);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || data.length === 0) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = 300;
    const margin = { top: 20, right: 30, bottom: 40, left: 60 };

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const x = d3.scaleTime()
      .domain(d3.extent(data, d => d.date) as [Date, Date])
      .range([margin.left, width - margin.right]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.volume) as number])
      .nice()
      .range([height - margin.bottom, margin.top]);

    const barWidth = Math.max(1, (width - margin.left - margin.right) / data.length - 1);

    svg.append("g")
      .attr("fill", (d, i) => i > 0 && data[i].close < data[i - 1].close ? "#ef4444" : "#22c55e")
      .selectAll("rect")
      .data(data)
      .join("rect")
      .attr("x", d => x(d.date) - barWidth / 2)
      .attr("y", d => y(d.volume))
      .attr("width", barWidth)
      .attr("height", d => y(0) - y(d.volume));

    svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x).ticks(6));

    svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y).ticks(5).tickFormat(d => d3.format(".2s")(d as number)));

  }, [data]);

  if (loading) return <div className="p-4 text-gray-500">Loading volume data...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  return (
    <div ref={containerRef} className="w-full">
      <svg ref={svgRef} className="w-full" style={{ height: "300px" }} />
    </div>
  );
}