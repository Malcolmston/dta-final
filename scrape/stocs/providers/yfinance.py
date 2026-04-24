"""
YFinance provider - primary provider using yfinance.
"""

import yfinance as yf
import pandas as pd

from stocs.providers.base import BaseProvider, ProviderError


class YFinanceProvider(BaseProvider):
    """Yahoo Finance data provider."""

    name = "yfinance"
    requires_api_key = False

    def get_quote(self, ticker: str) -> dict:
        """Get real-time quote."""
        try:
            data = yf.download(ticker, period="1d", interval="1m", auto_adjust=True)
            if data.empty:
                raise ProviderError(f"No data found for {ticker}")

            latest = data.iloc[-1]
            return {
                "symbol": ticker,
                "price": float(latest["Close"]),
                "change": float(latest["Close"] - data.iloc[0]["Close"]),
                "change_pct": float(((latest["Close"] - data.iloc[0]["Close"]) / data.iloc[0]["Close"]) * 100),
                "volume": int(latest["Volume"]),
                "timestamp": data.index[-1].isoformat(),
            }
        except Exception as e:
            raise ProviderError(f"Failed to get quote for {ticker}: {e}")

    def get_history(self, ticker: str, period: str = "1y", interval: str = "1d") -> pd.DataFrame:
        """Get historical price data."""
        try:
            data = yf.download(ticker, period=period, interval=interval, auto_adjust=True)
            if data.empty:
                raise ProviderError(f"No data found for {ticker}")

            if isinstance(data.columns, pd.MultiIndex):
                data.columns = data.columns.get_level_values(0)

            return data
        except Exception as e:
            raise ProviderError(f"Failed to get history for {ticker}: {e}")

    def get_info(self, ticker: str) -> dict:
        """Get company information."""
        try:
            ticker_obj = yf.Ticker(ticker)
            info = ticker_obj.info

            return {
                "symbol": ticker,
                "shortName": info.get("shortName"),
                "longName": info.get("longName"),
                "sector": info.get("sector"),
                "industry": info.get("industry"),
                "marketCap": info.get("marketCap"),
                "peRatio": info.get("trailingPE"),
                "dividendYield": info.get("dividendYield"),
                "52WeekHigh": info.get("fiftyTwoWeekHigh"),
                "52WeekLow": info.get("fiftyTwoWeekLow"),
                "volume": info.get("volume"),
                "avgVolume": info.get("averageVolume"),
            }
        except Exception as e:
            raise ProviderError(f"Failed to get info for {ticker}: {e}")

    def get_financials(self, ticker: str) -> dict:
        """Get financial statements."""
        try:
            ticker_obj = yf.Ticker(ticker)

            return {
                "income_stmt": ticker_obj.income_stmt.to_dict() if hasattr(ticker_obj.income_stmt, "to_dict") else {},
                "balance_sheet": ticker_obj.balance_sheet.to_dict() if hasattr(ticker_obj.balance_sheet, "to_dict") else {},
                "cashflow": ticker_obj.cashflow.to_dict() if hasattr(ticker_obj.cashflow, "to_dict") else {},
            }
        except Exception as e:
            raise ProviderError(f"Failed to get financials for {ticker}: {e}")

    def get_earnings(self, ticker: str) -> dict:
        """Get earnings data."""
        try:
            ticker_obj = yf.Ticker(ticker)

            return {
                "earnings": ticker_obj.earnings.to_dict() if hasattr(ticker_obj.earnings, "to_dict") else {},
                "earnings_dates": ticker_obj.earnings_dates.to_dict() if hasattr(ticker_obj.earnings_dates, "to_dict") else {},
            }
        except Exception as e:
            raise ProviderError(f"Failed to get earnings for {ticker}: {e}")

    def get_news(self, ticker: str) -> list:
        """Get recent news."""
        try:
            ticker_obj = yf.Ticker(ticker)
            news = ticker_obj.news

            if news is None:
                return []

            return [
                {
                    "title": n.get("title"),
                    "publisher": n.get("publisher"),
                    "link": n.get("link"),
                    "published": n.get("published"),
                }
                for n in news
            ]
        except Exception as e:
            raise ProviderError(f"Failed to get news for {ticker}: {e}")

    def get_recommendations(self, ticker: str) -> dict:
        """Get analyst recommendations."""
        try:
            ticker_obj = yf.Ticker(ticker)
            recs = ticker_obj.recommendations

            return recs.to_dict() if recs is not None else {}
        except Exception as e:
            raise ProviderError(f"Failed to get recommendations for {ticker}: {e}")

    def get_indicators(self, ticker: str, period: str = "6mo") -> dict:
        """Get technical indicators."""
        from stocs.indicators import get_indicators as calc_indicators

        try:
            return calc_indicators(ticker, period)
        except Exception as e:
            raise ProviderError(f"Failed to get indicators for {ticker}: {e}")