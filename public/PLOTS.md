# Dashboard Plots Documentation

The Stock Market Dashboard is organized into 7 main sections accessible via the left sidebar navigation. Each section contains specific charts and tools for different aspects of stock analysis.

---

## Overview Tab

**Purpose:** Landing page introducing the tool and its benefits to new users.

### Components

| Component | Description |
|-----------|-------------|
| Market Predictor | Shows overall market sentiment (bullish/bearish). Green = positive, Red = negative |
| Portfolio Pie Chart | Displays investment distribution across sectors. Larger slice = more invested |
| Candlestick Chart | Simple price chart with period buttons (1d, 5d, 1mo, 3mo, 6mo, 1y, 2y, 5y) |

### Key Sections
- **Why Stock Analysis Matters** — Introduction to data-driven investing
- **Three Benefit Cards** — Make Smarter Decisions, Track Your Progress, Understand the Market
- **Who This Is For** — Individual Investors, Financial Advisors, Students & Learners, Researchers
- **Simple Charts for Everyone** — Beginner-friendly chart explanations
- **How to Use This Dashboard** — Step-by-step navigation guide

### View Modes
- **Simplified** — Basic view for beginners
- **Detailed** — Full features for experienced users

---

## Trends Tab

**Purpose:** Display historical price data and trading activity.

### Simplified Mode
- Price Trends — Candlestick chart
- Trading Activity — Additional candlestick chart (3-month view)

### Detailed Mode

| Component | Description |
|-----------|-------------|
| CandlestickChart | Full candlestick chart with OHLC data, multiple time periods, zoom/pan |
| VolumeChart | Bar chart showing trading volume, colored by price movement |
| Streamgraph | Stacked area chart showing relative performance of multiple tickers |
| PriceRibbon3D | 3D visualization of multiple moving averages (SMA, EMA) |

### Default Tickers
AAPL, GOOGL, MSFT, AMZN, NVDA

### Time Periods
1d, 5d, 1mo, 3mo, 6mo, 1y, 2y, 5y

---

## Factors Tab

**Purpose:** Analyze economic and market factors affecting stock performance.

### Simplified Mode
- Market Factors — Visual analysis of key indicators
- DualAxisPlot — Economic trends comparison

### Detailed Mode

| Component | Description |
|-----------|-------------|
| MarketFactors | Analyzes key market indicators. Categories: Valuation, Momentum, Quality, Size |
| LagCorrelationPlot | Shows how correlations change over time. Adjustable lag period slider |
| DualAxisPlot | Dual-axis chart comparing two related metrics (e.g., interest rates vs stock prices) |

### Use Cases
- Understanding "why" behind price movements
- Identifying leading/lagging indicators
- Finding correlations between economic indicators and stock performance

---

## Sectors Tab

**Purpose:** Visualize market performance across different sectors.

### Simplified Mode
- Sector Performance — Heatmap
- Market Segments — Treemap

### Detailed Mode

| Component | Description |
|-----------|-------------|
| Heatmap | Color-coded grid showing sector performance. Green = positive, Red = negative |
| Treemap | Hierarchical treemap showing market structure. Nested rectangles sized by market cap |

### Sectors Displayed
Technology, Healthcare, Financial, Consumer, Energy, Utilities, Real Estate, Materials, Industrials, Communications

### Features
- Hover for detailed metrics
- Drill-down into subsectors
- Percentage change display

---

## Analysis Tab

**Purpose:** Deep technical analysis and stock relationship visualization.

### Simplified Mode
- Technical Analysis — Multi-tab technical analysis (basic view)
- NetworkGraph — Stock relationships

### Detailed Mode

| Component | Description |
|-----------|-------------|
| AnalysisTabs | Multi-indicator technical panel with tabs: Price, Moving Averages, RSI, MACD, Bollinger Bands, Patterns |
| NetworkGraph | Visual network showing stock relationships. Edge thickness = correlation strength |
| ConfusionMatrixPlot | ML model performance matrix showing true/false positives/negatives |

### Technical Indicators
- **SMA** — Simple Moving Average
- **EMA** — Exponential Moving Average
- **RSI** — Relative Strength Index (overbought/oversold)
- **MACD** — Moving Average Convergence Divergence
- **Bollinger Bands** — Price volatility bands

### Network Graph Features
- Sector clustering
- Node size = market cap
- Interactive: drag nodes, zoom, pan

---

## Portfolio Tab

**Purpose:** Manage investment portfolio with tracking and analysis tools.

### Components

