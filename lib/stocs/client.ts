/**
 * Client functions for fetching stock market data from Yahoo Finance.
 */

import type { Period, Interval } from "./constants";

export interface OHLCVData {
  Date: string;
  Open: number;
  High: number;
  Low: number;
  Close: number;
  Volume: number;
}

export interface TickerInfo {
  symbol: string;
  shortName?: string;
  longName?: string;
  sector?: string;
  industry?: string;
  marketCap?: number;
  currency?: string;
}

export interface QuoteData {
  symbol: string;
  price: number;
  change: number;
  change_pct: number;
  volume: number;
  timestamp: string;
}

interface YahooFinanceResponse {
  chart: {
    result: Array<{
      meta: {
        regularMarketPrice: number;
        previousClose: number;
        symbol: string;
        shortName?: string;
        longName?: string;
      };
      indicators: {
        quote: Array<{
          open: number[];
          high: number[];
          low: number[];
          close: number[];
          volume: number[];
        }>;
      };
      timestamp: number[];
    }>;
    error: null | { code: string; description: string };
  };
}

/**
 * Fetch historical stock data for a given ticker symbol and time period.
 */
export async function fetchPastData(ticker: string, period: Period = "1y"): Promise<OHLCVData[]> {
  const data = await getHistory(ticker, period, "1d");
  return data;
}

/**
 * Fetch historical market data for multiple tickers.
 */
export async function fetchMulti(tickers: string[], period: Period = "1y"): Promise<Record<string, OHLCVData[]>> {
  const results: Record<string, OHLCVData[]> = {};
  for (const ticker of tickers) {
    results[ticker] = await getHistory(ticker, period, "1d");
  }
  return results;
}

/**
 * Get historical data with custom interval.
 */
export async function getHistory(ticker: string, period: Period = "1y", interval: Interval = "1d"): Promise<OHLCVData[]> {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?interval=${interval}&range=${period}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch data for ${ticker}: ${response.statusText}`);
  }

  const json: YahooFinanceResponse = await response.json();

  if (json.chart.error) {
    throw new Error(json.chart.error.description || json.chart.error.code);
  }

  const result = json.chart.result?.[0];
  if (!result) {
    return [];
  }

  const quotes = result.indicators.quote?.[0];
  if (!quotes || !result.timestamp) {
    return [];
  }

  const data: OHLCVData[] = [];
  const timestamps = result.timestamp;

  for (let i = 0; i < timestamps.length; i++) {
    if (quotes.close[i] !== null) {
      data.push({
        Date: new Date(timestamps[i] * 1000).toISOString().split("T")[0],
        Open: quotes.open[i],
        High: quotes.high[i],
        Low: quotes.low[i],
        Close: quotes.close[i],
        Volume: quotes.volume[i],
      });
    }
  }

  return data;
}

/**
 * Get metadata for a ticker.
 */
export async function getHistoryMetadata(ticker: string): Promise<TickerInfo> {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?interval=1d&range=1d`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch metadata for ${ticker}: ${response.statusText}`);
  }

  const json: YahooFinanceResponse = await response.json();
  const result = json.chart.result?.[0];
  const meta = result?.meta;

  return {
    symbol: ticker,
    shortName: meta?.shortName,
    longName: meta?.longName,
  };
}

/**
 * Get fast information for a ticker.
 */
export async function getFastInfo(ticker: string): Promise<Record<string, unknown>> {
  const url = `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${encodeURIComponent(ticker)}?modules=price`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch info for ${ticker}: ${response.statusText}`);
  }

  const json = await response.json();
  return json?.quoteSummary?.result?.[0]?.price || {};
}

/**
 * Get full info for a ticker.
 */
