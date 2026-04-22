"""
Fetches tickers from S&P 500, NASDAQ-100, and DOW via Wikipedia,
then writes tickers.csv with columns: ticker, name, index, about
"""

import csv
import io

import pandas as pd
import requests

HEADERS = {"User-Agent": "Mozilla/5.0"}


def _read_html(url):
    html = requests.get(url, headers=HEADERS).text
    return pd.read_html(io.StringIO(html))


def _flatten_cols(df):
    """Flatten MultiIndex columns to simple strings."""
    if isinstance(df.columns, pd.MultiIndex):
        df.columns = [" ".join(str(c) for c in col).strip() for col in df.columns]
    else:
        df.columns = [str(c) for c in df.columns]
    return df


def fetch_sp500():
    url = "https://en.wikipedia.org/wiki/List_of_S%26P_500_companies"
    tables = _read_html(url)
    df = _flatten_cols(tables[0])
    results = []
    for _, row in df.iterrows():
        ticker = str(row["Symbol"]).strip().replace(".", "-")
        name = str(row["Security"]).strip()
        sector = str(row.get("GICS Sector", "")).strip()
        sub = str(row.get("GICS Sub-Industry", "")).strip()
        about = f"{sector} – {sub}" if sub and sub != "nan" else sector
        results.append((ticker, name, "S&P 500", about))
    return results


def fetch_nasdaq100():
    url = "https://en.wikipedia.org/wiki/Nasdaq-100"
    tables = _read_html(url)
    df = None
    for t in tables:
        t = _flatten_cols(t)
        cols = [c.lower() for c in t.columns]
        if any("ticker" in c or "symbol" in c for c in cols):
            df = t
            break
    if df is None:
        return []
    ticker_col = next(c for c in df.columns if "ticker" in c.lower() or "symbol" in c.lower())
    name_col = next(
        c
        for c in df.columns
        if "company" in c.lower() or "security" in c.lower() or "name" in c.lower()
    )
    results = []
    for _, row in df.iterrows():
        ticker = str(row[ticker_col]).strip().replace(".", "-")
        name = str(row[name_col]).strip()
        # grab any remaining column as about
        other_cols = [c for c in df.columns if c not in (ticker_col, name_col)]
        about = str(row[other_cols[0]]).strip() if other_cols else ""
        results.append((ticker, name, "NASDAQ-100", about))
    return results


def fetch_dow():
    url = "https://en.wikipedia.org/wiki/Dow_Jones_Industrial_Average"
    tables = _read_html(url)
    df = None
    for t in tables:
        t = _flatten_cols(t)
        cols = [c.lower() for c in t.columns]
        if any("symbol" in c or "ticker" in c for c in cols):
            df = t
            break
    if df is None:
        return []
    symbol_col = next(c for c in df.columns if "symbol" in c.lower() or "ticker" in c.lower())
    company_col = next(
        (c for c in df.columns if "company" in c.lower() or "name" in c.lower()), None
    )
    industry_col = next(
        (c for c in df.columns if "industry" in c.lower() or "sector" in c.lower()), None
    )
    results = []
    for _, row in df.iterrows():
        ticker = str(row[symbol_col]).strip().replace(".", "-")
        name = str(row[company_col]).strip() if company_col else ""
        about = str(row[industry_col]).strip() if industry_col else ""
        results.append((ticker, name, "DOW", about))
    return results


def fetch_all_tickets():
    sp500 = fetch_sp500()
    nasdaq = fetch_nasdaq100()
    dow = fetch_dow()

    # Merge — keep first occurrence (preserves index label), track multiple indices
    seen: dict[str, list] = {}
    for ticker, name, index, about in sp500 + nasdaq + dow:
        if not ticker or ticker == "nan":
            continue
        if ticker not in seen:
            seen[ticker] = [ticker, name, index, about]
        else:
            # append index name if ticker appears in multiple indices
            existing_index = seen[ticker][2]
            if index not in existing_index:
                seen[ticker][2] = f"{existing_index}, {index}"

    return sorted(seen.values(), key=lambda r: r[0])


if __name__ == "__main__":
    rows = fetch_all_tickets()

    out_path = "tickers.csv"
    with open(out_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["ticker", "name", "index", "about"])
        writer.writerows(rows)

    print(f"Wrote {len(rows)} tickers to {out_path}")
