import argparse
import csv
import io
import json

import pandas as pd

try:
    import pandas_ta as ta

    PANDAS_TA_AVAILABLE = True
except ImportError:
    PANDAS_TA_AVAILABLE = False
    ta = None
import yaml
import yfinance as yf

# ---------------------------------------------------------------------------
# WebSocket
# ---------------------------------------------------------------------------


def message_handler(message):
    print("Received message:", message)
    with open("messages.jsonl", "a", encoding="utf-8") as f:
        f.write(json.dumps(message, default=str) + "\n")


# ---------------------------------------------------------------------------
# CSV helpers
# ---------------------------------------------------------------------------


def list_all_tickers():
    """
    Reads a CSV file containing a list of tickers and returns them as a list. Assumes the file
    contains a header row where one of the columns is named "ticker". The function reads
    the file using a UTF-8 encoding.

    :raises FileNotFoundError: If the file "tickers.csv" does not exist.
    :raises KeyError: If the column "ticker" is not present in the CSV file.
    :raises csv.Error: If there is any issue reading from the CSV file.

    :return: A list of tickers extracted from the "ticker" column in the CSV file.
    :rtype: list[str]
    """
    with open("tickers.csv", newline="", encoding="utf-8") as f:
        tickers = [row["ticker"] for row in csv.DictReader(f)]
    print(tickers)
    return tickers


def load_tickers():
    """
    Loads a list of tickers from a CSV file.

    This function reads a CSV file named "tickers.csv" and extracts the values
    from the "ticker" column into a list. Each row in the file is processed
    as a dictionary, and the value associated with the "ticker" key is added
    to the result list.

    :param: None
    :return: A list of ticker strings extracted from the "ticker" column in the "tickers.csv" file.
    :rtype: list[str]
    """
    with open("tickers.csv", newline="", encoding="utf-8") as f:
        return [row["ticker"] for row in csv.DictReader(f)]


# ---------------------------------------------------------------------------
# download (multi-ticker batch)
# ---------------------------------------------------------------------------


def fetch_past_data(ticker, period="1y"):
    """
    Fetch historical stock data for a given ticker symbol and time period using the Yahoo Finance API.

    This function retrieves adjusted historical stock data based on the provided ticker
    symbol and time period. It utilizes the Yahoo Finance library to fetch and return
    the data, which includes various metrics like adjusted prices for the specified period.

    :param ticker: Stock ticker symbol representing the financial instrument to fetch data for.
        Example: "AAPL" for Apple Inc.
    :type ticker: str
    :param period: Time period for the historical data to retrieve. Defaults to "1y",
        which indicates data for one year. Other valid periods include "1d", "5d", "1mo",
        "6mo", etc. Refer to the Yahoo Finance documentation for more details.
    :type period: str
    :return: A DataFrame containing the historical data for the specified ticker and period.
        The returned data includes various fields like Open, High, Low, Close, Adjusted Close,
        and Volume, with adjustments made for dividends and stock splits.
    :rtype: pandas.DataFrame
    """
    return yf.download(ticker, period=period, auto_adjust=True)


def fetch_multi(tickers: list, period="1y"):
    """
    Fetches historical market data for multiple tickers over a specified period.

    This function uses the yfinance library to retrieve historical market data for
    the given list of tickers. Data is returned with adjustments applied and grouped
    by ticker.

    :param tickers: List of stock ticker symbols for which to fetch market data.
        Each symbol should be provided as a string.
    :type tickers: list
    :param period: The historical period for which data is required. Defaults to
        "1y" (one year). Acceptable formats include "1d", "5d", "1mo", "6mo", "1y",
        etc., as per yfinance's specification.
    :type period: str
    :return: A pandas DataFrame containing the historical market data for the
        specified tickers, categorized by ticker symbol.
    :rtype: pandas.DataFrame
    """
    return yf.download(tickers, period=period, auto_adjust=True, group_by="ticker")


# ---------------------------------------------------------------------------
# Ticker — price / history
# ---------------------------------------------------------------------------


def get_history(ticker, period="1y", interval="1d"):
    """
    Fetches the historical stock data for the given ticker symbol over a specified period
    and interval using the Yahoo Finance API.

    :param ticker: The ticker symbol of the stock to fetch historical data for.
    :type ticker: str
    :param period: The time period for which historical data is retrieved (default is "1y").
                    Examples include "1d", "5d", "1mo", "6mo", "1y", "5y", "max".
    :type period: str
    :param interval: The interval at which data points are aggregated (default is "1d").
                     Examples include "1m", "2m", "5m", "15m", "1h", "1d", "1wk", "1mo".
    :type interval: str
    :return: A DataFrame object containing historical stock data, including open, high,
             low, close, volume, and dividends (if available).
    :rtype: pandas.DataFrame
    """
    return yf.Ticker(ticker).history(period=period, interval=interval)


def get_history_metadata(ticker):
    """
    Fetches historical metadata for a given ticker symbol.

    This function utilizes the yfinance library to retrieve metadata
    about the historical data of the specified financial ticker. The
    retrieved metadata typically includes information about the historical
    price data's range, intervals, or any relevant configuration.

    :param ticker: The financial ticker symbol as a string for which the
        historical metadata is to be retrieved.
    :return: A dictionary containing the historical metadata for the
        specified ticker.
    """
    return yf.Ticker(ticker).get_history_metadata()


def get_fast_info(ticker):
    """
    Fetches fast information for a given stock ticker using the yfinance library. This function retrieves
    key financial data and statistics associated with the specified ticker symbol.

    :param ticker: The stock ticker symbol as a string for which fast information is retrieved.
    :return: A dictionary containing fast information about the given stock ticker.
    """
    return yf.Ticker(ticker).get_fast_info()


def get_info(ticker):
    """
    Fetches and returns the information for a given stock ticker.

    This function utilizes the Yahoo Finance API to retrieve information about
    a particular stock based on its ticker symbol.

    :param ticker: The stock ticker symbol for which information is to be retrieved.
    :type ticker: str

    :return: A dictionary containing detailed information about the specified stock ticker.
    :rtype: dict
    """
    return yf.Ticker(ticker).get_info()


def get_isin(ticker):
    """
    Retrieves the International Securities Identification Number (ISIN)
    for a given stock ticker symbol.

    :param ticker: The stock ticker symbol for which ISIN needs to be retrieved.
    :type ticker: str
    :return: The ISIN corresponding to the provided ticker symbol.
    :rtype: str
    """
    return yf.Ticker(ticker).get_isin()


# ---------------------------------------------------------------------------
# Ticker — actions
# ---------------------------------------------------------------------------


def get_actions(ticker):
    """
    Fetches historical corporate actions for a given stock ticker symbol. Corporate actions may
    include details on events like dividends, splits, or other actions affecting the stock data. This
    information is useful for financial analysis, modeling, or understanding past changes for a
    specific security.

    :param ticker: The stock ticker symbol for which to fetch corporate actions.
    :type ticker: str
    :return: A pandas DataFrame containing detailed corporate action data for the stock ticker.
        The data includes events such as dividends, splits, or other stock-related actions.
    :rtype: pandas.DataFrame
    """
    return yf.Ticker(ticker).get_actions()


def get_dividends(ticker):
    """
    Fetches the dividend history for a given stock ticker.

    This function utilizes the Yahoo Finance API to retrieve the dividend history
    of a specific stock identified by its ticker symbol. The dividend data
    includes details about previous payments made to shareholders.

    :param ticker: The stock ticker symbol for which dividend data is retrieved.
    :type ticker: str
    :return: A pandas Series containing the dividend history. The index represents
             payment dates, and the values indicate dividend amounts.
    :rtype: pandas.Series
    """
    return yf.Ticker(ticker).get_dividends()


def get_splits(ticker):
    """
    Fetches historical stock split data for a given ticker symbol.

    This function retrieves the split history of a specific stock or security
    from the Yahoo Finance API. The split data could include details about stock
    splits such as date and split ratio, which can be used for financial analysis
    or other purposes.

    :param ticker: A string representing the ticker symbol of the stock to
        retrieve split data for.
    :return: A pandas DataFrame object containing the stock split information
        for the given ticker. The DataFrame includes relevant details such as
        the date and split ratio.
    """
    return yf.Ticker(ticker).get_splits()


def get_capital_gains(ticker):
    """
    Retrieve the capital gains information for a given stock ticker using the yfinance library.

    This function fetches and returns the capital gains data for the specified
    stock ticker symbol. It's especially useful for analyzing financial gains
    based on investments. Ensure that the yfinance library is properly installed
    and configured in your environment before using this function.

    :param ticker: The stock ticker symbol to fetch capital gains data for.
    :type ticker: str
    :return: The capital gains data corresponding to the given stock ticker.
    :rtype: Any
    """
    return yf.Ticker(ticker).get_capital_gains()


# ---------------------------------------------------------------------------
# Ticker — financials
# ---------------------------------------------------------------------------


