"""
Constants for stock, bond, crypto, and international ticker symbols.
"""

# Bond ETFs
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

# International ETFs
INTERNATIONAL_TICKERS = {
    "EFA": "iShares MSCI EAFE ETF",
    "VEA": "Vanguard FTSE Developed Markets ETF",
    "VWO": "Vanguard FTSE Emerging Markets ETF",
    "IEFA": "iShares Core MSCI EAFE ETF",
    "IEMG": "iShares Core MSCI Emerging Markets ETF",
    "SCHF": "Schwab International Equity ETF",
}

# Popular Stock Tickers
STOCK_TICKERS = {
    # Tech
    "AAPL": "Apple Inc.",
    "MSFT": "Microsoft Corporation",
    "GOOGL": "Alphabet Inc.",
    "AMZN": "Amazon.com Inc.",
    "META": "Meta Platforms Inc.",
    "NVDA": "NVIDIA Corporation",
    "TSLA": "Tesla Inc.",
    "AMD": "Advanced Micro Devices",
    # Finance
    "JPM": "JPMorgan Chase & Co.",
    "BAC": "Bank of America Corp.",
    "WFC": "Wells Fargo & Company",
    "GS": "Goldman Sachs Group Inc.",
    # Healthcare
    "JNJ": "Johnson & Johnson",
    "PFE": "Pfizer Inc.",
    "UNH": "UnitedHealth Group Inc.",
    "ABBV": "AbbVie Inc.",
    # Consumer
    "WMT": "Walmart Inc.",
    "KO": "The Coca-Cola Company",
    "PEP": "PepsiCo Inc.",
    "HD": "The Home Depot Inc.",
    # Energy
    "XOM": "Exxon Mobil Corporation",
    "CVX": "Chevron Corporation",
}

# Popular Crypto Tickers
CRYPTO_TICKERS = {
    "BTC-USD": "Bitcoin",
    "ETH-USD": "Ethereum",
    "SOL-USD": "Solana",
    "BNB-USD": "BNB",
    "XRP-USD": "XRP",
    "ADA-USD": "Cardano",
    "DOGE-USD": "Dogecoin",
    "DOT-USD": "Polkadot",
    "MATIC-USD": "Polygon",
    "LTC-USD": "Litecoin",
}

# Stock pools for portfolio generation
STOCK_POOLS = {
    "growth": ["AAPL", "MSFT", "GOOGL", "AMZN", "NVDA", "META", "TSLA", "AMD"],
    "value": ["JPM", "BAC", "WFC", "JNJ", "PFE", "KO", "PEP", "WMT"],
    "dividend": ["KO", "PEP", "JNJ", "PFE", "XOM", "CVX", "JPM", "WMT"],
    "balanced": ["AAPL", "MSFT", "GOOGL", "AMZN", "JPM", "JNJ", "KO", "XOM", "WMT", "HD"],
    "tech": ["AAPL", "MSFT", "GOOGL", "NVDA", "AMD", "META", "TSLA", "ORCL", "CRM", "ADBE"],
    "finance": ["JPM", "BAC", "WFC", "GS", "MS", "C", "BLK", "AXP"],
    "healthcare": ["JNJ", "PFE", "UNH", "MRK", "ABBV", "LLY", "TMO", "DHR"],
    "energy": ["XOM", "CVX", "COP", "SLB", "EOG", "MPC", "VLO", "PSX"],
}

# Bond pools
BOND_POOL = ["TLT", "IEF", "AGG", "BND", "LQD"]

# International pools
INTL_POOL = ["VEA", "EFA", "VWO"]

# Crypto pools
CRYPTO_POOL = ["BTC-USD", "ETH-USD", "SOL-USD", "BNB-USD", "XRP-USD", "ADA-USD"]