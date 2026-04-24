/**
 * Provider fallback wrapper - tries primary, falls back to secondary on failure.
 */

import { BaseProvider, type ProviderOptions, ProviderError } from "./base";
import type { Period, Interval } from "../constants";
import type { OHLCVData, QuoteData } from "../client";
import { YFinanceProvider } from "./yfinance";
import { FinnhubProvider } from "./finnhub";
import { AlphaVantageProvider } from "./alpha_vantage";

export type ProviderName = "yfinance" | "finnhub" | "alpha_vantage";

const DEFAULT_PROVIDER: ProviderName = "yfinance";

const PROVIDER_CLASSES: Record<ProviderName, new (options: ProviderOptions) => BaseProvider> = {
  yfinance: YFinanceProvider,
  finnhub: FinnhubProvider,
  alpha_vantage: AlphaVantageProvider,
};

export function getProviderClass(name: ProviderName): new (options: ProviderOptions) => BaseProvider {
  const providerClass = PROVIDER_CLASSES[name.toLowerCase() as ProviderName];
  if (!providerClass) {
    throw new ProviderError(`Unknown provider: ${name}. Available: ${Object.keys(PROVIDER_CLASSES).join(", ")}`);
  }
  return providerClass;
}

export function createProvider(name: ProviderName, options: ProviderOptions = {}): BaseProvider {
  const ProviderClass = getProviderClass(name);
  return new ProviderClass(options);
}

export class FallbackProvider extends BaseProvider {
  name = "fallback";
  requiresApiKey = false;

  private primaryName: ProviderName;
  private fallbackName?: ProviderName;
  private primaryConfig: ProviderOptions;
  private fallbackConfig: ProviderOptions;
  private primary?: BaseProvider;
  private fallback?: BaseProvider;
  private primaryFailed: boolean = false;

  constructor(
    primary: ProviderName = DEFAULT_PROVIDER,
    fallback?: ProviderName,
    primaryConfig: ProviderOptions = {},
    fallbackConfig: ProviderOptions = {},
    _options: ProviderOptions = {}
  ) {
    super(_options);
    this.primaryName = primary;
    this.fallbackName = fallback;
    this.primaryConfig = primaryConfig;
    this.fallbackConfig = fallbackConfig;
  }

  private getPrimary(): BaseProvider {
    if (!this.primary) {
      this.primary = createProvider(this.primaryName, this.primaryConfig);
    }
    return this.primary;
  }

  private getFallback(): BaseProvider | undefined {
    if (!this.fallback && this.fallbackName) {
      try {
        this.fallback = createProvider(this.fallbackName, this.fallbackConfig);
      } catch {
        // Fallback not available
      }
    }
    return this.fallback;
  }

  private tryProvider(provider: BaseProvider, method: string, ...args: unknown[]): unknown {
    const methodFunc = (provider as unknown as Record<string, unknown>)[method];
    if (typeof methodFunc !== "function") {
      throw new ProviderError(`${provider.name} does not support ${method}`);
    }
    return (methodFunc as (...args: unknown[]) => unknown)(...args);
  }

  private withFallback<T>(method: string, ...args: unknown[]): Promise<T> {
    return new Promise(async (resolve, reject) => {
      // Try primary
      if (!this.primaryFailed) {
        try {
          const result = await this.tryProvider(this.getPrimary(), method, ...args);
          resolve(result as T);
          return;
        } catch (error) {
          // Mark primary as failed, try fallback
          this.primaryFailed = true;
        }
      }

      // Try fallback
      const fallback = this.getFallback();
      if (fallback) {
        try {
          const result = await this.tryProvider(fallback, method, ...args);
          resolve(result as T);
          return;
        } catch {
          // Fallback also failed
        }
      }

      // No fallback, re-raise original error
      reject(new ProviderError(`All providers failed. Primary: ${this.primaryName}, Fallback: ${this.fallbackName}`));
    });
  }

  async getQuote(ticker: string): Promise<QuoteData> {
    return this.withFallback<QuoteData>("getQuote", ticker);
  }

  async getHistory(ticker: string, period?: Period, interval?: Interval): Promise<OHLCVData[]> {
    return this.withFallback<OHLCVData[]>("getHistory", ticker, period, interval);
  }

  async getInfo(ticker: string): Promise<Record<string, unknown>> {
    return this.withFallback<Record<string, unknown>>("getInfo", ticker);
  }

  async getFinancials(ticker: string): Promise<Record<string, unknown>> {
    return this.withFallback<Record<string, unknown>>("getFinancials", ticker);
  }

  async getEarnings(ticker: string): Promise<Record<string, unknown>> {
    return this.withFallback<Record<string, unknown>>("getEarnings", ticker);
  }

  async getNews(ticker: string): Promise<Array<{ title: string; publisher: string; link: string; published: string }>> {
    return this.withFallback("getNews", ticker);
  }

  async getRecommendations(ticker: string): Promise<Record<string, unknown>> {
    return this.withFallback<Record<string, unknown>>("getRecommendations", ticker);
  }

  async getIndicators(ticker: string, period?: Period): Promise<Record<string, unknown>> {
    return this.withFallback<Record<string, unknown>>("getIndicators", ticker, period);
  }
}

export function createProviderWithFallback(
  primary: ProviderName = DEFAULT_PROVIDER,
  fallback?: ProviderName,
  primaryApiKey?: string,
  fallbackApiKey?: string
): BaseProvider {
  if (fallback) {
    return new FallbackProvider(
      primary,
      fallback,
      primaryApiKey ? { apiKey: primaryApiKey } : {},
      fallbackApiKey ? { apiKey: fallbackApiKey } : {}
    );
  } else {
    return createProvider(primary, primaryApiKey ? { apiKey: primaryApiKey } : {});
  }
}