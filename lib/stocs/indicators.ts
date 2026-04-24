/**
 * Technical indicators and trading signals.
 */

import { getHistory, type OHLCVData } from "./client";
import type { Period } from "./constants";

export interface IndicatorValues {
  rsi: number;
  sma_20: number;
  sma_50: number;
  macd: number;
  signal: number;
  histogram: number;
  bb_upper: number;
  bb_middle: number;
  bb_lower: number;
  atr: number;
}

export type TradingSignal = "BUY" | "SELL" | "HOLD";

export interface SignalData extends OHLCVData {
  RSI: number;
  SMA_20: number;
  SMA_50: number;
  MACD: number;
  Signal: number;
  Histogram: number;
  SignalLabel: TradingSignal;
}

/**
 * Calculate Relative Strength Index.
 */
export function calculateRSI(prices: number[], period: number = 14): number[] {
  const rsi: number[] = [];
  const gains: number[] = [];
  const losses: number[] = [];

  for (let i = 1; i < prices.length; i++) {
    const delta = prices[i] - prices[i - 1];
    gains.push(delta > 0 ? delta : 0);
    losses.push(delta < 0 ? -delta : 0);
  }

  // First RSI calculation uses simple average
  let avgGain = gains.slice(0, period).reduce((a, b) => a + b, 0) / period;
  let avgLoss = losses.slice(0, period).reduce((a, b) => a + b, 0) / period;

  for (let i = 0; i < period - 1; i++) {
    rsi.push(NaN);
  }

  if (avgLoss === 0) {
    rsi.push(100);
  } else {
    const rs = avgGain / avgLoss;
    rsi.push(100 - 100 / (1 + rs));
  }

  // Subsequent RSI uses smoothed average
  for (let i = period; i < gains.length; i++) {
    avgGain = (avgGain * (period - 1) + gains[i]) / period;
    avgLoss = (avgLoss * (period - 1) + losses[i]) / period;

    if (avgLoss === 0) {
      rsi.push(100);
    } else {
      const rs = avgGain / avgLoss;
      rsi.push(100 - 100 / (1 + rs));
    }
  }

  return rsi;
}

/**
 * Calculate Simple Moving Average.
 */
export function calculateSMA(prices: number[], period: number): number[] {
  const sma: number[] = [];

  for (let i = 0; i < prices.length; i++) {
    if (i < period - 1) {
      sma.push(NaN);
    } else {
      const slice = prices.slice(i - period + 1, i + 1);
      const avg = slice.reduce((a, b) => a + b, 0) / period;
      sma.push(avg);
    }
  }

  return sma;
}

/**
 * Calculate Exponential Moving Average.
 */
export function calculateEMA(prices: number[], period: number): number[] {
  const ema: number[] = [];
  const multiplier = 2 / (period + 1);

  // First EMA is SMA
  const firstSMA = prices.slice(0, period).reduce((a, b) => a + b, 0) / period;
  for (let i = 0; i < period - 1; i++) {
    ema.push(NaN);
  }
  ema.push(firstSMA);

  // Calculate EMA
  for (let i = period; i < prices.length; i++) {
    const value = (prices[i] - ema[i - 1]) * multiplier + ema[i - 1];
    ema.push(value);
  }

  return ema;
}

/**
 * Calculate MACD (Moving Average Convergence Divergence).
 */
export function calculateMACD(
  prices: number[],
  fast: number = 12,
  slow: number = 26,
  signalPeriod: number = 9
): { macd: number[]; signal: number[]; histogram: number[] } {
  const emaFast = calculateEMA(prices, fast);
  const emaSlow = calculateEMA(prices, slow);

  const macd: number[] = [];
  for (let i = 0; i < prices.length; i++) {
    if (isNaN(emaFast[i]) || isNaN(emaSlow[i])) {
      macd.push(NaN);
    } else {
      macd.push(emaFast[i] - emaSlow[i]);
    }
  }

  // Filter out NaN values for signal calculation
  const validMacd = macd.filter((v) => !isNaN(v));

  const signalEMA = calculateEMA(validMacd, signalPeriod);
  const signalLine: number[] = [];

  let signalIdx = 0;
  for (let i = 0; i < prices.length; i++) {
    if (isNaN(macd[i])) {
      signalLine.push(NaN);
    } else {
      signalLine.push(signalEMA[signalIdx] || NaN);
      signalIdx++;
    }
  }

  const histogram: number[] = [];
  for (let i = 0; i < prices.length; i++) {
    if (isNaN(macd[i]) || isNaN(signalLine[i])) {
      histogram.push(NaN);
    } else {
      histogram.push(macd[i] - signalLine[i]);
    }
  }

  return { macd, signal: signalLine, histogram };
}

/**
 * Calculate Bollinger Bands.
 */
