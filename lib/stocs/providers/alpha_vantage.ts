/**
 * Alpha Vantage provider - alternative provider with technical indicators.
 */

import { BaseProvider, type ProviderOptions, ProviderError } from "./base";
import type { Period, Interval } from "../constants";
import type { OHLCVData, QuoteData } from "../client";

const ALPHA_VANTAGE_BASE_URL = "https://www.alphavantage.co/query";

interface AlphaVantageResponse {
  "Global Quote"?: Record<string, string>;
  "Technical Analysis: RSI"?: Record<string, Record<string, string>>;
  "Technical Analysis: MACD"?: Record<string, Record<string, string>>;
  "Technical Analysis: SMA"?: Record<string, Record<string, string>>;
  "Time Series (Daily)"?: Record<string, Record<string, string>>;
  Note?: string;
  Error?: string;
  [key: string]: unknown;
}

export class AlphaVantageProvider extends BaseProvider {
  name = "alpha_vantage";
  requiresApiKey = true;
  private apiKey: string;

  constructor(options: ProviderOptions = {}) {
    super(options);
    this.apiKey = options.apiKey || "";

    if (!this.apiKey) {
      throw new ProviderError("Alpha Vantage requires an API key. Pass apiKey in options or set ALPHA_VANTAGE_API_KEY environment variable.");
    }
  }

  private async fetch(endpoint: string, params: Record<string, string>): Promise<AlphaVantageResponse> {
    const url = new URL(ALPHA_VANTAGE_BASE_URL);
    url.searchParams.append("apikey", this.apiKey);
    url.searchParams.append("function", endpoint);
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.append(key, value);
    }

    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error(`Alpha Vantage API error: ${response.statusText}`);
    }

    const data: AlphaVantageResponse = await response.json();

    if (data.Note) {
      throw new ProviderError("Alpha Vantage API rate limit reached");
    }

    if (data.Error) {
      throw new ProviderError(data.Error);
    }

    return data;
  }

  async getQuote(ticker: string): Promise<QuoteData> {
    try {
      const data = await this.fetch("GLOBAL_QUOTE", { symbol: ticker.toUpperCase() });
      const quote = data["Global Quote"];

      if (!quote || Object.keys(quote).length === 0) {
        throw new ProviderError(`No data found for ${ticker}`);
      }

      return {
        symbol: ticker.toUpperCase(),
        price: parseFloat(quote["05. price"] || "0"),
        change: parseFloat(quote["09. change"] || "0"),
        change_pct: parseFloat((quote["10. change percent"] || "0%").replace("%", "")),
        volume: parseInt(quote["06. volume"] || "0"),
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      if (error instanceof ProviderError) throw error;
      throw new ProviderError(`Failed to get quote for ${ticker}: ${error}`);
    }
  }

  async getHistory(ticker: string, period: Period = "1y", interval: Interval = "1d"): Promise<OHLCVData[]> {
    try {
      const outputsize = ["1d", "5d", "1mo"].includes(period) ? "compact" : "full";

      const data = await this.fetch("TIME_SERIES_DAILY", {
        symbol: ticker.toUpperCase(),
        outputsize,
      });

      const timeSeries = data["Time Series (Daily)"];
      if (!timeSeries) {
        throw new ProviderError(`No data found for ${ticker}`);
      }

      const entries = Object.entries(timeSeries).slice(0, period === "max" ? 5000 : 100);

      return entries.map(([date, values]) => ({
        Date: date,
        Open: parseFloat((values as Record<string, string>)["1. open"]),
        High: parseFloat((values as Record<string, string>)["2. high"]),
        Low: parseFloat((values as Record<string, string>)["3. low"]),
        Close: parseFloat((values as Record<string, string>)["4. close"]),
        Volume: parseInt((values as Record<string, string>)["5. volume"]),
      })).reverse();
    } catch (error) {
      if (error instanceof ProviderError) throw error;
      throw new ProviderError(`Failed to get history for ${ticker}: ${error}`);
    }
  }

  async getInfo(ticker: string): Promise<Record<string, unknown>> {
    // Alpha Vantage doesn't have rich company info
    return {
      symbol: ticker.toUpperCase(),
      name: ticker.toUpperCase(),
      note: "Alpha Vantage provides limited company info. Use Yahoo Finance for full details.",
    };
  }

  async getIndicators(ticker: string, period: Period = "6mo"): Promise<Record<string, unknown>> {
    try {
      const result: Record<string, number> = {};

      // RSI
      try {
        const rsiData = await this.fetch("RSI", {
          symbol: ticker.toUpperCase(),
          interval: "daily",
          time_period: "14",
          series_type: "close",
        });

        const rsiSeries = rsiData["Technical Analysis: RSI"];
        if (rsiSeries) {
          const latestRSI = Object.values(rsiSeries)[0] as Record<string, string>;
          result.rsi = parseFloat(latestRSI["RSI"] || "0");
        }
      } catch {
        // Ignore indicator errors
      }

      // MACD
      try {
        const macdData = await this.fetch("MACD", {
          symbol: ticker.toUpperCase(),
          interval: "daily",
          fastperiod: "12",
          slowperiod: "26",
          signalperiod: "9",
          series_type: "close",
        });

        const macdSeries = macdData["Technical Analysis: MACD"];
        if (macdSeries) {
          const latestMACD = Object.values(macdSeries)[0] as Record<string, string>;
          result.macd = parseFloat(latestMACD["MACD"] || "0");
          result.macd_signal = parseFloat(latestMACD["MACD_Signal"] || "0");
          result.macd_hist = parseFloat(latestMACD["MACD_Hist"] || "0");
        }
      } catch {
        // Ignore indicator errors
      }

      // SMA
      try {
        const smaData = await this.fetch("SMA", {
          symbol: ticker.toUpperCase(),
          interval: "daily",
          time_period: "20",
          series_type: "close",
        });

        const smaSeries = smaData["Technical Analysis: SMA"];
        if (smaSeries) {
          const latestSMA = Object.values(smaSeries)[0] as Record<string, string>;
          result.sma_20 = parseFloat(latestSMA["SMA"] || "0");
        }
      } catch {
        // Ignore indicator errors
      }

      return result;
    } catch (error) {
      throw new ProviderError(`Failed to get indicators for ${ticker}: ${error}`);
    }
  }
}