export async function getInfo(ticker: string): Promise<Record<string, unknown>> {
  const url = `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${encodeURIComponent(ticker)}?modules=defaultKeyStatistics,assetProfile,summaryDetail,price`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch info for ${ticker}: ${response.statusText}`);
  }

  const json = await response.json();
  return json?.quoteSummary?.result?.[0] || {};
}

/**
 * Get real-time quote for a ticker.
 */
export async function getQuote(ticker: string): Promise<QuoteData> {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?interval=1m&range=1d`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch quote for ${ticker}: ${response.statusText}`);
  }

  const json: YahooFinanceResponse = await response.json();
  const result = json.chart.result?.[0];
  const meta = result?.meta;
  const quotes = result?.indicators.quote?.[0];

  if (!meta || !quotes) {
    throw new Error(`No data found for ${ticker}`);
  }

  const currentPrice = meta.regularMarketPrice || 0;
  const previousClose = meta.previousClose || currentPrice;
  const change = currentPrice - previousClose;
  const changePct = previousClose > 0 ? (change / previousClose) * 100 : 0;
  const latestVolume = quotes.volume[quotes.volume.length - 1] || 0;

  return {
    symbol: ticker,
    price: currentPrice,
    change,
    change_pct: changePct,
    volume: latestVolume,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Get corporate actions (dividends, splits).
 * Note: This is a placeholder - Yahoo Finance doesn't provide direct actions API.
 */
export async function getActions(_ticker: string): Promise<Record<string, unknown>> {
  return {};
}

/**
 * Get dividend history.
 */
export async function getDividends(ticker: string): Promise<OHLCVData[]> {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?interval=1d&range=5y`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch dividends for ${ticker}`);
  }

  const json = await response.json();
  const result = json.chart?.result?.[0];
  const events = result?.events?.dividends;

  if (!events) {
    return [];
  }

  return Object.entries(events).map(([timestamp, data]) => ({
    Date: new Date(parseInt(timestamp) * 1000).toISOString().split("T")[0],
    Open: 0,
    High: 0,
    Low: 0,
    Close: (data as { amount: number }).amount,
    Volume: 0,
  }));
}

/**
 * Get stock split history.
 */
export async function getSplits(ticker: string): Promise<OHLCVData[]> {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?interval=1d&range=10y`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch splits for ${ticker}`);
  }

  const json = await response.json();
  const result = json.chart?.result?.[0];
  const events = result?.events?.splits;

  if (!events) {
    return [];
  }

  return Object.entries(events).map(([timestamp, data]) => ({
    Date: new Date(parseInt(timestamp) * 1000).toISOString().split("T")[0],
    Open: 0,
    High: 0,
    Low: 0,
    Close: (data as { numerator: number; denominator: number }).numerator / (data as { numerator: number; denominator: number }).denominator,
    Volume: 0,
  }));
}

/**
 * Get financial statements.
 */
export async function getFinancials(ticker: string, quarterly: boolean = false): Promise<Record<string, unknown>> {
  const url = `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${encodeURIComponent(ticker)}?modules=financials${quarterly ? "Quarterly" : ""}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch financials for ${ticker}`);
  }

  const json = await response.json();
  return json?.quoteSummary?.result?.[0]?.financials || {};
}

/**
 * Get income statement.
 */
export async function getIncomeStmt(ticker: string, quarterly: boolean = false): Promise<Record<string, unknown>> {
  const url = `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${encodeURIComponent(ticker)}?modules=income${quarterly ? "Quarterly" : ""}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch income statement for ${ticker}`);
  }

  const json = await response.json();
  return json?.quoteSummary?.result?.[0] || {};
}

/**
 * Get balance sheet.
 */
export async function getBalanceSheet(ticker: string, quarterly: boolean = false): Promise<Record<string, unknown>> {
  const url = `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${encodeURIComponent(ticker)}?modules=balance${quarterly ? "Quarterly" : ""}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch balance sheet for ${ticker}`);
  }

  const json = await response.json();
  return json?.quoteSummary?.result?.[0] || {};
}

/**
 * Get cash flow statement.
 */
export async function getCashFlow(ticker: string, quarterly: boolean = false): Promise<Record<string, unknown>> {
  const url = `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${encodeURIComponent(ticker)}?modules=cashflow${quarterly ? "Quarterly" : ""}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch cash flow for ${ticker}`);
  }

  const json = await response.json();
  return json?.quoteSummary?.result?.[0] || {};
}

/**
 * Get earnings data.
 */
export async function getEarnings(ticker: string): Promise<Record<string, unknown>> {
  const url = `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${encodeURIComponent(ticker)}?modules=earnings`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch earnings for ${ticker}`);
  }

  const json = await response.json();
  return json?.quoteSummary?.result?.[0]?.earnings || {};
}

/**
 * Get earnings dates.
 */
export async function getEarningsDates(ticker: string): Promise<string[]> {
  const url = `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${encodeURIComponent(ticker)}?modules=earnings`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch earnings dates for ${ticker}`);
  }

  const json = await response.json();
  const earnings = json?.quoteSummary?.result?.[0]?.earnings;
  return earnings?.earningsDate?.map((d: { raw: number }) => new Date(d.raw * 1000).toISOString().split("T")[0]) || [];
}

/**
 * Get earnings estimates.
 */
export async function getEarningsEstimate(ticker: string): Promise<Record<string, unknown>> {
  const url = `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${encodeURIComponent(ticker)}?modules=earningsTrend`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch earnings estimate for ${ticker}`);
  }

  const json = await response.json();
  return json?.quoteSummary?.result?.[0] || {};
}

/**
 * Get analyst recommendations.
 */
