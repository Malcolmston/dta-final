import types
import pytest
import pandas as pd


TICKERS_CSV = "ticker,name,index,about\nAAPL,Apple Inc.,S&P 500,Technology\nMSFT,Microsoft,S&P 500,Technology\n"


@pytest.fixture
def sample_df():
    df = pd.DataFrame(
        {"Open": [100.0, 101.0], "Close": [102.0, 103.0]},
        index=pd.to_datetime(["2025-01-01", "2025-01-02"]),
    )
    df.index.name = "Date"
    return df


@pytest.fixture
def tickers_csv():
    return TICKERS_CSV


@pytest.fixture
def option_chain(sample_df):
    return types.SimpleNamespace(calls=sample_df, puts=sample_df)
