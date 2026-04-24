"""
Alpha Vantage provider - alternative provider with technical indicators.
"""

import os
from datetime import datetime, timedelta

from stocs.providers.base import BaseProvider, ProviderError

try:
    from alpha_vantage.timeseries import TimeSeries
    from alpha_vantage.technicalindicators import TechnicalIndicators
    ALPHA_VANTAGE_AVAILABLE = True
except ImportError:
    ALPHA_VANTAGE_AVAILABLE = False


class AlphaVantageProvider(BaseProvider):
    """Alpha Vantage data provider."""

    name = "alpha_vantage"
    requires_api_key = True

    def __init__(self, api_key: str = None, **kwargs):
        super().__init__(api_key, **kwargs)

        if not ALPHA_VANTAGE_AVAILABLE:
            raise ProviderError("alpha_vantage package not installed. Run: pip install alpha_vantage")

        if not api_key:
            api_key = os.environ.get("ALPHA_VANTAGE_API_KEY")

        if not api_key:
            raise ProviderError("Alpha Vantage requires an API key. Set ALPHA_VANTAGE_API_KEY environment variable or pass api_key parameter.")

        self.ts = TimeSeries(key=api_key, output_format="pandas")
        self.ti = TechnicalIndicators(key=api_key, output_format="pandas")

    def get_quote(self, ticker: str) -> dict:
        """Get real-time quote."""
        try:
            data, meta = self.ts.get_quote_endpoint(symbol=ticker.upper())

            if data.empty:
                raise ProviderError(f"No data found for {ticker}")

            latest = data.iloc[-1]
            return {
                "symbol": ticker.upper(),
                "price": float(latest.get("05. price", 0)),
                "change": float(latest.get("09. change", 0)),
                "change_pct": float(latest.get("10. change percent", "0%").replace("%", "")),
                "volume": int(latest.get("06. volume", 0)),
                "timestamp": datetime.now().isoformat(),
            }
        except Exception as e:
            raise ProviderError(f"Failed to get quote for {ticker}: {e}")

    def get_history(self, ticker: str, period: str = "1y", interval: str = "1d") -> dict:
        """Get historical price data."""
        try:
            # Map period to outputsize
            outputsize = "compact" if period in ("1d", "5d", "1mo") else "full"

            data, meta = self.ts.get_daily(symbol=ticker.upper(), outputsize=outputsize)

            if data.empty:
                raise ProviderError(f"No data found for {ticker}")

            # Alpha Vantage returns most recent first, reverse it
            data = data.iloc[::-1]

            return data
        except Exception as e:
            raise ProviderError(f"Failed to get history for {ticker}: {e}")

    def get_info(self, ticker: str) -> dict:
        """Get company information (limited on Alpha Vantage)."""
        try:
            # Alpha Vantage doesn't have rich company info, return symbol
            return {
                "symbol": ticker.upper(),
                "name": ticker.upper(),
                "note": "Alpha Vantage provides limited company info. Use yfinance for full details.",
            }
        except Exception as e:
            raise ProviderError(f"Failed to get info for {ticker}: {e}")

    def get_indicators(self, ticker: str, period: str = "6mo") -> dict:
        """Get technical indicators (Alpha Vantage's strength)."""
        try:
            result = {}

            # RSI
            try:
                rsi, _ = self.ti.get_rsi(symbol=ticker.upper(), interval="daily", time_period=14)
                if not rsi.empty:
                    result["rsi"] = float(rsi.iloc[-1].get("RSI", 0))
            except Exception:
                pass

            # MACD
            try:
                macd, _ = self.ti.get_macd(symbol=ticker.upper(), interval="daily")
                if not macd.empty:
                    result["macd"] = float(macd.iloc[-1].get("MACD", 0))
                    result["macd_signal"] = float(macd.iloc[-1].get("MACD_Signal", 0))
                    result["macd_hist"] = float(macd.iloc[-1].get("MACD_Hist", 0))
            except Exception:
                pass

            # SMA
            try:
                sma20, _ = self.ti.get_sma(symbol=ticker.upper(), interval="daily", time_period=20)
                if not sma20.empty:
                    result["sma_20"] = float(sma20.iloc[-1].get("SMA", 0))
            except Exception:
                pass

            return result
        except Exception as e:
            raise ProviderError(f"Failed to get indicators for {ticker}: {e}")