def get_financials(ticker, quarterly=False):
    """
    Fetches financial data for a given stock ticker.

    This function retrieves financial data for a specific stock ticker using the
    Yahoo Finance API. It can return either quarterly financials or annual financials,
    based on the provided boolean argument.

    :param ticker: The stock ticker symbol as a string.
    :param quarterly: A boolean indicating whether to retrieve quarterly financial
        data (True) or annual financial data (False). Defaults to False.
    :return: A pandas DataFrame containing either quarterly or annual financial
        data for the specified stock ticker.
    """
    t = yf.Ticker(ticker)
    return t.quarterly_financials if quarterly else t.financials


def get_income_stmt(ticker, quarterly=False):
    """
    Fetches the income statement data for a given ticker symbol.

    This function utilizes the yfinance library to retrieve income statement
    details for a specified stock ticker. Depending on the provided `quarterly`
    flag, it can fetch either quarterly or annual income statement data.

    :param ticker: A string representing the stock ticker symbol for which the
        income statement data is to be retrieved.
    :param quarterly: A boolean indicating whether to fetch quarterly income
        statement data. If False, annual income statement data is retrieved
        instead.
    :return: The income statement data for the given stock ticker; this can
        either be a quarterly or annual representation, returned in an appropriate
        format provided by the yfinance library.
    """
    t = yf.Ticker(ticker)
    return t.quarterly_income_stmt if quarterly else t.income_stmt


def get_balance_sheet(ticker, quarterly=False):
    """
    Retrieve the balance sheet data of a specified stock from Yahoo Finance.

    This function utilizes the `yfinance` library to extract balance sheet information
    for a given stock ticker. The balance sheet data can be retrieved either quarterly
    or annually, depending on the input parameter.

    :param ticker: The stock ticker symbol as a string. For example, 'AAPL' for Apple Inc.
    :type ticker: str
    :param quarterly: A boolean indicating whether to fetch quarterly data.
        If set to True, returns the quarterly balance sheet. Defaults to False.
    :type quarterly: bool
    :return: A pandas DataFrame containing either the quarterly or annual balance sheet data.
    :rtype: pandas.DataFrame
    """
    t = yf.Ticker(ticker)
    return t.quarterly_balance_sheet if quarterly else t.balance_sheet


def get_cash_flow(ticker, quarterly=False):
    """
    Fetches the cash flow statement for a specified stock ticker using the yfinance library.
    The function can retrieve either quarterly or annual cash flow data based on the provided
    parameters.

    :param ticker: The stock ticker symbol for which the cash flow statement is to be fetched.
    :param quarterly: A boolean flag indicating whether to fetch quarterly cash flow data. If set
        to True, quarterly cash flow data will be returned. If set to False or omitted, annual cash
        flow data will be returned.
    :return: The cash flow data for the specified stock ticker. Returns quarterly or annual cash flow
        data as a pandas DataFrame.
    """
    t = yf.Ticker(ticker)
    return t.quarterly_cash_flow if quarterly else t.cash_flow


def get_ttm_financials(ticker):
    """
    Fetches the trailing twelve months (TTM) financials for a specified stock ticker symbol.

    This function retrieves financial data for a given stock ticker using the Yahoo Finance
    library and returns the TTM financials.

    :param ticker: The stock ticker symbol as a string.
    :type ticker: str
    :return: A DataFrame containing the TTM financials for the specified stock ticker.
    :rtype: pandas.DataFrame
    """
    return yf.Ticker(ticker).ttm_financials


def get_ttm_income_stmt(ticker):
    """
    Fetches the trailing twelve months (TTM) income statement for a specified stock ticker using the Yahoo Finance API.

    The function retrieves financial data for the given company ticker symbol, specifically the TTM income statement, which
    includes revenue, expenses, and profits over the last four quarters combined.

    :param ticker: The stock ticker symbol of the company.
    :type ticker: str
    :return: A dictionary containing the TTM income statement data.
    :rtype: dict
    """
    return yf.Ticker(ticker).ttm_income_stmt


def get_ttm_cash_flow(ticker):
    """
    Retrieves the trailing twelve months (TTM) cash flow for the specified stock ticker.

    This function uses the yfinance library to fetch the TTM cash flow data
    associated with the given stock ticker.

    :param ticker: The stock ticker symbol of the company.
    :type ticker: str
    :return: The TTM cash flow data for the specified ticker.
    :rtype: pandas.DataFrame
    """
    return yf.Ticker(ticker).ttm_cash_flow


# ---------------------------------------------------------------------------
# Ticker — earnings & estimates
# ---------------------------------------------------------------------------


def get_earnings(ticker):
    """
    Retrieve the earnings data for a given stock ticker symbol using Yahoo Finance.

    :param ticker: The stock ticker symbol for which earnings data is requested.
    :type ticker: str
    :return: A dictionary containing the earnings data of the specified ticker.
    :rtype: dict
    """
    return yf.Ticker(ticker).get_earnings()


def get_earnings_dates(ticker):
    """
    Retrieve the earnings dates for a specific stock ticker.

    This function fetches the earnings dates associated with the given
    stock ticker symbol. It uses the Yahoo Finance API to gather the required
    information and provides it in a structured format.

    :param ticker: The stock ticker symbol for which to fetch earnings dates.
    :type ticker: str
    :return: A DataFrame containing the earnings dates and related data for
        the provided stock ticker.
    :rtype: pandas.DataFrame
    """
    return yf.Ticker(ticker).get_earnings_dates()


def get_earnings_history(ticker):
    """
    Retrieves the earnings history for a given stock ticker using the yfinance library.

    :param ticker: The stock ticker symbol as a string.
    :type ticker: str
    :return: A list of dictionaries containing earnings history data. Each dictionary
             includes details such as earnings announcement dates, EPS actuals, and
             EPS estimates.
    :rtype: list
    """
    return yf.Ticker(ticker).get_earnings_history()


def get_earnings_estimate(ticker):
    """
    Fetches the earnings estimate data for a specific stock ticker symbol.

    This function retrieves the earnings estimate data using the provided ticker
    symbol by utilizing the `yfinance` library.

    :param ticker: The stock ticker symbol as a string.
    :return: A DataFrame containing earnings estimate data for the given ticker.
    """
    return yf.Ticker(ticker).get_earnings_estimate()


def get_revenue_estimate(ticker):
    """
    Fetches the revenue estimate for a specified stock ticker.

    This function utilizes the yfinance library to retrieve the revenue
    estimate for the given stock ticker symbol. The revenue estimate
    provides information about the expected revenue for the company
    associated with the provided ticker.

    :param ticker: The stock ticker symbol for which the revenue estimate
        should be retrieved.
    :type ticker: str
    :return: The revenue estimate retrieved for the specified ticker.
    :rtype: Any
    """
    return yf.Ticker(ticker).get_revenue_estimate()


def get_eps_trend(ticker):
    """
    Retrieves the EPS (Earnings Per Share) trend for the specified stock ticker.

    This function utilizes the Yahoo Finance library to fetch the EPS trend
    for the provided stock ticker. The EPS trend indicates the historical
    or forecasted earnings per share data, which can be useful for
    financial analysis and decision-making.

    :param ticker: The stock ticker symbol for which to retrieve the EPS trend.
                   The ticker should be a valid string representing a publicly
                   traded stock.
    :return: A dictionary containing the EPS trend data as fetched from
             Yahoo Finance.
    :rtype: dict
    """
    return yf.Ticker(ticker).get_eps_trend()


def get_eps_revisions(ticker):
    """
    Fetches the EPS (Earnings Per Share) revisions for a given stock ticker.

    This function utilizes the yfinance library to retrieve the EPS revisions
    associated with a specific ticker symbol.

    :param ticker: The stock ticker symbol for which to retrieve EPS revisions.
    :type ticker: str
    :return: A data structure containing the EPS revisions for the specified ticker.
    :rtype: object or None
    """
    return yf.Ticker(ticker).get_eps_revisions()


def get_growth_estimates(ticker):
    """
    Fetches the growth estimates for a stock ticker from Yahoo Finance.

    This function uses the Yahoo Finance API to retrieve growth estimates for
    the given stock ticker symbol. Growth estimates include information like
    projected earnings growth for specific time periods. Useful for
    financial analysis and decision making.

    :param ticker: A string representing the stock ticker symbol.
    :type ticker: str
    :return: A pandas DataFrame containing growth estimates data.
    :rtype: pandas.DataFrame
    """
    return yf.Ticker(ticker).get_growth_estimates()


# ---------------------------------------------------------------------------
# Ticker — analyst / recommendations
# ---------------------------------------------------------------------------


def get_recommendations(ticker):
    """
    Fetches the stock recommendations for a given ticker symbol. Utilizes the yfinance library to obtain recommendation
    data for the specified stock ticker.

    :param ticker: The stock ticker symbol whose recommendations are to be fetched.
    :type ticker: str
    :return: A DataFrame containing recommendation data for the specified ticker.
    :rtype: pandas.DataFrame
    """
    return yf.Ticker(ticker).get_recommendations()


