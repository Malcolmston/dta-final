/**
 * Base provider interface.
 */

import type { Period, Interval } from "../constants";
import type { OHLCVData, QuoteData } from "../client";

export class ProviderError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProviderError";
  }
}

export interface ProviderOptions {
  apiKey?: string;
  [key: string]: unknown;
}

export abstract class BaseProvider {
  abstract name: string;
  requiresApiKey: boolean = false;

  constructor(_options: ProviderOptions = {}) {
    // Base implementation
  }

  abstract getQuote(ticker: string): Promise<QuoteData>;

  abstract getHistory(ticker: string, period?: Period, interval?: Interval): Promise<OHLCVData[]>;

  abstract getInfo(ticker: string): Promise<Record<string, unknown>>;

  getFinancials(ticker: string): Promise<Record<string, unknown>> {
    throw new ProviderError(`${this.name} does not support financials`);
  }

  getEarnings(ticker: string): Promise<Record<string, unknown>> {
    throw new ProviderError(`${this.name} does not support earnings`);
  }

  getNews(ticker: string): Promise<Array<{ title: string; publisher: string; link: string; published: string }>> {
    throw new ProviderError(`${this.name} does not support news`);
  }

  getRecommendations(ticker: string): Promise<Record<string, unknown>> {
    throw new ProviderError(`${this.name} does not support recommendations`);
  }

  getIndicators(ticker: string, period?: Period): Promise<Record<string, unknown>> {
    throw new ProviderError(`${this.name} does not support indicators`);
  }
}