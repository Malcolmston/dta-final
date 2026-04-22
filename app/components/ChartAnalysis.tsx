"use client";

interface ChartAnalysisProps {
  chartType: string;
  isSimpleMode: boolean;
  data?: {
    value?: string;
    change?: string;
    trend?: "up" | "down" | "neutral";
  };
}

const analyses: Record<string, { simple: string; detailed: string }> = {
  "MarketPredictor": {
    simple: "This shows which stocks are popular right now and how experts think they might perform. Green means experts think it's a good buy, red means they think you should sell.",
    detailed: "Real-time market sentiment analysis based on multiple technical indicators including RSI, MACD, and moving average crossovers. Signal strength indicates conviction level.",
  },
  "PortfolioPieChart": {
    simple: "This pie chart shows how your money is spread out across different types of investments. A balanced portfolio means if one type does poorly, the others might help balance it out.",
    detailed: "Portfolio allocation breakdown by sector weighting. Diversification metrics and concentration risk analysis. Rebalancing recommendations based on target allocation.",
  },
  "Candlestick3DChart": {
    simple: "These 3D bars show how stock prices moved over time. The tall green bars mean the price went up a lot that day. The short red bars mean the price stayed fairly flat.",
    detailed: "3D candlestick visualization displaying OHLCV data with volume-weighted price action. Supports rotation and zoom for temporal pattern analysis.",
  },
  "PriceRibbon3D": {
    simple: "These colored lines show different averages of the stock price over time. When the short-term average crosses above the long-term average, that's often a good sign.",
    detailed: "Multi-timeframe moving average ribbon visualization. Golden cross and death cross signals, trend strength indicators, and support/resistance levels.",
  },
  "Volume3DBars": {
    simple: "These bars show how many shares were traded each day. Big bars mean lots of people were buying or selling that day - something important might be happening.",
    detailed: "Volume profile analysis with volume-at-price indicators. Unusual volume detection and institutional activity estimation.",
  },
  "CandlestickChart": {
    simple: "This 2D chart shows the same price information as the 3D version but in a simpler format. Green means the price went up, red means it went down.",
    detailed: "Traditional candlestick charting with configurable timeframes. Pattern recognition for doji, hammer, engulfing patterns, and other technical formations.",
  },
  "MarketFactors": {
    simple: "These are the main things that affect how stock prices change. Understanding these helps you make better decisions about when to buy or sell.",
    detailed: "Comprehensive market factor analysis including fundamental, technical, and sentiment indicators. Real-time correlation matrix for factor exposures.",
  },
  "Heatmap": {
    simple: "This map shows how different groups of stocks are doing. Green groups are doing well, red groups are doing poorly. Bigger squares mean more money is in those stocks.",
    detailed: "Sector and industry performance heatmap with market cap weighting. Relative strength rankings and sector rotation analysis.",
  },
  "Treemap": {
    simple: "This box picture shows which parts of the market are biggest and how they're performing. Bigger boxes are larger companies, colors show if they're up or down.",
    detailed: "Hierarchical market capitalization treemap with performance overlays. Sector drill-down capabilities and relative performance metrics.",
  },
  "Treemap3DBoxes": {
    simple: "This 3D version gives you a cool view of the same information. You can rotate it around to see which areas of the market are biggest.",
    detailed: "Interactive 3D treemap visualization with depth cues and spatial navigation. Market structure analysis and sector allocation visualization.",
  },
  "Streamgraph": {
    simple: "This flowing chart shows how different groups of stocks have performed over time. It's like watching the popularity of different types of investments change.",
    detailed: "Stacked area visualization showing sector performance over time. Sector rotation patterns and momentum transition analysis.",
  },
  "AnalysisTabs": {
    simple: "These tabs let you see different types of analysis. Think of it like getting different expert opinions on the same stock.",
    detailed: "Multi-panel technical analysis with RSI, MACD, Stochastic, Williams %R, and CCI indicators. Signal compilation and confluence analysis.",
  },
  "TechnicalAnalysis": {
    simple: "This shows technical indicators - mathematical ways to predict where the price might go. Think of it like weather prediction but for stocks.",
    detailed: "Comprehensive technical indicator dashboard with RSI, MACD, Bollinger Bands, ATR, and custom indicators. Backtested signal performance.",
  },
  "NetworkGraph": {
    simple: "This shows how different stocks move together. Stocks connected by lines tend to go up and down at similar times.",
    detailed: "Stock correlation network visualization with adjustable correlation thresholds. Sector clustering and co-movement analysis.",
  },
  "ConfusionMatrixPlot": {
    simple: "This shows how good our predictions have been. The bigger the colored squares, the more accurate our predictions were.",
    detailed: "Machine learning model performance visualization. Precision, recall, F1-score metrics for forecast accuracy evaluation.",
  },
  "LagCorrelationPlot": {
    simple: "This shows how changes in one thing might predict changes in another. It helps find patterns that happen before big price moves.",
    detailed: "Temporal correlation analysis with configurable lag periods. Leading indicator discovery and causal relationship mapping.",
  },
  "DualAxisPlot": {
    simple: "This chart compares two different things at once. It helps you see if there's a relationship between them.",
    detailed: "Dual-axis charting with correlation coefficients. Multi-variable analysis and regression statistics.",
  },
  "default": {
    simple: "This chart shows important market information. Look for patterns in colors and sizes to understand what's happening.",
    detailed: "Advanced visualization with interactive data points. Hover for detailed metrics and configurable time ranges.",
  },
};

export default function ChartAnalysis({ chartType, isSimpleMode, data }: ChartAnalysisProps) {
  const analysis = analyses[chartType] || analyses["default"];

  return (
    <div className={`mt-4 p-4 rounded-lg ${isSimpleMode ? "bg-blue-50 border border-blue-100" : "bg-gray-50 border border-gray-200"}`}>
      <div className="flex items-start gap-2">
        <span className={`font-semibold ${isSimpleMode ? "text-blue-600" : "text-gray-600"}`}>
          {isSimpleMode ? "Simple" : "Detailed"}
        </span>
        <div>
          <p className={`text-sm ${isSimpleMode ? "text-blue-800" : "text-gray-700"}`}>
            {isSimpleMode ? analysis.simple : analysis.detailed}
          </p>
          {data && (
            <div className={`mt-2 text-xs ${isSimpleMode ? "text-blue-600" : "text-gray-500"}`}>
              Current: <span className="font-semibold">{data.value}</span>
              {data.change && (
                <span className={`ml-2 ${data.trend === "up" ? "text-green-600" : data.trend === "down" ? "text-red-600" : ""}`}>
                  {data.trend === "up" ? "+" : data.trend === "down" ? "-" : ""} {data.change}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}