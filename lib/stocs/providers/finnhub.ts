/**
 * Finnhub provider - alternative provider with free tier.
 */

import { BaseProvider, type ProviderOptions, ProviderError } from "./base";
import type { Period, Interval } from "../constants";
import type { OHLCVData, QuoteData } from "../client";

interface FinnhubQuote {
  c: number; // Current price
  d: number; // Change
  dp: number; // Percent change
  h: number; // High price of the day
  l: number; // Low price of the day
  o: number; // Open price of the day
  pc: number; // Previous close price
  t: number; // Timestamp
}

interface FinnhubCandles {
  s: string; // Status
  t: number[]; // Timestamps
  o: number[]; // Open prices
  h: number[]; // High prices
  l: number[]; // Low prices
  c: number[]; // Close prices
  v: number[]; // Volumes
}

interface FinnhubProfile {
  country: string;
  currency: string;
  exchange: string;
  ipo: string;
  marketCapitalization: number;
  name: string;
  phone: string;
  shareOutstanding: number;
  ticker: string;
  weburl: string;
  logo: string;
  finnhubIndustry: string;
}

interface FinnhubNews {
  category: string;
  datetime: number;
  headline: string;
  id: number;
  image: string;
  related: string;
  source: string;
  summary: string;
  url: string;
}

const FINNHUB_BASE_URL = "https://finnhub.io/api/v1";

export class FinnhubProvider extends BaseProvider {
  name = "finnhub";
  requiresApiKey = true;
  private apiKey: string;

  constructor(options: ProviderOptions = {}) {
    super(options);
    this.apiKey = options.apiKey || "";

    if (!this.apiKey) {
      throw new ProviderError("Finnhub requires an API key. Pass apiKey in options or set FINNHUB_API_KEY environment variable.");
    }
  }

  private async fetch<T>(endpoint: string): Promise<T> {
    const url = `${FINNHUB_BASE_URL}${endpoint}&token=${this.apiKey}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Finnhub API error: ${response.statusText}`);
    }

    return response.json();
  }

  async getQuote(ticker: string): Promise<QuoteData> {
    try {
      const data = await this.fetch<FinnhubQuote>(`/quote?symbol=${ticker.toUpperCase()}`);

      if (data.c === 0 && data.dp === 0) {
        throw new ProviderError(`No data found for ${ticker}`);
      }

      return {
        symbol: ticker.toUpperCase(),
        price: data.c,
        change: data.d,
        change_pct: data.dp,
        volume: 0, // Finnhub doesn't provide volume in quote
        timestamp: new Date(data.t * 1000).toISOString(),
      };
    } catch (error) {
      if (error instanceof ProviderError) throw error;
      throw new ProviderError(`Failed to get quote for ${ticker}: ${error}`);
    }
  }

  async getHistory(ticker: string, period: Period = "1y", interval: Interval = "1d"): Promise<OHLCVData[]> {
    try {
      const periodMap: Record<string, number> = {
        "1d": 1,
        "5d": 5,
        "1mo": 30,
        "3mo": 90,
        "6mo": 180,
        "1y": 365,
        "2y": 730,
        "5y": 1825,
      };

      const days = periodMap[period] || 365;
      const to = Math.floor(Date.now() / 1000);
      const from = to - days * 24 * 60 * 60;

      const data = await this.fetch<FinnhubCandles>(
        `/ candles?symbol=${ticker.toUpperCase()}&resolution=D&from=${from}&to=${to}`
      );

      if (data.s === "no_data") {
        throw new ProviderError(`No data found for ${ticker}`);
      }

      return data.t.map((timestamp, i) => ({
        Date: new Date(timestamp * 1000).toISOString().split("T")[0],
        Open: data.o[i],
        High: data.h[i],
        Low: data.l[i],
        Close: data.c[i],
        Volume: data.v[i],
      }));
    } catch (error) {
      if (error instanceof ProviderError) throw error;
      throw new ProviderError(`Failed to get history for ${ticker}: ${error}`);
    }
  }

  async getInfo(ticker: string): Promise<Record<string, unknown>> {
    try {
      const profile = await this.fetch<FinnhubProfile>(`/stock/profile2?symbol=${ticker.toUpperCase()}`);

      if (!profile || !profile.name) {
        throw new ProviderError(`No profile found for ${ticker}`);
      }

      return {
        symbol: ticker.toUpperCase(),
        name: profile.name,
        ticker: profile.ticker,
        currency: profile.currency,
        exchange: profile.exchange,
        finnhubIndustry: profile.finnhubIndustry,
        ipo: profile.ipo,
        marketCapitalization: profile.marketCapitalization,
        shareOutstanding: profile.shareOutstanding,
        weburl: profile.weburl,
        logo: profile.logo,
      };
    } catch (error) {
      if (error instanceof ProviderError) throw error;
      throw new ProviderError(`Failed to get info for ${ticker}: ${error}`);
    }
  }

  async getNews(ticker: string): Promise<Array<{ title: string; publisher: string; link: string; published: string }>> {
    try {
      const toDate = new Date().toISOString().split("T")[0];
      const fromDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

      const news = await this.fetch<FinnhubNews[]>(
        `/company-news?symbol=${ticker.toUpperCase()}&_from=${fromDate}&to=${toDate}`
      );

      if (!news || news.length === 0) {
        return [];
      }

      return news.map((n) => ({
        title: n.headline,
        publisher: n.source,
        link: n.url,
        published: new Date(n.datetime * 1000).toISOString(),
        summary: n.summary,
        image: n.image,
      }));
    } catch (error) {
      throw new ProviderError(`Failed to get news for ${ticker}: ${error}`);
    }
  }

  async getEarnings(ticker: string): Promise<Record<string, unknown>> {
    try {
      const calendar = await this.fetch<unknown[]>(
        `/earnings-calendar?symbol=${ticker.toUpperCase()}&_from=2020-01-01&to=2025-12-31`
      );

      return { earnings: calendar || [] };
    } catch (error) {
      throw new ProviderError(`Failed to get earnings for ${ticker}: ${error}`);
    }
  }

  async getRecommendations(ticker: string): Promise<Record<string, unknown>> {
    try {
      const recs = await this.fetch<unknown[]>(`/stock/recommendations?symbol=${ticker.toUpperCase()}`);

      return { recommendations: recs || [] };
    } catch (error) {
      throw new ProviderError(`Failed to get recommendations for ${ticker}: ${error}`);
    }
  }
}