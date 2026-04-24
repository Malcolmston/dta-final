"""
stocs - A stock market data scraping library

A Python library for fetching and analyzing stock market data from Yahoo Finance.
"""

__version__ = "0.1.0"

from stocs.client import (
    fetch_past_data,
    fetch_multi,
    get_history,
    get_history_metadata,
    get_fast_info,
    get_info,
    get_actions,
    get_dividends,
    get_splits,
    get_capital_gains,
    get_financials,
    get_income_stmt,
    get_balance_sheet,
    get_cash_flow,
    get_earnings,
    get_earnings_dates,
    get_earnings_estimate,
    get_recommendations,
    get_analyst_price_targets,
    get_major_holders,
    get_institutional_holders,
    get_insider_transactions,
    get_insider_purchases,
    get_shares,
    get_options,
    get_option_chain,
    get_calendar,
    get_news,
    get_sustainability,
    get_sec_filings,
    get_market,
    get_sector,
)

from stocs.constants import (
    BOND_TICKERS,
    INTERNATIONAL_TICKERS,
    STOCK_TICKERS,
    CRYPTO_TICKERS,
)

from stocs.providers import (
    get_provider,
    DEFAULT_PROVIDER,
    FallbackProvider,
    create_provider_with_fallback,
)

__all__ = [
    # Client functions
    "fetch_past_data",
    "fetch_multi",
    "get_history",
    "get_history_metadata",
    "get_fast_info",
    "get_info",
    "get_actions",
    "get_dividends",
    "get_splits",
    "get_capital_gains",
    "get_financials",
    "get_income_stmt",
    "get_balance_sheet",
    "get_cash_flow",
    "get_earnings",
    "get_earnings_dates",
    "get_earnings_estimate",
    "get_recommendations",
    "get_analyst_price_targets",
    "get_major_holders",
    "get_institutional_holders",
    "get_insider_transactions",
    "get_insider_purchases",
    "get_shares",
    "get_options",
    "get_option_chain",
    "get_calendar",
    "get_news",
    "get_sustainability",
    "get_sec_filings",
    "get_market",
    "get_sector",
    # Constants
    "BOND_TICKERS",
    "INTERNATIONAL_TICKERS",
    "STOCK_TICKERS",
    "CRYPTO_TICKERS",
    # Providers
    "get_provider",
    "DEFAULT_PROVIDER",
    "FallbackProvider",
    "create_provider_with_fallback",
]