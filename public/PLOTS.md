# Plots

## Dashboard Overview

The dashboard is organized into 7 main sections accessible via the right sidebar navigation. Each section can be viewed in **Simplified** or **Detailed** mode, toggled via the header switch.

---

## 1. Overview

**Purpose:** Landing page that introduces the tool and its benefits to new users.

### Key Sections:

#### Why Stock Analysis Matters
- Introduction explaining the value of stock market analysis
- Helps users understand the importance of data-driven investment decisions

#### Three Benefit Cards
1. **Make Smarter Decisions** — Data-driven insights for better investment choices
2. **Track Your Progress** — Monitor portfolio performance over time
3. **Understand the Market** — Visualize market trends and patterns

#### Who This Is For
Four target user groups displayed as cards with icons:
- **Individual Investors** — Track and analyze personal portfolios
- **Financial Advisors** — Present market insights to clients
- **Students & Learners** — Understand how markets work
- **Researchers** — Analyze market data and patterns

#### Simple Charts for Everyone
Three beginner-friendly charts with explanations:

1. **Market Overview** (`MarketPredictor`)
   - Shows overall market sentiment (bullish/bearish)
   - Green = positive sentiment, Red = negative
   - Great for understanding overall market mood at a glance

2. **Your Portfolio** (`PortfolioPieChart`)
   - Pie chart showing investment distribution across sectors
   - Larger slice = more money invested in that sector
   - Displays sector allocation visually

3. **Price Trend** (`CandlestickChart`)
   - Simple candlestick chart showing price movements
   - Shows how prices have changed over time
   - Buttons to change time period (1d, 5d, 1mo, 3mo, 6mo, 1y, 2y, 5y)
   - Default ticker: AAPL

#### How to Use This Dashboard
- Step-by-step guide with numbered instructions
- Explains Simple Mode vs Detailed Mode toggle
- Navigation instructions for sidebar

**User Note:** Start here if you're new to the dashboard. This section provides context for all other features and explains how to navigate.

---

## 2. Trends

**Purpose:** Display historical price data and trading activity for selected stocks.

### Simplified Mode Components:
- **Price Trends** — Candlestick chart showing stock price movement
- **Trading Activity** — Additional candlestick chart with 3-month view

### Detailed Mode Components:

#### Candlestick Chart (`CandlestickChart`)
- Full-featured candlestick chart
- Multiple time period options (1d, 5d, 1mo, 3mo, 6mo, 1y, 2y, 5y)
- Ticker selection dropdown
- OHLC (Open, High, Low, Close) data display
- Zoom and pan capabilities
- Candle colors: Green (up), Red (down)

#### Volume Analysis (`VolumeChart`)
- Bar chart showing trading volume
- Volume bars colored by price movement
- Helps identify trading activity spikes
- Syncs with candlestick chart timeframe

#### Multi-Ticker Performance (`Streamgraph`)
- Stacked area chart showing relative performance
- Shows how different stocks compare over time
- Useful for relative strength analysis
- Default tickers: AAPL, GOOGL, MSFT, AMZN, NVDA

#### Moving Average Ribbon (`PriceRibbon3D`)
- 3D visualization of multiple moving averages
- Shows trend strength and direction
- Visual confirmation of trend changes
- SMA, EMA lines in different colors

**User Note:** Select different tickers from the dropdown to view various stocks. The default ticker is AAPL. Use the time period buttons to change the view range. Volume analysis is particularly useful for confirming price movements.

---

## 3. Factors

**Purpose:** Analyze economic and market factors affecting stock performance.

### Simplified Mode Components:
- **Market Factors** — Visual analysis of key market indicators
- **Economic Trends** (`DualAxisPlot`) — Dual-axis plot showing economic relationships

### Detailed Mode Components:

#### Market Factors (`MarketFactors`)
- Analyzes key market indicators
- Shows correlation between factors and stock performance
- Multiple factor comparison
- Factor categories: Valuation, Momentum, Quality, Size

