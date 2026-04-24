/**
 * stocs - A stock market data scraping library
 *
 * A TypeScript library for fetching and analyzing stock market data from Yahoo Finance.
 */

export * from "./constants";
export * from "./client";
export * from "./indicators";
export * from "./portfolio";
export * from "./providers";

// Re-export commonly used functions
export {
  fetchPastData,
  fetchMulti,
  getHistory,
  getHistoryMetadata,
  getInfo,
  getQuote,
  getActions,
  getDividends,
  getSplits,
  getFinancials,
  getIncomeStmt,
  getBalanceSheet,
  getCashFlow,
  getEarnings,
  getEarningsDates,
  getEarningsEstimate,
  getRecommendations,
  getAnalystPriceTargets,
  getMajorHolders,
  getInstitutionalHolders,
  getInsiderTransactions,
  getInsiderPurchases,
  getShares,
  getOptions,
  getOptionChain,
  getCalendar,
  getNews,
  getSustainability,
  getSecFilings,
  getMarket,
  getSector,
  type OHLCVData,
  type QuoteData,
  type TickerInfo,
} from "./client";

export {
  calculateRSI,
  calculateSMA,
  calculateEMA,
  calculateMACD,
  calculateBollingerBands,
  calculateATR,
  generateSignals,
  getIndicators,
  getSignals,
  type IndicatorValues,
  type TradingSignal,
  type SignalData,
} from "./indicators";

export {
  getPortfolioAllocation,
  generatePortfolio,
  calculatePortfolioMetrics,
  type Position,
  type Allocation,
  type Portfolio,
  type PortfolioMetrics,
} from "./portfolio";

export {
  getProvider,
  DEFAULT_PROVIDER,
  PROVIDERS,
  createProviderWithFallback,
  type ProviderName,
} from "./providers";