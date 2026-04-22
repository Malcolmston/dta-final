import pandas as pd
from unittest.mock import patch
import main


class TestFetchPastData:
    def test_returns_dataframe(self, sample_df):
        with patch("yfinance.download", return_value=sample_df) as mock_dl:
            result = main.fetch_past_data("AAPL", "1mo")
        mock_dl.assert_called_once_with("AAPL", period="1mo", auto_adjust=True)
        assert isinstance(result, pd.DataFrame)

    def test_default_period(self, sample_df):
        with patch("yfinance.download", return_value=sample_df) as mock_dl:
            main.fetch_past_data("MSFT")
        mock_dl.assert_called_once_with("MSFT", period="1y", auto_adjust=True)


class TestFetchMulti:
    def test_passes_tickers_and_group_by(self, sample_df):
        with patch("yfinance.download", return_value=sample_df) as mock_dl:
            result = main.fetch_multi(["AAPL", "MSFT"], "6mo")
        mock_dl.assert_called_once_with(
            ["AAPL", "MSFT"], period="6mo", auto_adjust=True, group_by="ticker"
        )
        assert isinstance(result, pd.DataFrame)
