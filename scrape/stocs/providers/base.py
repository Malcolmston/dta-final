"""
Base provider interface.
"""

from abc import ABC, abstractmethod
from typing import Any, Optional


class ProviderError(Exception):
    """Provider-specific error."""
    pass


class BaseProvider(ABC):
    """Abstract base class for data providers."""

    name: str = "base"
    requires_api_key: bool = False

    def __init__(self, api_key: Optional[str] = None, **kwargs):
        """
        Initialize provider.

        :param api_key: API key for provider (if required)
        :param kwargs: Additional provider configuration
        """
        self.api_key = api_key

    @abstractmethod
    def get_quote(self, ticker: str) -> dict:
        """
        Get real-time quote for a ticker.

        :param ticker: Stock ticker symbol
        :return: Dictionary with price data
        """
        pass

    @abstractmethod
    def get_history(self, ticker: str, period: str = "1y", interval: str = "1d") -> Any:
        """
        Get historical price data.

        :param ticker: Stock ticker symbol
        :param period: Time period (1d, 5d, 1mo, 3mo, 6mo, 1y, 2y, 5y, 10y, ytd, max)
        :param interval: Data interval (1m, 2m, 5m, 15m, 30m, 60m, 1h, 1d, 1wk, 1mo)
        :return: DataFrame with OHLCV data
        """
        pass

    @abstractmethod
    def get_info(self, ticker: str) -> dict:
        """
        Get company information.

        :param ticker: Stock ticker symbol
        :return: Dictionary with company info
        """
        pass

    def get_financials(self, ticker: str) -> dict:
        """
        Get financial statements (optional override).

        :param ticker: Stock ticker symbol
        :return: Dictionary with financial data
        """
        raise ProviderError(f"{self.name} does not support financials")

    def get_earnings(self, ticker: str) -> dict:
        """
        Get earnings data (optional override).

        :param ticker: Stock ticker symbol
        :return: Dictionary with earnings data
        """
        raise ProviderError(f"{self.name} does not support earnings")

    def get_news(self, ticker: str) -> list:
        """
        Get recent news (optional override).

        :param ticker: Stock ticker symbol
        :return: List of news articles
        """
        raise ProviderError(f"{self.name} does not support news")

    def get_recommendations(self, ticker: str) -> dict:
        """
        Get analyst recommendations (optional override).

        :param ticker: Stock ticker symbol
        :return: Dictionary with recommendations
        """
        raise ProviderError(f"{self.name} does not support recommendations")

    def get_indicators(self, ticker: str, period: str = "6mo") -> dict:
        """
        Get technical indicators (optional override).

        :param ticker: Stock ticker symbol
        :param period: Time period
        :return: Dictionary with indicator values
        """
        raise ProviderError(f"{self.name} does not support indicators")