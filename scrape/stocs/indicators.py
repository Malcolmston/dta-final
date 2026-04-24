"""
Technical indicators and trading signals.
"""

import pandas as pd
import numpy as np
import yfinance as yf


def calculate_rsi(prices: pd.Series, period: int = 14) -> pd.Series:
    """
    Calculate Relative Strength Index.

    :param prices: Price series
    :param period: RSI period (default: 14)
    :return: RSI values
    """
    delta = prices.diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=period).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()

    rs = gain / loss
    rsi = 100 - (100 / (1 + rs))
    return rsi


def calculate_sma(prices: pd.Series, period: int) -> pd.Series:
    """
    Calculate Simple Moving Average.

    :param prices: Price series
    :param period: SMA period
    :return: SMA values
    """
    return prices.rolling(window=period).mean()


def calculate_ema(prices: pd.Series, period: int) -> pd.Series:
    """
    Calculate Exponential Moving Average.

    :param prices: Price series
    :param period: EMA period
    :return: EMA values
    """
    return prices.ewm(span=period, adjust=False).mean()


def calculate_macd(prices: pd.Series, fast: int = 12, slow: int = 26, signal: int = 9):
    """
    Calculate MACD (Moving Average Convergence Divergence).

    :param prices: Price series
    :param fast: Fast EMA period
    :param slow: Slow EMA period
    :param signal: Signal line period
    :return: MACD, Signal, Histogram
    """
    ema_fast = calculate_ema(prices, fast)
    ema_slow = calculate_ema(prices, slow)
    macd = ema_fast - ema_slow
    signal_line = calculate_ema(macd, signal)
    histogram = macd - signal_line
    return macd, signal_line, histogram


def calculate_bollinger_bands(prices: pd.Series, period: int = 20, std_dev: int = 2):
    """
    Calculate Bollinger Bands.

    :param prices: Price series
    :param period: Moving average period
    :param std_dev: Standard deviation multiplier
    :return: Upper, Middle, Lower bands
    """
    middle = calculate_sma(prices, period)
    std = prices.rolling(window=period).std()
    upper = middle + (std * std_dev)
    lower = middle - (std * std_dev)
    return upper, middle, lower


def calculate_atr(high: pd.Series, low: pd.Series, close: pd.Series, period: int = 14) -> pd.Series:
    """
    Calculate Average True Range.

    :param high: High prices
    :param low: Low prices
    :param close: Close prices
    :param period: ATR period
    :return: ATR values
    """
    high_low = high - low
    high_close = (high - close.shift()).abs()
    low_close = (low - close.shift()).abs()

    true_range = pd.concat([high_low, high_close, low_close], axis=1).max(axis=1)
    atr = true_range.rolling(window=period).mean()
    return atr


def generate_signals(data: pd.DataFrame) -> pd.DataFrame:
    """
    Generate trading signals based on RSI and MACD.

    :param data: DataFrame with Close, High, Low prices
    :return: DataFrame with signals
    """
    df = data.copy()

    # Calculate indicators
    df["RSI"] = calculate_rsi(df["Close"])
    df["SMA_20"] = calculate_sma(df["Close"], 20)
    df["SMA_50"] = calculate_sma(df["Close"], 50)
    df["MACD"], df["Signal"], df["Histogram"] = calculate_macd(df["Close"])

    # Generate signals
    df["Signal"] = "HOLD"

    # RSI signals
    df.loc[df["RSI"] < 30, "Signal"] = "BUY"  # Oversold
    df.loc[df["RSI"] > 70, "Signal"] = "SELL"  # Overbought

    # MACD crossover signals
    df.loc[(df["MACD"] > df["Signal"]) & (df["MACD"].shift(1) <= df["Signal"].shift(1)), "Signal"] = "BUY"
    df.loc[(df["MACD"] < df["Signal"]) & (df["MACD"].shift(1) >= df["Signal"].shift(1)), "Signal"] = "SELL"

    return df


def get_indicators(ticker: str, period: str = "6mo") -> dict:
    """
    Get technical indicators for a ticker.

    :param ticker: Stock ticker
    :param period: Time period
    :return: Dictionary with indicator data
    """
    data = yf.download(ticker, period=period, auto_adjust=True)

    if data.empty:
        return {}

    if isinstance(data.columns, pd.MultiIndex):
        data.columns = data.columns.get_level_values(0)

    close = data["Close"]
    high = data["High"]
    low = data["Low"]

    indicators = {
        "rsi": calculate_rsi(close).iloc[-1],
        "sma_20": calculate_sma(close, 20).iloc[-1],
        "sma_50": calculate_sma(close, 50).iloc[-1],
        "macd": calculate_macd(close)[0].iloc[-1],
        "signal": calculate_macd(close)[1].iloc[-1],
        "histogram": calculate_macd(close)[2].iloc[-1],
        "bb_upper": calculate_bollinger_bands(close)[0].iloc[-1],
        "bb_middle": calculate_bollinger_bands(close)[1].iloc[-1],
        "bb_lower": calculate_bollinger_bands(close)[2].iloc[-1],
        "atr": calculate_atr(high, low, close).iloc[-1],
    }

    return indicators


def get_signals(ticker: str, period: str = "6mo") -> pd.DataFrame:
    """
    Get trading signals for a ticker.

    :param ticker: Stock ticker
    :param period: Time period
    :return: DataFrame with signals
    """
    data = yf.download(ticker, period=period, auto_adjust=True)

    if data.empty:
        return pd.DataFrame()

    if isinstance(data.columns, pd.MultiIndex):
        data.columns = data.columns.get_level_values(0)

    return generate_signals(data)