def get_recommendations_summary(ticker):
    """
    Retrieves the recommendations summary for the provided stock ticker using the `yfinance` library.

    This function fetches data relevant to the recommendations summary of a particular stock or
    asset, as denoted by its ticker symbol. The data is pulled from Yahoo Finance via the
    `yfinance` module.

    :param ticker: The stock ticker symbol for which the recommendations summary needs to
        be fetched.
    :type ticker: str
    :return: The recommendations summary for the provided stock ticker symbol, as retrieved
        from Yahoo Finance.
    :rtype: dict
    """
    return yf.Ticker(ticker).get_recommendations_summary()


def get_analyst_price_targets(ticker):
    """
    Fetches analyst price target data for a given stock ticker symbol. This function
    retrieves detailed information about analyst price targets, including metrics
    such as low, high, and mean price targets.

    :param ticker: Stock ticker symbol as a string.
    :type ticker: str
    :return: A DataFrame containing analyst price target data.
    :rtype: pandas.DataFrame
    """
    return yf.Ticker(ticker).get_analyst_price_targets()


def get_upgrades_downgrades(ticker):
    """
    Fetches stock upgrades and downgrades data for a specific ticker symbol.

    This function retrieves data related to stock upgrades and downgrades
    for the specified company ticker symbol using the Yahoo Finance API.
    The data can be useful for analyzing market sentiment and trends
    around a certain stock.

    :param ticker: The ticker symbol of the stock for which to retrieve
        upgrades and downgrades data.
    :type ticker: str
    :return: A DataFrame containing the upgrades and downgrades data for
        the specified ticker symbol.
    :rtype: pandas.DataFrame
    """
    return yf.Ticker(ticker).get_upgrades_downgrades()


# ---------------------------------------------------------------------------
# Ticker — holders
# ---------------------------------------------------------------------------


def get_major_holders(ticker):
    """
    Fetches the major holders of a given stock ticker.

    This function retrieves information about the major holders of a stock
    based on the provided ticker symbol. It utilizes the Yahoo Finance API
    to fetch the required data.

    :param ticker: str
        The stock ticker symbol for which the major holders should be
        obtained. For example, 'AAPL' for Apple Inc., 'GOOGL' for Alphabet
        Inc., etc.
    :return: pandas.DataFrame
        A DataFrame containing information about the major holders of the
        specified stock ticker. Typically includes data on percentage
        ownership, names, and other relevant information.
    """
    return yf.Ticker(ticker).get_major_holders()


def get_institutional_holders(ticker):
    """
    Retrieve institutional holders for a given stock ticker.

    This function fetches and returns detailed institutional holding information
    for the specified stock ticker by utilizing the Yahoo Finance API.

    :param ticker: The stock ticker symbol for which the institutional holders
        data is to be retrieved.
    :type ticker: str
    :return: A pandas DataFrame containing information about the institutional
        holders of the specified stock, such as holder names, positions, and
        ownership details.
    :rtype: pandas.DataFrame
    """
    return yf.Ticker(ticker).get_institutional_holders()


def get_mutualfund_holders(ticker):
    """
    Fetches mutual fund holders for a given stock ticker.

    This function retrieves the mutual fund holders of the specified stock ticker
    using the yfinance library. The returned data contains information about
    mutual funds holding shares related to the provided ticker.

    :param ticker: The stock ticker symbol for which mutual fund holders are to
        be retrieved.
    :type ticker: str
    :return: A DataFrame containing information about mutual fund holders of
        the specified ticker. The structure of the returned data depends on
        the implementation of yfinance's `get_mutualfund_holders` method.
    :rtype: pandas.DataFrame
    """
    return yf.Ticker(ticker).get_mutualfund_holders()


def get_insider_transactions(ticker):
    """
    Fetches and returns the insider transactions for a given stock ticker.

    Retrieves insider trading data based on the specified stock ticker using
    the yfinance library.

    :param ticker: The stock ticker symbol for which to retrieve insider transactions.
    :type ticker: str
    :return: A DataFrame containing insider transaction data for the specified stock ticker.
    :rtype: pandas.DataFrame
    """
    return yf.Ticker(ticker).get_insider_transactions()


def get_insider_purchases(ticker):
    """
    Retrieve insider purchase activities for a specific stock ticker symbol.

    This function utilizes the Yahoo Finance API wrapper to fetch insider
    purchase data pertinent to a given stock. Insider purchases are
    transactions conducted by individuals with access to non-public financial
    information about the company, such as executives or board members.

    :param ticker: The stock ticker symbol for the company whose insider
        purchase data will be retrieved.
    :type ticker: str
    :return: A data set containing insider purchase information associated
        with the given stock ticker.
    :rtype: pandas.DataFrame
    """
    return yf.Ticker(ticker).get_insider_purchases()


def get_insider_roster_holders(ticker):
    """
    Fetches and returns insider roster holders for the specified ticker symbol. The function utilizes the `yfinance` library to
    retrieve the data and provides an interface for accessing insider-related information for a given financial asset. It simplifies
    the retrieval of insider data for analysis or reporting purposes.

    :param ticker: A string representing the ticker symbol of the asset for which to retrieve insider roster holders.
    :type ticker: str
    :return: Insider roster holders data for the specified ticker symbol as retrieved using the `yfinance` library.
    :rtype: Any
    """
    return yf.Ticker(ticker).get_insider_roster_holders()


def get_shares(ticker):
    """ """
    return yf.Ticker(ticker).get_shares()


def get_shares_full(ticker):
    """
    Fetches and returns the full shares outstanding information for a given stock ticker.
    This function utilizes Yahoo Finance's API via the yfinance package to retrieve
    information about the shares outstanding for the specified stock.

    :param ticker: The stock ticker symbol for which the shares outstanding information
        should be retrieved.
    :type ticker: str

    :return: Full shares outstanding data for the given stock, retrieved from Yahoo Finance.
    :rtype: any
    """
    return yf.Ticker(ticker).get_shares_full()


# ---------------------------------------------------------------------------
# Ticker — options
# ---------------------------------------------------------------------------


def get_options(ticker):
    """
    Fetches the list of available options expiration dates for a given stock ticker symbol.

    This function uses the yfinance library to retrieve options information
    for a specific stock or security based on its ticker symbol. It returns
    a list containing the expiration dates for the options available.

    :param ticker: The ticker symbol of the stock or security for which to retrieve
                   options data.
    :type ticker: str
    :return: A list of expiration dates for the options available for the given
             ticker symbol.
    :rtype: list[str]
    """
    return yf.Ticker(ticker).options


def get_option_chain(ticker, date=None):
    """ """
    t = yf.Ticker(ticker)
    return t.option_chain(date) if date else t.option_chain()


# ---------------------------------------------------------------------------
# Ticker — misc
# ---------------------------------------------------------------------------


def get_calendar(ticker):
    """
    Fetches the earnings calendar for the provided stock ticker using Yahoo Finance.

    This function retrieves information about the earnings calendar for a specific
    stock ticker symbol. The earnings calendar typically includes details about
    earnings announcement dates and other related information.

    :param ticker: The stock ticker symbol for which to retrieve the earnings calendar.
    :type ticker: str
    :return: A DataFrame containing the earnings calendar data for the given ticker.
    :rtype: pandas.DataFrame
    """
    return yf.Ticker(ticker).get_calendar()


def get_news(ticker):
    """
    Fetches the news related to a specific stock ticker symbol using the yfinance library.

    The function retrieves a list of news articles associated with the provided
    ticker symbol. It is a convenient way to access the latest financial news
    relevant to a specific stock.

    :param ticker: A string representing the stock ticker symbol for which news
        articles will be retrieved.
    :return: A list of news articles associated with the given ticker symbol.
        Each item in the list typically contains metadata about the news, such as
        the title, publisher, publication date, and a link to the full article.
    """
    return yf.Ticker(ticker).get_news()


def get_sustainability(ticker):
    """
    Fetches the sustainability-related data for a given ticker symbol.

    This function retrieves environmental, social, and governance (ESG) data
    for the company associated with the specified ticker symbol. It utilizes
    the Yahoo Finance API to access this information. The ESG data can be
    used to assess the sustainability practices of the company.

    :param ticker: The stock ticker symbol of the company whose sustainability
        data is to be retrieved. Must be a valid string representing the
        company's ticker symbol.
    :type ticker: str
    :return: The sustainability information associated with the given ticker.
        Typically, this includes a dataset with ESG scores and other related
        metrics.
    :rtype: dict or None
    """
    return yf.Ticker(ticker).get_sustainability()


