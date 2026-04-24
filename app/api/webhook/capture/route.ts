import { NextRequest, NextResponse } from "next/server";
import { rateLimit, getClientIp } from "@/lib/rateLimit";

const CHART_COMPONENTS: Record<string, string> = {
  candlestick: "CandlestickChart",
  candlestick3d: "Candlestick3DChart",
  heatmap: "Heatmap",
  volume: "VolumeChart",
  volume3d: "Volume3DBars",
  streamgraph: "Streamgraph",
  network: "NetworkGraph",
  correlation: "CorrelationMatrix",
  lag: "LagCorrelationPlot",
  portfolioage: "PortfolioAgeAnimation",
  benchmark: "BenchmarkComparison",
  cashflow: "CashFlowTracking",
  dualaxis: "DualAxisPlot",
  forecast: "MarketPredictor",
  signals: "TradingSignals",
  momentum: "MomentumIndicators",
  treemap: "Treemap",
  treemap3d: "Treemap3DBoxes",
  pie: "PortfolioPieChart",
  diversification: "DiversificationAnalyzer",
  risk: "RiskMetricsPanel",
  retirement: "RetirementCalculator",
  price3d: "PriceRibbon3D",
  rebalancing: "RebalancingAlerts",
  income: "IncomeTrackingPanel",
  assetallocation: "AssetAllocation",
  simplified: "SimplifiedChart",
  technical: "TechnicalAnalysis",
  confusion: "ConfusionMatrixPlot",
};

