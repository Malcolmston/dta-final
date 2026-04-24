"""
Provider fallback wrapper - tries primary, falls back to secondary on failure.
"""

from stocs.providers.base import BaseProvider, ProviderError

DEFAULT_PROVIDER = "yfinance"


def get_provider(name: str, **kwargs):
    """Lazy import to avoid circular import."""
    from stocs.providers import PROVIDERS

    provider_class = PROVIDERS.get(name.lower())
    if provider_class is None:
        raise ProviderError(f"Unknown provider: {name}")
    return provider_class(**kwargs)


class FallbackProvider(BaseProvider):
    """
    Provider that tries a primary provider and falls back to secondary on failure.

    Usage:
        provider = FallbackProvider(
            primary="yfinance",
            fallback="finnhub",
            api_key="your_key"  # Only needed if fallback requires it
        )
    """

    def __init__(
        self,
        primary: str = DEFAULT_PROVIDER,
        fallback: str = None,
        primary_config: dict = None,
        fallback_config: dict = None,
        **kwargs
    ):
        super().__init__(**kwargs)

        self.primary_name = primary
        self.fallback_name = fallback
        self.primary_config = primary_config or {}
        self.fallback_config = fallback_config or {}

        self._primary = None
        self._fallback = None
        self._primary_failed = False

    @property
    def name(self) -> str:
        return f"{self.primary_name}_with_{self.fallback_name}_fallback"

    def _get_primary(self) -> BaseProvider:
        """Lazy load primary provider."""
        if self._primary is None:
            self._primary = get_provider(self.primary_name, **self.primary_config)
        return self._primary

    def _get_fallback(self) -> BaseProvider:
        """Lazy load fallback provider."""
        if self._fallback is None and self.fallback_name:
            try:
                self._fallback = get_provider(self.fallback_name, **self.fallback_config)
            except ProviderError:
                # Fallback not available
                pass
        return self._fallback

    def _try_provider(self, provider: BaseProvider, method: str, *args, **kwargs):
        """Try a provider method, raise ProviderError on failure."""
        method_func = getattr(provider, method, None)
        if method_func is None:
            raise ProviderError(f"{provider.name} does not support {method}")
        return method_func(*args, **kwargs)

    def _with_fallback(self, method: str, *args, **kwargs):
        """Try primary, fall back to secondary on failure."""
        # Try primary
        if not self._primary_failed:
            try:
                return self._try_provider(self._get_primary(), method, *args, **kwargs)
            except ProviderError as e:
                # Mark primary as failed, try fallback
                self._primary_failed = True
                # Continue to fallback

        # Try fallback
        fallback = self._get_fallback()
        if fallback:
            return self._try_provider(fallback, method, *args, **kwargs)

        # No fallback, re-raise original error
        raise ProviderError(f"All providers failed. Primary: {self.primary_name}, Fallback: {self.fallback_name}")

    def get_quote(self, ticker: str) -> dict:
        return self._with_fallback("get_quote", ticker)

    def get_history(self, ticker: str, period: str = "1y", interval: str = "1d"):
        return self._with_fallback("get_history", ticker, period, interval)

    def get_info(self, ticker: str) -> dict:
        return self._with_fallback("get_info", ticker)

    def get_financials(self, ticker: str) -> dict:
        return self._with_fallback("get_financials", ticker)

    def get_earnings(self, ticker: str) -> dict:
        return self._with_fallback("get_earnings", ticker)

    def get_news(self, ticker: str) -> list:
        return self._with_fallback("get_news", ticker)

    def get_recommendations(self, ticker: str) -> dict:
        return self._with_fallback("get_recommendations", ticker)

    def get_indicators(self, ticker: str, period: str = "6mo") -> dict:
        return self._with_fallback("get_indicators", ticker, period)


def create_provider_with_fallback(
    primary: str = DEFAULT_PROVIDER,
    fallback: str = None,
    primary_api_key: str = None,
    fallback_api_key: str = None,
) -> BaseProvider:
    """
    Create a provider with automatic fallback.

    :param primary: Primary provider name (yfinance, finnhub, alpha_vantage)
    :param fallback: Fallback provider name
    :param primary_api_key: API key for primary (if needed)
    :param fallback_api_key: API key for fallback (if needed)
    :return: Provider instance

    Examples:
        # Use yfinance only
        provider = create_provider_with_fallback(primary="yfinance")

        # Use yfinance with Finnhub fallback
        provider = create_provider_with_fallback(
            primary="yfinance",
            fallback="finnhub",
            fallback_api_key="your_finnhub_key"
        )
    """
    if fallback:
        return FallbackProvider(
            primary=primary,
            fallback=fallback,
            primary_config={"api_key": primary_api_key} if primary_api_key else {},
            fallback_config={"api_key": fallback_api_key} if fallback_api_key else {},
        )
    else:
        return get_provider(primary, api_key=primary_api_key if primary_api_key else None)