| Component | Description |
|-----------|-------------|
| PortfolioManager | Add/remove holdings, track shares, purchase price, current value |
| PortfolioPieChart | Pie chart showing asset distribution by sector/type |
| Treemap | Holdings visualization. Size = position value, Color = performance |
| IncomeTrackingPanel | Track dividends received, record other income |
| CostBasisInput | Enter purchase price and shares, calculate profit/loss |
| SurvivorshipBiasDisclaimer | Warning about data limitations |

### Features
- Add new position form
- Edit/delete existing positions
- Calculate total portfolio value
- View individual holding performance
- Realized vs unrealized gains tracking

---

## Wealth Tab

**Purpose:** Long-term wealth management and financial planning.

### Components

| Component | Description |
|-----------|-------------|
| InvestmentGoalsWizard | First-time setup wizard with risk tolerance assessment |
| RetirementCalculator | Project retirement savings, account for inflation |
| GoalTracking | Set financial goals, track progress, timeline visualization |
| AssetAllocation | Recommended portfolio distribution based on risk tolerance |
| RebalancingAlerts | Notifications when portfolio drifts from target |
| RiskMetricsPanel | Sharpe Ratio, Volatility, Beta, Maximum Drawdown, VaR |
| EmergencyFundCheck | Check emergency fund adequacy |
| CashFlowTracking | Track income and expenses, savings rate calculation |
| DiversificationAnalyzer | Analyze portfolio diversity, correlation between holdings |
| TaxAwareFeatures | Tax-efficient strategies, tax-loss harvesting |
| BenchmarkComparison | Compare against S&P 500, NASDAQ, Dow Jones |
| FeeDisclosure | Understand investment costs, expense ratio breakdown |
| ActionItemsPanel | Personalized recommendations, prioritized action list |

### Goal Types
Emergency Fund, House, Retirement, Education

### Available Benchmarks
S&P 500, NASDAQ, Dow Jones

### Risk Metrics
- **Sharpe Ratio** — Risk-adjusted return
- **Volatility** — Standard deviation of returns
- **Beta** — vs benchmark (1.0 = same as market)
- **Maximum Drawdown** — Largest peak-to-trough decline
- **Value at Risk (VaR)** — Expected maximum loss

---

## Global Components

### Header
- App Title — "Stock Market Dashboard"
- Ticker Input — Search and select stock tickers
- Simple/Detailed Toggle — Switch between view modes
- Theme Toggle — Light/Dark mode switch

### Sidebar Navigation
- Title — "Dashboard"
- 7 Section Buttons — Overview, Trends, Factors, Sectors, Analysis, Portfolio, Wealth
- Active State — Highlighted with primary color

### Footer
- API Docs Link — "/docs"
- Copyright — App information

---

## API Documentation (/docs)

Accessible via footer link. 5 tabs:

### 1. REST API
- Standard OpenAPI documentation
- All REST endpoints for stock data
- Try-it-out functionality

### 2. Async API
- AsyncAPI specification for real-time updates
- WebSocket channels
- SSE endpoints

### 3. Cron Jobs
- OpenAPI spec for scheduled task endpoints
- 6 cron endpoints

### 4. Webhooks
- Webhook API for programmatic data retrieval
- Chart export endpoints

### 5. Plots
- This documentation

### Key Endpoints
- `/api/health` — Health check
- `/api/stocks/history` — Historical price data
- `/api/stocks/signals` — Trading signals
- `/api/stocks/forecast` — Price forecasts
- `/api/stocks/growth` — Growth metrics
- `/api/stocks/momentum` — Momentum indicators
- `/api/heatmap` — Sector heatmap data
- `/api/webhook` — Webhook data retrieval
- `/api/webhook/capture` — Chart image export

---

## Theme & Settings

### Light Mode (Default)
- Background: #ffffff
- Text: #1f2937
- Primary: #3b82f6
- Grid Lines: #e5e7eb

### Dark Mode
- Background: #111827
- Text: #f9fafb
- Primary: #60a5fa
- Grid Lines: #374151

---

## Important Disclaimers

1. **Data Accuracy** — Stock data from Yahoo Finance. Verify critical data independently.

2. **Past Performance** — Historical data does not guarantee future results.

3. **Survivorship Bias** — Backtested strategies may exclude failed funds.

4. **Not Financial Advice** — For informational and educational purposes only.

5. **Real-Time Data** — Data may have 15+ minute delays.

6. **Educational Purpose** — Charts for learning and research only.

---

## Technical Stack

- **Framework:** Next.js 16 with App Router
- **UI Library:** React 19
- **Charts:** D3.js, Three.js (3D charts)
- **Styling:** Tailwind CSS v4
- **State Management:** React Context + localStorage
- **Deployment:** Vercel (Serverless Functions)
- **Package Manager:** pnpm
