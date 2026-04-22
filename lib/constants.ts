/**
 * Shared constants used across multiple components
 */

/**
 * Time range options for stock data queries
 * Used in: MarketPredictor, Heatmap, Treemap, Streamgraph, NetworkGraph, CandlestickChart, DualAxisPlot, PriceRibbon3D
 */
export const TIME_RANGES = [
  { label: "1D", value: "1d" },
  { label: "1W", value: "5d" },
  { label: "1M", value: "1mo" },
  { label: "3M", value: "3mo" },
  { label: "6M", value: "6mo" },
  { label: "1Y", value: "1y" },
  { label: "2Y", value: "2y" },
  { label: "5Y", value: "5y" },
  { label: "10Y", value: "10y" },
] as const;

/**
 * Shorter time range options for simpler components
 */
export const TIME_RANGES_SHORT = [
  { label: "1M", value: "1mo" },
  { label: "3M", value: "3mo" },
  { label: "6M", value: "6mo" },
  { label: "1Y", value: "1y" },
  { label: "2Y", value: "2y" },
] as const;

/**
 * Extended time range options for charts that support longer periods
 */
export const TIME_RANGES_EXTENDED = [
  { label: "1W", value: "5d" },
  { label: "1M", value: "1mo" },
  { label: "3M", value: "3mo" },
  { label: "6M", value: "6mo" },
  { label: "1Y", value: "1y" },
  { label: "2Y", value: "2y" },
] as const;

export type TimeRange = typeof TIME_RANGES[number];