"""
Provider abstraction layer for multiple stock data APIs.

Supports:
- yfinance (primary, free)
- Finnhub (free tier available)
- Alpha Vantage (free tier available)
- Financial Modeling Prep (free tier available)
"""

from stocs.providers.base import BaseProvider, ProviderError
from stocs.providers.yfinance import YFinanceProvider
from stocs.providers.finnhub import FinnhubProvider
from stocs.providers.alpha_vantage import AlphaVantageProvider
from stocs.providers.fallback import FallbackProvider, create_provider_with_fallback

# Default to yfinance
DEFAULT_PROVIDER = "yfinance"

# Provider registry
PROVIDERS = {
    "yfinance": YFinanceProvider,
    "finnhub": FinnhubProvider,
    "alpha_vantage": AlphaVantageProvider,
}


def get_provider(name: str = DEFAULT_PROVIDER, **kwargs) -> BaseProvider:
    """
    Get a provider instance by name.

    :param name: Provider name (yfinance, finnhub, alpha_vantage)
    :param kwargs: Provider-specific configuration (api_key, etc.)
    :return: Provider instance
    :raises ValueError: If provider not found
    """
    provider_class = PROVIDERS.get(name.lower())
    if provider_class is None:
        raise ValueError(f"Unknown provider: {name}. Available: {list(PROVIDERS.keys())}")
    return provider_class(**kwargs)


__all__ = [
    "BaseProvider",
    "ProviderError",
    "YFinanceProvider",
    "FinnhubProvider",
    "AlphaVantageProvider",
    "get_provider",
    "DEFAULT_PROVIDER",
    "PROVIDERS",
    "FallbackProvider",
    "create_provider_with_fallback",
]