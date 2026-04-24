/**
 * Provider abstraction layer for multiple stock data APIs.
 *
 * Supports:
 * - yfinance (primary, free)
 * - Finnhub (free tier available)
 * - Alpha Vantage (free tier available)
 */

import { BaseProvider, ProviderError, type ProviderOptions } from "./base";
import { YFinanceProvider } from "./yfinance";
import { FinnhubProvider } from "./finnhub";
import { AlphaVantageProvider } from "./alpha_vantage";
import { FallbackProvider, createProviderWithFallback, type ProviderName } from "./fallback";

export { BaseProvider, ProviderError, type ProviderOptions };
export { YFinanceProvider };
export { FinnhubProvider };
export { AlphaVantageProvider };
export { FallbackProvider, createProviderWithFallback, type ProviderName };

export const DEFAULT_PROVIDER = "yfinance" as const;

export const PROVIDERS = {
  yfinance: "yfinance",
  finnhub: "finnhub",
  alpha_vantage: "alpha_vantage",
} as const;

export function getProvider(name: string = DEFAULT_PROVIDER, options: ProviderOptions = {}): BaseProvider {
  const providerClasses: Record<string, new (options: ProviderOptions) => BaseProvider> = {
    yfinance: YFinanceProvider,
    finnhub: FinnhubProvider,
    alpha_vantage: AlphaVantageProvider,
  };

  const ProviderClass = providerClasses[name.toLowerCase()];
  if (!ProviderClass) {
    throw new Error(`Unknown provider: ${name}. Available: ${Object.keys(providerClasses).join(", ")}`);
  }

  return new ProviderClass(options);
}