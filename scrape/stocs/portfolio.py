"""
Portfolio generation and analysis.
"""

import yfinance as yf
import pandas as pd


def get_portfolio_allocation(age: int, strategy: str = "balanced") -> dict:
    """
    Get portfolio allocation based on age and strategy.

    :param age: User's age
    :param strategy: Investment strategy (growth, value, dividend, conservative, balanced, aggressive)
    :return: Dictionary with allocation percentages
    """
    # Base allocation by age (100 - age = stocks percentage)
    bonds = max(10, min(60, age))
    stocks = 100 - bonds

    # Strategy modifiers
    strategy_modifiers = {
        "growth": {"stocks": 20, "bonds": -15, "crypto": 5},
        "value": {"stocks": 10, "bonds": -5, "crypto": 0},
        "dividend": {"stocks": 5, "bonds": 0, "crypto": 0},
        "conservative": {"stocks": -15, "bonds": 20, "crypto": 0},
        "balanced": {"stocks": 0, "bonds": 0, "crypto": 0},
        "aggressive": {"stocks": 15, "bonds": -10, "crypto": 5},
    }

    modifier = strategy_modifiers.get(strategy, strategy_modifiers["balanced"])

    return {
        "stocks": max(10, min(90, stocks + modifier["stocks"])),
        "bonds": max(5, min(70, bonds + modifier["bonds"])),
        "crypto": max(0, min(10, modifier.get("crypto", 0))),
    }


def generate_portfolio(
    capital: int,
    strategy: str = "balanced",
    age: int = 30,
    top_n: int = 5,
    stock_pools: dict = None,
    bond_pool: list = None,
    crypto_pool: list = None,
) -> dict:
    """
    Generate a portfolio based on capital and strategy.

    :param capital: Total capital amount
    :param strategy: Investment strategy
    :param age: User age
    :param top_n: Number of stocks per category
    :param stock_pools: Dictionary of stock pools
    :param bond_pool: List of bond tickers
    :param crypto_pool: List of crypto tickers
    :return: Portfolio dictionary
    """
    # Default pools
    if stock_pools is None:
        stock_pools = {
            "growth": ["AAPL", "MSFT", "GOOGL", "AMZN", "NVDA", "META", "TSLA", "AMD"],
            "value": ["JPM", "BAC", "WFC", "JNJ", "PFE", "KO", "PEP", "WMT"],
            "dividend": ["KO", "PEP", "JNJ", "PFE", "XOM", "CVX", "JPM", "WMT"],
            "balanced": ["AAPL", "MSFT", "GOOGL", "AMZN", "JPM", "JNJ", "KO", "XOM", "WMT", "HD"],
        }

    if bond_pool is None:
        bond_pool = ["TLT", "IEF", "AGG", "BND", "LQD"]

    if crypto_pool is None:
        crypto_pool = ["BTC-USD", "ETH-USD", "SOL-USD", "BNB-USD", "XRP-USD", "ADA-USD"]

    allocation = get_portfolio_allocation(age, strategy)

    stocks_key = strategy if strategy in stock_pools else "balanced"
    stock_tickers = stock_pools.get(stocks_key, stock_pools["balanced"])[:top_n]

    portfolio = {
        "allocation": allocation,
        "stocks": {"tickers": [], "allocation_pct": allocation["stocks"]},
        "bonds": {"tickers": [], "allocation_pct": allocation["bonds"]},
        "crypto": {"tickers": [], "allocation_pct": allocation["crypto"]},
    }

    # Get stock data
    stock_value = capital * allocation["stocks"] / 100
    for ticker in stock_tickers:
        try:
            data = yf.download(ticker, period="3mo", auto_adjust=True)
            if isinstance(data.columns, pd.MultiIndex):
                data.columns = data.columns.get_level_values(0)

            close = data["Close"].iloc[-1] if len(data) > 0 else 0
            shares = int(stock_value / close / len(stock_tickers)) if close > 0 else 0

            portfolio["stocks"]["tickers"].append({
                "symbol": ticker,
                "shares": shares,
                "price": close,
                "value": shares * close,
            })
        except Exception:
            continue

    # Get bond data
    bond_value = capital * allocation["bonds"] / 100
    for ticker in bond_pool[:3]:
        try:
            data = yf.download(ticker, period="3mo", auto_adjust=True)
            if isinstance(data.columns, pd.MultiIndex):
                data.columns = data.columns.get_level_values(0)

            close = data["Close"].iloc[-1] if len(data) > 0 else 0
            shares = int(bond_value / close / 3) if close > 0 else 0

            portfolio["bonds"]["tickers"].append({
                "symbol": ticker,
                "shares": shares,
                "price": close,
                "value": shares * close,
            })
        except Exception:
            continue

    # Get crypto data
    if allocation["crypto"] > 0:
        crypto_value = capital * allocation["crypto"] / 100
        for ticker in crypto_pool[:3]:
            try:
                data = yf.download(ticker, period="3mo", auto_adjust=True)
                if isinstance(data.columns, pd.MultiIndex):
                    data.columns = data.columns.get_level_values(0)

                close = data["Close"].iloc[-1] if len(data) > 0 else 0
                shares = int(crypto_value / close / 3) if close > 0 else 0

                portfolio["crypto"]["tickers"].append({
                    "symbol": ticker,
                    "shares": shares,
                    "price": close,
                    "value": shares * close,
                })
            except Exception:
                continue

    # Calculate totals
    total_stocks = sum(s["value"] for s in portfolio["stocks"]["tickers"])
    total_bonds = sum(b["value"] for b in portfolio["bonds"]["tickers"])
    total_crypto = sum(c["value"] for c in portfolio["crypto"]["tickers"])
    portfolio["total_value"] = total_stocks + total_bonds + total_crypto

    return portfolio


def calculate_portfolio_metrics(portfolio: dict) -> dict:
    """
    Calculate portfolio performance metrics.

    :param portfolio: Portfolio dictionary
    :return: Dictionary with metrics
    """
    total = portfolio.get("total_value", 0)
    if total == 0:
        return {}

    stocks_value = sum(s["value"] for s in portfolio["stocks"]["tickers"])
    bonds_value = sum(b["value"] for b in portfolio["bonds"]["tickers"])
    crypto_value = sum(c["value"] for c in portfolio["crypto"]["tickers"])

    return {
        "total_value": total,
        "stocks_value": stocks_value,
        "bonds_value": bonds_value,
        "crypto_value": crypto_value,
        "stocks_pct": (stocks_value / total) * 100,
        "bonds_pct": (bonds_value / total) * 100,
        "crypto_pct": (crypto_value / total) * 100,
    }