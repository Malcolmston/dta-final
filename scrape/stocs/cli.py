"""
Command-line interface for stocs.
"""

import argparse
import sys
import json

import yfinance as yf
import pandas as pd

from stocs import client, constants, indicators, portfolio


def cmd_history(args):
    """Fetch historical data."""
    data = client.get_history(args.ticker, period=args.period, interval=args.interval)
    if args.csv:
        print(data.to_csv())
    else:
        print(data)


def cmd_info(args):
    """Get stock info."""
    info = client.get_info(args.ticker)
    print(json.dumps(info, indent=2, default=str))


def cmd_indicators(args):
    """Get technical indicators."""
    data = indicators.get_indicators(args.ticker, period=args.period)
    print(json.dumps(data, indent=2))


def cmd_signals(args):
    """Get trading signals."""
    data = indicators.get_signals(args.ticker, period=args.period)
    if args.csv:
        print(data.to_csv())
    else:
        print(data.tail(20))


def cmd_portfolio(args):
    """Generate portfolio."""
    result = portfolio.generate_portfolio(
        capital=args.capital,
        strategy=args.portfolio,
        age=args.age,
        top_n=args.top,
        stock_pools=constants.STOCK_POOLS,
        bond_pool=constants.BOND_POOL,
        crypto_pool=constants.CRYPTO_POOL,
    )

    if args.json:
        print(json.dumps(result, indent=2, default=str))
    else:
        allocation = result["allocation"]
        print(f"\n=== Portfolio: {args.portfolio} ===")
        print(f"Capital: ${args.capital:,}")
        print(f"Allocation: Stocks {allocation['stocks']}%, Bonds {allocation['bonds']}%, Crypto {allocation['crypto']}%")
        print(f"\n--- Stocks ---")
        for s in result["stocks"]["tickers"]:
            print(f"  {s['symbol']}: {s['shares']} shares @ ${s['price']:.2f} = ${s['value']:,.0f}")
        print(f"\n--- Bonds ---")
        for b in result["bonds"]["tickers"]:
            print(f"  {b['symbol']}: {b['shares']} shares @ ${b['price']:.2f} = ${b['value']:,.0f}")
        if result["crypto"]["tickers"]:
            print(f"\n--- Crypto ---")
            for c in result["crypto"]["tickers"]:
                print(f"  {c['symbol']}: {c['shares']} shares @ ${c['price']:.2f} = ${c['value']:,.0f}")
        print(f"\nTotal Value: ${result['total_value']:,.0f}")


def cmd_bond(args):
    """Get bond ETF data."""
    data = yf.download(args.bond, period="6mo", auto_adjust=True)
    if args.csv:
        print(data.to_csv())
    else:
        print(data.tail(10))


def cmd_bond_all(args):
    """Get all major bond ETFs."""
    for ticker in constants.BOND_POOL:
        print(f"\n=== {ticker} ===")
        data = yf.download(ticker, period="3mo", auto_adjust=True)
        if isinstance(data.columns, pd.MultiIndex):
            data.columns = data.columns.get_level_values(0)
        print(data.tail(3))


def cmd_crypto(args):
    """Get crypto price."""
    data = yf.download(args.crypto, period="1d", interval="1h", auto_adjust=True)
    if args.csv:
        print(data.to_csv())
    else:
        print(data.tail(10))


def cmd_crypto_all(args):
    """Get all major crypto prices."""
    for ticker in constants.CRYPTO_POOL:
        data = yf.download(ticker, period="1d", interval="1h", auto_adjust=True)
        if len(data) > 0:
            price = data["Close"].iloc[-1]
            print(f"{ticker}: ${price:,.2f}")


def cmd_search(args):
    """Search Yahoo Finance."""
    from yfinance import search
    results = search(args.query)
    print(json.dumps(results, indent=2, default=str))


