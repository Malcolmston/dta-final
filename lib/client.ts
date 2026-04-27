/**
 * Client-safe stock data fetching utilities
 * This file exports only the functions and types needed by client components
 */

export interface StockQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap?: number;
  high: number;
  low: number;
  open: number;
  previousClose: number;
}

export interface StockHistory {
  date: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface StockInfo {
  symbol: string;
  name: string;
  sector?: string;
  industry?: string;
  marketCap?: number;
  peRatio?: number;
  dividendYield?: number;
  beta?: number;
  week52High?: number;
  week52Low?: number;
}

export interface SearchResult {
  symbol: string;
  name: string;
  exchange: string;
  type: string;
}

export interface GrowthEstimate {
  symbol: string;
  currentQuarterEarnings?: number;
  nextQuarterEarnings?: number;
  currentYearEarnings?: number;
  nextYearEarnings?: number;
  earningsTrend?: number;
  revenueTrend?: number;
  growthCurrentYear?: number;
  growthNextYear?: number;
  growthNext5Years?: number;
  growthPast5Years?: number;
}

export interface ForecastData {
  date: Date;
  close: number;
  score: string;
  signal: "BUY" | "SELL" | "HOLD";
}

export interface SignalsData {
  date: Date;
  close: number;
  rsi: number | null;
  rsi_signal: string | null;
  macd: number | null;
  macd_signal: number | null;
  macd_cross: string | null;
  sma: number | null;
  sma_2: number | null;
  cci: number | null;
  willr: number | null;
  stoch_k: number | null;
  stoch_d: number | null;
}

export interface MomentumData {
  date: Date;
  close: number;
  rsi: number | null;
  mom: number | null;
  stoch_k: number | null;
  stoch_d: number | null;
  willr: number | null;
  cci: number | null;
}

interface RawStockHistoryItem {
  date: string | number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface RawSearchQuote {
  symbol: string;
  shortname?: string;
  longname?: string;
  exchange?: string;
  quoteType?: string;
}

interface RawSignalsData {
  Date: string | number;
  Close: number;
  rsi: number | null;
  rsi_signal: string | null;
  macd: number | null;
  macd_signal: number | null;
  macd_cross: string | null;
  sma: number | null;
  sma_2: number | null;
  cci?: number;
  willr?: number;
  stoch_k?: number;
  stoch_d?: number;
}

interface RawMomentumData {
  Date: string | number;
  Close: number;
  RSI_14: number | null;
  MOM_10: number | null;
  STOCHk_14_3_3: number | null;
  STOCHd_14_3_3: number | null;
  WILLR_14: number | null;
  "CCI_20_0.015": number | null;
}

interface RawForecastData {
  Date: string | number;
  Close: number;
  score: string;
  signal: "BUY" | "SELL" | "HOLD";
}

/**
 * LTTB (Largest Triangle Three Buckets) downsampling algorithm
 */
export function downsampleLTTB<T>(
  data: T[],
  targetPoints: number,
  getX: (d: T) => number,
  getY: (d: T) => number
): T[] {
  if (data.length <= targetPoints) {
    return data;
  }

  const sampled: T[] = [data[0]];
  const bucketSize = (data.length - 2) / (targetPoints - 2);

  let a = 0;

  for (let i = 0; i < targetPoints - 2; i++) {
    const avgRangeStart = Math.floor((i + 1) * bucketSize) + 1;
    const avgRangeEnd = Math.floor((i + 2) * bucketSize) + 1;
    const avgRangeLength = avgRangeEnd - avgRangeStart;

    let avgX = 0;
    let avgY = 0;

    for (let j = avgRangeStart; j < avgRangeEnd && j < data.length; j++) {
      avgX += getX(data[j]);
      avgY += getY(data[j]);
    }

    if (avgRangeLength > 0) {
      avgX /= avgRangeLength;
      avgY /= avgRangeLength;
    }

    const rangeStart = Math.floor(i * bucketSize) + 1;
    const rangeEnd = Math.floor((i + 1) * bucketSize) + 1;

    let maxArea = -1;
    let nextA = a;

    for (let j = rangeStart; j < rangeEnd && j < data.length; j++) {
      const area = Math.abs(
        (getX(data[a]) - avgX) * (getY(data[j]) - getY(data[a])) -
        (getX(data[a]) - getX(data[j])) * (avgY - getY(data[a]))
      ) * 0.5;

      if (area > maxArea) {
        maxArea = area;
        nextA = j;
      }
    }

    sampled.push(data[nextA]);
    a = nextA;
  }

  sampled.push(data[data.length - 1]);
  return sampled;
}

export function downsampleStockHistory(
  data: StockHistory[],
  targetPoints: number = 252
): StockHistory[] {
  return downsampleLTTB(
    data,
    targetPoints,
    (d) => d.date.getTime(),
    (d) => d.close
  );
}

export async function fetchQuote(symbol: string): Promise<StockQuote> {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1d`;

  const response = await fetch(url);
  const json = await response.json();

  if (json.chart.error) {
    throw new Error(json.chart.error.description || "Failed to fetch quote");
  }

  const result = json.chart.result[0];
  const meta = result.meta;
  const quote = result.indicators.quote[0];

  return {
    symbol: meta.symbol,
    price: meta.regularMarketPrice || 0,
    change: meta.regularMarketChange || 0,
    changePercent: meta.regularMarketChangePercent || 0,
    volume: meta.regularMarketVolume || 0,
    marketCap: meta.marketCap,
    high: quote.high?.[quote.high.length - 1] || 0,
    low: quote.low?.[quote.low.length - 1] || 0,
    open: quote.open?.[quote.open.length - 1] || 0,
    previousClose: meta.chartPreviousClose || meta.previousClose || 0,
  };
}

export async function fetchHistory(
  symbol: string,
  period: string = "1y",
  interval: string = "1d",
  limit?: number
): Promise<StockHistory[]> {
  // Use relative URL for client-side to avoid CSP issues
  // Only use absolute URL when VERCEL_URL is explicitly set (server-side)
  const vercelUrl = process.env.VERCEL_URL || process.env.NEXT_PUBLIC_VERCEL_URL;

  // Always use relative URL in browser - avoids CSP and CORS issues
  let url = `/api/stocks/history?symbol=${encodeURIComponent(symbol)}&period=${period}&interval=${interval}`;

  // Log what's happening
  console.log(`[fetchHistory] Fetching: ${url}, vercelUrl: ${vercelUrl}`);

  const response = await fetch(url);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch history");
  }

  const result = await response.json();

  if (result.error) {
    throw new Error(result.error);
  }

  let data = result.data.map((d: RawStockHistoryItem) => ({
    date: new Date(d.date),
    open: d.open,
    high: d.high,
    low: d.low,
    close: d.close,
    volume: d.volume,
  }));

  if (limit && data.length > limit) {
    data = downsampleStockHistory(data, limit);
  }

  return data;
}

export async function fetchStockInfo(symbol: string): Promise<StockInfo> {
  const url = `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${encodeURIComponent(symbol)}?modules=summaryDetail,price,quoteType,defaultKeyStatistics`;

  const response = await fetch(url);
  const json = await response.json();

  if (json.quoteSummary?.error) {
    throw new Error(json.quoteSummary.error.description || "Failed to fetch stock info");
  }

  const result = json.quoteSummary.result[0];
  const summary = result.summaryDetail || {};
  const price = result.price || {};
  const stats = result.defaultKeyStatistics || {};

  return {
    symbol: price.symbol || symbol,
    name: price.shortName || price.longName || symbol,
    sector: price.sector || undefined,
    industry: price.industry || undefined,
    marketCap: summary.marketCap?.raw,
    peRatio: summary.trailingPE?.raw,
    dividendYield: summary.dividendYield?.raw,
    beta: stats.beta3Year?.raw,
    week52High: summary.fiftyTwoWeekHigh?.raw,
    week52Low: summary.fiftyTwoWeekLow?.raw,
  };
}

export function isValidTicker(ticker: string): boolean {
  return /^[A-Z]{1,5}$/.test(ticker);
}

export async function searchStocks(query: string): Promise<SearchResult[]> {
  const url = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query)}&quotesCount=10&newsCount=0`;

  const response = await fetch(url);
  const json = await response.json();

  if (!json.quotes) {
    return [];
  }

  return json.quotes.map((q: RawSearchQuote) => ({
    symbol: q.symbol,
    name: q.shortname || q.longname || q.symbol,
    exchange: q.exchange || "",
    type: q.quoteType || "",
  }));
}

export async function fetchQuotes(symbols: string[]): Promise<StockQuote[]> {
  const results = await Promise.allSettled(
    symbols.map(s => fetchQuote(s))
  );

  return results
    .filter((r): r is PromiseFulfilledResult<StockQuote> => r.status === "fulfilled")
    .map(r => r.value);
}

export async function fetchGrowthEstimate(symbol: string): Promise<GrowthEstimate | null> {
  const url = `/api/stocks/growth?symbol=${encodeURIComponent(symbol)}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      return null;
    }

    const result = await response.json();

    if (result.error) {
      return null;
    }

    return result.data;
  } catch {
    return null;
  }
}

export function getPopularTickers(): string[] {
  return [
    "AAPL", "GOOGL", "MSFT", "AMZN", "NVDA", "META", "TSLA", "BRK.B",
    "JPM", "V", "JNJ", "WMT", "PG", "MA", "UNH", "HD", "DIS", "BAC",
    "ADBE", "CRM", "NFLX", "INTC", "AMD", "CSCO", "PEP",
  ];
}

function mapSignalsFields(d: RawSignalsData): SignalsData {
  return {
    date: new Date(d.Date),
    close: d.Close,
    rsi: d.rsi,
    rsi_signal: d.rsi_signal,
    macd: d.macd,
    macd_signal: d.macd_signal,
    macd_cross: d.macd_cross,
    sma: d.sma,
    sma_2: d.sma_2,
    cci: d.cci ?? null,
    willr: d.willr ?? null,
    stoch_k: d.stoch_k ?? null,
    stoch_d: d.stoch_d ?? null,
  };
}

function mapMomentumFields(d: RawMomentumData): MomentumData {
  return {
    date: new Date(d.Date),
    close: d.Close,
    rsi: d.RSI_14,
    mom: d.MOM_10,
    stoch_k: d.STOCHk_14_3_3,
    stoch_d: d.STOCHd_14_3_3,
    willr: d.WILLR_14,
    cci: d["CCI_20_0.015"],
  };
}

export async function fetchForecast(symbol: string, period: string = "3mo"): Promise<ForecastData[]> {
  const url = `/api/stocks/forecast?ticker=${encodeURIComponent(symbol)}&period=${period}`;

  const response = await fetch(url);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch forecast");
  }

  const result = await response.json();

  if (result.error) {
    throw new Error(result.error);
  }

  return result.data.map((d: RawForecastData) => ({
    date: new Date(d.Date),
    close: d.Close,
    score: d.score,
    signal: d.signal,
  }));
}

export async function fetchSignals(symbol: string, period: string = "6mo"): Promise<SignalsData[]> {
  const url = `/api/stocks/signals?ticker=${encodeURIComponent(symbol)}&period=${period}`;

  const response = await fetch(url);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch signals");
  }

  const result = await response.json();

  if (result.error) {
    throw new Error(result.error);
  }

  return result.data.map(mapSignalsFields);
}

export async function fetchMomentum(symbol: string, period: string = "3mo"): Promise<MomentumData[]> {
  const url = `/api/stocks/momentum?ticker=${encodeURIComponent(symbol)}&period=${period}`;

  const response = await fetch(url);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch momentum");
  }

  const result = await response.json();

  if (result.error) {
    throw new Error(result.error);
  }

  return result.data.map(mapMomentumFields);
}

export async function fetchHistoryCached(
  symbol: string,
  period: string = "1y",
  interval: string = "1d"
): Promise<StockHistory[]> {
  try {
    const response = await fetch("/api/queue", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "history", symbol, period, interval }),
    });

    if (!response.ok) {
      throw new Error("Queue fetch failed");
    }

    const result = await response.json();

    return result.data.map((d: RawStockHistoryItem) => ({
      date: new Date(d.date),
      open: d.open,
      high: d.high,
      low: d.low,
      close: d.close,
      volume: d.volume,
    }));
  } catch (error) {
    console.warn("Queue unavailable, using direct API:", error);
    return fetchHistory(symbol, period, interval);
  }
}

export async function fetchSignalsCached(symbol: string, period: string = "3mo"): Promise<SignalsData[]> {
  try {
    const response = await fetch("/api/queue", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "signals", symbol, period }),
    });

    if (!response.ok) {
      throw new Error("Queue fetch failed");
    }

    const result = await response.json();
    return result.data.map(mapSignalsFields);
  } catch (error) {
    console.warn("Queue unavailable, using direct API:", error);
    return fetchSignals(symbol, period);
  }
}

export async function fetchMomentumCached(symbol: string, period: string = "3mo"): Promise<MomentumData[]> {
  try {
    const response = await fetch("/api/queue", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "momentum", symbol, period }),
    });

    if (!response.ok) {
      throw new Error("Queue fetch failed");
    }

    const result = await response.json();
    return result.data.map(mapMomentumFields);
  } catch (error) {
    console.warn("Queue unavailable, using direct API:", error);
    return fetchMomentum(symbol, period);
  }
}

export async function fetchGrowthCached(symbol: string): Promise<GrowthEstimate | null> {
  try {
    const response = await fetch("/api/queue", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "growth", symbol }),
    });

    if (!response.ok) {
      throw new Error("Queue fetch failed");
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.warn("Queue unavailable, using direct API:", error);
    return fetchGrowthEstimate(symbol);
  }
}

export async function fetchForecastCached(symbol: string, period: string = "3mo"): Promise<ForecastData[]> {
  try {
    const response = await fetch("/api/queue", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "forecast", symbol, period }),
    });

    if (!response.ok) {
      throw new Error("Queue fetch failed");
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.warn("Queue unavailable, using direct API:", error);
    return fetchForecast(symbol, period);
  }
}