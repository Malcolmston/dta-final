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

/**
 * Represents the historical data of a stock for a specific date.
 *
 * This interface contains information about market activity for a stock,
 * including pricing and trading volume.
 *
 * Properties:
 * - `date`: The date corresponding to the stock history data.
 * - `open`: The price at which the stock opened on the specified date.
 * - `high`: The highest price the stock reached on the specified date.
 * - `low`: The lowest price the stock reached on the specified date.
 * - `close`: The price at which the stock closed on the specified date.
 * - `volume`: The total number of shares traded for the stock on the specified date.
 */
export interface StockHistory {
  date: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

/**
 * Represents information about a stock.
 *
 * @interface StockInfo
 * @property {string} symbol - The unique stock ticker symbol.
 * @property {string} name - The name of the company or stock.
 * @property {string} [sector] - The sector to which the company belongs (e.g., Technology, Finance).
 * @property {string} [industry] - The specific industry in which the company operates.
 * @property {number} [marketCap] - The market capitalization of the company, typically in USD.
 * @property {number} [peRatio] - The price-to-earnings ratio of the stock.
 * @property {number} [dividendYield] - The dividend yield percentage.
 * @property {number} [beta] - The stock's beta, measuring volatility relative to the market.
 * @property {number} [week52High] - The highest stock price in the last 52 weeks.
 * @property {number} [week52Low] - The lowest stock price in the last 52 weeks.
 */
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

/**
 * Represents the result of a search query, providing details about a specific entity such as a stock or financial instrument.
 *
 * @interface SearchResult
 * @property {string} symbol - The unique ticker or identifier symbol for the entity.
 * @property {string} name - The full name or description of the entity being represented.
 * @property {string} exchange - The name or abbreviation of the exchange where the entity is listed or traded.
 * @property {string} type - The category or classification of the entity (e.g., stock, ETF, etc.).
 */
export interface SearchResult {
  symbol: string;
  name: string;
  exchange: string;
  type: string;
}

/**
 * Represents the growth estimate for a specific financial entity.
 * This interface outlines various metrics related to earnings and revenue growth trends.
 *
 * Properties:
 * - `symbol`: The unique identifier or ticker symbol of the entity.
 * - `currentQuarterEarnings`: The estimated earnings for the current quarter, if available.
 * - `nextQuarterEarnings`: The estimated earnings for the next quarter, if available.
 * - `currentYearEarnings`: The estimated earnings for the current fiscal year, if available.
 * - `nextYearEarnings`: The estimated earnings for the next fiscal year, if available.
 * - `earningsTrend`: The trend of earnings growth across recent periods, if available.
 * - `revenueTrend`: The trend of revenue growth across recent periods, if available.
 * - `growthCurrentYear`: The estimated percentage growth for the current fiscal year, if available.
 * - `growthNextYear`: The estimated percentage growth for the next fiscal year, if available.
 * - `growthNext5Years`: The average annual growth rate estimate for the next five years, if available.
 * - `growthPast5Years`: The average annual growth rate over the past five years, if available.
 */
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

/**
 * Represents forecast data used for financial or market predictions.
 *
 * @interface ForecastData
 * @property {Date} date - The date associated with the forecast data.
 * @property {number} close - The closing value or price used in the forecast.
 * @property {string} score - A computed or assigned score indicating the confidence or quality of the forecast.
 * @property {"BUY" | "SELL" | "HOLD"} signal - A signal indicating the recommended action based on the forecast.
 */
export interface ForecastData {
  date: Date;
  close: number;
  score: string;
  signal: "BUY" | "SELL" | "HOLD";
}

/**
 * Interface representing financial signal data.
 *
 * This interface is used to hold various technical indicators and related data
 * useful for financial analysis or trading systems. Most of the properties are
 * optional or nullable, as the availability of information may vary depending
 * on the context or computation.
 *
 * Properties:
 * - date: The date associated with the signal data.
 * - close: The closing price of the financial instrument.
 * - rsi: Relative Strength Index, a momentum oscillator that measures the speed
 *   and change of price movements. Can be null if RSI is not calculated.
 * - rsi_signal: Signal for RSI, indicating "buy", "sell", or null if undecided.
 * - macd: Moving Average Convergence Divergence value, used to measure momentum.
 *   Can be null if not computed.
 * - macd_signal: Signal line for the MACD, used to identify buy or sell signals.
 *   Can be null if not available.
 * - macd_cross: Indicates the type of MACD crossover ("bullish", "bearish",
 *   or null if no crossover).
 * - sma: Simple Moving Average calculated over a specific period. Can be null
 *   if unavailable.
 * - sma_2: Another Simple Moving Average, typically computed using a different
 *   time frame. Can be null if unavailable.
 * - cci: Commodity Channel Index, used to assess overbought or oversold conditions.
 *   Can be null if not calculated.
 * - willr: Williams %R, a momentum indicator that measures overbought or oversold
 *   levels. Can be null if unavailable.
 * - stoch_k: Stochastic %K value, part of the stochastic oscillator. Can be null
 *   if not provided.
 * - stoch_d: Stochastic %D value, the signal line of the stochastic oscillator.
 *   Can be null if not computed.
 */
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

/**
 * Represents financial momentum data for a specific date.
 *
 * This interface is commonly used to store and access momentum
 * indicator values, which are derived from a time series of
 * financial data. Momentum indicators help analyze market trends,
 * strength, and potential reversals.
 */
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

/**
 * Represents a single entry in the raw stock history data.
 *
 * This interface defines the structure of a stock history item,
 * including its date, open price, high price, low price, closing
 * price, and trading volume.
 *
 * Properties:
 * - `date`: The date of the stock entry, represented as a string or a numeric timestamp.
 * - `open`: The opening price of the stock on the specified date.
 * - `high`: The highest price of the stock on the specified date.
 * - `low`: The lowest price of the stock on the specified date.
 * - `close`: The closing price of the stock on the specified date.
 * - `volume`: The volume of shares traded on the specified date.
 */
interface RawStockHistoryItem {
  date: string | number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

/**
 * Represents a raw search quote object typically returned from financial or stock market data sources.
 *
 * @interface RawSearchQuote
 *
 * @property {string} symbol - The unique stock ticker or symbol for the financial instrument.
 * @property {string} [shortname] - The abbreviated name of the financial instrument, if available.
 * @property {string} [longname] - The full descriptive name of the financial instrument, if available.
 * @property {string} [exchange] - The stock exchange where the financial instrument is traded, if available.
 * @property {string} [quoteType] - The type of quote data (e.g., equity, index, mutual fund), if available.
 */
interface RawSearchQuote {
  symbol: string;
  shortname?: string;
  longname?: string;
  exchange?: string;
  quoteType?: string;
}

/**
 * Represents raw signals data for financial analysis.
 * This interface provides various properties to track different indicators
 * and statistics used in technical analysis of stock or asset price movements.
 */
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

/**
 * Represents raw momentum data for financial analysis.
 * This interface contains various technical indicator values calculated for a specific date.
 *
 * Properties:
 * - Date: The date associated with the data, which can be a string or a timestamp.
 * - Close: The closing price of the asset on the specified date.
 * - RSI_14: The 14-day Relative Strength Index (RSI), which measures the speed and change of price movements.
 *   A null value indicates the RSI is unavailable for the respective date.
 * - MOM_10: The 10-period Momentum indicator, which measures the rate of change in the closing price.
 *   A null value indicates the Momentum data is unavailable for the respective date.
 * - STOCHk_14_3_3: The %K value of the 14,3,3 Stochastic Oscillator, which shows the relation of the closing
 *   price relative to the high-low range over a specified period. A null value indicates the Stochastic Oscillator
 *   %K value is unavailable for the respective date.
 * - STOCHd_14_3_3: The %D value of the 14,3,3 Stochastic Oscillator, which is a moving average of %K. A null
 *   value indicates the Stochastic Oscillator %D value is unavailable for the respective date.
 * - WILLR_14: The 14-period Williams %R indicator, which measures overbought and oversold levels.
 *   A null value indicates the Williams %R data is unavailable for the respective date.
 * - CCI_20_0.015: The 20-period Commodity Channel Index (CCI) with a 0.015 scaling constant, which is used to
 *   identify cyclical trends. A null value indicates the CCI data is unavailable for the respective date.
 */
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

/**
 * Represents the raw data structure for a financial forecast, including date, closing price, score, and trading signal.
 */
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

/**
 * Reduces the number of data points in a stock history dataset using the Largest Triangle Three Buckets (LTTB) algorithm.
 *
 * @param {StockHistory[]} data - The array of stock history objects, each containing date and close information.
 * @param {number} [targetPoints=252] - The desired number of data points in the downsampled dataset. Defaults to 252.
 * @return {StockHistory[]} The downsampled array of stock history objects.
 */
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

/**
 * Fetches stock quote data for the given symbol from Yahoo Finance.
 *
 * @param {string} symbol The stock ticker symbol to retrieve quote data for.
 * @return {Promise<StockQuote>} A promise that resolves to a StockQuote object containing the stock's data.
 * @throws {Error} Throws an error if the fetch operation fails or if the response indicates an error.
 */
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

/**
 * Fetches historical stock data for a given symbol with specified parameters.
 *
 * @param {string} symbol - The stock symbol to fetch history for.
 * @param {string} [period="1y"] - The time period for which historical data is requested (e.g., "1y", "6m").
 * @param {string} [interval="1d"] - The interval between data points (e.g., "1d", "1h").
 * @param {number} [limit] - Optional parameter to limit the number of data points returned.
 * @return {Promise<StockHistory[]>} A promise that resolves to an array of stock history objects, each containing date, open, high, low, close, and volume values.
 */
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

/**
 * Fetches detailed stock information for a given symbol from Yahoo Finance.
 *
 * @param {string} symbol - The stock symbol to fetch information for.
 * @return {Promise<StockInfo>} A promise that resolves to an object containing stock information,
 *                              including details such as name, sector, industry, market cap,
 *                              P/E ratio, dividend yield, beta, and 52-week high/low values.
 * @throws {Error} If the API response contains an error or fails to fetch stock information.
 */
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

/**
 * Validates if the given ticker symbol is valid based on the specified criteria.
 * A valid ticker must consist of 1 to 5 uppercase English letters.
 *
 * @param {string} ticker - The ticker symbol to validate.
 * @return {boolean} Returns `true` if the ticker is valid, otherwise returns `false`.
 */
export function isValidTicker(ticker: string): boolean {
  return /^[A-Z]{1,5}$/.test(ticker);
}

/**
 * Searches for stocks based on the provided query and returns a list of matching stock results.
 *
 * @param {string} query - The search term used to find relevant stocks.
 * @return {Promise<SearchResult[]>} A promise that resolves to an array of stock search results. Each result contains details such as symbol, name, exchange, and type.
 */
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

/**
 * Fetches stock quotes for the provided list of stock symbols.
 *
 * @param {string[]} symbols - An array of stock symbols to fetch quotes for.
 * @return {Promise<StockQuote[]>} A promise that resolves to an array of StockQuote objects for successfully fetched symbols.
 */
export async function fetchQuotes(symbols: string[]): Promise<StockQuote[]> {
  const results = await Promise.allSettled(
    symbols.map(s => fetchQuote(s))
  );

  return results
    .filter((r): r is PromiseFulfilledResult<StockQuote> => r.status === "fulfilled")
    .map(r => r.value);
}

/**
 * Fetches the growth estimate for a given stock symbol.
 *
 * @param {string} symbol - The stock symbol for which to fetch the growth estimate.
 * @return {Promise<GrowthEstimate | null>} A promise resolving to the growth estimate data for the given stock symbol,
 * or null if the operation fails or no data is available.
 */
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

/**
 * Retrieves a list of ticker symbols that are considered popular.
 * @return {string[]} An array of popular ticker symbols.
 */
export function getPopularTickers(): string[] {
  return [
    "AAPL", "GOOGL", "MSFT", "AMZN", "NVDA", "META", "TSLA", "BRK.B",
    "JPM", "V", "JNJ", "WMT", "PG", "MA", "UNH", "HD", "DIS", "BAC",
    "ADBE", "CRM", "NFLX", "INTC", "AMD", "CSCO", "PEP",
  ];
}

/**
 * Maps raw signal data fields from the input object to a formatted signals data object.
 *
 * @param {RawSignalsData} d - The raw signals data containing various market signal properties.
 * @return {SignalsData} The formatted signals data with mapped and transformed fields.
 */
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

/**
 * Maps raw momentum data fields to structured momentum data format.
 *
 * @param {RawMomentumData} d - Raw momentum data containing unprocessed field names and values.
 * @return {MomentumData} A structured object with processed momentum indicators and their respective values.
 */
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

/**
 * Fetches the forecast data for a given stock symbol and period.
 *
 * @param {string} symbol - The stock ticker symbol for which to fetch the forecast.
 * @param {string} [period="3mo"] - The forecast period (e.g., "3mo", "6mo", "1y"). Defaults to "3mo".
 * @return {Promise<ForecastData[]>} A promise that resolves to an array of forecast data objects.
 * @throws {Error} Throws an error if the fetch operation fails or the response contains an error.
 */
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

/**
 * Fetches signal data for the specified stock symbol and time period.
 *
 * @param {string} symbol - The stock ticker symbol for which to fetch signals.
 * @param {string} [period="6mo"] - The time period for the requested signals (default is "6 months").
 * @return {Promise<SignalsData[]>} A promise that resolves to an array of signal data.
 * @throws {Error} If the fetch request fails or if the API returns an error.
 */
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

/**
 * Fetches momentum data for a given stock symbol and period.
 *
 * @param {string} symbol - The stock ticker symbol to fetch momentum data for.
 * @param {string} [period="3mo"] - The time period for which momentum data is required (default is 3 months).
 * @return {Promise<MomentumData[]>} A promise that resolves to an array of momentum data objects.
 * @throws {Error} If the request fails or the server returns an error response.
 */
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

/**
 * Fetches historical stock data for a given symbol by first attempting to retrieve it from cache.
 * If the cached data is unavailable, it falls back to fetching the data directly from the API.
 *
 * @param {string} symbol - The stock symbol to fetch historical data for.
 * @param {string} [period="1y"] - The time period for which to retrieve the historical data (e.g., "1d", "1mo", "1y").
 * @param {string} [interval="1d"] - The interval between data points (e.g., "1m", "1h", "1d").
 * @return {Promise<StockHistory[]>} A promise that resolves to an array of stock history objects, each containing date, open, high, low, close, and volume values.
 */
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

/**
 * Fetches signals data, using cached results if available. If the cache is unavailable,
 * it falls back to a direct API call.
 *
 * @param {string} symbol - The symbol for which to fetch signals.
 * @param {string} [period="3mo"] - The time period for the signals. Defaults to "3mo".
 * @return {Promise<SignalsData[]>} - A promise that resolves to an array of signals data.
 */
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

/**
 * Fetches momentum data for a given symbol and period, utilizing a caching mechanism.
 * If the queue fetch fails, it falls back to a direct API call.
 *
 * @param {string} symbol - The financial instrument's symbol for which momentum data is retrieved.
 * @param {string} [period="3mo"] - The time period for which the momentum data is fetched (e.g., "1d", "1mo"). Defaults to "3mo".
 * @return {Promise<MomentumData[]>} A promise resolving to an array of momentum data.
 */
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

/**
 * Fetches the growth estimate for a given symbol, leveraging caching through a queue endpoint.
 * If the queue is unavailable, it falls back to using the direct API.
 *
 * @param {string} symbol - The stock or asset symbol for which the growth estimate is to be fetched.
 * @return {Promise<GrowthEstimate | null>} A promise that resolves to the growth estimate object if successful, or null if no data is available.
 */
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

/**
 * Fetches the forecast data for a given symbol and period, utilizing a cached queue mechanism.
 * Falls back to direct API requests if the cached mechanism is unavailable.
 *
 * @param {string} symbol - The stock symbol or identifier for which to fetch the forecast data.
 * @param {string} [period="3mo"] - The time period for the forecast data, defaulting to 3 months if not specified.
 * @return {Promise<ForecastData[]>} A promise that resolves to an array of forecast data.
 */
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