def get_sec_filings(ticker):
    """
    Retrieve SEC filings for a given stock ticker.

    This function uses the `yfinance` library to fetch SEC filing data
    associated with the provided ticker symbol. SEC filings are comprehensive
    documents submitted by publicly-traded companies to the U.S. Securities
    and Exchange Commission (SEC) and contain important financial and business
    information.

    :param ticker: The stock ticker symbol representing the company whose SEC
        filings are to be retrieved.
    :type ticker: str
    :return: SEC filings retrieved for the specified ticker.
    :rtype: Any
    """
    return yf.Ticker(ticker).get_sec_filings()


def get_funds_data(ticker):
    """
    Fetches mutual funds data for a given ticker symbol using the Yahoo Finance library.

    This function retrieves data specific to mutual funds associated with the input
    ticker symbol. The retrieved data can include performance details, holdings,
    and other fund-related statistics.

    :param ticker: The ticker symbol of the mutual fund for which data is to be
        retrieved.
    :type ticker: str
    :return: A dictionary or other structured data containing mutual fund-related
        information retrieved from the Yahoo Finance library. The exact structure
        and content of the returned data depend on the data available for the
        provided ticker.
    :rtype: Any
    """
    return yf.Ticker(ticker).get_funds_data()


# ---------------------------------------------------------------------------
# Market-level
# ---------------------------------------------------------------------------


def get_market(market="us_market"):
    """
    Fetches and returns a market instance based on the specified market name.

    This function uses the given market name to create and return an instance
    of the corresponding market object. If no market name is specified, it will
    default to "us_market".

    :param market: The name of the market to fetch. Defaults to "us_market".
    :type market: str
    :return: An instance of the specified market.
    :rtype: yf.Market
    """
    return yf.Market(market)


def get_sector(sector):
    """
    Fetches and returns financial data for the specified sector using the Yahoo Finance API.

    :param sector: The financial sector for which data is to be retrieved.
    :type sector: str
    :return: An object containing financial data related to the specified sector.
    :rtype: yf.Sector
    """
    return yf.Sector(sector)


def get_industry(industry):
    """
    Fetches information about a specific industry using the yfinance library.

    This function retrieves data related to the industry specified by the input.

    :param industry: The name of the industry for which information is to be
        fetched.
    :type industry: str
    :return: An object containing data about the specified industry.
    :rtype: yf.Industry
    """
    return yf.Industry(industry)


# ---------------------------------------------------------------------------
# Search / Lookup / Screener
# ---------------------------------------------------------------------------


def search(query, max_results=10):
    """ """
    return yf.Search(query, max_results=max_results)


def lookup(query):
    """ """
    return yf.Lookup(query)


def screen(query):
    """
    Filters data based on the specified query and returns the results.

    This function utilizes `yf.screen()` to process the query and
    return relevant data. The query is expected to be in the format
    required by the `yf` module.

    :param query: The query to filter data. The format and parameters
        of the query depend on the `yf.screen` implementation.
    :type query: str
    :return: The results of the data filtering based on the provided query.
    :rtype: Any
    """
    return yf.screen(query)


# ---------------------------------------------------------------------------
# Tickers (batch object)
# ---------------------------------------------------------------------------


def get_tickers_obj(tickers: list):
    """
    Constructs and returns a `yf.Tickers` object initialized with a combined string of
    tickers provided in a list.

    This function takes a list of stock ticker symbols, concatenates them into a single
    space-separated string, and initializes a `yf.Tickers` object using the `yfinance`
    library.

    :param tickers: List of stock ticker symbols to be included in the `yf.Tickers`
        object.
    :type tickers: list
    :return: An instance of `yf.Tickers` initialized with the specified ticker symbols.
    :rtype: yf.Tickers
    """
    return yf.Tickers(" ".join(tickers))


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

# ---------------------------------------------------------------------------
# Output formatter
# ---------------------------------------------------------------------------


def _to_serializable(obj):
    """Recursively convert yfinance / pandas objects to plain Python types."""
    if isinstance(obj, pd.DataFrame):
        return json.loads(obj.to_json(orient="records", date_format="iso"))
    if isinstance(obj, pd.Series):
        return json.loads(obj.to_json(date_format="iso"))
    if isinstance(obj, dict):
        return {k: _to_serializable(v) for k, v in obj.items()}
    if isinstance(obj, (list, tuple)):
        return [_to_serializable(i) for i in obj]
    if hasattr(obj, "__dict__"):
        return _to_serializable(vars(obj))
    return obj


def format_output(data, fmt="plain"):
    # option_chain returns a named tuple with .calls / .puts DataFrames
    if hasattr(data, "calls") and hasattr(data, "puts"):
        data = {"calls": data.calls, "puts": data.puts}

    fmt = (fmt or "plain").lower()

    # ---- DataFrame ----
    if isinstance(data, pd.DataFrame):
        if fmt == "json":
            print(data.to_json(orient="records", indent=2, date_format="iso"))
        elif fmt == "csv":
            print(data.to_csv())
        elif fmt == "tsv":
            print(data.to_csv(sep="\t"))
        elif fmt == "yaml":
            print(yaml.dump(_to_serializable(data), allow_unicode=True))
        else:
            print(data)
        return

    # ---- Series ----
    if isinstance(data, pd.Series):
        if fmt == "json":
            print(data.to_json(indent=2, date_format="iso"))
        elif fmt == "csv":
            print(data.to_csv())
        elif fmt == "tsv":
            print(data.to_csv(sep="\t"))
        elif fmt == "yaml":
            print(yaml.dump(_to_serializable(data), allow_unicode=True))
        else:
            print(data)
        return

    # ---- dict / list ----
    if isinstance(data, (dict, list)):
        serializable = _to_serializable(data)
        if fmt == "json":
            print(json.dumps(serializable, indent=2, default=str))
        elif fmt in ("csv", "tsv"):
            sep = "," if fmt == "csv" else "\t"
            # flatten a list-of-dicts into tabular form
            rows = serializable if isinstance(serializable, list) else [serializable]
            if rows and isinstance(rows[0], dict):
                buf = io.StringIO()
                w = csv.DictWriter(buf, fieldnames=rows[0].keys(), delimiter=sep)
                w.writeheader()
                w.writerows(rows)
                print(buf.getvalue())
            else:
                print(("\n" if sep == "," else "\t").join(str(r) for r in rows))
        elif fmt == "yaml":
            print(yaml.dump(serializable, allow_unicode=True))
        else:
            print(data)
        return

    # ---- scalar / string / everything else ----
    if fmt == "json":
        print(json.dumps(data, default=str, indent=2))
    elif fmt == "yaml":
        print(yaml.dump(_to_serializable(data), allow_unicode=True))
    else:
        print(data)


# ---------------------------------------------------------------------------
# Prediction / Technical Analysis
# ---------------------------------------------------------------------------