#### Temporal Lag Analysis (`LagCorrelationPlot`)
- Shows how correlations change over time
- Helps identify leading/lagging indicators
- Useful for timing entry and exit points
- Adjustable lag period slider

#### Economic Trends (`DualAxisPlot`)
- Dual-axis chart comparing two related metrics
- Example: interest rates vs stock prices
- Helps identify relationships between economic variables
- Toggle between different metric pairs

**User Note:** This section helps understand the "why" behind price movements. Look for correlations between economic indicators and stock performance. The lag analysis is particularly useful for understanding when indicators lead or follow price movements.

---

## 4. Sectors

**Purpose:** Visualize market performance across different sectors and market segments.

### Simplified Mode Components:
- **Sector Performance** — Heatmap showing performance across GICS sectors
- **Market Segments** — Treemap showing hierarchical market structure

### Detailed Mode Components:

#### Sector Performance Heatmap (`Heatmap`)
- Color-coded grid showing sector performance
- Green = positive performance, Red = negative
- Size represents market cap or other metrics
- Hover for detailed metrics
- Updates periodically with latest data
- Sectors: Technology, Healthcare, Financial, Consumer, etc.
- Percentage change display

#### Sector Allocation (`TreemapBoxes`)
- Hierarchical treemap showing market structure
- Nested rectangles sized by market cap
- Color-coded by performance
- Click to drill down into subsectors
- Shows sector and subsector breakdown

**User Note:** Use the heatmap to quickly identify outperforming and underperforming sectors. Great for sector rotation strategies. The treemap provides a bird's-eye view of the entire market structure.

---

## 5. Analysis

**Purpose:** Deep technical analysis and stock relationship visualization.

### Simplified Mode Components:
- **Technical Analysis** — Multi-tab technical analysis (basic view)
- **Stock Connections** (`NetworkGraph`) — Network graph showing relationships

### Detailed Mode Components:

#### Multi-Indicator Technical Panel (`AnalysisTabs`)
- Comprehensive technical analysis tool
- Multiple tabs covering:
  - **Price** — OHLC data, historical prices
  - **Moving Averages** — SMA, EMA at various periods
  - **RSI** — Relative Strength Index (overbought/oversold)
  - **MACD** — Moving Average Convergence Divergence
  - **Bollinger Bands** — Price volatility bands
  - **Patterns** — Chart pattern recognition
- Toggle between Simple/Detailed views
- Settings button for customization
- Ticker selector

#### Stock Connections (`NetworkGraph`)
- Visual network showing relationships between stocks
- Correlation visualization
- Sector clustering
- Edge thickness = correlation strength
- Node size = market cap or other metric
- Interactive: drag nodes, zoom, pan

#### ML Model Performance Matrix (`ConfusionMatrixPlot`)
- Shows accuracy of predictive models
- Displays true/false positives/negatives
- Model performance visualization
- Useful for understanding prediction reliability
- Accuracy percentage display

**User Note:** Toggle between simple/detailed view using the switch in the header. Detailed view shows more indicators but requires more experience to interpret. The network graph helps identify stocks that move together for diversification purposes.

---

## 6. Portfolio

**Purpose:** Manage your investment portfolio with tracking and analysis tools.

### Components:

#### My Portfolio (`PortfolioManager`)
- Add/remove holdings
- Track shares, purchase price, current value
- Calculate total portfolio value
- View individual holding performance
- Add new position form
- Edit/delete existing positions

#### Portfolio Weight Distribution (`PortfolioPieChart`)
- Pie chart showing asset distribution
- Shows allocation by sector/type
- Helps identify over/under-weight positions
- Interactive: hover for details

#### Holdings Map (`Treemap`)
- Treemap visualization of holdings
- Size = position value
- Color = performance (green/red)
- Quick visual of portfolio concentration
- Nested view by sector