export async function getRecommendations(ticker: string): Promise<Record<string, unknown>> {
  const url = `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${encodeURIComponent(ticker)}?modules=recommendationTrend`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch recommendations for ${ticker}`);
  }

  const json = await response.json();
  return json?.quoteSummary?.result?.[0] || {};
}

/**
 * Get analyst price targets.
 */
export async function getAnalystPriceTargets(ticker: string): Promise<Record<string, unknown>> {
  const url = `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${encodeURIComponent(ticker)}?modules=analystPriceTarget`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch price targets for ${ticker}`);
  }

  const json = await response.json();
  return json?.quoteSummary?.result?.[0] || {};
}

/**
 * Get major holders.
 */
export async function getMajorHolders(ticker: string): Promise<Record<string, unknown>> {
  const url = `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${encodeURIComponent(ticker)}?modules=majorHoldersBreakdown`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch major holders for ${ticker}`);
  }

  const json = await response.json();
  return json?.quoteSummary?.result?.[0] || {};
}

/**
 * Get institutional holders.
 */
export async function getInstitutionalHolders(ticker: string): Promise<Record<string, unknown>> {
  const url = `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${encodeURIComponent(ticker)}?modules=topHoldings`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch institutional holders for ${ticker}`);
  }

  const json = await response.json();
  return json?.quoteSummary?.result?.[0] || {};
}

/**
 * Get insider transactions.
 */
export async function getInsiderTransactions(ticker: string): Promise<Record<string, unknown>> {
  const url = `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${encodeURIComponent(ticker)}?modules=insiderHolders`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch insider transactions for ${ticker}`);
  }

  const json = await response.json();
  return json?.quoteSummary?.result?.[0] || {};
}

/**
 * Get insider purchases.
 */
export async function getInsiderPurchases(ticker: string): Promise<Record<string, unknown>> {
  return getInsiderTransactions(ticker);
}

/**
 * Get shares information.
 */
export async function getShares(ticker: string): Promise<Record<string, unknown>> {
  const url = `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${encodeURIComponent(ticker)}?modules=shares`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch shares for ${ticker}`);
  }

  const json = await response.json();
  return json?.quoteSummary?.result?.[0] || {};
}

/**
 * Get available options dates.
 */
export async function getOptions(ticker: string): Promise<string[]> {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?intervals=1d`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch options for ${ticker}`);
  }

  const json = await response.json();
  const result = json.chart?.result?.[0];
  const options = result?.options?.expirations;

  if (!options) {
    return [];
  }

  return Object.keys(options).map(exp => new Date(parseInt(exp) * 1000).toISOString().split("T")[0]);
}

/**
 * Get option chain for a specific date.
 */
export async function getOptionChain(ticker: string, date?: string): Promise<Record<string, unknown>> {
  const options = await getOptions(ticker);
  const expiry = date || options[0];

  if (!expiry) {
    return {};
  }

  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?options=${expiry}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch option chain for ${ticker}`);
  }

  const json = await response.json();
  return json.chart?.result?.[0]?.options || {};
}

/**
 * Get earnings calendar.
 */
export async function getCalendar(ticker: string): Promise<Record<string, unknown>> {
  const url = `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${encodeURIComponent(ticker)}?modules=earnings`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch calendar for ${ticker}`);
  }

  const json = await response.json();
  return json?.quoteSummary?.result?.[0]?.earnings || {};
}

/**
 * Get recent news.
 */
export async function getNews(ticker: string): Promise<Array<{ title: string; publisher: string; link: string; published: string }>> {
  const url = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(ticker)}&news=1`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch news for ${ticker}`);
  }

  const json = await response.json();
  return json?.news?.map((n: { title: string; publisher: string; link: string; publishedAt: string }) => ({
    title: n.title,
    publisher: n.publisher,
    link: n.link,
    published: n.publishedAt,
  })) || [];
}

/**
 * Get ESG/sustainability data.
 */
export async function getSustainability(ticker: string): Promise<Record<string, unknown>> {
  const url = `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${encodeURIComponent(ticker)}?modules=esgScores`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch sustainability for ${ticker}`);
  }

  const json = await response.json();
  return json?.quoteSummary?.result?.[0] || {};
}

/**
 * Get SEC filings.
 */
export async function getSecFilings(ticker: string): Promise<Record<string, unknown>> {
  const url = `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${encodeURIComponent(ticker)}?modules=secFilings`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch SEC filings for ${ticker}`);
  }

  const json = await response.json();
  return json?.quoteSummary?.result?.[0] || {};
}

/**
 * Get market information.
 */
export async function getMarket(market: string = "us_market"): Promise<OHLCVData[]> {
  return getHistory(market, "1d", "1d");
}

/**
 * Get sector information.
 */
export async function getSector(sector: string): Promise<OHLCVData[]> {
  return getHistory(sector, "1y", "1d");
}