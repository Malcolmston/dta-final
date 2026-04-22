"""
Integration tests — hit the real Yahoo Finance API.

Run:  pytest -m integration
Skip: pytest -m "not integration"
"""
import pandas as pd
import pytest
import main


@pytest.mark.integration
class TestIntegration:
    def test_fetch_past_data_aapl(self):
        df = main.fetch_past_data("AAPL", "5d")
        assert isinstance(df, pd.DataFrame)
        assert not df.empty

    def test_get_history_aapl(self):
        df = main.get_history("AAPL", "5d", "1d")
        assert isinstance(df, pd.DataFrame)
        assert "Close" in df.columns

    def test_get_info_aapl(self):
        info = main.get_info("AAPL")
        assert isinstance(info, dict)
        assert "shortName" in info or "longName" in info

    def test_get_fast_info_aapl(self):
        assert main.get_fast_info("AAPL") is not None

    def test_get_dividends_aapl(self):
        assert isinstance(main.get_dividends("AAPL"), pd.Series)

    def test_get_options_aapl(self):
        opts = main.get_options("AAPL")
        assert isinstance(opts, tuple)
        assert len(opts) > 0

    def test_get_news_aapl(self):
        assert isinstance(main.get_news("AAPL"), list)

    def test_fetch_multi(self):
        df = main.fetch_multi(["AAPL", "MSFT"], "5d")
        assert isinstance(df, pd.DataFrame)
        assert not df.empty

    def test_load_tickers_from_real_csv(self):
        tickers = main.load_tickers()
        assert isinstance(tickers, list)
        assert len(tickers) > 0
        assert all(isinstance(t, str) for t in tickers)