#### Income Tracking (`IncomeTrackingPanel`)
- Track dividends received
- Record other income (interest, etc.)
- Historical income log
- Projected annual income
- Add income entry form

#### Cost Basis & P&L (`CostBasisInput`)
- Enter purchase price and shares
- Calculate profit/loss
- Account for fees
- View realized vs unrealized gains
- Per-position and total P&L

#### Survivorship Bias Disclaimer (`SurvivorshipBiasDisclaimer`)
- Important warning about data limitations
- Explains that backtests may exclude failed funds
- Helps users understand backtest limitations
- Collapsible banner

**User Note:** Add your holdings to track performance. The cost basis feature helps calculate true returns including fees. Note: Past performance does not guarantee future results.

---

## 7. Wealth

**Purpose:** Long-term wealth management and financial planning tools.

### Components:

#### Investment Goals Wizard (`InvestmentGoalsWizard`)
- First-time setup wizard
- Risk tolerance assessment questions
- Time horizon selection (years until retirement)
- Primary goal definition (retirement, growth, income)
- Personalizes all wealth tools to your situation
- Skip option available

#### Retirement Planning (`RetirementCalculator`)
- Project retirement savings
- Account for inflation
- Multiple scenario modeling
- Required savings calculator
- Current savings input
- Monthly contribution input
- Expected return rate
- Retirement age target

#### Goal Tracking (`GoalTracking`)
- Set financial goals
- Track progress toward each goal
- Timeline visualization
- Milestone celebrations
- Goal types: Emergency Fund, House, Retirement, Education

#### Asset Allocation (`AssetAllocation`)
- Recommended portfolio distribution
- Based on risk tolerance
- Shows target vs actual allocation
- Suggestions for rebalancing
- Categories: US Stocks, Int'l Stocks, Bonds, Cash

#### Rebalancing Alerts (`RebalancingAlerts`)
- Notifications when portfolio drifts from target
- Configurable thresholds (e.g., 5%)
- Alert when allocation is off by X%
- Current vs target comparison

#### Risk Metrics (`RiskMetricsPanel`)
- Portfolio risk analysis
- **Sharpe Ratio** — Risk-adjusted return
- **Volatility** — Standard deviation of returns
- **Beta** — vs benchmark (1.0 = same as market)
- **Maximum Drawdown** — Largest peak-to-trough decline
- **Value at Risk (VaR)** — Expected maximum loss
- Risk score display

#### Emergency Fund (`EmergencyFundCheck`)
- Check emergency fund adequacy
- Months of expenses covered
- Recommendations based on income
- Input: monthly expenses, savings balance

#### Cash Flow (`CashFlowTracking`)
- Track income and expenses
- Monthly summaries
- Savings rate calculation
- Cash flow visualization
- Income vs expenses comparison

#### Diversification Analyzer (`DiversificationAnalyzer`)
- Analyze portfolio diversity
- Correlation between holdings
- Sector concentration check
- Suggestions for improvement
- Concentration score

#### Tax-Aware Features (`TaxAwareFeatures`)
- Tax-efficient strategies
- Tax-loss harvesting suggestions
- Capital gains/losses tracking
- Tax-efficient location recommendations
- Unrealized gains display

#### Benchmark Comparison (`BenchmarkComparison`)
- Compare against indexes
- Available benchmarks: S&P 500, NASDAQ, Dow Jones
- Relative performance
- Risk-adjusted returns
- Custom benchmark selection

#### Fee Disclosure (`FeeDisclosure`)
- Understand investment costs
- Expense ratio breakdown
- Impact of fees over time
- Fee optimization suggestions
- Total annual fees display

#### Action Items (`ActionItemsPanel`)
- Personalized recommendations
- Prioritized action list
- Based on portfolio analysis
- Action items with descriptions

**User Note:** Complete the Investment Goals Wizard on first visit. This personalizes all wealth tools to your situation. Review risk metrics regularly, especially when market conditions change.

---

## Global Components

