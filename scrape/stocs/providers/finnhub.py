"""
Finnhub provider - alternative provider with free tier.
"""

import os
from datetime import datetime, timedelta

from stocs.providers.base import BaseProvider, ProviderError

try:
    import finnhub
    FINNHUB_AVAILABLE = True
except ImportError:
    FINNHUB_AVAILABLE = False


class FinnhubProvider(BaseProvider):
    """Finnhub.io data provider."""

    name = "finnhub"
    requires_api_key = True

    def __init__(self, api_key: str = None, **kwargs):
        super().__init__(api_key, **kwargs)

        if not FINNHUB_AVAILABLE:
            raise ProviderError("finnhub package not installed. Run: pip install finnhub-python")

        if not api_key:
            api_key = os.environ.get("FINNHUB_API_KEY")

        if not api_key:
            raise ProviderError("Finnhub requires an API key. Set FINNHUB_API_KEY environment variable or pass api_key parameter.")

        self.client = finnhub.Client(api_key=api_key)

    def get_quote(self, ticker: str) -> dict:
        """Get real-time quote."""
        try:
            data = self.client.quote(ticker.upper())

            if data.get("c") == 0 and data.get("dp") == 0:
                raise ProviderError(f"No data found for {ticker}")

            return {
                "symbol": ticker.upper(),
                "price": data.get("c", 0),
                "change": data.get("d", 0),
                "change_pct": data.get("dp", 0),
                "high": data.get("h", 0),
                "low": data.get("l", 0),
                "open": data.get("o", 0),
                "previous_close": data.get("pc", 0),
                "timestamp": datetime.now().isoformat(),
            }
        except Exception as e:
            raise ProviderError(f"Failed to get quote for {ticker}: {e}")

    def get_history(self, ticker: str, period: str = "1y", interval: str = "1d") -> dict:
        """
        Get historical data (requires premium for full history).
        Falls back to candles from company profile.
        """
        # Note: Full historical data requires Finnhub premium
        # Free tier only gets recent candles
        try:
            # Convert period to timestamps
            now = datetime.now()
            period_map = {
                "1d": 1,
                "5d": 5,
                "1mo": 30,
                "3mo": 90,
                "6mo": 180,
                "1y": 365,
                "2y": 730,
                "5y": 1825,
            }

            days = period_map.get(period, 365)
            from_time = int((now - timedelta(days=days)).timestamp())

            candles = self.client.candles(ticker.upper(), "D", from_time, int(now.timestamp()))

            if candles.get("s") == "no_data":
                raise ProviderError(f"No data found for {ticker}")

            return {
                "timestamps": candles.get("t", []),
                "open": candles.get("o", []),
                "high": candles.get("h", []),
                "low": candles.get("l", []),
                "close": candles.get("c", []),
                "volume": candles.get("v", []),
            }
        except ProviderError:
            raise
        except Exception as e:
            raise ProviderError(f"Failed to get history for {ticker}: {e}")

    def get_info(self, ticker: str) -> dict:
        """Get company information."""
        try:
            profile = self.client.company_profile2(symbol=ticker.upper())

            if not profile:
                raise ProviderError(f"No profile found for {ticker}")

            return {
                "symbol": ticker.upper(),
                "name": profile.get("name"),
                "ticker": profile.get("ticker"),
                "currency": profile.get("currency"),
                "exchange": profile.get("exchange"),
                "finnhubIndustry": profile.get("finnhubIndustry"),
                "ipo": profile.get("ipo"),
                "marketCapitalization": profile.get("marketCapitalization"),
                "shareOutstanding": profile.get("shareOutstanding"),
                "weburl": profile.get("weburl"),
                "logo": profile.get("logo"),
            }
        except Exception as e:
            raise ProviderError(f"Failed to get info for {ticker}: {e}")

    def get_news(self, ticker: str) -> list:
        """Get recent news."""
        try:
            to_date = datetime.now().strftime("%Y-%m-%d")
            from_date = (datetime.now() - timedelta(days=30)).strftime("%Y-%m-%d")

            news = self.client.company_news(ticker.upper(), _from=from_date, to=to_date)

            if not news:
                return []

            return [
                {
                    "title": n.get("headline"),
                    "publisher": n.get("source"),
                    "link": n.get("url"),
                    "published": n.get("datetime"),
                    "summary": n.get("summary"),
                    "image": n.get("image"),
                }
                for n in news
            ]
        except Exception as e:
            raise ProviderError(f"Failed to get news for {ticker}: {e}")

    def get_earnings(self, ticker: str) -> dict:
        """Get earnings data."""
        try:
            # Earnings calendar
            calendar = self.client.earnings_calendar(symbol=ticker.upper(), _from="2020-01-01", to="2025-12-31")

            return calendar if calendar else {}
        except Exception as e:
            raise ProviderError(f"Failed to get earnings for {ticker}: {e}")

    def get_recommendations(self, ticker: str) -> dict:
        """Get analyst recommendations."""
        try:
            recs = self.client.recommendations_trends(symbol=ticker.upper())

            return {"recommendations": recs} if recs else {}
        except Exception as e:
            raise ProviderError(f"Failed to get recommendations for {ticker}: {e}")