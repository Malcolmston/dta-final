import csv
import io
import json
import pandas as pd
import main


class TestFormatOutputDataFrame:
    def test_plain(self, capsys, sample_df):
        main.format_output(sample_df, "plain")
        assert "Open" in capsys.readouterr().out

    def test_json(self, capsys, sample_df):
        main.format_output(sample_df, "json")
        parsed = json.loads(capsys.readouterr().out)
        assert isinstance(parsed, list)
        assert parsed[0]["Open"] == 100.0

    def test_csv(self, capsys, sample_df):
        main.format_output(sample_df, "csv")
        out = capsys.readouterr().out
        assert "Open" in out and "Close" in out
        assert len(list(csv.reader(io.StringIO(out)))) > 1

    def test_tsv(self, capsys, sample_df):
        main.format_output(sample_df, "tsv")
        assert "\t" in capsys.readouterr().out

    def test_yaml(self, capsys, sample_df):
        main.format_output(sample_df, "yaml")
        out = capsys.readouterr().out
        assert "Open" in out or "open" in out.lower()


class TestFormatOutputDict:
    DATA = {"ticker": "AAPL", "price": 150.0}

    def test_json(self, capsys):
        main.format_output(self.DATA, "json")
        assert json.loads(capsys.readouterr().out)["ticker"] == "AAPL"

    def test_csv(self, capsys):
        main.format_output(self.DATA, "csv")
        out = capsys.readouterr().out
        assert "ticker" in out and "AAPL" in out

    def test_tsv(self, capsys):
        main.format_output(self.DATA, "tsv")
        assert "\t" in capsys.readouterr().out

    def test_yaml(self, capsys):
        main.format_output(self.DATA, "yaml")
        assert "AAPL" in capsys.readouterr().out

    def test_plain(self, capsys):
        main.format_output(self.DATA, "plain")
        assert "AAPL" in capsys.readouterr().out


class TestFormatOutputSeries:
    def setup_method(self):
        import pandas as pd
        self.series = pd.Series({"AAPL": 150.0, "MSFT": 300.0})

    def test_json(self, capsys):
        import json
        main.format_output(self.series, "json")
        parsed = json.loads(capsys.readouterr().out)
        assert parsed["AAPL"] == 150.0

    def test_csv(self, capsys):
        main.format_output(self.series, "csv")
        assert "AAPL" in capsys.readouterr().out

    def test_tsv(self, capsys):
        main.format_output(self.series, "tsv")
        assert "\t" in capsys.readouterr().out

    def test_yaml(self, capsys):
        main.format_output(self.series, "yaml")
        assert "AAPL" in capsys.readouterr().out

    def test_plain(self, capsys):
        main.format_output(self.series, "plain")
        assert "AAPL" in capsys.readouterr().out


class TestFormatOutputList:
    DATA = ["AAPL", "MSFT", "NVDA"]

    def test_json(self, capsys):
        main.format_output(self.DATA, "json")
        assert json.loads(capsys.readouterr().out) == self.DATA

    def test_plain(self, capsys):
        main.format_output(self.DATA, "plain")
        assert "AAPL" in capsys.readouterr().out

    def test_yaml(self, capsys):
        main.format_output(self.DATA, "yaml")
        assert "AAPL" in capsys.readouterr().out

    def test_csv_flat_scalars(self, capsys):
        """Flat list of scalars (no dicts) falls through to join path."""
        main.format_output(["AAPL", "MSFT"], "csv")
        assert "AAPL" in capsys.readouterr().out

    def test_tsv_flat_scalars(self, capsys):
        main.format_output(["AAPL", "MSFT"], "tsv")
        assert "AAPL" in capsys.readouterr().out


class TestFormatOutputOptionChain:
    def test_calls_and_puts_unwrapped(self, capsys, option_chain):
        main.format_output(option_chain, "json")
        parsed = json.loads(capsys.readouterr().out)
        assert "calls" in parsed and "puts" in parsed
        assert isinstance(parsed["calls"], list)


class TestFormatOutputScalar:
    def test_string_plain(self, capsys):
        main.format_output("US0378331005", "plain")
        assert "US0378331005" in capsys.readouterr().out

    def test_string_json(self, capsys):
        main.format_output("US0378331005", "json")
        assert json.loads(capsys.readouterr().out) == "US0378331005"

    def test_int_yaml(self, capsys):
        main.format_output(42, "yaml")
        assert "42" in capsys.readouterr().out
