/**
 * Constants for stock, bond, crypto, and international ticker symbols.
 */

export interface TickerInfo {
  name: string;
  symbol: string;
}

// Bond ETFs
export const BOND_TICKERS: Record<string, TickerInfo> = {
  TLT: { symbol: "TLT", name: "iShares 20+ Year Treasury Bond ETF" },
  IEF: { symbol: "IEF", name: "iShares 7-10 Year Treasury Bond ETF" },
  SHY: { symbol: "SHY", name: "iShares 1-3 Year Treasury Bond ETF" },
  AGG: { symbol: "AGG", name: "iShares Core US Aggregate Bond ETF" },
  BND: { symbol: "BND", name: "Vanguard Total Bond Market ETF" },
  JNK: { symbol: "JNK", name: "SPDR Bloomberg High Yield Bond ETF" },
  HYG: { symbol: "HYG", name: "iShares iBoxx $ High Yield Corporate Bond ETF" },
  LQD: { symbol: "LQD", name: "iShares iBoxx $ Investment Grade Corporate Bond ETF" },
};

// International ETFs
export const INTERNATIONAL_TICKERS: Record<string, TickerInfo> = {
  EFA: { symbol: "EFA", name: "iShares MSCI EAFE ETF" },
  VEA: { symbol: "VEA", name: "Vanguard FTSE Developed Markets ETF" },
  VWO: { symbol: "VWO", name: "Vanguard FTSE Emerging Markets ETF" },
  IEFA: { symbol: "IEFA", name: "iShares Core MSCI EAFE ETF" },
  IEMG: { symbol: "IEMG", name: "iShares Core MSCI Emerging Markets ETF" },
  SCHF: { symbol: "SCHF", name: "Schwab International Equity ETF" },
};

// Popular Stock Tickers
export const STOCK_TICKERS: Record<string, TickerInfo> = {
  // Tech
  AAPL: { symbol: "AAPL", name: "Apple Inc." },
  MSFT: { symbol: "MSFT", name: "Microsoft Corporation" },
  GOOGL: { symbol: "GOOGL", name: "Alphabet Inc." },
  AMZN: { symbol: "AMZN", name: "Amazon.com Inc." },
  META: { symbol: "META", name: "Meta Platforms Inc." },
  NVDA: { symbol: "NVDA", name: "NVIDIA Corporation" },
  TSLA: { symbol: "TSLA", name: "Tesla Inc." },
  AMD: { symbol: "AMD", name: "Advanced Micro Devices" },
  // Finance
  JPM: { symbol: "JPM", name: "JPMorgan Chase & Co." },
  BAC: { symbol: "BAC", name: "Bank of America Corp." },
  WFC: { symbol: "WFC", name: "Wells Fargo & Company" },
  GS: { symbol: "GS", name: "Goldman Sachs Group Inc." },
  // Healthcare
  JNJ: { symbol: "JNJ", name: "Johnson & Johnson" },
  PFE: { symbol: "PFE", name: "Pfizer Inc." },
  UNH: { symbol: "UNH", name: "UnitedHealth Group Inc." },
  ABBV: { symbol: "ABBV", name: "AbbVie Inc." },
  // Consumer
  WMT: { symbol: "WMT", name: "Walmart Inc." },
  KO: { symbol: "KO", name: "The Coca-Cola Company" },
  PEP: { symbol: "PEP", name: "PepsiCo Inc." },
  HD: { symbol: "HD", name: "The Home Depot Inc." },
  // Energy
  XOM: { symbol: "XOM", name: "Exxon Mobil Corporation" },
  CVX: { symbol: "CVX", name: "Chevron Corporation" },
};

// Popular Crypto Tickers
export const CRYPTO_TICKERS: Record<string, TickerInfo> = {
  "BTC-USD": { symbol: "BTC-USD", name: "Bitcoin" },
  "ETH-USD": { symbol: "ETH-USD", name: "Ethereum" },
  "SOL-USD": { symbol: "SOL-USD", name: "Solana" },
  "BNB-USD": { symbol: "BNB-USD", name: "BNB" },
  "XRP-USD": { symbol: "XRP-USD", name: "XRP" },
  "ADA-USD": { symbol: "ADA-USD", name: "Cardano" },
  "DOGE-USD": { symbol: "DOGE-USD", name: "Dogecoin" },
  "DOT-USD": { symbol: "DOT-USD", name: "Polkadot" },
  "MATIC-USD": { symbol: "MATIC-USD", name: "Polygon" },
  "LTC-USD": { symbol: "LTC-USD", name: "Litecoin" },
};

// Stock pools for portfolio generation
export const STOCK_POOLS: Record<string, string[]> = {
  growth: ["AAPL", "MSFT", "GOOGL", "AMZN", "NVDA", "META", "TSLA", "AMD"],
  value: ["JPM", "BAC", "WFC", "JNJ", "PFE", "KO", "PEP", "WMT"],
  dividend: ["KO", "PEP", "JNJ", "PFE", "XOM", "CVX", "JPM", "WMT"],
  balanced: ["AAPL", "MSFT", "GOOGL", "AMZN", "JPM", "JNJ", "KO", "XOM", "WMT", "HD"],
  tech: ["AAPL", "MSFT", "GOOGL", "NVDA", "AMD", "META", "TSLA", "ORCL", "CRM", "ADBE"],
  finance: ["JPM", "BAC", "WFC", "GS", "MS", "C", "BLK", "AXP"],
  healthcare: ["JNJ", "PFE", "UNH", "MRK", "ABBV", "LLY", "TMO", "DHR"],
  energy: ["XOM", "CVX", "COP", "SLB", "EOG", "MPC", "VLO", "PSX"],
};

// Bond pools
export const BOND_POOL: string[] = ["TLT", "IEF", "AGG", "BND", "LQD"];

// International pools
export const INTL_POOL: string[] = ["VEA", "EFA", "VWO"];

// Crypto pools
export const CRYPTO_POOL: string[] = ["BTC-USD", "ETH-USD", "SOL-USD", "BNB-USD", "XRP-USD", "ADA-USD"];

// Strategy type
export type PortfolioStrategy = "growth" | "value" | "dividend" | "conservative" | "balanced" | "aggressive";

// Period type
export type Period = "1d" | "5d" | "1mo" | "3mo" | "6mo" | "1y" | "2y" | "5y" | "10y" | "ytd" | "max";

// Interval type
export type Interval = "1m" | "2m" | "5m" | "15m" | "30m" | "60m" | "1h" | "1d" | "1wk" | "1mo";