/**
 * YFinance provider - primary provider using Yahoo Finance API.
 */

import { BaseProvider, type ProviderOptions, ProviderError } from "./base";
import {
  getQuote as getYahooQuote,
  getHistory as getYahooHistory,
  getInfo as getYahooInfo,
  getFinancials as getYahooFinancials,
  getEarnings as getYahooEarnings,
  getNews as getYahooNews,
  getRecommendations as getYahooRecommendations,
  type OHLCVData,
  type QuoteData,
} from "../client";
import { getIndicators } from "../indicators";
import type { Period, Interval } from "../constants";

export class YFinanceProvider extends BaseProvider {
  name = "yfinance";
  requiresApiKey = false;

  constructor(options: ProviderOptions = {}) {
    super(options);
  }

  async getQuote(ticker: string): Promise<QuoteData> {
    try {
      return await getYahooQuote(ticker);
    } catch (error) {
      throw new ProviderError(`Failed to get quote for ${ticker}: ${error}`);
    }
  }

  async getHistory(ticker: string, period: Period = "1y", interval: Interval = "1d"): Promise<OHLCVData[]> {
    try {
      return await getYahooHistory(ticker, period, interval);
    } catch (error) {
      throw new ProviderError(`Failed to get history for ${ticker}: ${error}`);
    }
  }

  async getInfo(ticker: string): Promise<Record<string, unknown>> {
    try {
      return await getYahooInfo(ticker);
    } catch (error) {
      throw new ProviderError(`Failed to get info for ${ticker}: ${error}`);
    }
  }

  async getFinancials(ticker: string): Promise<Record<string, unknown>> {
    try {
      return await getYahooFinancials(ticker);
    } catch (error) {
      throw new ProviderError(`Failed to get financials for ${ticker}: ${error}`);
    }
  }

  async getEarnings(ticker: string): Promise<Record<string, unknown>> {
    try {
      return await getYahooEarnings(ticker);
    } catch (error) {
      throw new ProviderError(`Failed to get earnings for ${ticker}: ${error}`);
    }
  }

  async getNews(ticker: string): Promise<Array<{ title: string; publisher: string; link: string; published: string }>> {
    try {
      return await getYahooNews(ticker);
    } catch (error) {
      throw new ProviderError(`Failed to get news for ${ticker}: ${error}`);
    }
  }

  async getRecommendations(ticker: string): Promise<Record<string, unknown>> {
    try {
      return await getYahooRecommendations(ticker);
    } catch (error) {
      throw new ProviderError(`Failed to get recommendations for ${ticker}: ${error}`);
    }
  }

  async getIndicators(ticker: string, period: Period = "6mo"): Promise<Record<string, unknown>> {
    try {
      const indicators = await getIndicators(ticker, period);
      return indicators as unknown as Record<string, unknown>;
    } catch (error) {
      throw new ProviderError(`Failed to get indicators for ${ticker}: ${error}`);
    }
  }
}