def get_technical_indicators(ticker, period="6mo"):
    """
    Calculate technical indicators for a given ticker.

    :param ticker: Stock ticker symbol.
    :param period: Data period (default: 6mo).
    :return: DataFrame with technical indicators.
    """
    data = yf.download(ticker, period=period, auto_adjust=True)
    if data.empty:
        return pd.DataFrame()

    # Handle MultiIndex from yfinance - flatten columns
    if isinstance(data.columns, pd.MultiIndex):
        # Extract just the field names (Close, High, etc.)
        data.columns = data.columns.get_level_values(0)

    # Reset index to have Date as column
    df = data.reset_index()

    # Calculate indicators using pandas-ta (if available)
    if PANDAS_TA_AVAILABLE and ta is not None:
        n = len(df)
        # Common indicators - use adaptive lengths
        sma_len = min(20, max(5, n // 3))
        ema_len = min(12, max(3, n // 5))
        rsi_len = min(14, max(7, n // 4))

        df.ta.sma(length=sma_len, close="Close", append=True)
        df.ta.ema(length=ema_len, close="Close", append=True)
        df.ta.rsi(length=rsi_len, close="Close", append=True)
        df.ta.macd(fast=12, slow=26, signal=9, close="Close", append=True)
        df.ta.bbands(length=sma_len, std=2, close="Close", append=True)
        df.ta.atr(length=14, high="High", low="Low", close="Close", append=True)
    return df


def get_signals(ticker, period="6mo"):
    """
    Generate trading signals based on technical indicators.

    :param ticker: Stock ticker symbol.
    :param period: Data period (default: 6mo).
    :return: DataFrame with buy/sell signals.
    """
    df = get_technical_indicators(ticker, period)
    if df.empty:
        return pd.DataFrame()

    # Generate signals
    signals = pd.DataFrame(index=df.index)
    signals["close"] = df["Close"]

    # RSI signals - find RSI column dynamically
    rsi_cols = [c for c in df.columns if c.startswith("RSI_")]
    if rsi_cols:
        rsi_col = rsi_cols[0]
        signals["rsi"] = df[rsi_col]
        signals["rsi_signal"] = df[rsi_col].apply(
            lambda x: "BUY" if x < 30 else ("SELL" if x > 70 else "HOLD") if pd.notna(x) else None
        )

    # MACD signals
    macd_cols = [c for c in df.columns if c.startswith("MACD")]
    if len(macd_cols) >= 2:
        signals["macd"] = df["MACD_12_26_9"]
        signals["macd_signal"] = df["MACD_12_26_9"] - df["MACDs_12_26_9"]
        signals["macd_cross"] = signals["macd_signal"].apply(
            lambda x: "BUY" if x > 0 else "SELL" if pd.notna(x) else None
        )

    # SMA crossover signals - find SMA columns dynamically
    sma_cols = [c for c in df.columns if c.startswith("SMA_")]
    if len(sma_cols) >= 1:
        signals["sma"] = df[sma_cols[0]]
        if len(sma_cols) >= 2:
            signals["sma_2"] = df[sma_cols[1]]

    return signals.tail(30)  # Last 30 signals


# ---------------------------------------------------------------------------
# Crypto
# ---------------------------------------------------------------------------


def get_crypto_price(ticker, period="1mo"):
    """
    Get cryptocurrency price data.

    :param ticker: Crypto ticker (e.g., BTC-USD, ETH-USD).
    :param period: Data period (default: 1mo).
    :return: DataFrame with crypto prices.
    """
    data = yf.download(ticker, period=period, auto_adjust=True)
    if data.empty:
        return pd.DataFrame()

    if isinstance(data.columns, pd.MultiIndex):
        data.columns = data.columns.get_level_values(0)

    return data.reset_index()


def get_crypto_indicators(ticker, period="1mo"):
    """
    Get technical indicators for cryptocurrency.

    :param ticker: Crypto ticker (e.g., BTC-USD).
    :param period: Data period (default: 1mo).
    :return: DataFrame with crypto indicators.
    """
    data = yf.download(ticker, period=period, auto_adjust=True)
    if data.empty:
        return pd.DataFrame()

    if isinstance(data.columns, pd.MultiIndex):
        data.columns = data.columns.get_level_values(0)

    df = data.reset_index()
    n = len(df)

    if PANDAS_TA_AVAILABLE and ta is not None and n > 10:
        df.ta.sma(length=20, close="Close", append=True)
        df.ta.rsi(length=14, close="Close", append=True)
        df.ta.macd(fast=12, slow=26, signal=9, close="Close", append=True)
        df.ta.bbands(length=20, close="Close", append=True)

    return df


# Popular crypto tickers
CRYPTO_TICKERS = {
    "BTC": "BTC-USD",
    "ETH": "ETH-USD",
    "BNB": "BNB-USD",
    "XRP": "XRP-USD",
    "ADA": "ADA-USD",
    "SOL": "SOL-USD",
    "DOGE": "DOGE-USD",
    "DOT": "DOT-USD",
    "MATIC": "MATIC-USD",
    "LTC": "LTC-USD",
}

BOND_TICKERS = {
    "TLT": "iShares 20+ Year Treasury Bond ETF",
    "IEF": "iShares 7-10 Year Treasury Bond ETF",
    "SHY": "iShares 1-3 Year Treasury Bond ETF",
    "AGG": "iShares Core US Aggregate Bond ETF",
    "BND": "Vanguard Total Bond Market ETF",
    "JNK": "SPDR Bloomberg High Yield Bond ETF",
    "HYG": "iShares iBoxx $ High Yield Corporate Bond ETF",
    "LQD": "iShares iBoxx $ Investment Grade Corporate Bond ETF",
}

INTERNATIONAL_TICKERS = {
    "EFA": "iShares MSCI EAFE ETF",
    "VEA": "Vanguard FTSE Developed Markets ETF",
    "VWO": "Vanguard FTSE Emerging Markets ETF",
    "IEFA": "iShares Core MSCI EAFE ETF",
    "IEMG": "iShares Core MSCI Emerging Markets ETF",
    "SCHF": "Schwab International Equity ETF",
}


def get_bond_indicators(ticker, period="6mo"):
    """
    Get bond ETF data with indicators.

    :param ticker: Bond ticker symbol.
    :param period: Data period (default: 6mo).
    :return: DataFrame with bond data.
    """
    data = yf.download(ticker, period=period, auto_adjust=True)
    if data.empty:
        return pd.DataFrame()

    if isinstance(data.columns, pd.MultiIndex):
        data.columns = data.columns.get_level_values(0)

    df = data.reset_index()

    if len(df) > 20:
        df.ta.sma(length=20, close="Close", append=True)
        df.ta.rsi(length=14, close="Close", append=True)
        df.ta.bbands(length=20, close="Close", append=True)

    return df


# ---------------------------------------------------------------------------
# CDs (Certificates of Deposit)
# ---------------------------------------------------------------------------

# Typical CD rates (as of 2024-2025) - these change regularly
CD_RATES = {
    "3_month": {"rate": 4.50, "description": "3 Month CD"},
    "6_month": {"rate": 4.75, "description": "6 Month CD"},
    "9_month": {"rate": 4.60, "description": "9 Month CD"},
    "1_year": {"rate": 4.85, "description": "1 Year CD"},
    "18_month": {"rate": 4.50, "description": "18 Month CD"},
    "2_year": {"rate": 4.40, "description": "2 Year CD"},
    "3_year": {"rate": 4.35, "description": "3 Year CD"},
    "5_year": {"rate": 4.25, "description": "5 Year CD"},
}


def get_cd_rates():
    """
    Get current typical CD rates.

    :return: Dictionary with CD rates by term.
    """
    return CD_RATES


def calculate_cd_return(principal, term, rate=None):
    """
    Calculate CD return.

    :param principal: Initial deposit amount.
    :param term: CD term (e.g., "1_year", "6_month").
    :param rate: Optional custom rate (default: uses typical rate).
    :return: Dictionary with CD calculation results.
    """
    if term not in CD_RATES:
        return {"error": f"Unknown term: {term}. Available: {list(CD_RATES.keys())}"}

    cd = CD_RATES[term]
    annual_rate = rate / 100 if rate else cd["rate"] / 100

    # Calculate simple interest
    term_months = {
        "3_month": 3,
        "6_month": 6,
        "9_month": 9,
        "1_year": 12,
        "18_month": 18,
        "2_year": 24,
        "3_year": 36,
        "5_year": 60,
    }
    months = term_months.get(term, 12)

    interest = principal * annual_rate * (months / 12)
    final_value = principal + interest

    return {
        "principal": principal,
        "term": term,
        "description": cd["description"],
        "rate": cd["rate"],
        "months": months,
        "interest_earned": round(interest, 2),
        "final_value": round(final_value, 2),
    }


# ---------------------------------------------------------------------------
# Portfolio Generation
# ---------------------------------------------------------------------------


def get_allocation_by_age(age, strategy="balanced"):
    """
    Calculate portfolio allocation based on age and strategy.

    :param age: User's age.
    :param strategy: Investment strategy (conservative, balanced, aggressive).
    :return: Dictionary with allocation percentages.
    """
    # Base allocation: 100 - age in stocks (classic rule)
    # Age 30: 70% stocks, 30% bonds
    # Age 60: 40% stocks, 60% bonds
    age = max(18, min(age, 100))
    stock_pct = max(10, 100 - age)

    if strategy == "conservative":
        stock_pct = int(stock_pct * 0.6)
    elif strategy == "aggressive":
        stock_pct = int(stock_pct * 1.2)

    stock_pct = min(stock_pct, 90)
    bond_pct = min(90 - stock_pct, 80)
    crypto_pct = 100 - stock_pct - bond_pct

    # Adjust for strategy
    if strategy == "conservative":
        crypto_pct = 0
        bond_pct = 100 - stock_pct
    elif strategy == "aggressive":
        crypto_pct = min(crypto_pct + 10, 25)

    return {
        "stocks": stock_pct,
        "bonds": bond_pct,
        "crypto": crypto_pct,
    }


def get_portfolio(strategy="balanced", age=30, capital=10000, top_n=5):
    """
    Generate a portfolio based on strategy and age.

    :param strategy: Strategy type (day_trading, swing, long_term, growth, value, dividend, conservative, balanced, aggressive).
    :param age: User's age for allocation.
    :param capital: Total capital to invest.
    :param top_n: Number of stocks per category.
    :return: Dictionary with portfolio allocation and recommendations.
    """
    allocation = get_allocation_by_age(age, strategy)
    allocation["age"] = age
    allocation["strategy"] = strategy
    allocation["capital"] = capital

    # Stock recommendations by strategy
    stock_pools = {
        "day_trading": ["NVDA", "TSLA", "AMD", "META", "AAPL", "AMZN", "MSFT"],
        "swing": ["NVDA", "TSLA", "AMD", "AAPL", "MSFT", "GOOGL", "AMZN", "META"],
        "long_term": ["AAPL", "MSFT", "GOOGL", "AMZN", "JNJ", "PG", "V", "UNH"],
        "growth": ["NVDA", "TSLA", "AMD", "META", "AMZN", "GOOGL", "CRM"],
        "value": ["JNJ", "PG", "KO", "PEP", "WMT", "VZ", "T", "XOM"],
        "dividend": ["JNJ", "PG", "KO", "PEP", "VZ", "T", "XOM", "CVX"],
        "conservative": ["JNJ", "PG", "KO", "VZ", "T", "XOM", "CVX", "PFE"],
        "balanced": ["AAPL", "MSFT", "GOOGL", "AMZN", "JNJ", "PG", "KO", "V"],
        "aggressive": ["NVDA", "TSLA", "AMD", "META", "AMZN", "GOOGL", "CRM", "SQ"],
    }

    # Crypto recommendations
    crypto_pool = ["BTC-USD", "ETH-USD", "SOL-USD", "BNB-USD", "XRP-USD", "ADA-USD"]

    # Bond recommendations
    bond_pool = ["TLT", "IEF", "AGG", "BND", "LQD"]

    # Get stocks
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

            portfolio["stocks"]["tickers"].append(
                {
                    "ticker": ticker,
                    "shares": shares,
                    "price": float(close),
                    "value": float(shares * close),
                    "allocation_pct": 100 / len(stock_tickers),
                }
            )
        except Exception:
            pass

    # Get crypto data
    if allocation["crypto"] > 0:
        crypto_value = capital * allocation["crypto"] / 100
        for ticker in crypto_pool[:top_n]:
            try:
                data = yf.download(ticker, period="1mo", auto_adjust=True)
                if isinstance(data.columns, pd.MultiIndex):
                    data.columns = data.columns.get_level_values(0)

                close = data["Close"].iloc[-1] if len(data) > 0 else 0
                shares = float(crypto_value / close / len(crypto_pool[:top_n])) if close > 0 else 0

                portfolio["crypto"]["tickers"].append(
                    {
                        "ticker": ticker,
                        "shares": shares,
                        "price": float(close),
                        "value": float(shares * close),
                        "allocation_pct": 100 / len(crypto_pool[:top_n]),
                    }
                )
            except Exception:
                pass

    # Get bond data
    if allocation["bonds"] > 0:
        bond_value = capital * allocation["bonds"] / 100
        for ticker in bond_pool[:top_n]:
            try:
                data = yf.download(ticker, period="3mo", auto_adjust=True)
                if isinstance(data.columns, pd.MultiIndex):
                    data.columns = data.columns.get_level_values(0)

                close = data["Close"].iloc[-1] if len(data) > 0 else 0
                shares = int(bond_value / close / len(bond_pool[:top_n])) if close > 0 else 0

                portfolio["bonds"]["tickers"].append(
                    {
                        "ticker": ticker,
                        "shares": shares,
                        "price": float(close),
                        "value": float(shares * close),
                        "allocation_pct": 100 / len(bond_pool[:top_n]),
                    }
                )
            except Exception:
                pass

    # Calculate totals
    total_stocks = sum(s["value"] for s in portfolio["stocks"]["tickers"])
    total_bonds = sum(b["value"] for b in portfolio["bonds"]["tickers"])
    total_crypto = sum(c["value"] for c in portfolio["crypto"]["tickers"])
    portfolio["total_value"] = total_stocks + total_bonds + total_crypto

    return portfolio


def get_forecast(ticker, period="3mo"):
    """
    Generate buy/sell/hold forecast based on multiple indicators.

    :param ticker: Stock ticker symbol.
    :param period: Data period (default: 3mo).
    :return: DataFrame with forecast signals.
    """
    data = yf.download(ticker, period=period, auto_adjust=True)
    if data.empty:
        return pd.DataFrame()

    # Handle MultiIndex from yfinance - flatten columns
    if isinstance(data.columns, pd.MultiIndex):
        data.columns = data.columns.get_level_values(0)

    df = data.reset_index()
    n = len(df)

    # Calculate indicators
    if PANDAS_TA_AVAILABLE and ta is not None:
        sma_len = min(20, max(5, n // 3))
        ema_len = min(12, max(3, n // 5))
        rsi_len = min(14, max(7, n // 4))

        df.ta.sma(length=sma_len, close="Close", append=True)
        df.ta.ema(length=ema_len, close="Close", append=True)
        df.ta.rsi(length=rsi_len, close="Close", append=True)
        df.ta.macd(fast=12, slow=26, signal=9, close="Close", append=True)
        df.ta.rvgi(length=14, close="Close", append=True)  # Relative Vigor Index

    # Generate forecast signals
    forecast = pd.DataFrame(index=df.index)
    forecast["Date"] = df["Date"]
    forecast["Close"] = df["Close"]

    signals_list = []
    for idx in range(len(df)):
        buy_score = 0
        sell_score = 0

        # RSI
        rsi_val = df.iloc[idx].get(f"RSI_{rsi_len}")
        if pd.notna(rsi_val):
            if rsi_val < 30:
                buy_score += 2
            elif rsi_val > 70:
                sell_score += 2

        # Price vs SMA
        sma_val = df.iloc[idx].get(f"SMA_{sma_len}")
        if pd.notna(sma_val):
            if df.iloc[idx]["Close"] < sma_val:
                buy_score += 1
            elif df.iloc[idx]["Close"] > sma_val:
                sell_score += 1

        # EMA trend
        ema_val = df.iloc[idx].get(f"EMA_{ema_len}")
        if pd.notna(ema_val):
            if df.iloc[idx]["Close"] > ema_val:
                buy_score += 1
            else:
                sell_score += 1

        # MACD
        macd = df.iloc[idx].get("MACD_12_26_9")
        macd_signal = df.iloc[idx].get("MACDs_12_26_9")
        if pd.notna(macd) and pd.notna(macd_signal):
            if macd > macd_signal:
                buy_score += 1
            elif macd < macd_signal:
                sell_score += 1

        # Determine signal
        if buy_score > sell_score + 1:
            signal = "BUY"
        elif sell_score > buy_score + 1:
            signal = "SELL"
        else:
            signal = "HOLD"

        signals_list.append(
            {"Close": df.iloc[idx]["Close"], "score": f"{buy_score}-{sell_score}", "signal": signal}
        )

    result = pd.DataFrame(signals_list)
    result["Date"] = forecast["Date"]

    return result[["Date", "Close", "score", "signal"]].tail(30)


def get_short_indicators(ticker, period="3mo"):
    """
    Calculate short-term indicators for quick trading decisions.

    :param ticker: Stock ticker symbol.
    :param period: Data period (default: 3mo).
    :return: DataFrame with short-term indicators.
    """
    data = yf.download(ticker, period=period, auto_adjust=True)
    if data.empty:
        return pd.DataFrame()

    # Handle MultiIndex from yfinance - flatten columns
    if isinstance(data.columns, pd.MultiIndex):
        data.columns = data.columns.get_level_values(0)

    df = data.reset_index()
    len(df)

    # Short-term indicators (fast settings)
    df.ta.sma(length=5, close="Close", append=True)
    df.ta.sma(length=10, close="Close", append=True)
    df.ta.ema(length=5, close="Close", append=True)
    df.ta.ema(length=9, close="Close", append=True)
    df.ta.rsi(length=7, close="Close", append=True)  # Fast RSI
    df.ta.stoch(length=9, smooth_k=3, smooth_d=3, close="Close", append=True)
    df.ta.macd(fast=5, slow=13, signal=4, close="Close", append=True)  # Fast MACD
    df.ta.willr(length=10, close="Close", append=True)
    df.ta.cci(length=10, high="High", low="Low", close="Close", append=True)

    return df.tail(30)


def get_backtest(ticker, period="6mo", initial_cash=10000):
    """
    Backtest a simple RSI/MACD strategy.

    :param ticker: Stock ticker symbol.
    :param period: Data period (default: 6mo).
    :param initial_cash: Starting capital (default: 10000).
    :return: Dictionary with backtest results.
    """
    try:
        import vectorbt as vbt
    except ImportError:
        return {"error": "vectorbt not installed. pip install vectorbt"}

    data = yf.download(ticker, period=period, auto_adjust=True)
    if data.empty:
        return {"error": "No data available"}

    # Handle MultiIndex from yfinance - flatten columns
    if isinstance(data.columns, pd.MultiIndex):
        data.columns = data.columns.get_level_values(0)

    close = data["Close"]

    # Calculate indicators
    rsi = vbt.RSI.run(close, window=14).rsi
    macd = vbt.MACD.run(close, fast_window=12, slow_window=26, signal_window=9)

    # Generate signals
    entries = (rsi < 30) & (macd.macd > macd.signal)
    exits = (rsi > 70) | (macd.macd < macd.signal)

    # Run backtest
    pf = vbt.Portfolio.from_signals(close, entries, exits, init_cash=initial_cash)

    # Get results
    stats = {
        "ticker": ticker,
        "period": period,
        "initial_cash": initial_cash,
        "total_return": float(pf.total_return()),
        "final_value": float(pf.value().iloc[-1]),
        "total_trades": int(pf.trades.count()),
        "win_rate": float(pf.trades.win_rate()),
        "profit_factor": float(pf.trades.profit_factor()),
        "max_drawdown": float(pf.max_drawdown()),
    }

    # Add trade log
    trades = pf.trades.records_readable
    if len(trades) > 0:
        stats["trades"] = trades[
            ["Entry Date", "Exit Date", "Entry Price", "Exit Price", "Return"]
        ].to_dict("records")

    return stats


def get_metrics(ticker, period="6mo", initial_cash=10000):
    """
    Get comprehensive portfolio metrics.

    :param ticker: Stock ticker symbol.
    :param period: Data period (default: 6mo).
    :param initial_cash: Starting capital (default: 10000).
    :return: Dictionary with portfolio metrics.
    """
    try:
        import quantstats as qs
    except ImportError:
        return {"error": "quantstats not installed. pip install quantstats"}

    data = yf.download(ticker, period=period, auto_adjust=True)
    if data.empty:
        return {"error": "No data available"}

    # Handle MultiIndex from yfinance - flatten columns
    if isinstance(data.columns, pd.MultiIndex):
        data.columns = data.columns.get_level_values(0)

    close = data["Close"]
    returns = close.pct_change().dropna()

    # Calculate returns from initial cash
    portfolio_value = initial_cash * (1 + returns).cumprod()

    # Build metrics
    metrics = {
        "ticker": ticker,
        "period": period,
        "initial_cash": initial_cash,
        "final_value": float(portfolio_value.iloc[-1]),
        "total_return": float((portfolio_value.iloc[-1] - initial_cash) / initial_cash),
        # Volatility
        "volatility": float(qs.stats.volatility(returns)),
        "avg_return": float(qs.stats.avg_return(returns)),
        # Risk metrics
        "sharpe_ratio": float(qs.stats.sharpe(returns)),
        "sortino_ratio": float(qs.stats.sortino(returns)),
        "calmar": float(qs.stats.calmar(returns)),
        "max_drawdown": float(qs.stats.max_drawdown(returns)),
        # Win rate
        "win_rate": float(qs.stats.win_rate(returns)),
        # Trade statistics
        "avg_win": float(qs.stats.avg_win(returns)),
        "avg_loss": float(qs.stats.avg_loss(returns)),
        "best_day": float(qs.stats.best(returns)),
        "worst_day": float(qs.stats.worst(returns)),
        # Additional metrics
        "skew": float(qs.stats.skew(returns)),
        "kurtosis": float(qs.stats.kurtosis(returns)),
        "profit_factor": float(qs.stats.profit_factor(returns)),
    }

    return metrics


def get_momentum(ticker, period="3mo"):
    """
    Calculate momentum indicators.

    :param ticker: Stock ticker symbol.
    :param period: Data period (default: 3mo).
    :return: DataFrame with momentum indicators.
    """
    data = yf.download(ticker, period=period, auto_adjust=True)
    if data.empty:
        return pd.DataFrame()

    # Handle MultiIndex from yfinance - flatten columns
    if isinstance(data.columns, pd.MultiIndex):
        data.columns = data.columns.get_level_values(0)

    df = data.reset_index()
    n = len(df)

    # Momentum indicators - adaptive lengths
    rsi_len = min(14, max(7, n // 4))
    mom_len = min(10, max(5, n // 5))

    df.ta.rsi(length=rsi_len, close="Close", append=True)
    df.ta.mom(length=mom_len, close="Close", append=True)
    df.ta.stoch(length=14, smooth_k=3, smooth_d=3, close="Close", append=True)
    df.ta.willr(length=14, close="Close", append=True)
    df.ta.cci(length=20, high="High", low="Low", close="Close", append=True)
    return df


def get_trend(ticker, period="6mo"):
    """
    Calculate trend indicators.

    :param ticker: Stock ticker symbol.
    :param period: Data period (default: 6mo).
    :return: DataFrame with trend indicators.
    """
    data = yf.download(ticker, period=period, auto_adjust=True)
    if data.empty:
        return pd.DataFrame()

    # Handle MultiIndex from yfinance - flatten columns
    if isinstance(data.columns, pd.MultiIndex):
        data.columns = data.columns.get_level_values(0)

    df = data.reset_index()
    n = len(df)

    # Trend indicators - adaptive lengths
    sma_len = min(20, max(5, n // 3))
    ema_len = min(12, max(3, n // 5))

    df.ta.sma(length=sma_len, close="Close", append=True)
    df.ta.ema(length=ema_len, close="Close", append=True)
    df.ta.adx(length=14, high="High", low="Low", close="Close", append=True)
    df.ta.aroon(length=25, close="Close", append=True)
    return df


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Yahoo Finance CLI")

    # --- core ---
    parser.add_argument("-a", "--all", action="store_true", help="Print all tickers and exit")
    parser.add_argument("-t", "--ticker", type=str, help="Ticker symbol to query")
    parser.add_argument("-p", "--period", type=str, default="1y", help="Data period (default: 1y)")
    parser.add_argument(
        "-i", "--interval", type=str, default="1d", help="History interval (default: 1d)"
    )
    parser.add_argument(
        "-f",
        "--format",
        type=str,
        default="plain",
        choices=["plain", "json", "csv", "tsv", "yaml"],
        help="Output format (default: plain)",
    )

    # --- what to fetch (requires -t) ---
    parser.add_argument("--history", action="store_true", help="OHLCV history")
    parser.add_argument("--history-metadata", action="store_true", help="History metadata")
    parser.add_argument("--fast-info", action="store_true", help="Fast info snapshot")
    parser.add_argument("--info", action="store_true", help="Full company info")
    parser.add_argument("--isin", action="store_true", help="ISIN code")

    # actions
    parser.add_argument("--actions", action="store_true", help="Dividends + splits")
    parser.add_argument("--dividends", action="store_true", help="Dividend history")
    parser.add_argument("--splits", action="store_true", help="Split history")
    parser.add_argument("--capital-gains", action="store_true", help="Capital gains")

    # financials
    parser.add_argument("--financials", action="store_true", help="Annual financials")
    parser.add_argument("--income-stmt", action="store_true", help="Annual income statement")
    parser.add_argument("--balance-sheet", action="store_true", help="Annual balance sheet")
    parser.add_argument("--cash-flow", action="store_true", help="Annual cash flow")
    parser.add_argument(
        "--quarterly", action="store_true", help="Use quarterly data with financials flags"
    )
    parser.add_argument("--ttm-financials", action="store_true", help="TTM financials")
    parser.add_argument("--ttm-income-stmt", action="store_true", help="TTM income statement")
    parser.add_argument("--ttm-cash-flow", action="store_true", help="TTM cash flow")

    # earnings / estimates
    parser.add_argument("--earnings", action="store_true", help="Earnings data")
    parser.add_argument("--earnings-dates", action="store_true", help="Earnings dates")
    parser.add_argument("--earnings-history", action="store_true", help="Earnings history")
    parser.add_argument("--earnings-estimate", action="store_true", help="Earnings estimates")
    parser.add_argument("--revenue-estimate", action="store_true", help="Revenue estimates")
    parser.add_argument("--eps-trend", action="store_true", help="EPS trend")
    parser.add_argument("--eps-revisions", action="store_true", help="EPS revisions")
    parser.add_argument("--growth-estimates", action="store_true", help="Growth estimates")

    # analyst
    parser.add_argument("--recommendations", action="store_true", help="Analyst recommendations")
    parser.add_argument(
        "--recommendations-summary", action="store_true", help="Recommendations summary"
    )
    parser.add_argument("--price-targets", action="store_true", help="Analyst price targets")
    parser.add_argument("--upgrades-downgrades", action="store_true", help="Upgrades/downgrades")

    # holders
    parser.add_argument("--major-holders", action="store_true", help="Major holders")
    parser.add_argument(
        "--institutional-holders", action="store_true", help="Institutional holders"
    )
    parser.add_argument("--mutualfund-holders", action="store_true", help="Mutual fund holders")
    parser.add_argument("--insider-transactions", action="store_true", help="Insider transactions")
    parser.add_argument("--insider-purchases", action="store_true", help="Insider purchases")
    parser.add_argument("--insider-roster", action="store_true", help="Insider roster holders")
    parser.add_argument("--shares", action="store_true", help="Shares data")
    parser.add_argument("--shares-full", action="store_true", help="Full shares history")

    # options
    parser.add_argument("--options", action="store_true", help="Option expiration dates")
    parser.add_argument(
        "--option-chain",
        type=str,
        metavar="DATE",
        help="Option chain for expiry date (YYYY-MM-DD), or 'next' for nearest",
    )

    # misc
    parser.add_argument("--calendar", action="store_true", help="Upcoming events calendar")
    parser.add_argument("--news", action="store_true", help="Recent news")
    parser.add_argument("--sustainability", action="store_true", help="ESG / sustainability data")
    parser.add_argument("--sec-filings", action="store_true", help="SEC filings")
    parser.add_argument("--funds-data", action="store_true", help="Fund-specific data")

    # market / search
    parser.add_argument("--market", type=str, metavar="MARKET", help="Market info (e.g. us_market)")
    parser.add_argument("--sector", type=str, metavar="SECTOR", help="Sector info")
    parser.add_argument("--industry", type=str, metavar="INDUSTRY", help="Industry info")
    parser.add_argument("--search", type=str, metavar="QUERY", help="Search Yahoo Finance")
    parser.add_argument("--lookup", type=str, metavar="QUERY", help="Lookup ticker by name")
    parser.add_argument(
        "--multi", type=str, metavar="TICKERS", help="Comma-separated tickers for batch download"
    )

    # prediction / technical analysis
    parser.add_argument(
        "--indicators", action="store_true", help="Technical indicators (RSI, MACD, SMA, etc.)"
    )
    parser.add_argument(
        "--signals", action="store_true", help="Trading signals based on indicators"
    )
    parser.add_argument("--momentum", action="store_true", help="Momentum indicators")
    parser.add_argument("--trend", action="store_true", help="Trend indicators")
    parser.add_argument(
        "--forecast", action="store_true", help="Buy/Sell/Hold forecast based on indicators"
    )
    parser.add_argument(
        "--short", action="store_true", help="Short-term indicators for quick trades"
    )
    parser.add_argument("--backtest", action="store_true", help="Backtest RSI/MACD strategy")
    parser.add_argument(
        "--metrics", action="store_true", help="Portfolio metrics (Sharpe, Sortino, drawdown, etc.)"
    )

    # portfolio generation
    parser.add_argument(
        "--portfolio",
        type=str,
        help="Generate portfolio (day_trading, swing, long_term, growth, value, dividend, conservative, balanced, aggressive)",
    )
    parser.add_argument("--age", type=int, default=30, help="User age for allocation (default: 30)")
    parser.add_argument(
        "--capital", type=int, default=10000, help="Total capital for portfolio (default: 10000)"
    )
    parser.add_argument(
        "--top", type=int, default=5, help="Number of stocks per category (default: 5)"
    )

    # crypto & bonds
    parser.add_argument("--crypto", type=str, help="Get crypto price (e.g., BTC-USD, ETH-USD)")
    parser.add_argument("--crypto-all", action="store_true", help="Get all major crypto prices")
    parser.add_argument("--bond", type=str, help="Get bond ETF data (e.g., TLT, BND, AGG)")
    parser.add_argument("--bond-all", action="store_true", help="Get all major bond ETFs")

    # CDs
    parser.add_argument("--cd-rates", action="store_true", help="Get typical CD rates")
    parser.add_argument(
        "--cd-calculate", type=str, help="Calculate CD return (e.g., 1_year, 6_month)"
    )
    parser.add_argument(
        "--principal", type=float, default=10000, help="CD principal amount (default: 10000)"
    )

    args = parser.parse_args()

    fmt = args.format

    # --- dispatch ---
    if args.all:
        list_all_tickers()

    elif args.multi:
        format_output(fetch_multi(args.multi.split(","), args.period), fmt)

    elif args.market:
        format_output(get_market(args.market), fmt)

    elif args.sector:
        format_output(get_sector(args.sector), fmt)

    elif args.industry:
        format_output(get_industry(args.industry), fmt)

    elif args.search:
        format_output(search(args.search), fmt)

    elif args.lookup:
        format_output(lookup(args.lookup), fmt)

    # portfolio generation (doesn't require ticker)
    elif args.portfolio:
        format_output(get_portfolio(args.portfolio, args.age, args.capital, args.top), fmt)

    # crypto (doesn't require ticker)
    elif args.crypto:
        format_output(get_crypto_indicators(args.crypto, args.period), fmt)
    elif args.crypto_all:
        all_crypto = {}
        for name, ticker in CRYPTO_TICKERS.items():
            all_crypto[name] = get_crypto_price(ticker, "1d")
        format_output(all_crypto, fmt)

    # bonds (doesn't require ticker)
    elif args.bond:
        format_output(get_bond_indicators(args.bond, args.period), fmt)
    elif args.bond_all:
        all_bonds = {}
        for ticker in BOND_TICKERS.keys():
            all_bonds[ticker] = get_bond_indicators(ticker, args.period)
        format_output(all_bonds, fmt)

    # CDs
    elif args.cd_rates:
        format_output(get_cd_rates(), fmt)
    elif args.cd_calculate:
        format_output(calculate_cd_return(args.principal, args.cd_calculate), fmt)

    elif args.ticker:
        t = args.ticker
        q = args.quarterly

        if args.history:
            format_output(get_history(t, args.period, args.interval), fmt)
        elif args.history_metadata:
            format_output(get_history_metadata(t), fmt)
        elif args.fast_info:
            format_output(get_fast_info(t), fmt)
        elif args.info:
            format_output(get_info(t), fmt)
        elif args.isin:
            format_output(get_isin(t), fmt)
        elif args.actions:
            format_output(get_actions(t), fmt)
        elif args.dividends:
            format_output(get_dividends(t), fmt)
        elif args.splits:
            format_output(get_splits(t), fmt)
        elif args.capital_gains:
            format_output(get_capital_gains(t), fmt)
        elif args.financials:
            format_output(get_financials(t, q), fmt)
        elif args.income_stmt:
            format_output(get_income_stmt(t, q), fmt)
        elif args.balance_sheet:
            format_output(get_balance_sheet(t, q), fmt)
        elif args.cash_flow:
            format_output(get_cash_flow(t, q), fmt)
        elif args.ttm_financials:
            format_output(get_ttm_financials(t), fmt)
        elif args.ttm_income_stmt:
            format_output(get_ttm_income_stmt(t), fmt)
        elif args.ttm_cash_flow:
            format_output(get_ttm_cash_flow(t), fmt)
        elif args.earnings:
            format_output(get_earnings(t), fmt)
        elif args.earnings_dates:
            format_output(get_earnings_dates(t), fmt)
        elif args.earnings_history:
            format_output(get_earnings_history(t), fmt)
        elif args.earnings_estimate:
            format_output(get_earnings_estimate(t), fmt)
        elif args.revenue_estimate:
            format_output(get_revenue_estimate(t), fmt)
        elif args.eps_trend:
            format_output(get_eps_trend(t), fmt)
        elif args.eps_revisions:
            format_output(get_eps_revisions(t), fmt)
        elif args.growth_estimates:
            format_output(get_growth_estimates(t), fmt)
        elif args.recommendations:
            format_output(get_recommendations(t), fmt)
        elif args.recommendations_summary:
            format_output(get_recommendations_summary(t), fmt)
        elif args.price_targets:
            format_output(get_analyst_price_targets(t), fmt)
        elif args.upgrades_downgrades:
            format_output(get_upgrades_downgrades(t), fmt)
        elif args.major_holders:
            format_output(get_major_holders(t), fmt)
        elif args.institutional_holders:
            format_output(get_institutional_holders(t), fmt)
        elif args.mutualfund_holders:
            format_output(get_mutualfund_holders(t), fmt)
        elif args.insider_transactions:
            format_output(get_insider_transactions(t), fmt)
        elif args.insider_purchases:
            format_output(get_insider_purchases(t), fmt)
        elif args.insider_roster:
            format_output(get_insider_roster_holders(t), fmt)
        elif args.shares:
            format_output(get_shares(t), fmt)
        elif args.shares_full:
            format_output(get_shares_full(t), fmt)
        elif args.options:
            format_output(get_options(t), fmt)
        elif args.option_chain:
            date = None if args.option_chain == "next" else args.option_chain
            format_output(get_option_chain(t, date), fmt)
        elif args.calendar:
            format_output(get_calendar(t), fmt)
        elif args.news:
            format_output(get_news(t), fmt)
        elif args.sustainability:
            format_output(get_sustainability(t), fmt)
        elif args.sec_filings:
            format_output(get_sec_filings(t), fmt)
        elif args.funds_data:
            format_output(get_funds_data(t), fmt)

        # prediction / technical analysis
        elif args.indicators:
            format_output(get_technical_indicators(t, args.period), fmt)
        elif args.signals:
            format_output(get_signals(t, args.period), fmt)
        elif args.momentum:
            format_output(get_momentum(t, args.period), fmt)
        elif args.trend:
            format_output(get_trend(t, args.period), fmt)
        elif args.forecast:
            format_output(get_forecast(t, args.period), fmt)
        elif args.short:
            format_output(get_short_indicators(t, args.period), fmt)
        elif args.backtest:
            format_output(get_backtest(t, args.period), fmt)
        elif args.metrics:
            format_output(get_metrics(t, args.period), fmt)
            format_output(all_bonds, fmt)

        else:
            format_output(fetch_past_data(t, args.period), fmt)

    else:
        tickers = load_tickers()

        # =======================
        # With Context Manager
        # =======================
        with yf.WebSocket() as ws:
            ws.subscribe(tickers)
            ws.listen(message_handler)
