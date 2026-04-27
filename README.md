# Stock Market Analysis Dashboard - Project Report

> A comprehensive stock market visualization tool serving beginners and advanced traders.

## Quick Links

- [Project Report](./PROJECT_REPORT.md) - Full documentation with all details
- [Getting Started](#getting-started) - Run the project locally
- [Features](#features) - Dashboard capabilities
- [Chart Types](#chart-types) - All 16 chart explanations

---

## Overview

This is a [Next.js](https://nextjs.org) project providing comprehensive stock market visualization and analysis tools. The dashboard offers **dual-mode viewing**:

- **Simple Mode**: Beginner-friendly explanations with plain language chart descriptions
- **Detailed Mode**: Advanced technical indicators and comprehensive analytics

---

## Features

### Dual-Mode Interface

- Toggle button to switch between Simple and Detailed modes
- Each mode provides appropriate complexity for the user
- ChartAnalysis component explains every visualization

### 16 Chart Types

The dashboard includes 16 different chart types for market analysis.

### Accessibility

- Dark mode support
- Palette-based dynamic theming
- Accessible color combinations

---

## Chart Types

### MarketPredictor

- **Simple**: This shows which stocks are popular right now and how experts think they might perform. Green means experts think it's a good buy, red means they think you should sell.
- **Detailed**: Real-time market sentiment analysis based on multiple technical indicators including RSI, MACD, and moving average crossovers. Signal strength indicates conviction level.
- **Purpose**: Help users understand current market mood and expert consensus

### PortfolioPieChart

- **Simple**: This pie chart shows how your money is spread out across different types of investments. A balanced portfolio means if one type does poorly, the others might help balance it out.
- **Detailed**: Portfolio allocation breakdown by sector weighting. Diversification metrics and concentration risk analysis. Rebalancing recommendations based on target allocation.
- **Purpose**: Visualize portfolio diversity and risk distribution

### Candlestick3DChart

- **Simple**: These 3D bars show how stock prices moved over time. The tall green bars mean the price went up a lot that day. The short red bars mean the price stayed fairly flat.
- **Detailed**: 3D candlestick visualization displaying OHLCV data with volume-weighted price action. Supports rotation and zoom for temporal pattern analysis.
- **Purpose**: Understand price movement patterns over time

### PriceRibbon3D

- **Simple**: These colored lines show different averages of the stock price over time. When the short-term average crosses above the long-term average, that's often a good sign.
- **Detailed**: Multi-timeframe moving average ribbon visualization. Golden cross and death cross signals, trend strength indicators, and support/resistance levels.
- **Purpose**: Identify trend changes and key price levels

### Volume3DBars

- **Simple**: These bars show how many shares were traded each day. Big bars mean lots of people were buying or selling that day - something important might be happening.
- **Detailed**: Volume profile analysis with volume-at-price indicators. Unusual volume detection and institutional activity estimation.
- **Purpose**: See trading activity and market interest

### CandlestickChart

- **Simple**: This 2D chart shows the same price information as the 3D version but in a simpler format. Green means the price went up, red means it went down.
- **Detailed**: Traditional candlestick charting with configurable timeframes. Pattern recognition for doji, hammer, engulfing patterns, and other technical formations.
- **Purpose**: Simple price trend visualization

### MarketFactors

- **Simple**: These are the main things that affect how stock prices change. Understanding these helps you make better decisions about when to buy or sell.
- **Detailed**: Comprehensive market factor analysis including fundamental, technical, and sentiment indicators. Real-time correlation matrix for factor exposures.
- **Purpose**: Educational overview of market drivers

### Heatmap

- **Simple**: This map shows how different groups of stocks are doing. Green groups are doing well, red groups are doing poorly. Bigger squares mean more money is in those stocks.
- **Detailed**: Sector and industry performance heatmap with market cap weighting. Relative strength rankings and sector rotation analysis.
- **Purpose**: Quick overview of market sector performance

### Treemap

- **Simple**: This box picture shows which parts of the market are biggest and how they're performing. Bigger boxes are larger companies, colors show if they're up or down.
- **Detailed**: Hierarchical market capitalization treemap with performance overlays. Sector drill-down capabilities and relative performance metrics.
- **Purpose**: Visualize market segments by size and performance

### Treemap3DBoxes

- **Simple**: This 3D version gives you a cool view of the same information. You can rotate it around to see which areas of the market are biggest.
- **Detailed**: Interactive 3D treemap visualization with depth cues and spatial navigation. Market structure analysis and sector allocation visualization.
- **Purpose**: 3D view of market structure

### Streamgraph

- **Simple**: This flowing chart shows how different groups of stocks have performed over time. It's like watching the popularity of different types of investments change.
- **Detailed**: Stacked area visualization showing sector performance over time. Sector rotation patterns and momentum transition analysis.
- **Purpose**: Track sector performance over time

### AnalysisTabs

- **Simple**: These tabs let you see different types of analysis. Think of it like getting different expert opinions on the same stock.
- **Detailed**: Multi-panel technical analysis with RSI, MACD, Stochastic, Williams %R, and CCI indicators. Signal compilation and confluence analysis.
- **Purpose**: Comprehensive technical indicator analysis

### TechnicalAnalysis

- **Simple**: This shows technical indicators - mathematical ways to predict where the price might go. Think of it like weather prediction but for stocks.
- **Detailed**: Comprehensive technical indicator dashboard with RSI, MACD, Bollinger Bands, ATR, and custom indicators. Backtested signal performance.
- **Purpose**: Deep dive into technical indicators

### NetworkGraph

- **Simple**: This shows how different stocks move together. Stocks connected by lines tend to go up and down at similar times.
- **Detailed**: Stock correlation network visualization with adjustable correlation thresholds. Sector clustering and co-movement analysis.
- **Purpose**: See how stocks are related to each other

### ConfusionMatrixPlot

- **Simple**: This shows how good our predictions have been. The bigger the colored squares, the more accurate our predictions were.
- **Detailed**: Machine learning model performance visualization. Precision, recall, F1-score metrics for forecast accuracy evaluation.
- **Purpose**: Evaluate prediction accuracy

### LagCorrelationPlot

- **Simple**: This shows how changes in one thing might predict changes in another. It helps find patterns that happen before big price moves.
- **Detailed**: Temporal correlation analysis with configurable lag periods. Leading indicator discovery and causal relationship mapping.
- **Purpose**: Find predictive patterns

### DualAxisPlot

- **Simple**: This chart compares two different things at once. It helps you see if there's a relationship between them.
- **Detailed**: Dual-axis charting with correlation coefficients. Multi-variable analysis and regression statistics.
- **Purpose**: Compare two metrics

---

## Stakeholders

### Beginner Investor

- **Profile**: Limited knowledge, owns stock portfolio, wants to understand trends
- **Needs**: Simple language, guided interpretation, gradual complexity
- **Pain Points Resolved**: Complex visualizations, technical jargon, no context

### Advanced Trader

- **Profile**: Experienced with technical analysis, needs detailed data
- **Needs**: Full indicators, multiple charts, backtesting
- **Pain Points Resolved**: Oversimplified interfaces, limited data access

### Financial Educator

- **Profile**: Teaches investing concepts, needs examples for teaching
- **Needs**: Toggle modes, educational explanations, professional presentation
- **Pain Points Resolved**: No mode switching, missing context

### Casual Market Observer

- **Profile**: Not actively trading, wants general understanding
- **Needs**: High-level summary, quick insights
- **Pain Points Resolved**: Information overload

---

## Problems Solved

1. **Stock Market Complexity for Beginners** → Simple Mode with plain language
2. **Lack of Contextual Understanding** → ChartAnalysis component
3. **No Mode Differentiation** → Dual Simple/Detailed modes
4. **Insufficient Charts in Simple Mode** → 4 charts per tab in both modes

---

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Learn Next.js](https://nextjs.org/learn)
- [Project Report](./PROJECT_REPORT.md) - Full documentation

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme).

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.