def cmd_lookup(args):
    """Lookup ticker by name."""
    from yfinance import search
    results = search(args.query)
    if results.get("quotes"):
        for q in results["quotes"][:5]:
            print(f"{q.get('symbol')}: {q.get('longname') or q.get('shortname')}")


def create_parser():
    """Create the argument parser."""
    parser = argparse.ArgumentParser(description="Stock market data CLI")
    subparsers = parser.add_subparsers(dest="command", help="Command to run")

    # History command
    p_history = subparsers.add_parser("history", help="Get historical data")
    p_history.add_argument("ticker", help="Stock ticker symbol")
    p_history.add_argument("--period", default="1y", help="Time period")
    p_history.add_argument("--interval", default="1d", help="Data interval")
    p_history.add_argument("--csv", action="store_true", help="Output as CSV")

    # Info command
    p_info = subparsers.add_parser("info", help="Get stock info")
    p_info.add_argument("ticker", help="Stock ticker symbol")

    # Indicators command
    p_ind = subparsers.add_parser("indicators", help="Technical indicators")
    p_ind.add_argument("ticker", help="Stock ticker symbol")
    p_ind.add_argument("--period", default="6mo", help="Time period")

    # Signals command
    p_sig = subparsers.add_parser("signals", help="Trading signals")
    p_sig.add_argument("ticker", help="Stock ticker symbol")
    p_sig.add_argument("--period", default="6mo", help="Time period")
    p_sig.add_argument("--csv", action="store_true", help="Output as CSV")

    # Portfolio command
    p_port = subparsers.add_parser("portfolio", help="Generate portfolio")
    p_port.add_argument("--portfolio", type=str, default="balanced",
                        help="Strategy (day_trading, swing, long_term, growth, value, dividend, conservative, balanced, aggressive)")
    p_port.add_argument("--age", type=int, default=30, help="User age")
    p_port.add_argument("--capital", type=int, default=10000, help="Total capital")
    p_port.add_argument("--top", type=int, default=5, help="Stocks per category")
    p_port.add_argument("--json", action="store_true", help="Output as JSON")

    # Bond commands
    p_bond = subparsers.add_parser("bond", help="Get bond ETF data")
    p_bond.add_argument("bond", help="Bond ticker (e.g., TLT, BND)")
    p_bond.add_argument("--csv", action="store_true", help="Output as CSV")

    p_bond_all = subparsers.add_parser("bond-all", help="Get all bond ETFs")

    # Crypto commands
    p_crypto = subparsers.add_parser("crypto", help="Get crypto price")
    p_crypto.add_argument("crypto", help="Crypto ticker (e.g., BTC-USD)")
    p_crypto.add_argument("--csv", action="store_true", help="Output as CSV")

    p_crypto_all = subparsers.add_parser("crypto-all", help="Get all major crypto")

    # Search commands
    p_search = subparsers.add_parser("search", help="Search Yahoo Finance")
    p_search.add_argument("query", help="Search query")

    p_lookup = subparsers.add_parser("lookup", help="Lookup ticker by name")
    p_lookup.add_argument("query", help="Company name")

    return parser


def main():
    """Main entry point."""
    parser = create_parser()
    args = parser.parse_args()

    if not args.command:
        parser.print_help()
        return

    commands = {
        "history": cmd_history,
        "info": cmd_info,
        "indicators": cmd_indicators,
        "signals": cmd_signals,
        "portfolio": cmd_portfolio,
        "bond": cmd_bond,
        "bond-all": cmd_bond_all,
        "crypto": cmd_crypto,
        "crypto-all": cmd_crypto_all,
        "search": cmd_search,
        "lookup": cmd_lookup,
    }

    cmd = commands.get(args.command)
    if cmd:
        try:
            cmd(args)
        except Exception as e:
            print(f"Error: {e}", file=sys.stderr)
            sys.exit(1)
    else:
        parser.print_help()


if __name__ == "__main__":
    main()