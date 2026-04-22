import types
import pytest
import pandas as pd
from unittest.mock import patch
import main


def _mock(attr, return_value, method=False):
    """Patch yfinance.Ticker, set attr as property or method return value."""
    with patch("yfinance.Ticker") as MockTicker:
        if method:
            getattr(MockTicker.return_value, attr).return_value = return_value
        else:
            setattr(MockTicker.return_value, attr, return_value)
        yield MockTicker


class TestTickerProperty:
    """Wrappers that read a Ticker attribute (property-style)."""

    @pytest.mark.parametrize("fn,attr", [
        (lambda: main.get_financials("AAPL"),                 "financials"),
        (lambda: main.get_financials("AAPL", True),           "quarterly_financials"),
        (lambda: main.get_income_stmt("AAPL"),                "income_stmt"),
        (lambda: main.get_income_stmt("AAPL", True),          "quarterly_income_stmt"),
        (lambda: main.get_balance_sheet("AAPL"),              "balance_sheet"),
        (lambda: main.get_balance_sheet("AAPL", True),        "quarterly_balance_sheet"),
        (lambda: main.get_cash_flow("AAPL"),                  "cash_flow"),
        (lambda: main.get_cash_flow("AAPL", True),            "quarterly_cash_flow"),
        (lambda: main.get_ttm_financials("AAPL"),             "ttm_financials"),
        (lambda: main.get_ttm_income_stmt("AAPL"),            "ttm_income_stmt"),
        (lambda: main.get_ttm_cash_flow("AAPL"),              "ttm_cash_flow"),
        (lambda: main.get_options("AAPL"),                    "options"),
    ])
    def test_returns_ticker_attr(self, fn, attr, sample_df):
        with patch("yfinance.Ticker") as MockTicker:
            setattr(MockTicker.return_value, attr, sample_df)
            result = fn()
            MockTicker.assert_called()
        assert result is sample_df


class TestTickerMethod:
    """Wrappers that call a get_* method on the Ticker object."""

    @pytest.mark.parametrize("fn,method", [
        (lambda: main.get_actions("AAPL"),                    "get_actions"),
        (lambda: main.get_dividends("AAPL"),                  "get_dividends"),
        (lambda: main.get_splits("AAPL"),                     "get_splits"),
        (lambda: main.get_capital_gains("AAPL"),              "get_capital_gains"),
        (lambda: main.get_sustainability("AAPL"),             "get_sustainability"),
        (lambda: main.get_history_metadata("AAPL"),           "get_history_metadata"),
        (lambda: main.get_fast_info("AAPL"),                  "get_fast_info"),
        (lambda: main.get_info("AAPL"),                       "get_info"),
        (lambda: main.get_isin("AAPL"),                       "get_isin"),
        (lambda: main.get_earnings("AAPL"),                   "get_earnings"),
        (lambda: main.get_earnings_dates("AAPL"),             "get_earnings_dates"),
        (lambda: main.get_earnings_history("AAPL"),           "get_earnings_history"),
        (lambda: main.get_earnings_estimate("AAPL"),          "get_earnings_estimate"),
        (lambda: main.get_revenue_estimate("AAPL"),           "get_revenue_estimate"),
        (lambda: main.get_eps_trend("AAPL"),                  "get_eps_trend"),
        (lambda: main.get_eps_revisions("AAPL"),              "get_eps_revisions"),
        (lambda: main.get_growth_estimates("AAPL"),           "get_growth_estimates"),
        (lambda: main.get_recommendations("AAPL"),            "get_recommendations"),
        (lambda: main.get_recommendations_summary("AAPL"),    "get_recommendations_summary"),
        (lambda: main.get_analyst_price_targets("AAPL"),      "get_analyst_price_targets"),
        (lambda: main.get_upgrades_downgrades("AAPL"),        "get_upgrades_downgrades"),
        (lambda: main.get_major_holders("AAPL"),              "get_major_holders"),
        (lambda: main.get_institutional_holders("AAPL"),      "get_institutional_holders"),
        (lambda: main.get_mutualfund_holders("AAPL"),         "get_mutualfund_holders"),
        (lambda: main.get_insider_transactions("AAPL"),       "get_insider_transactions"),
        (lambda: main.get_insider_purchases("AAPL"),          "get_insider_purchases"),
        (lambda: main.get_insider_roster_holders("AAPL"),     "get_insider_roster_holders"),
        (lambda: main.get_shares("AAPL"),                     "get_shares"),
        (lambda: main.get_shares_full("AAPL"),                "get_shares_full"),
        (lambda: main.get_calendar("AAPL"),                   "get_calendar"),
        (lambda: main.get_news("AAPL"),                       "get_news"),
        (lambda: main.get_sec_filings("AAPL"),                "get_sec_filings"),
        (lambda: main.get_funds_data("AAPL"),                 "get_funds_data"),
    ])
    def test_calls_method(self, fn, method, sample_df):
        with patch("yfinance.Ticker") as MockTicker:
            getattr(MockTicker.return_value, method).return_value = sample_df
            result = fn()
            MockTicker.assert_called()
            getattr(MockTicker.return_value, method).assert_called_once()
        assert result is sample_df