export async function GET(request: NextRequest) {
  const clientIp = getClientIp(request);
  const limit = rateLimit(`webhook-capture-${clientIp}`, { windowMs: 60000, maxRequests: 50 });

  if (!limit.success) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers: { "Retry-After": String(Math.ceil((limit.resetTime - Date.now()) / 1000)) } }
    );
  }

  const { searchParams } = new URL(request.url);
  const chartName = searchParams.get("chart")?.toLowerCase();
  const format = searchParams.get("format") || "png";
  const tickersParam = searchParams.get("symbol")?.toUpperCase() || "AAPL";
  const tickers = tickersParam.split(",").map(t => t.trim()).filter(t => t);
  const symbol = tickers[0];
  // Translate "all" to "max" for Yahoo Finance
  const rawPeriod = searchParams.get("period") || "1y";
  const period = rawPeriod === "all" ? "max" : rawPeriod;
  const interval = searchParams.get("interval") || "1d";
  const width = searchParams.get("width") || "800";
  const height = searchParams.get("height") || "400";
  const theme = searchParams.get("theme") || "dark";
  const title = searchParams.get("title") || decodeURIComponent(searchParams.get("title") || "");

  if (!chartName || !CHART_COMPONENTS[chartName]) {
    return NextResponse.json(
      { error: "Invalid chart name", availableCharts: Object.keys(CHART_COMPONENTS) },
      { status: 400 }
    );
  }

  const componentName = CHART_COMPONENTS[chartName];

  // Return HTML page that captures the chart
  const bgColor = theme === "light" ? "#ffffff" : "#0f172a";
  const textColor = theme === "light" ? "#1f2937" : "#ffffff";

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Export ${componentName}</title>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: ${bgColor};
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .loading {
      color: ${textColor};
      font-size: 18px;
      text-align: center;
    }
    .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid #334155;
      border-top-color: #3b82f6;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 20px auto;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    #chart-container {
      background: ${bgColor};
      padding: 20px;
      border-radius: 12px;
    }
    .error { color: #ef4444; background: #1e1e1e; padding: 20px; border-radius: 8px; }
  </style>
</head>
<body>
  <div class="loading" id="loading">
    <div class="spinner"></div>
    <p>Loading ${componentName} for ${symbol}...</p>
  </div>
  <div id="error" style="display:none;"></div>
  <div id="chart-container"></div>

  <script>
    const CHART_NAME = "${chartName}";
    const FORMAT = "${format}";
    const TICKERS = "${tickers}";
    const SYMBOL = TICKERS.split(",")[0];
    const PERIOD = "${period}";
    const INTERVAL = "${interval}";
    const WIDTH = ${width};
    const HEIGHT = ${height};
    const THEME = "${theme}";
    const CUSTOM_TITLE = "${title}";

    // Theme colors from server
    const BG_COLOR = "${bgColor}";
    const TEXT_COLOR = "${textColor}";

    async function loadChart() {
      try {
        // Fetch chart data
        const historyRes = await fetch(\`/api/stocks/history?symbol=\${SYMBOL}&period=\${PERIOD}\`);
        const historyData = await historyRes.json();

        // Render the chart inline based on chart type
        const container = document.getElementById('chart-container');

        if (CHART_NAME === 'candlestick') {
          container.innerHTML = await renderCandlestick(historyData, SYMBOL);
        } else if (CHART_NAME === 'heatmap') {
          container.innerHTML = await renderHeatmap(SYMBOL, PERIOD);
        } else if (CHART_NAME === 'volume') {
          container.innerHTML = await renderVolume(historyData, SYMBOL);
        } else if (CHART_NAME === 'signals') {
          container.innerHTML = await renderSignals(SYMBOL);
        } else if (CHART_NAME === 'momentum') {
          container.innerHTML = await renderMomentum(SYMBOL, PERIOD);
        } else if (CHART_NAME === 'forecast') {
          container.innerHTML = await renderForecast(SYMBOL, PERIOD);
        } else {
          container.innerHTML = '<div style="color:#fff;padding:40px;"><h2>' + CHART_NAME + ' - ' + SYMBOL + '</h2><p>Chart: ' + CHART_NAME + '</p><p>Period: ' + PERIOD + '</p></div>';
        }

        document.getElementById('loading').style.display = 'none';

        // Wait for render then capture
        await new Promise(r => setTimeout(r, 1500));
        await captureAndDownload();
      } catch (err) {
        document.getElementById('loading').style.display = 'none';
        document.getElementById('error').style.display = 'block';
        document.getElementById('error').className = 'error';
        document.getElementById('error').textContent = 'Error: ' + err.message;
      }
    }

    async function renderCandlestick(data, symbol) {
      if (!data.data || data.data.length === 0) return '<div style="color:' + TEXT_COLOR + ';">No data</div>';

      const prices = data.data.map(d => ({
        date: new Date(d.date).toLocaleDateString(),
        open: d.open, high: d.high, low: d.low, close: d.close
      }));

      const width = WIDTH, height = HEIGHT;
      const candleW = Math.max(2, width / prices.length - 2);

      let svg = '<svg width="' + width + '" height="' + height + '" style="background:' + BG_COLOR + ';font-family:system-ui;">';

      if (CUSTOM_TITLE) {
        svg += '<text x="' + (width/2) + '" y="25" fill="' + TEXT_COLOR + '" font-size="18" font-weight="bold" text-anchor="middle">' + CUSTOM_TITLE + '</text>';
      }

      // Find min/max
      const minP = Math.min(...prices.flatMap(p => p.low));
      const maxP = Math.max(...prices.flatMap(p => p.high));
      const range = maxP - minP || 1;

      const scale = (p) => height - 30 - ((p - minP) / range) * (height - 60);

      prices.forEach((p, i) => {
        const x = 30 + (i / prices.length) * (width - 60);
        const isUp = p.close >= p.open;
        const color = isUp ? '#22c55e' : '#ef4444';

        // Wick
        svg += '<line x1="' + (x + candleW/2) + '" y1="' + scale(p.high) + '" x2="' + (x + candleW/2) + '" y2="' + scale(p.low) + '" stroke="' + color + '" stroke-width="1"/>';
        // Body
        const bodyTop = scale(Math.max(p.open, p.close));
        const bodyBottom = scale(Math.min(p.open, p.close));
        const bodyH = Math.max(1, bodyBottom - bodyTop);
        svg += '<rect x="' + x + '" y="' + bodyTop + '" width="' + candleW + '" height="' + bodyH + '" fill="' + color + '"/>';
      });

      // Axes
      svg += '<line x1="30" y1="' + (height-30) + '" x2="' + (width-30) + '" y2="' + (height-30) + '" stroke="#475569"/>';
      svg += '<line x1="30" y1="30" x2="30" y2="' + (height-30) + '" stroke="#475569"/>';

      // Labels
      svg += '<text x="' + (width/2) + '" y="' + (height-5) + '" fill="#94a3b8" font-size="12" text-anchor="middle">' + symbol + ' - ' + PERIOD + '</text>';
      svg += '<text x="15" y="' + (height/2) + '" fill="#94a3b8" font-size="12" transform="rotate(-90,15,' + (height/2) + ')">Price</text>';
      svg += '</svg>';

      return svg;
    }

    async function renderHeatmap(symbol, period) {
      // Get sector heatmap data
      const tickersList = TICKERS.split(",").filter(t => t);
      const res = await fetch('/api/heatmap?tickers=' + encodeURIComponent(tickersList.join(",")));
      const data = await res.json();

      const tickers = tickersList.length > 0 ? tickersList : Object.keys(data || {}).slice(0, 12);

      let svg = '<svg width="' + WIDTH + '" height="' + HEIGHT + '" style="background:' + BG_COLOR + ';font-family:system-ui;">';

      if (CUSTOM_TITLE) {
        svg += '<text x="' + (WIDTH/2) + '" y="30" fill="' + TEXT_COLOR + '" font-size="18" font-weight="bold" text-anchor="middle">' + CUSTOM_TITLE + '</text>';
      } else {
        svg += '<text x="20" y="30" fill="' + TEXT_COLOR + '" font-size="16" font-weight="bold">Heatmap - ' + TICKERS + '</text>';
      }

      const cellW = (WIDTH - 40) / 4;
      const cellH = (HEIGHT - 80) / 3;

      tickers.forEach((t, i) => {
        const change = (data[t]?.change || 0);
        const color = change >= 0 ?
          'rgb(34,197,94)' : 'rgb(239,68,68)';
        const opacity = Math.min(1, Math.abs(change) / 20);

        const col = i % 4;
        const row = Math.floor(i / 4);
        const x = 20 + col * cellW;
        const y = 50 + row * cellH;

        svg += '<rect x="' + x + '" y="' + y + '" width="' + (cellW-5) + '" height="' + (cellH-5) + '" fill="' + color + '" fill-opacity="' + (0.3 + opacity*0.5) + '" rx="4"/>';
        svg += '<text x="' + (x+cellW/2-5) + '" y="' + (y+cellH/2) + '" fill="#fff" font-size="14" text-anchor="middle">' + t + '</text>';
        svg += '<text x="' + (x+cellW/2-5) + '" y="' + (y+cellH/2+18) + '" fill="#fff" font-size="12" text-anchor="middle">' + change.toFixed(1) + '%</text>';
      });

      svg += '</svg>';
      return svg;
    }

    async function renderVolume(data, symbol) {
      if (!data.data || data.data.length === 0) return '<div style="color:#fff;">No data</div>';

      const volumes = data.data.map(d => ({ date: new Date(d.date).toLocaleDateString(), volume: d.volume, close: d.close }));
      const width = 800, height = 300;

      let svg = '<svg width="' + width + '" height="' + height + '" style="background:#0f172a;font-family:system-ui;">';
      svg += '<text x="20" y="30" fill="#fff" font-size="16">Volume - ' + symbol + '</text>';

      const maxV = Math.max(...volumes.map(v => v.volume));

      volumes.forEach((v, i) => {
        const x = 50 + (i / volumes.length) * (width - 100);
        const barH = (v.volume / maxV) * (height - 60);
        const color = v.close >= 0 ? '#22c55e' : '#ef4444';

        svg += '<rect x="' + x + '" y="' + (height-30-barH) + '" width="' + Math.max(1, width/volumes.length-2) + '" height="' + barH + '" fill="' + color + '" fill-opacity="0.7"/>';
      });

      svg += '<line x1="50" y1="' + (height-30) + '" x2="' + (width-50) + '" y2="' + (height-30) + '" stroke="#475569"/>';
      svg += '</svg>';
      return svg;
    }

    async function renderSignals(symbol) {
      const res = await fetch('/api/stocks/signals?symbol=' + symbol);
      const signals = await res.json();

      const width = 600, height = 300;
      let svg = '<svg width="' + width + '" height="' + height + '" style="background:#0f172a;font-family:system-ui;">';
      svg += '<text x="20" y="30" fill="#fff" font-size="16">Trading Signals - ' + symbol + '</text>';

      const signalTypes = signals?.signals || ['SMA','RSI','MACD'];
      const colors = ['#3b82f6','#22c55e','#f97316','#a855f7','#ef4444'];

      signalTypes.forEach((s, i) => {
        const y = 60 + i * 40;
        svg += '<circle cx="40" cy="' + y + '" r="8" fill="' + colors[i%colors.length] + '"/>';
        svg += '<text x="60" y="' + (y+5) + '" fill="#fff" font-size="14">' + (s.signal || s.name || s) + '</text>';
      });

      svg += '</svg>';
      return svg;
    }

    async function renderMomentum(symbol, period) {
      const res = await fetch('/api/stocks/momentum?symbol=' + symbol + '&period=' + period);
      const data = await res.json();

      const width = 700, height = 350;
      let svg = '<svg width="' + width + '" height="' + height + '" style="background:#0f172a;font-family:system-ui;">';
      svg += '<text x="20" y="30" fill="#fff" font-size="16">Momentum - ' + symbol + '</text>';

      const metrics = data?.metrics || { rsi: 55, macd: 0.5, roc: 5 };

      Object.entries(metrics).forEach(([key, val], i) => {
        const y = 70 + i * 60;
        svg += '<text x="30" y="' + y + '" fill="#94a3b8" font-size="14">' + key.toUpperCase() + '</text>';
        svg += '<text x="150" y="' + y + '" fill="#fff" font-size="20" font-weight="bold">' + (typeof val === 'number' ? val.toFixed(2) : val) + '</text>';
        svg += '<rect x="250" y="' + (y-15) + '" width="200" height="20" fill="#1e293b" rx="4"/>';
        const barW = Math.min(200, Math.abs(val) * 2);
        const color = val >= 0 ? '#22c55e' : '#ef4444';
        svg += '<rect x="250" y="' + (y-15) + '" width="' + barW + '" height="20" fill="' + color + '" rx="4"/>';
      });

      svg += '</svg>';
      return svg;
    }

    async function renderForecast(symbol, period) {
      const res = await fetch('/api/stocks/forecast?ticker=' + symbol + '&period=' + period);
      const data = await res.json();

      const width = 700, height = 350;
      let svg = '<svg width="' + width + '" height="' + height + '" style="background:#0f172a;font-family:system-ui;">';
      svg += '<text x="20" y="30" fill="#fff" font-size="16">Market Predictor - ' + symbol + '</text>';

      const signal = data?.signal || 'HOLD';
      const confidence = data?.confidence || 50;
      const color = signal === 'BUY' ? '#22c55e' : signal === 'SELL' ? '#ef4444' : '#f59e0b';

      svg += '<text x="350" y="120" fill="' + color + '" font-size="48" font-weight="bold" text-anchor="middle">' + signal + '</text>';
      svg += '<text x="350" y="160" fill="#fff" font-size="18" text-anchor="middle">Confidence: ' + confidence + '%</text>';

      if (data?.prediction) {
        svg += '<text x="350" y="200" fill="#94a3b8" font-size="14" text-anchor="middle">Prediction: ' + data.prediction.price?.toFixed(2) + '</text>';
      }

      svg += '</svg>';
      return svg;
    }

    async function captureAndDownload() {
      const container = document.getElementById('chart-container');

      try {
        const canvas = await html2canvas(container, {
          backgroundColor: '#0f172a',
          scale: 2
        });

        const link = document.createElement('a');
        link.download = CHART_NAME + '_' + SYMBOL + '.' + FORMAT;

        if (FORMAT === 'png') {
          link.href = canvas.toDataURL('image/png');
        } else if (FORMAT === 'webp') {
          link.href = canvas.toDataURL('image/webp');
        } else {
          link.href = canvas.toDataURL('image/jpeg', 0.95);
        }

        link.click();

        // Show success
        const loading = document.getElementById('loading');
        loading.innerHTML = '<p style="color:#22c55e;font-size:18px;">✓ Chart downloaded!</p>';
        loading.style.display = 'block';
      } catch(err) {
        document.getElementById('error').style.display = 'block';
        document.getElementById('error').className = 'error';
        document.getElementById('error').textContent = 'Capture failed: ' + err.message;
      }
    }

    loadChart();
  </script>
</body>
</html>
  `.trim();

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html",
      "Cache-Control": "no-store",
    },
  });
}