# Commands

| Long | Short | Description |
|------|-------|-------------|
| `--all` | `-a` | Print all tickers and exit |
| `--ticker` | `-t` | Ticker symbol to query |
| `--period` | `-p` | Data period (default: `1y`) |
| `--interval` | `-i` | History interval (default: `1d`) |
| `--format` | `-f` | Output format: `plain` `json` `csv` `tsv` `yaml` (default: `plain`) |
| `--history` | — | OHLCV history |
| `--history-metadata` | — | History metadata |
| `--fast-info` | — | Fast info snapshot |
| `--info` | — | Full company info |
| `--isin` | — | ISIN code |
| `--actions` | — | Dividends + splits |
| `--dividends` | — | Dividend history |
| `--splits` | — | Split history |
| `--capital-gains` | — | Capital gains |
| `--financials` | — | Annual financials |
| `--income-stmt` | — | Annual income statement |
| `--balance-sheet` | — | Annual balance sheet |
| `--cash-flow` | — | Annual cash flow |
| `--quarterly` | — | Use quarterly data with financials flags |
| `--ttm-financials` | — | TTM financials |
| `--ttm-income-stmt` | — | TTM income statement |
| `--ttm-cash-flow` | — | TTM cash flow |
| `--earnings` | — | Earnings data |
| `--earnings-dates` | — | Earnings dates |
| `--earnings-history` | — | Earnings history |
| `--earnings-estimate` | — | Earnings estimates |
| `--revenue-estimate` | — | Revenue estimates |
| `--eps-trend` | — | EPS trend |
| `--eps-revisions` | — | EPS revisions |
| `--growth-estimates` | — | Growth estimates |
| `--recommendations` | — | Analyst recommendations |
| `--recommendations-summary` | — | Recommendations summary |
| `--price-targets` | — | Analyst price targets |
| `--upgrades-downgrades` | — | Upgrades/downgrades |
| `--major-holders` | — | Major holders |
| `--institutional-holders` | — | Institutional holders |
| `--mutualfund-holders` | — | Mutual fund holders |
| `--insider-transactions` | — | Insider transactions |
| `--insider-purchases` | — | Insider purchases |
| `--insider-roster` | — | Insider roster holders |
| `--shares` | — | Shares data |
| `--shares-full` | — | Full shares history |
| `--options` | — | Option expiration dates |
| `--option-chain` | — | Option chain for expiry date (`YYYY-MM-DD` or `next`) |
| `--calendar` | — | Upcoming events calendar |
| `--news` | — | Recent news |
| `--sustainability` | — | ESG / sustainability data |
| `--sec-filings` | — | SEC filings |
| `--funds-data` | — | Fund-specific data |
| `--market` | — | Market info (e.g. `us_market`) |
| `--sector` | — | Sector info |
| `--industry` | — | Industry info |
| `--search` | — | Search Yahoo Finance |
| `--lookup` | — | Lookup ticker by name |
| `--multi` | — | Comma-separated tickers for batch download |
| `--indicators` | — | Technical indicators (RSI, MACD, SMA, EMA, BB, etc.) |
| `--signals` | — | Trading signals based on indicators |
| `--momentum` | — | Momentum indicators |
| `--trend` | — | Trend indicators |
| `--forecast` | — | Buy/Sell/Hold forecast based on multiple indicators |
| `--short` | — | Short-term indicators for quick trades |
| `--backtest` | — | Backtest RSI/MACD strategy |
| `--metrics` | — | Portfolio metrics (Sharpe, Sortino, drawdown, etc.) |
| `--portfolio` | — | Generate portfolio by strategy & age |
| `--age` | — | User age for allocation (used with --portfolio) |
| `--capital` | — | Total capital for portfolio (default: 10000) |
| `--crypto` | — | Get crypto price data (e.g., BTC-USD) |
| `--crypto-all` | — | Get all major crypto prices |
| `--bond` | — | Get bond ETF data (e.g., TLT, BND) |
| `--bond-all` | — | Get all major bond ETFs |
| `--cd-rates` | — | Get typical CD rates |
| `--cd-calculate` | — | Calculate CD return (e.g., 1_year, 6_month) |
| `--principal` | — | CD principal amount (default: 10000) |

---

## Prediction / Technical Analysis

```bash
# Get technical indicators
python main.py -t AAPL --indicators -p 6mo

# Get trading signals
python main.py -t AAPL --signals -p 3mo

# Get momentum indicators
python main.py -t TSLA --momentum -p 3mo

# Get trend indicators
python main.py -t MSFT --trend -p 6mo

# Get Buy/Sell/Hold forecast
python main.py -t AAPL --forecast -p 2mo

# Get short-term indicators
python main.py -t AAPL --short -p 1mo

# Backtest a strategy
python main.py -t AAPL --backtest -p 6mo

# Get portfolio metrics
python main.py -t AAPL --metrics -p 6mo
```

---

## Portfolio & Allocation

```bash
# Generate portfolio (age-based allocation)
python main.py --portfolio balanced --age 30 --capital 50000

# Generate aggressive portfolio (younger investor)
python main.py --portfolio aggressive --age 25 --capital 100000

# Generate conservative portfolio (older investor)
python main.py --portfolio conservative --age 60 --capital 50000

# Portfolio strategies: day_trading, swing, long_term, growth, value, dividend, conservative, balanced, aggressive
```

---

## Crypto & Bonds

```bash
# Get crypto price with indicators
python main.py --crypto BTC-USD --indicators -p 1mo

# Get all major cryptos
python main.py --crypto-all -p 1d

# Get bond ETF data
python main.py --bond TLT -p 1mo

# Get all major bonds
python main.py --bond-all -p 1mo

# Get CD rates
python main.py --cd-rates

# Calculate CD return
python main.py --cd-calculate 1_year --principal 10000
python main.py --cd-calculate 5_year --principal 50000
```

---

## Tests

| Command | Description |
|---------|-------------|
| `pytest` | Run unit tests with coverage |
| `pytest -m integration` | Run real API tests (requires network) |
| `pytest -m "not integration"` | Unit tests only (explicit) |
| `pytest -v` | Verbose output |
| `pytest -k "TestFetch"` | Run a specific test class |

## Lint

| Command | Description |
|---------|-------------|
| `ruff check main.py build_tickers_csv.py` | Check for lint errors |
| `ruff check --fix main.py build_tickers_csv.py` | Auto-fix lint errors |
| `ruff format main.py build_tickers_csv.py` | Format code |
| `ruff format --check main.py build_tickers_csv.py` | Check formatting without writing |

## Coverage

| Command | Description |
|---------|-------------|
| `pytest --cov=main --cov-report=term-missing` | Coverage with missing lines |
| `pytest --cov=main --cov-report=html:coverage` | Generate HTML report in `coverage/` |
| `open coverage/index.html` | Open HTML coverage report |

## Rebuild Tickers CSV

| Command | Description |
|---------|-------------|
| `python build_tickers_csv.py` | Fetch and rebuild `tickers.csv` from Wikipedia |
