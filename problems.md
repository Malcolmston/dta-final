# Stock Market Dashboard - Problems & Concerns

## From the perspective of a stock investor who finds most tools overly complicated

### 1. PORTFOLIO IS NOT REAL

**Problem**: The "Your Portfolio" section doesn't let me input my actual holdings. It shows hypothetical allocations based on ticker symbols (e.g., if I type AAPL, it generates some mock 45% stocks / 20% CDs / 25% bonds / 10% crypto allocation).

**Why this matters**: I can't see how MY actual investments are performing. This defeats the purpose of a wealth management tool.

---

### 2. NO WAY TO TRACK PERFORMANCE OVER TIME

**Problem**: There's no feature to add transactions (buys/sells), track cost basis, or see P&L over time.

**Why this matters**: A real investment tool should show me if I'm actually making or losing money, not just show me stock charts.

---

### 3. TOO MANY TECHNICAL INDICATORS

**Problem**: Even in "Simple Mode", I'm faced with RSI, Williams %R, Stochastic %K, CCI, MACD, SMA, and more. The Technical Analysis section has 4 different momentum indicators that all seem to measure the same thing differently.

**Why this matters**: These are tools for day traders, not long-term investors. Most investors just need to know: "is the stock going up or down?"

---

### 4. THE "PREDICTIONS" ARE MISLEADING

**Problem**: The Market Predictor shows a dashed line labeled "Prediction: +15%/yr" based on "analyst estimates". The forecasting API gives BUY/SELL/HOLD signals based on technical indicators.

**Why this matters**: This could be mistaken for financial advice. Technical indicator-based signals are NOT reliable predictions of future performance. The average investor might think the tool is telling them what to buy.

---

### 5. NO DOLLAR AMOUNTS - ONLY PERCENTAGES

**Problem**: Charts show percentage changes, allocation percentages, but I can't input dollar amounts.

**Why this matters**: If my portfolio is worth $100,000, a 5% change is $5,000. If it's $10,000, it's $500. The same percentage means completely different things for different people.

---

### 6. NO WEALTH MANAGEMENT FEATURES

