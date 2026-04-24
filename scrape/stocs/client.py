"""
Client functions for fetching stock market data from Yahoo Finance.
"""

import yfinance as yf
import pandas as pd


def fetch_past_data(ticker, period="1y"):
    """
    Fetch historical stock data for a given ticker symbol and time period.

    :param ticker: Stock ticker symbol (e.g., "AAPL")
    :param period: Time period (e.g., "1y", "6mo", "1d")
    :return: DataFrame with historical data
    """
    return yf.download(ticker, period=period, auto_adjust=True)


def fetch_multi(tickers: list, period="1y"):
    """
    Fetch historical market data for multiple tickers.

    :param tickers: List of ticker symbols
    :param period: Time period
    :return: DataFrame with data grouped by ticker
    """
    return yf.download(tickers, period=period, auto_adjust=True, group_by="ticker")


def get_history(ticker, period="1y", interval="1d"):
    """
    Get historical data with custom interval.

    :param ticker: Stock ticker symbol
    :param period: Time period
    :param interval: Data interval (e.g., "1d", "1h", "5m")
    :return: DataFrame with historical data
    """
    return yf.download(ticker, period=period, interval=interval, auto_adjust=True)


def get_history_metadata(ticker):
    """
    Get metadata for a ticker.

    :param ticker: Stock ticker symbol
    :return: Dictionary with metadata
    """
    ticker_obj = yf.Ticker(ticker)
    info = ticker_obj.info
    return {
        "symbol": ticker,
        "shortName": info.get("shortName"),
        "longName": info.get("longName"),
        "sector": info.get("sector"),
        "industry": info.get("industry"),
        "marketCap": info.get("marketCap"),
        "currency": info.get("currency"),
    }


def get_fast_info(ticker):
    """Get fast information for a ticker."""
    ticker_obj = yf.Ticker(ticker)
    return ticker_obj.fast_info


def get_info(ticker):
    """Get full info for a ticker."""
    ticker_obj = yf.Ticker(ticker)
    return ticker_obj.info


def get_isin(ticker):
    """Get ISIN for a ticker."""
    ticker_obj = yf.Ticker(ticker)
    return ticker_obj.isin


def get_actions(ticker):
    """Get corporate actions (dividends, splits)."""
    ticker_obj = yf.Ticker(ticker)
    return ticker_obj.actions


def get_dividends(ticker):
    """Get dividend history."""
    ticker_obj = yf.Ticker(ticker)
    return ticker_obj.dividends


def get_splits(ticker):
    """Get stock split history."""
    ticker_obj = yf.Ticker(ticker)
    return ticker_obj.splits


def get_capital_gains(ticker):
    """Get capital gains data."""
    ticker_obj = yf.Ticker(ticker)
    return ticker_obj.capital_gains


def get_financials(ticker, quarterly=False):
    """Get financial statements."""
    ticker_obj = yf.Ticker(ticker)
    if quarterly:
        return ticker_obj.quarterly_financials
    return ticker_obj.financials


def get_income_stmt(ticker, quarterly=False):
    """Get income statement."""
    ticker_obj = yf.Ticker(ticker)
    if quarterly:
        return ticker_obj.quarterly_income_stmt
    return ticker_obj.income_stmt


def get_balance_sheet(ticker, quarterly=False):
    """Get balance sheet."""
    ticker_obj = yf.Ticker(ticker)
    if quarterly:
        return ticker_obj.quarterly_balance_sheet
    return ticker_obj.balance_sheet


def get_cash_flow(ticker, quarterly=False):
    """Get cash flow statement."""
    ticker_obj = yf.Ticker(ticker)
    if quarterly:
        return ticker_obj.quarterly_cashflow
    return ticker_obj.cashflow


def get_earnings(ticker):
    """Get earnings data."""
    ticker_obj = yf.Ticker(ticker)
    return ticker_obj.earnings


def get_earnings_dates(ticker):
    """Get earnings dates."""
    ticker_obj = yf.Ticker(ticker)
    return ticker_obj.earnings_dates


def get_earnings_history(ticker):
    """Get earnings history."""
    ticker_obj = yf.Ticker(ticker)
    return ticker_obj.earnings_history


def get_earnings_estimate(ticker):
    """Get earnings estimates."""
    ticker_obj = yf.Ticker(ticker)
    return ticker_obj.earnings_estimate


def get_recommendations(ticker):
    """Get analyst recommendations."""
    ticker_obj = yf.Ticker(ticker)
    return ticker_obj.recommendations


def get_analyst_price_targets(ticker):
    """Get analyst price targets."""
    ticker_obj = yf.Ticker(ticker)
    return ticker_obj.analyst_price_targets


def get_upgrades_downgrades(ticker):
    """Get upgrades and downgrades."""
    ticker_obj = yf.Ticker(ticker)
    return ticker_obj.upgrades_downgrades


def get_major_holders(ticker):
    """Get major holders."""
    ticker_obj = yf.Ticker(ticker)
    return ticker_obj.major_holders


def get_institutional_holders(ticker):
    """Get institutional holders."""
    ticker_obj = yf.Ticker(ticker)
    return ticker_obj.institutional_holders


def get_mutualfund_holders(ticker):
    """Get mutual fund holders."""
    ticker_obj = yf.Ticker(ticker)
    return ticker_obj.mutualfund_holders


def get_insider_transactions(ticker):
    """Get insider transactions."""
    ticker_obj = yf.Ticker(ticker)
    return ticker_obj.insider_transactions


def get_insider_purchases(ticker):
    """Get insider purchases."""
    ticker_obj = yf.Ticker(ticker)
    return ticker_obj.insider_purchases


def get_insider_roster_holders(ticker):
    """Get insider roster holders."""
    ticker_obj = yf.Ticker(ticker)
    return ticker_obj.insider_roster


def get_shares(ticker):
    """Get shares information."""
    ticker_obj = yf.Ticker(ticker)
    return ticker_obj.shares


def get_shares_full(ticker):
    """Get full shares information."""
    ticker_obj = yf.Ticker(ticker)
    return ticker_obj.shares_full


def get_options(ticker):
    """Get available options dates."""
    ticker_obj = yf.Ticker(ticker)
    return ticker_obj.options


def get_option_chain(ticker, date=None):
    """Get option chain for a specific date."""
    ticker_obj = yf.Ticker(ticker)
    if date:
        return ticker_obj.option_chain(date)
    # Return first available date if none specified
    options = ticker_obj.options
    if options and len(options) > 0:
        return ticker_obj.option_chain(options[0])
    return None


def get_calendar(ticker):
    """Get earnings calendar."""
    ticker_obj = yf.Ticker(ticker)
    return ticker_obj.calendar


def get_news(ticker):
    """Get recent news."""
    ticker_obj = yf.Ticker(ticker)
    return ticker_obj.news


def get_sustainability(ticker):
    """Get ESG/sustainability data."""
    ticker_obj = yf.Ticker(ticker)
    return ticker_obj.sustainability


def get_sec_filings(ticker):
    """Get SEC filings."""
    ticker_obj = yf.Ticker(ticker)
    return ticker_obj.sec_filings


def get_funds_data(ticker):
    """Get fund-specific data."""
    ticker_obj = yf.Ticker(ticker)
    return ticker_obj.funds_data


def get_market(market="us_market"):
    """Get market information."""
    return yf.download(tickers=market)


def get_sector(sector):
    """Get sector information."""
    return yf.download(tickers=sector)