/**
 * Portfolio generation and analysis.
 */

import { getHistory, getQuote, type OHLCVData, type QuoteData } from "./client";
import { STOCK_POOLS, BOND_POOL, CRYPTO_POOL, type PortfolioStrategy } from "./constants";

export interface Position {
  symbol: string;
  shares: number;
  price: number;
  value: number;
}

export interface Allocation {
  stocks: number;
  bonds: number;
  crypto: number;
}

export interface Portfolio {
  allocation: Allocation;
  stocks: {
    tickers: Position[];
    allocation_pct: number;
  };
  bonds: {
    tickers: Position[];
    allocation_pct: number;
  };
  crypto: {
    tickers: Position[];
    allocation_pct: number;
  };
  total_value: number;
}

export interface PortfolioMetrics {
  total_value: number;
  stocks_value: number;
  bonds_value: number;
  crypto_value: number;
  stocks_pct: number;
  bonds_pct: number;
  crypto_pct: number;
}

interface StrategyModifier {
  stocks: number;
  bonds: number;
  crypto: number;
}

const STRATEGY_MODIFIERS: Record<PortfolioStrategy, StrategyModifier> = {
  growth: { stocks: 20, bonds: -15, crypto: 5 },
  value: { stocks: 10, bonds: -5, crypto: 0 },
  dividend: { stocks: 5, bonds: 0, crypto: 0 },
  conservative: { stocks: -15, bonds: 20, crypto: 0 },
  balanced: { stocks: 0, bonds: 0, crypto: 0 },
  aggressive: { stocks: 15, bonds: -10, crypto: 5 },
};

/**
 * Get portfolio allocation based on age and strategy.
 */
export function getPortfolioAllocation(age: number, strategy: PortfolioStrategy = "balanced"): Allocation {
  // Base allocation by age (100 - age = stocks percentage)
  const bonds = Math.max(10, Math.min(60, age));
  const stocks = 100 - bonds;

  const modifier = STRATEGY_MODIFIERS[strategy] || STRATEGY_MODIFIERS.balanced;

  return {
    stocks: Math.max(10, Math.min(90, stocks + modifier.stocks)),
    bonds: Math.max(5, Math.min(70, bonds + modifier.bonds)),
    crypto: Math.max(0, Math.min(10, modifier.crypto)),
  };
}

/**
 * Fetch current price for a ticker.
 */
async function fetchPrice(ticker: string): Promise<number> {
  try {
    const quote = await getQuote(ticker);
    return quote.price;
  } catch {
    // Fallback to fetching history
    try {
      const data = await getHistory(ticker, "3mo", "1d");
      if (data.length > 0) {
        return data[data.length - 1].Close;
      }
    } catch {
      // Ignore errors
    }
    return 0;
  }
}

/**
 * Generate a portfolio based on capital and strategy.
 */
export async function generatePortfolio(
  capital: number,
  strategy: PortfolioStrategy = "balanced",
  age: number = 30,
  topN: number = 5,
  stockPools: Record<string, string[]> = STOCK_POOLS,
  bondPool: string[] = BOND_POOL,
  cryptoPool: string[] = CRYPTO_POOL
): Promise<Portfolio> {
  const allocation = getPortfolioAllocation(age, strategy);

  const stocksKey = strategy in stockPools ? strategy : "balanced";
  const stockTickers = (stockPools[stocksKey] || stockPools.balanced).slice(0, topN);

  const portfolio: Portfolio = {
    allocation,
    stocks: { tickers: [], allocation_pct: allocation.stocks },
    bonds: { tickers: [], allocation_pct: allocation.bonds },
    crypto: { tickers: [], allocation_pct: allocation.crypto },
    total_value: 0,
  };

  // Get stock data
  const stockValue = capital * allocation.stocks / 100;
  for (const ticker of stockTickers) {
    try {
      const price = await fetchPrice(ticker);
      const shares = price > 0 ? Math.floor(stockValue / price / stockTickers.length) : 0;
      const value = shares * price;

      portfolio.stocks.tickers.push({
        symbol: ticker,
        shares,
        price,
        value,
      });
    } catch {
      continue;
    }
  }

  // Get bond data
  const bondValue = capital * allocation.bonds / 100;
  for (const ticker of bondPool.slice(0, 3)) {
    try {
      const price = await fetchPrice(ticker);
      const shares = price > 0 ? Math.floor(bondValue / price / 3) : 0;
      const value = shares * price;

      portfolio.bonds.tickers.push({
        symbol: ticker,
        shares,
        price,
        value,
      });
    } catch {
      continue;
    }
  }

  // Get crypto data
  if (allocation.crypto > 0) {
    const cryptoValue = capital * allocation.crypto / 100;
    for (const ticker of cryptoPool.slice(0, 3)) {
      try {
        const price = await fetchPrice(ticker);
        const shares = price > 0 ? Math.floor(cryptoValue / price / 3) : 0;
        const value = shares * price;

        portfolio.crypto.tickers.push({
          symbol: ticker,
          shares,
          price,
          value,
        });
      } catch {
        continue;
      }
    }
  }

  // Calculate totals
  const totalStocks = portfolio.stocks.tickers.reduce((sum, s) => sum + s.value, 0);
  const totalBonds = portfolio.bonds.tickers.reduce((sum, b) => sum + b.value, 0);
  const totalCrypto = portfolio.crypto.tickers.reduce((sum, c) => sum + c.value, 0);
  portfolio.total_value = totalStocks + totalBonds + totalCrypto;

  return portfolio;
}

/**
 * Calculate portfolio performance metrics.
 */
export function calculatePortfolioMetrics(portfolio: Portfolio): PortfolioMetrics {
  const total = portfolio.total_value;
  if (total === 0) {
    return {
      total_value: 0,
      stocks_value: 0,
      bonds_value: 0,
      crypto_value: 0,
      stocks_pct: 0,
      bonds_pct: 0,
      crypto_pct: 0,
    };
  }

  const stocksValue = portfolio.stocks.tickers.reduce((sum, s) => sum + s.value, 0);
  const bondsValue = portfolio.bonds.tickers.reduce((sum, b) => sum + b.value, 0);
  const cryptoValue = portfolio.crypto.tickers.reduce((sum, c) => sum + c.value, 0);

  return {
    total_value: total,
    stocks_value: stocksValue,
    bonds_value: bondsValue,
    crypto_value: cryptoValue,
    stocks_pct: (stocksValue / total) * 100,
    bonds_pct: (bondsValue / total) * 100,
    crypto_pct: (cryptoValue / total) * 100,
  };
}