**Problem**: Missing features that actually help with wealth management:
- No retirement calculator (how much do I need to save?)
- No goal tracking (save for house, kid's college, retirement)
- No asset allocation recommendations based on age/risk tolerance
- No rebalancing suggestions

**Why this matters**: This is supposed to be a "Stock Market Dashboard" but it doesn't help me manage my wealth. It's just charts.

---

### 7. 3D CHARTS ARE UNNECESSARY

**Problem**: There are 3D candlestick charts, 3D volume bars, 3D treemap boxes, 3D price ribbons.

**Why this matters**: 3D visualizations are harder to read, take longer to load, and add no actual value for investment decisions. They seem like "flash" over substance.

---

### 8. CONFUSING "SIMPLE MODE" VS "DETAILED MODE"

**Problem**: The two modes don't feel meaningfully different. Both show charts with technical data. Detailed mode just adds more charts with more jargon (ML Model Performance Matrix, Temporal Lag Analysis, Confusion Matrix).

**Why this matters**: Neither mode is actually simple enough for a beginner investor.

---

### 9. NO WAY TO SAVE MY DATA

**Problem**: Everything resets when I refresh the page. Can't save portfolio, can't save chart configurations.

**Why this matters**: This is useless for ongoing portfolio tracking. I have to re-enter everything every time.

---

### 10. DATA SOURCE UNCLEARITY

**Problem**: Stock price data comes from Yahoo Finance (real), but portfolio allocations are "simulated for demonstration purposes". Forecast signals come from some internal calculation.

**Why this matters**: I don't know what's real data and what's demo data. This is confusing.

---

### 11. OVERWHELMING STATS ON OVERVIEW

**Problem**: The overview shows:
- S&P 500: 4,892 (+0.82%)
- NASDAQ: 15,628 (+1.24%)
- DOW: 38,519 (+0.35%)
- Volatility: 13.45 (-2.1%)

**Why this matters**: These are index values that change every second. Showing them as static numbers is meaningless. What am I supposed to do with "NASDAQ: 15,628"?

---

### 12. NO CLEAR ACTION ITEMS

**Problem**: The dashboard shows tons of data but doesn't tell me what to DO about it.

**Why this matters**: A useful tool for an investor would say things like:
- "Your portfolio is too heavily weighted in tech stocks - consider diversifying"
- "You're 5 years from retirement - your portfolio is too aggressive"
- "You've had consistent gains - consider tax-loss harvesting"

Instead I just get charts.

---

### 13. TERMINOLOGY ISSUES

**Problem**: Using terms without explanation in key places:
- "OHLCV" (Open, High, Low, Close, Volume)
- "Dual Axis Plot"
- "Lag Correlation Plot"
- "Confusion Matrix Plot"

**Why this matters**: Even "Simple Mode" assumes familiarity with financial charting.

---

### 14. "ACCESSIBILITY" ONLY CHANGES COLORS

**Problem**: The accessibility settings let me choose color palettes (default, high contrast, colorblind-friendly).

**Why this matters**: This doesn't address the fundamental problem that the data itself is too complex. Color-blind friendly colors won't help if I don't understand what RSI means.

---

---

## From the perspective of a Financial Adviser (industry veteran)

### 15. REGULATORY RED FLAGS

**Problem**: The tool shows BUY/SELL/HOLD signals and "predictions" without any proper disclaimers.

**Why this matters**: This could constitute unauthorized investment advice. FINRA Rule 2010 requires that any tool providing investment recommendations must be properly supervised or include clear disclosures that this is not financial advice. The current disclaimer "Data provided for educational purposes" is insufficient and potentially misleading.

---

### 16. NO RISK ASSESSMENT

**Problem**: There's no risk tolerance questionnaire, no suitability assessment.

**Why this matters**: A core requirement of proper financial advice is understanding the client's risk tolerance before making ANY recommendations. A 22-year-old with student loans has vastly different needs than a 65-year-old retiree. This tool makes no attempt to assess suitability.

---

### 17. TECHNICAL ANALYSIS IS NOT INVESTMENT ADVICE

**Problem**: The tool uses RSI, MACD, moving averages, and other technical indicators to generate "BUY/SELL/HOLD" signals.

**Why this matters**: As a financial adviser, I can tell you: technical analysis has no evidence-based track record of outperforming the market. Relying on it for investment decisions is speculation, not investment management. Presenting these signals as actionable recommendations without heavy disclaimers is professionally irresponsible.

---

### 18. NO FEE DISCLOSURE

**Problem**: The tool doesn't show trading costs, expense ratios, or advisory fees anywhere.

**Why this matters**: Fees are one of the most important factors in long-term returns. A portfolio with 1% annual fees vs 0.1% fees can cost a client hundreds of thousands over a lifetime. Professional advisers must disclose all costs. This tool hides them entirely.

---

### 19. NO TAX CONSIDERATIONS

**Problem**: No discussion of tax implications, no mention of tax-advantaged accounts (IRA, 401k, Roth), no tax-loss harvesting suggestions.

**Why this matters**: After-tax returns are what actually matter to investors. Ignoring the tax treatment of investments is a massive oversight. A tool that doesn't differentiate between taxable accounts and tax-advantaged accounts is providing incomplete advice.

---

### 20. NO BENCHMARK COMPARISON

**Problem**: Charts show price performance but never compare to benchmarks like S&P 500, Russell 2000, or bond indices.

**Why this matters**: Performance numbers are meaningless without context. A 10% return looks good until you realize the S&P 500 returned 20%. Professional portfolio review always includes benchmark comparison.

---

### 21. NO CASH FLOW ANALYSIS

**Problem**: No way to track income, dividends, contributions, or withdrawals.

**Why this matters**: Wealth management isn't just about asset prices - it's about cash flow. Does the portfolio generate enough income? Are distributions sustainable? This tool says nothing about either.

---

### 22. NO EMERGENCY FUND CHECK

**Problem**: Doesn't verify if the user has adequate liquid reserves before investing.

**Why this matters**: Proper financial planning requires 3-6 months of expenses in emergency funds BEFORE investing in the stock market. Jumping straight to stock charts without addressing liquidity is irresponsible.

---

### 23. NO DIVERSIFICATION ANALYSIS

**Problem**: Just shows sector allocation but doesn't analyze if it's appropriate.

**Why this matters**: Having 40% in technology might be fine for some clients and completely inappropriate for others. The tool shows data but provides no analysis of concentration risk.

---

### 24. MISSING PROPER RISK METRICS

**Problem**: Shows volatility numbers but no:
- Sharpe ratio
- Sortino ratio
- Maximum drawdown
- Beta
- Standard deviation

**Why this matters**: Professional portfolio management relies on risk-adjusted returns, not just absolute returns. A return of 8% with 5% volatility is better than 8% with 20% volatility. This tool ignores risk-adjusted performance entirely.

---

### 25. NO REBALANCING TRIGGERS

**Problem**: Shows allocation but doesn't suggest when to rebalance.

**Why this matters**: Rebalancing is a core part of portfolio management. A professional adviser knows to rebalance when allocations drift 5%+ from targets. This tool doesn't mention it.

---

### 26. ENCOURAGES MARKET TIMING

**Problem**: The BUY/SELL/HOLD signals and "prediction" line could encourage investors to time the market.

**Why this matters**: Market timing is one of the most destructive behaviors for long-term investors. Studies consistently show that trying to time the market underperforms buy-and-hold. A professional tool should discourage timing, not encourage it.

---

### 27. NO TIME HORIZON INPUT

**Problem**: No discussion of investment goals or time horizon.

**Why this matters**: A 30-year-old saving for retirement and a 60-year-old generating income have completely different optimal portfolios. This tool treats every investor the same.

---

### 28. NO INCOME TRACKING

**Problem**: No tracking of dividend income, interest income, or distribution yields.

**Why this matters**: For many investors, income is the primary goal. A portfolio yielding 3% on a $500k portfolio is $15,000/year - significant income. The tool ignores this entirely.

---

### 29. NO COST BASIS TRACKING

**Problem**: Can't input purchase prices to calculate true P&L including taxes.

**Why this matters**: You can't calculate real returns without knowing cost basis. A stock purchased at $50 and now at $100 has a very different tax implication than one purchased at $10. The tool treats all gains the same.

---

### 30. SURVIVORSHIP BIAS

**Problem**: Only shows existing stocks - no mention of companies that went bankrupt or were acquired.

**Why this matters**: This creates a false picture of market returns. The "performance" shown excludes failed companies, inflating the perceived returns. This is a well-known statistical bias that misleadingly represents the market.

---

### 31. INAPPROPRIATE USE OF LEVERAGE/MARGIN

**Problem**: The 3D charts and complex visualizations suggest a trading mindset, not a wealth management mindset.

**Why this matters**: Professional wealth management emphasizes simplicity, low costs, and long-term holding. The flashy 3D charts and technical analysis tools are inappropriate for the vast majority of retail investors.

---

### 32. NO SUITABILITY DOCUMENTATION

**Problem**: No way to document the "analysis" or generate reports for client files.

**Why this matters**: Financial advisers are required to maintain documentation of their analysis and recommendations. This tool provides no way to export or document what was reviewed.

---

### SUGGESTED IMPROVEMENTS FOR A REAL WEALTH MANAGEMENT TOOL

#### Basic Requirements:
1. **Let me input real holdings** - Add transactions, track cost basis, show P&L
2. **Show dollar amounts** - Not just percentages
3. **Actually simple mode** - Just show: my holdings, how they're doing, sector breakdown
4. **Add planning tools** - Retirement calculator, goal tracking
5. **Remove 3D charts** - Keep 2D for clarity
6. **Add educational tooltips** - What does each indicator actually mean for my money?
7. **Show actionable insights** - Don't just show data, interpret it
8. **Allow saving** - User accounts or local storage

#### Professional Requirements (Financial Adviser Perspective):
21. **Add proper disclaimers** - "Not investment advice" visible on every page
22. **Risk assessment questionnaire** - Required before showing any recommendations
23. **Remove BUY/SELL/HOLD signals** - Or make them very clearly "educational only"
24. **Add fee disclosure** - Show expense ratios, expected trading costs
25. **Add tax-aware features** - Distinguish taxable vs tax-advantaged accounts
26. **Add benchmark comparison** - S&P 500, appropriate indices
27. **Add proper risk metrics** - Sharpe ratio, max drawdown, standard deviation
28. **Add rebalancing alerts** - Trigger when allocations drift from targets
29. **Add time horizon** - Ask about goals before showing any "advice"
30. **Add income tracking** - Dividend yield, distribution tracking
31. **Add emergency fund check** - Verify liquidity before suggesting investments
32. **Add documentation/export** - Generate reports for compliance files

---

## From the Technical Lead Perspective (Performance & Code Quality)

### 33. CLIENT-SIDE RENDERING (CRITICAL)

**Problem**: ALL components use `"use client"` directive - forces entire application to client-side rendering.

**Files**:
- `app/page.tsx` (line 1)
- `app/layout.tsx` (line 4) - ColorPaletteProvider forces client rendering
- All 26 component files

**Why this matters**: Massive impact on SEO, initial load time, and performance. The ColorPaletteContext forces the entire app to be client-rendered because it's used in layout.tsx.

**Fix**: Move ColorPaletteProvider to a client wrapper component, extract static content to server components.

---

### 34. EXCESSIVE API CALLS (CRITICAL)

**Problem**: Components make excessive sequential API calls.

**Files**:
- `app/components/MarketPredictor.tsx` (lines 82-151) - Makes 3 separate API calls per fetch
- `app/components/TechnicalAnalysis.tsx` (lines 90-145) - Makes 2 calls per symbol
- `app/components/AnalysisTabs.tsx` - Each tab makes separate API calls (~252 data points)

**Why this matters**: Each API call hits Yahoo Finance + Python scripts = very slow load times. No data sharing between tabs despite overlapping data needs.

**Fix**: Consolidate API calls - fetch once, share data between components. Use React Query or SWR for caching.

---

### 35. MISSING CACHING IN API ROUTES

**Problem**: Only `/api/queue` has Redis caching. Other routes have no caching.

**Files**:
- `app/api/stocks/history/route.ts` - No caching
- `app/api/stocks/growth/route.ts` - No caching
- `app/api/stocks/forecast/route.ts` - Uses `force-dynamic` but no caching
- `app/api/stocks/momentum/route.ts` - Uses `force-dynamic` but no caching

**Why this matters**: Every page refresh re-fetches all data from Yahoo Finance + runs Python scripts.

**Fix**: Add `export const revalidate = 60;` to cache responses for 60 seconds.

---

### 36. NO LOADING SKELETONS

**Problem**: Components show simple "Loading..." text instead of proper skeleton UI.

**Files**: All chart components

**Why this matters**: Poor user experience - no visual feedback during slow API calls.

**Fix**: Implement skeleton components for each chart type.

---

### 37. PYTHON PROCESS SPAWNING (PERFORMANCE)

**Problem**: API routes spawn Python processes synchronously with no timeout.

**Files**:
- `app/api/stocks/forecast/route.ts`
- `app/api/stocks/momentum/route.ts`
- `app/api/stocks/signals/route.ts`

**Why this matters**: Can hang indefinitely, blocks event loop, Python execution takes seconds per request.

**Fix**: Add timeouts to Python spawn calls, use streaming responses where possible.

---

### 38. LARGE DATA PAYLOADS

**Problem**: Components fetch full historical data without pagination or downsampling.

**Files**:
- `lib/index.ts` - fetchHistory fetches entire period without limits
- D3 charts render all data points without downsampling

**Why this matters**: Performance issues with large datasets (252+ data points per year).

**Fix**: Implement data downsampling for chart rendering, add limit parameters.

---

### 39. BUNDLE SIZE - NO OPTIMIZATION

**Problem**: next.config.ts missing bundle optimization settings.

**Issue**:
- No bundle analyzer
- No code splitting configuration
- No compression settings
- Large dependencies imported client-side: d3 (~90KB), three, @react-three/fiber, bullmq

**Fix**: Add to next.config.ts:
```typescript
experimental: {
  optimizePackageImports: ['d3', 'three'],
},
compress: true,
```

---

### 40. HARDcoded Colors vs ColorPaletteContext

**Problem**: Components hardcode colors instead of using the ColorPaletteContext.

**Files**:
- `app/components/CandlestickChart.tsx` (lines 17-19) - Hardcoded BULLISH_COLOR, BEARISH_COLOR
- `app/components/DualAxisPlot.tsx` (lines 15-20) - Hardcoded colors
- `app/components/Streamgraph.tsx` (lines 23-34) - Hardcoded COLORS array
- `app/components/Heatmap.tsx` (line 146) - Hardcoded colors
- `app/components/NetworkGraph.tsx` (line 269) - Hardcoded colors

**Why this matters**: The accessibility color settings don't apply to most charts. Breaking the theme system.

**Fix**: Use `useColorPalette()` hook in all chart components.

---

### 41. COLOR CONTRAST ISSUES (WCAG)

**Problem**: Multiple instances of low-contrast text on chart elements.

**Files**:
- `app/components/Heatmap.tsx` (lines 247, 256, 265) - 10px legend labels with gray-500
- `app/components/NetworkGraph.tsx` (line 419) - Performance labels at 10px
- `app/components/TechnicalAnalysis.tsx` - 10px-11px chart labels

**Why this matters**: Fails WCAG AA (4.5:1 minimum). Text at 10px with gray-500 has insufficient contrast.

**Fix**: Use minimum 12px font for all chart labels, use darker colors (#4b5563 instead of #6b7280).

---

### 42. ZERO ARIA LABELS

**Problem**: No ARIA attributes in any chart component.

**Files**: All 26 chart components

**Why this matters**: 100% of charts are inaccessible to screen readers. No `role="img"`, no `aria-label`, no `<title>` or `<desc>` in SVGs.

**Fix**: Add proper ARIA labels to all SVGs:
```tsx
<title>Portfolio Allocation Pie Chart</title>
<desc>A pie chart showing portfolio allocation...</desc>
```

---

### 43. NO KEYBOARD NAVIGATION

**Problem**: Interactive chart elements are not keyboard accessible.

**Files**:
- `app/components/Heatmap.tsx` - Heatmap cells use mouse events only
- `app/components/Treemap.tsx` - Treemap cells mouse-only
- `app/components/NetworkGraph.tsx` - Nodes use d3 drag, not keyboard

**Why this matters**: Users cannot navigate charts using keyboard.

**Fix**: Add keyboard navigation with arrow keys, or provide alternative controls (table view).

---

### 44. MISSING FOCUS STATES

**Problem**: Inconsistent or missing focus indicators on interactive elements.

**Files**:
- `app/components/TickerInput.tsx` (lines 115-123, 152-160) - Remove button has no focus state
- `app/components/Streamgraph.tsx` (line 377) - Only uses hover, no focus ring
- `app/components/Treemap.tsx` (lines 345-360) - Time period buttons lack focus

**Why this matters**: Keyboard users cannot see where they are on the page.

**Fix**: Add `focus:ring-2 focus:ring-blue-500 focus:outline-none` to all buttons.

---

### 45. NO SECURITY HEADERS

**Problem**: next.config.ts missing security headers configuration.

**Missing Headers**:
- Content-Security-Policy
- X-Frame-Options
- X-Content-Type-Options
- Referrer-Policy
- Permissions-Policy

**Why this matters**: Vulnerable to XSS, clickjacking, and other attacks.

**Fix**: Add headers() function in next.config.ts.

---

### 46. NO API RATE LIMITING

**Problem**: None of the API routes implement rate limiting.

**Files**: All API routes (`app/api/stocks/*/route.ts`)

**Why this matters**: Vulnerable to abuse - Yahoo Finance API calls can be spammed.

**Fix**: Implement rate limiting using Upstash Redis or rate-limit package.

---

### 47. NO ERROR BOUNDARIES

**Problem**: No React Error Boundaries in the application.

**Files**: `app/layout.tsx`, `app/page.tsx`

**Why this matters**: Unhandled React errors crash the entire application with no recovery.

**Fix**: Add ErrorBoundary components to catch and handle errors gracefully.

---

### 48. NO HEALTH CHECK ENDPOINT

**Problem**: No health check route for container orchestration.

**Why this matters**: No way for Docker/Kubernetes to verify app is ready to serve requests.

**Fix**: Create `app/api/health/route.ts` for readiness/liveness checks.

---

### 49. TYPESCRIPT ERRORS IGNORED

**Problem**: next.config.ts has `ignoreBuildErrors: true`

**File**: `next.config.ts` (lines 4-5)

**Why this matters**: Masks type safety issues that should be fixed, not ignored.

**Fix**: Remove `ignoreBuildErrors: true` and fix TypeScript errors.

---

### 50. EXCESSIVE USE OF `any` TYPE

**Problem**: Multiple files use `any` type extensively, losing type safety.

**Files**:
- `lib/index.ts` (lines 104, 192, 352, 379, 437) - Multiple `any` casts
- `app/components/MarketPredictor.tsx` (lines 194, 208, 376) - D3 data typed as `any`
- `app/components/AnalysisTabs.tsx` (lines 280, 298, 319) - Multiple `any` types

**Why this matters**: Defeats purpose of TypeScript - no compile-time safety.

**Fix**: Define proper interfaces for all data structures.

---

### 51. CODE DUPLICATION

**Problem**: TIME_RANGES constant duplicated in 6 components.

**Files**:
- `app/components/MarketPredictor.tsx` (lines 57-67)
- `app/components/Heatmap.tsx` (lines 14-21)
- `app/components/Treemap.tsx` (lines 24-30)
- `app/components/Streamgraph.tsx` (lines 12-21)
- `app/components/NetworkGraph.tsx` (lines 499-505)
- `app/components/CandlestickChart.tsx` (lines 8-15)

**Fix**: Create `lib/constants.ts` with shared constants.

---

### 52. MEGA COMPONENT (AnalysisTabs.tsx)

**Problem**: AnalysisTabs.tsx is 1309 lines - violates single responsibility principle.

**File**: `app/components/AnalysisTabs.tsx`

Contains: Main component + MarketOverviewTab (290 lines) + PriceTrendsTab (225 lines) + MarketFactorsTab (195 lines) + SignalsTab (230 lines) + StrategyTab (120 lines)

**Fix**: Split into separate files:
```
app/components/tabs/
  AnalysisTabs.tsx
  MarketOverviewTab.tsx
  PriceTrendsTab.tsx
  MarketFactorsTab.tsx
  SignalsTab.tsx
  StrategyTab.tsx
```

---

### 53. NON-EXISTENT FUNCTION CALL

**Problem**: lib/index.ts line 508 calls `fetchGrowth(symbol)` which doesn't exist.

**File**: `lib/index.ts` (line 508)

**Why this matters**: Will cause runtime error.

**Fix**: Change to `fetchGrowthEstimate(symbol)`.

---

### 54. MAGIC NUMBERS WITHOUT CONSTANTS

**Problem**: Hardcoded numbers without explanation.

**Files**:
- `app/components/PortfolioAgeAnimation.tsx`:
  - Line 30: `(70 - targetAge) / 50` - unexplained
  - Line 178: `12000` - animation duration
- `app/components/CandlestickChart.tsx`:
  - Line 100: `height * 0.7` - price area height
  - Line 109: `0.1` - padding

**Fix**: Create named constants:
```typescript
const ANIMATION_CYCLE_DURATION_MS = 12000;
const MIN_AGE = 20;
const MAX_AGE = 70;
```

---

### 55. DEBUG console.log IN PRODUCTION

**Problem**: Debug logging left in production code.

**File**: `app/components/MarketPredictor.tsx` (line 52)
```typescript
console.log('Stock zones:', { minPct, maxPct, rangeToUse, buyLine, sellLine });
```

**Fix**: Remove before production or use proper logging utility.

---

### 56. NO INPUT VALIDATION

**Problem**: No validation on user inputs.

**Files**:
- `app/components/TickerInput.tsx` - Accepts any text without ticker validation
- `app/components/NetworkGraph.tsx` (line 542) - Correlation threshold accepts values outside 0-1

**Fix**: Add proper validation:
```typescript
const isValidTicker = (ticker: string): boolean => {
  return /^[A-Z]{1,5}$/.test(ticker);
};
```

---

### 57. NO UNIT TESTS (CRITICAL)

**Problem**: No test files exist in the entire codebase.

**Why this matters**: No way to verify changes don't break existing functionality.

**Fix**: Add tests for lib/index.ts utilities, TickerInput component, SimplifiedChart component.

---

### 58. INCOMPLETE ENVIRONMENT CONFIGURATION

**Problem**: Only 2 variables in .env.local, missing critical variables.

**Missing**:
- REDIS_PASSWORD
- NODE_ENV
- Database credentials
- API keys for external services
- Logging/monitoring credentials

**Fix**: Create `.env.example` with all required variables documented.

---

### 59. DOCKERFILE NOT PRODUCTION-READY

**Problem**: Dockerfile uses `npm run dev` instead of production build.

**File**: `Dockerfile` (line 21)

**Issues**:
- Uses npm run dev (should use npm run start)
- No multi-stage build
- No .dockerignore
- No health check defined

**Fix**: Use multi-stage build with production start command, add health check.

---

### 60. NO CI/CD PIPELINE

**Problem**: No GitHub Actions or CI/CD configuration.

**Why this matters**: No automated testing or deployment.

**Fix**: Add GitHub Actions workflow for testing and deployment.