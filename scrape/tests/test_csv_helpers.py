import pytest
from unittest.mock import mock_open, patch
import main


class TestLoadTickers:
    def test_returns_list(self, tickers_csv):
        with patch("builtins.open", mock_open(read_data=tickers_csv)):
            result = main.load_tickers()
        assert isinstance(result, list)
        assert result == ["AAPL", "MSFT"]

    def test_missing_file_raises(self):
        with pytest.raises(FileNotFoundError):
            with patch("builtins.open", side_effect=FileNotFoundError):
                main.load_tickers()


class TestListAllTickers:
    def test_prints_and_returns(self, capsys, tickers_csv):
        with patch("builtins.open", mock_open(read_data=tickers_csv)):
            result = main.list_all_tickers()
        captured = capsys.readouterr()
        assert "AAPL" in captured.out
        assert "MSFT" in captured.out
        assert result == ["AAPL", "MSFT"]