### Header (per page)
- **App Title** — "Stock Market Dashboard"
- **Ticker Input** — Search and select stock tickers
- **Simple/Detailed Toggle** — Switch between view modes
- **Theme Toggle** — Light/Dark mode switch (sun/moon icon)

### Sidebar Navigation
- **Title** — "Dashboard" with subtitle "Navigate sections"
- **7 Section Buttons** — Overview, Trends, Factors, Sectors, Analysis, Portfolio, Wealth
- **Active State** — Highlighted with primary color + left border
- **Footer** — "Stock Market Dashboard" small text

### Footer (per page)
- **API Docs Link** — "API Docs" with underline, links to `/docs`
- **Copyright** — App information

---

## API Documentation (`/docs`)

Accessible via footer link. Three tabs:

### 1. REST API
- Standard OpenAPI documentation
- All REST endpoints for stock data
- Try-it-out functionality
- Schema definitions

### 2. Async API
- AsyncAPI specification for real-time updates
- WebSocket channels
- SSE endpoints
- Message schemas

### 3. Cron Jobs
- OpenAPI spec for scheduled task endpoints
- 6 cron endpoints documented

### Key Endpoints:
- `/api/health` — Health check
- `/api/stocks/history` — Historical price data
- `/api/stocks/signals` — Trading signals
- `/api/stocks/forecast` — Price forecasts
- `/api/stocks/growth` — Growth metrics
- `/api/stocks/momentum` — Momentum indicators
- `/api/stocs-test` — Stock library test endpoint
- `/api/heatmap` — Sector heatmap data
- `/api/queue` — Job queue
- `/api/cron/*` — Scheduled job endpoints

---

## View Modes

### Simplified View
- Recommended for beginners
- Basic charts with fewer indicators
- Easier to understand at a glance
- Key metrics only
- Toggle via header switch
- Persists in localStorage
- Labeled "Simple Mode"

### Detailed View
- For experienced users
- Full technical indicators
- More chart options
- Advanced analysis tools
- Toggle via header switch
- Persists in localStorage
- Labeled "Detailed Mode"

---

## Theme & Settings

### Light Mode (Default)
- White/light backgrounds (#ffffff)
- Dark text (#1f2937)
- Blue primary accent (#3b82f6)
- Gray grid lines (#e5e7eb)
- Based on system preference initially

### Dark Mode
- Dark backgrounds (#111827)
- Light text (#f9fafb)
- Light blue primary accent (#60a5fa)
- Dark gray grid lines (#374151)
- Toggle in header
- Persists in localStorage

---

## Important Disclaimers

1. **Data Accuracy** — Stock data comes from third-party providers (Yahoo Finance). Verify critical data independently before making investment decisions.

2. **Past Performance** — Historical data does not guarantee future results. Past performance is not indicative of future returns.

3. **Survivorship Bias** — Backtested strategies may exclude failed funds, overstating returns. This tool uses survivor-biased data.

4. **Not Financial Advice** — This tool is for informational and educational purposes only. Not a recommendation to buy or sell securities. Consult a qualified financial advisor for investment decisions.

5. **Real-Time Data** — Data may have delays (typically 15+ minutes). Not suitable for day trading or real-time decision making.

6. **Educational Purpose** — Charts and analysis are for learning and research purposes. Not intended as investment recommendations.

---

## Data Sources

- **Primary:** Yahoo Finance API
- **Technical Indicators:** Calculated locally from price data
- **Sector Data:** GICS sector classification
- **Economic Data:** Various public sources
- **Real-time Quotes:** Delayed by ~15+ minutes

---

## Technical Stack

- **Framework:** Next.js 16 with App Router
- **UI Library:** React 19
- **Charts:** D3.js, Three.js (3D charts)
- **Styling:** Tailwind CSS v4
- **State Management:** React Context + localStorage
- **Deployment:** Vercel (Serverless Functions)
- **Package Manager:** pnpm