export function calculateBollingerBands(
  prices: number[],
  period: number = 20,
  stdDev: number = 2
): { upper: number[]; middle: number[]; lower: number[] } {
  const middle = calculateSMA(prices, period);
  const upper: number[] = [];
  const lower: number[] = [];

  for (let i = 0; i < prices.length; i++) {
    if (i < period - 1) {
      upper.push(NaN);
      lower.push(NaN);
    } else {
      const slice = prices.slice(i - period + 1, i + 1);
      const mean = middle[i];
      const variance = slice.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / period;
      const std = Math.sqrt(variance);

      upper.push(middle[i] + std * stdDev);
      lower.push(middle[i] - std * stdDev);
    }
  }

  return { upper, middle, lower };
}

/**
 * Calculate Average True Range.
 */
export function calculateATR(
  high: number[],
  low: number[],
  close: number[],
  period: number = 14
): number[] {
  const trueRange: number[] = [];

  for (let i = 0; i < high.length; i++) {
    if (i === 0) {
      trueRange.push(high[i] - low[i]);
    } else {
      const hl = high[i] - low[i];
      const hc = Math.abs(high[i] - close[i - 1]);
      const lc = Math.abs(low[i] - close[i - 1]);
      trueRange.push(Math.max(hl, hc, lc));
    }
  }

  const atr: number[] = [];
  for (let i = 0; i < trueRange.length; i++) {
    if (i < period - 1) {
      atr.push(NaN);
    } else {
      const slice = trueRange.slice(i - period + 1, i + 1);
      const avg = slice.reduce((a, b) => a + b, 0) / period;
      atr.push(avg);
    }
  }

  return atr;
}

/**
 * Generate trading signals based on RSI and MACD.
 */
export function generateSignals(data: OHLCVData[]): SignalData[] {
  if (data.length === 0) {
    return [];
  }

  const closes = data.map((d) => d.Close);
  const highs = data.map((d) => d.High);
  const lows = data.map((d) => d.Low);

  const rsi = calculateRSI(closes);
  const sma20 = calculateSMA(closes, 20);
  const sma50 = calculateSMA(closes, 50);
  const { macd, signal: signalLine, histogram } = calculateMACD(closes);
  const { upper: bbUpper, middle: bbMiddle, lower: bbLower } = calculateBollingerBands(closes);

  const result: SignalData[] = [];

  for (let i = 0; i < data.length; i++) {
    let signal: TradingSignal = "HOLD";

    // RSI signals
    if (rsi[i] < 30) {
      signal = "BUY"; // Oversold
    } else if (rsi[i] > 70) {
      signal = "SELL"; // Overbought
    }

    // MACD crossover signals
    if (i > 0) {
      if (macd[i] > signalLine[i] && macd[i - 1] <= signalLine[i - 1]) {
        signal = "BUY";
      } else if (macd[i] < signalLine[i] && macd[i - 1] >= signalLine[i - 1]) {
        signal = "SELL";
      }
    }

    result.push({
      ...data[i],
      RSI: rsi[i] || 0,
      SMA_20: sma20[i] || 0,
      SMA_50: sma50[i] || 0,
      MACD: macd[i] || 0,
      Signal: signalLine[i] || 0,
      Histogram: histogram[i] || 0,
      SignalLabel: signal,
    });
  }

  return result;
}

/**
 * Get technical indicators for a ticker.
 */
export async function getIndicators(ticker: string, period: Period = "6mo"): Promise<IndicatorValues> {
  const data = await getHistory(ticker, period, "1d");

  if (data.length === 0) {
    return {
      rsi: 0,
      sma_20: 0,
      sma_50: 0,
      macd: 0,
      signal: 0,
      histogram: 0,
      bb_upper: 0,
      bb_middle: 0,
      bb_lower: 0,
      atr: 0,
    };
  }

  const closes = data.map((d) => d.Close);
  const highs = data.map((d) => d.High);
  const lows = data.map((d) => d.Low);

  const lastIdx = closes.length - 1;
  const rsi = calculateRSI(closes);
  const sma20 = calculateSMA(closes, 20);
  const sma50 = calculateSMA(closes, 50);
  const macd = calculateMACD(closes);
  const bb = calculateBollingerBands(closes);
  const atr = calculateATR(highs, lows, closes);

  return {
    rsi: rsi[lastIdx] || 0,
    sma_20: sma20[lastIdx] || 0,
    sma_50: sma50[lastIdx] || 0,
    macd: macd.macd[lastIdx] || 0,
    signal: macd.signal[lastIdx] || 0,
    histogram: macd.histogram[lastIdx] || 0,
    bb_upper: bb.upper[lastIdx] || 0,
    bb_middle: bb.middle[lastIdx] || 0,
    bb_lower: bb.lower[lastIdx] || 0,
    atr: atr[lastIdx] || 0,
  };
}

/**
 * Get trading signals for a ticker.
 */
export async function getSignals(ticker: string, period: Period = "6mo"): Promise<SignalData[]> {
  const data = await getHistory(ticker, period, "1d");
  return generateSignals(data);
}