class TestGetHistory:
    def test_period_and_interval_passed(self, sample_df):
        with patch("yfinance.Ticker") as MockTicker:
            MockTicker.return_value.history.return_value = sample_df
            result = main.get_history("AAPL", "1mo", "1wk")
            MockTicker.return_value.history.assert_called_once_with(period="1mo", interval="1wk")
        assert isinstance(result, pd.DataFrame)

    def test_defaults(self, sample_df):
        with patch("yfinance.Ticker") as MockTicker:
            MockTicker.return_value.history.return_value = sample_df
            main.get_history("AAPL")
            MockTicker.return_value.history.assert_called_once_with(period="1y", interval="1d")


class TestGetOptionChain:
    def test_with_date(self, sample_df):
        chain = types.SimpleNamespace(calls=sample_df, puts=sample_df)
        with patch("yfinance.Ticker") as MockTicker:
            MockTicker.return_value.option_chain.return_value = chain
            result = main.get_option_chain("AAPL", "2025-06-20")
            MockTicker.return_value.option_chain.assert_called_once_with("2025-06-20")
        assert hasattr(result, "calls")

    def test_no_date(self, sample_df):
        chain = types.SimpleNamespace(calls=sample_df, puts=sample_df)
        with patch("yfinance.Ticker") as MockTicker:
            MockTicker.return_value.option_chain.return_value = chain
            result = main.get_option_chain("AAPL")
            MockTicker.return_value.option_chain.assert_called_once_with()
        assert hasattr(result, "puts")


class TestMarketSectorIndustry:
    def test_get_market(self):
        with patch("yfinance.Market") as MockMarket:
            result = main.get_market("us_market")
            MockMarket.assert_called_once_with("us_market")
            assert result is MockMarket.return_value

    def test_get_sector(self):
        with patch("yfinance.Sector") as MockSector:
            result = main.get_sector("Technology")
            MockSector.assert_called_once_with("Technology")
            assert result is MockSector.return_value

    def test_get_industry(self):
        with patch("yfinance.Industry") as MockIndustry:
            result = main.get_industry("Semiconductors")
            MockIndustry.assert_called_once_with("Semiconductors")
            assert result is MockIndustry.return_value


class TestSearchLookup:
    def test_search(self):
        with patch("yfinance.Search") as MockSearch:
            result = main.search("Apple", max_results=5)
            MockSearch.assert_called_once_with("Apple", max_results=5)
            assert result is MockSearch.return_value

    def test_lookup(self):
        with patch("yfinance.Lookup") as MockLookup:
            result = main.lookup("Apple Inc")
            MockLookup.assert_called_once_with("Apple Inc")
            assert result is MockLookup.return_value

    def test_screen(self):
        with patch("yfinance.screen") as MockScreen:
            result = main.screen("some_query")
            MockScreen.assert_called_once_with("some_query")
            assert result is MockScreen.return_value

    def test_get_tickers_obj(self):
        with patch("yfinance.Tickers") as MockTickers:
            result = main.get_tickers_obj(["AAPL", "MSFT"])
            MockTickers.assert_called_once_with("AAPL MSFT")
            assert result is MockTickers.return_value
