'use client';

import { useState, useEffect, useRef } from 'react';
import mermaid from 'mermaid';

interface AnimatedBackgroundProps {
  particleCount?: number;
}

function AnimatedBackground({ particleCount = 30 }: AnimatedBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      opacity: number;
      char: string;
    }> = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const initParticles = () => {
      const chars = ['▲', '▼', '●', '◆', '★', '●', '▲', '▼'];
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          size: Math.random() * 20 + 10,
          opacity: Math.random() * 0.15 + 0.05,
          char: chars[Math.floor(Math.random() * chars.length)],
        });
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.font = `${p.size}px Arial`;
        ctx.fillStyle = `rgba(59, 130, 246, ${p.opacity})`;
        ctx.fillText(p.char, p.x, p.y);
      });

      animationId = requestAnimationFrame(animate);
    };

    resize();
    initParticles();
    animate();

    window.addEventListener('resize', () => {
      resize();
      initParticles();
    });

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, [particleCount]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none opacity-30"
      style={{ zIndex: 0 }}
    />
  );
}

interface ColorSwatchProps {
  hex: string;
}

function ColorSwatch({ hex }: ColorSwatchProps) {
  const isLight = (color: string) => {
    const hexColor = color.replace('#', '');
    const r = parseInt(hexColor.substr(0, 2), 16);
    const g = parseInt(hexColor.substr(2, 2), 16);
    const b = parseInt(hexColor.substr(4, 2), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 150;
  };

  return (
    <span
      className="inline-block w-6 h-6 rounded mr-2 align-middle border"
      style={{
        backgroundColor: hex,
        borderColor: isLight(hex) ? '#d1d5db' : 'transparent',
      }}
      title={hex}
    />
  );
}

interface MermaidDiagramProps {
  code: string;
}

function MermaidDiagram({ code }: MermaidDiagramProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>('');

  useEffect(() => {
    const renderDiagram = async () => {
      try {
        const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
        const { svg: renderedSvg } = await mermaid.render(id, code);
        const svgWithBg = renderedSvg.replace(/<svg/, '<svg style="background-color: #ffffff;"');
        setSvg(svgWithBg);
      } catch (err) {
        console.error('Mermaid render error:', err);
        setSvg(`<pre style="color: #ef4444;">Error rendering diagram</pre>`);
      }
    };
    renderDiagram();
  }, [code]);

  return (
    <div
      ref={ref}
      className="my-4 p-4 rounded-lg overflow-x-auto"
      style={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb' }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

export default function PlotsTab() {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'base',
      themeVariables: {
        background: '#ffffff',
        darkMode: false,
        primaryColor: '#3b82f6',
        primaryTextColor: '#fff',
        primaryBorderColor: '#3b82f6',
        lineColor: '#1f2937',
        secondaryColor: '#f3f4f6',
        tertiaryColor: '#f9fafb',
      },
      securityLevel: 'loose',
    });
    setInitialized(true);
  }, []);

  if (!initialized) {
    return (
      <div style={{ padding: '1.5rem', color: '#6b7280' }}>
        Loading diagrams...
      </div>
    );
  }

  const themeColors = [
    { name: 'Primary Blue', usage: 'Navigation highlights, primary buttons', hex: '#3b82f6' },
    { name: 'Primary Dark', usage: 'Dark mode primary', hex: '#60a5fa' },
    { name: 'Positive Green', usage: 'Gains, bullish signals', hex: '#22c55e' },
    { name: 'Negative Red', usage: 'Losses, bearish signals', hex: '#ef4444' },
    { name: 'Background Light', usage: 'Light mode background', hex: '#ffffff' },
    { name: 'Background Dark', usage: 'Dark mode background', hex: '#111827' },
    { name: 'Text Light', usage: 'Light mode text', hex: '#1f2937' },
    { name: 'Text Dark', usage: 'Dark mode text', hex: '#f9fafb' },
    { name: 'Grid Light', usage: 'Light mode grid lines', hex: '#e5e7eb' },
    { name: 'Grid Dark', usage: 'Dark mode grid lines', hex: '#374151' },
  ];

  const chartPalette = [
    { name: 'Teal 1', hex: '#14b8a6' },
    { name: 'Teal 2', hex: '#2dd4bf' },
    { name: 'Teal 3', hex: '#5eead4' },
    { name: 'Blue 1', hex: '#3b82f6' },
    { name: 'Blue 2', hex: '#60a5fa' },
    { name: 'Blue 3', hex: '#93c5fd' },
    { name: 'Purple 1', hex: '#8b5cf6' },
    { name: 'Purple 2', hex: '#a78bfa' },
    { name: 'Purple 3', hex: '#c4b5fd' },
  ];

  const heatmapGradient = [
    { performance: '> +5% (Deep Green)', hex: '#15803d' },
    { performance: '+2% to +5% (Green)', hex: '#22c55e' },
    { performance: '0% to +2% (Light Green)', hex: '#86efac' },
    { performance: '-2% to 0% (Light Red)', hex: '#fca5a5' },
    { performance: '-5% to -2% (Red)', hex: '#f87171' },
    { performance: '< -5% (Deep Red)', hex: '#dc2626' },
  ];

  const tableStyle: React.CSSProperties = {
    width: '100%',
    borderCollapse: 'collapse',
    marginBottom: '1rem',
  };

  const thStyle: React.CSSProperties = {
    border: '1px solid #e5e7eb',
    padding: '0.5rem 0.75rem',
    textAlign: 'left',
    backgroundColor: '#f9fafb',
    fontWeight: 600,
    color: '#1f2937',
  };

  const tdStyle: React.CSSProperties = {
    border: '1px solid #e5e7eb',
    padding: '0.5rem 0.75rem',
    color: '#1f2937',
  };

  const h1Style: React.CSSProperties = {
    fontSize: '1.5rem',
    fontWeight: 700,
    marginBottom: '1rem',
    marginTop: '1.5rem',
    color: '#1f2937',
  };

  const h2Style: React.CSSProperties = {
    fontSize: '1.125rem',
    fontWeight: 600,
    marginTop: '1.5rem',
    marginBottom: '0.75rem',
    color: '#1f2937',
  };

  const h3Style: React.CSSProperties = {
    fontSize: '1rem',
    fontWeight: 600,
    marginTop: '1rem',
    marginBottom: '0.5rem',
    color: '#374151',
  };

  const pStyle: React.CSSProperties = {
    color: '#1f2937',
    lineHeight: 1.6,
    marginBottom: '0.75rem',
  };

  const liStyle: React.CSSProperties = {
    color: '#1f2937',
    lineHeight: 1.8,
    marginBottom: '0.25rem',
  };

  const strongStyle: React.CSSProperties = {
    color: '#1f2937',
    fontWeight: 600,
  };

  return (
    <div style={{ padding: '1.5rem', maxWidth: '56rem', margin: '0 auto', color: '#1f2937', position: 'relative' }}>
      <AnimatedBackground particleCount={25} />
      <div style={{ position: 'relative', zIndex: 1 }}>
      <h1 style={{ ...h1Style, marginTop: 0 }}>Dashboard Plots Documentation</h1>

      {/* Dashboard Layout Diagram */}
      <h2 style={h2Style}>Dashboard Layout</h2>
      <MermaidDiagram code={`graph TB
    subgraph HEADER["HEADER - Top Bar"]
        direction LR
        Logo["Logo/Title"]
        Ticker["Ticker Search"]
        Mode["Simple/Detailed Toggle"]
        Theme["Theme Toggle"]
    end

    subgraph SIDEBAR["LEFT SIDEBAR"]
        direction TB
        O["Overview"]
        T["Trends"]
        F["Factors"]
        S["Sectors"]
        A["Analysis"]
        P["Portfolio"]
        W["Wealth"]
    end

    subgraph MAIN["MAIN CONTENT"]
        Charts["Charts & Visualizations"]
        Tables["Tables & Data"]
        Tools["Analysis Tools"]
    end

    HEADER --> SIDEBAR
    SIDEBAR --> MAIN

    style HEADER fill:#dbeafe,stroke:#3b82f6
    style SIDEBAR fill:#dcfce7,stroke:#22c55e
    style MAIN fill:#fef3c7,stroke:#f59e0b`} />

      {/* Project Report */}
      <h2 style={h2Style}>Project Report</h2>
      <h3 style={h3Style}>Bid Idea Worksheet</h3>
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>Question</th>
            <th style={thStyle}>Response</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={tdStyle}><strong style={strongStyle}>What problem does this dashboard solve?</strong></td>
            <td style={tdStyle}>Individual investors and financial enthusiasts need a unified, beginner-friendly interface to analyze stock market data, track portfolios, and make informed investment decisions.</td>
          </tr>
          <tr>
            <td style={tdStyle}><strong style={strongStyle}>Who is the target audience?</strong></td>
            <td style={tdStyle}>Individual investors, financial advisors, students learning finance, and researchers needing visual stock analysis tools.</td>
          </tr>
          <tr>
            <td style={tdStyle}><strong style={strongStyle}>What makes your approach unique?</strong></td>
            <td style={tdStyle}>Combines multiple analysis modes (simplified/detailed), integrates portfolio tracking with market analysis, and provides both traditional charts alongside 3D visualizations.</td>
          </tr>
        </tbody>
      </table>

      {/* Storyboard */}
      <h2 style={h2Style}>Storyboard</h2>
      <h3 style={h3Style}>Initial Brainstorming Sketches</h3>
      <MermaidDiagram code={`graph TD
    subgraph HEADER["HEADER"]
        Logo["Logo"]
        Ticker["Ticker Search"]
        ModeToggle["Simple/Detailed Toggle"]
        Theme["Theme Toggle"]
    end
    subgraph SIDEBAR["SIDEBAR"]
        Overview["Overview"]
        Trends["Trends"]
        Factors["Factors"]
        Sectors["Sectors"]
        Analysis["Analysis"]
        Portfolio["Portfolio"]
        Wealth["Wealth"]
    end
    subgraph MAIN["MAIN CONTENT AREA"]
        TabContent["Tab Content Charts, Tables, Tools"]
    end
    HEADER --- SIDEBAR --- MAIN
    ModeToggle -->|"Switch"| TabContent
    Theme -->|"Apply"| TabContent`} />

      {/* Creation Phase */}
      <h2 style={h2Style}>Creation Phase</h2>
      <p style={pStyle}>The dashboard concept emerged from collaborative brainstorming with AI, focusing on democratizing stock market analysis for retail investors.</p>
      <p style={pStyle}><strong style={strongStyle}>Key Decisions Made:</strong></p>
      <ul style={{ marginLeft: '1.5rem', marginBottom: '1rem' }}>
        <li style={liStyle}><strong style={strongStyle}>Dual-Mode Architecture</strong> - Create both "Simplified" and "Detailed" view modes</li>
        <li style={liStyle}><strong style={strongStyle}>Seven-Section Structure</strong> - Overview, Trends, Factors, Sectors, Analysis, Portfolio, Wealth</li>
        <li style={liStyle}><strong style={strongStyle}>Interactive Visualizations</strong> - D3.js for custom charts, Three.js for 3D</li>
        <li style={liStyle}><strong style={strongStyle}>Persistent Settings</strong> - localStorage for user preferences</li>
      </ul>

      {/* Before/After Comparison */}
      <h2 style={h2Style}>Before/After Comparison</h2>
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>Aspect</th>
            <th style={thStyle}>Before</th>
            <th style={thStyle}>After</th>
          </tr>
        </thead>
        <tbody>
          <tr><td style={tdStyle}>User Modes</td><td style={tdStyle}>Single view</td><td style={tdStyle}>Dual Simple/Detailed</td></tr>
          <tr><td style={tdStyle}>Chart Types</td><td style={tdStyle}>Basic line charts</td><td style={tdStyle}>Candlestick, heatmap, 3D</td></tr>
          <tr><td style={tdStyle}>Portfolio</td><td style={tdStyle}>Not planned</td><td style={tdStyle}>Full manager with P&amp;L</td></tr>
          <tr><td style={tdStyle}>Technical Indicators</td><td style={tdStyle}>Basic price only</td><td style={tdStyle}>RSI, MACD, Bollinger Bands</td></tr>
          <tr><td style={tdStyle}>Theme</td><td style={tdStyle}>Light only</td><td style={tdStyle}>Light/Dark toggle</td></tr>
          <tr><td style={tdStyle}>Navigation</td><td style={tdStyle}>Top tabs</td><td style={tdStyle}>Sidebar</td></tr>
        </tbody>
      </table>

      {/* Dashboard Sections */}
      <h2 style={h2Style}>Dashboard Sections</h2>

      <h3 style={h3Style}>Overview Tab</h3>
      <p style={pStyle}>Landing page introducing the tool and its benefits to new users.</p>
      <ul style={{ marginLeft: '1.5rem', marginBottom: '1rem' }}>
        <li style={liStyle}><strong style={strongStyle}>Market Predictor</strong> - Shows overall market sentiment</li>
        <li style={liStyle}><strong style={strongStyle}>Portfolio Pie Chart</strong> - Displays investment distribution</li>
        <li style={liStyle}><strong style={strongStyle}>Candlestick Chart</strong> - Simple price chart with period buttons</li>
      </ul>

      <h3 style={h3Style}>Trends Tab</h3>
      <p style={pStyle}>Display historical price data and trading activity.</p>
      <ul style={{ marginLeft: '1.5rem', marginBottom: '1rem' }}>
        <li style={liStyle}><strong style={strongStyle}>CandlestickChart</strong> - OHLC data, multiple time periods</li>
        <li style={liStyle}><strong style={strongStyle}>VolumeChart</strong> - Trading volume bars</li>
        <li style={liStyle}><strong style={strongStyle}>Streamgraph</strong> - Relative performance of multiple tickers</li>
        <li style={liStyle}><strong style={strongStyle}>PriceRibbon3D</strong> - 3D visualization of moving averages</li>
      </ul>

      <h3 style={h3Style}>Factors Tab</h3>
      <p style={pStyle}>Analyze economic and market factors affecting stock performance.</p>
      <ul style={{ marginLeft: '1.5rem', marginBottom: '1rem' }}>
        <li style={liStyle}><strong style={strongStyle}>MarketFactors</strong> - Valuation, Momentum, Quality, Size</li>
        <li style={liStyle}><strong style={strongStyle}>LagCorrelationPlot</strong> - Correlations over time</li>
        <li style={liStyle}><strong style={strongStyle}>DualAxisPlot</strong> - Compare two related metrics</li>
      </ul>

      <h3 style={h3Style}>Sectors Tab</h3>
      <p style={pStyle}>Visualize market performance across different sectors.</p>
      <ul style={{ marginLeft: '1.5rem', marginBottom: '1rem' }}>
        <li style={liStyle}><strong style={strongStyle}>Heatmap</strong> - Color-coded sector performance</li>
        <li style={liStyle}><strong style={strongStyle}>Treemap</strong> - Hierarchical market structure</li>
      </ul>

      <h3 style={h3Style}>Analysis Tab</h3>
      <p style={pStyle}>Deep technical analysis and stock relationship visualization.</p>
      <ul style={{ marginLeft: '1.5rem', marginBottom: '1rem' }}>
        <li style={liStyle}><strong style={strongStyle}>AnalysisTabs</strong> - Price, SMA, EMA, RSI, MACD, Bollinger Bands</li>
        <li style={liStyle}><strong style={strongStyle}>NetworkGraph</strong> - Stock relationships visualization</li>
        <li style={liStyle}><strong style={strongStyle}>ConfusionMatrixPlot</strong> - ML model performance</li>
      </ul>

      <h3 style={h3Style}>Portfolio Tab</h3>
      <p style={pStyle}>Manage investment portfolio with tracking and analysis tools.</p>
      <ul style={{ marginLeft: '1.5rem', marginBottom: '1rem' }}>
        <li style={liStyle}><strong style={strongStyle}>PortfolioManager</strong> - Add/remove holdings</li>
        <li style={liStyle}><strong style={strongStyle}>PortfolioPieChart</strong> - Asset distribution</li>
        <li style={liStyle}><strong style={strongStyle}>Treemap</strong> - Holdings visualization</li>
        <li style={liStyle}><strong style={strongStyle}>IncomeTrackingPanel</strong> - Dividend tracking</li>
      </ul>

      <h3 style={h3Style}>Wealth Tab</h3>
      <p style={pStyle}>Long-term wealth management and financial planning.</p>
      <ul style={{ marginLeft: '1.5rem', marginBottom: '1rem' }}>
        <li style={liStyle}><strong style={strongStyle}>InvestmentGoalsWizard</strong> - Risk tolerance assessment</li>
        <li style={liStyle}><strong style={strongStyle}>RetirementCalculator</strong> - Project retirement savings</li>
        <li style={liStyle}><strong style={strongStyle}>GoalTracking</strong> - Financial goal progress</li>
        <li style={liStyle}><strong style={strongStyle}>RiskMetricsPanel</strong> - Sharpe Ratio, Volatility, Beta, VaR</li>
        <li style={liStyle}><strong style={strongStyle}>BenchmarkComparison</strong> - S&amp;P 500, NASDAQ, Dow Jones</li>
      </ul>

      {/* Architecture Diagram */}
      <h2 style={h2Style}>Architecture Diagram</h2>
      <MermaidDiagram code={`graph TB
    subgraph Components["Dashboard Components"]
        H[Header]
        SB[Sidebar]
        OT[Overview Tab]
        TT[Trends Tab]
        FT[Factors Tab]
        SECT[Sectors Tab]
        AT[Analysis Tab]
        PT[Portfolio Tab]
        WT[Wealth Tab]
    end
    H --> SB
    SB --> OT
    SB --> TT
    SB --> FT
    SB --> SECT
    SB --> AT
    SB --> PT
    SB --> WT`} />

      {/* Theme Colors */}
      <h2 style={h2Style}>Theme Colors</h2>
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>Color Name</th>
            <th style={thStyle}>Usage</th>
            <th style={thStyle}>Hex</th>
          </tr>
        </thead>
        <tbody>
          {themeColors.map((color) => (
            <tr key={color.name}>
              <td style={tdStyle}>{color.name}</td>
              <td style={tdStyle}>{color.usage}</td>
              <td style={tdStyle}>
                <ColorSwatch hex={color.hex} />
                {color.hex}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Chart Palette */}
      <h2 style={h2Style}>Chart Palette (Sequential)</h2>
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>Color Name</th>
            <th style={thStyle}>Hex</th>
          </tr>
        </thead>
        <tbody>
          {chartPalette.map((color) => (
            <tr key={color.name}>
              <td style={tdStyle}>{color.name}</td>
              <td style={tdStyle}>
                <ColorSwatch hex={color.hex} />
                {color.hex}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Heatmap Gradient */}
      <h2 style={h2Style}>Heatmap Gradient</h2>
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>Performance</th>
            <th style={thStyle}>Hex</th>
          </tr>
        </thead>
        <tbody>
          {heatmapGradient.map((item) => (
            <tr key={item.performance}>
              <td style={tdStyle}>{item.performance}</td>
              <td style={tdStyle}>
                <ColorSwatch hex={item.hex} />
                {item.hex}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Theme Settings */}
      <h2 style={h2Style}>Theme and Settings</h2>
      <h3 style={h3Style}>Light Mode (Default)</h3>
      <ul style={{ marginLeft: '1.5rem', marginBottom: '1rem' }}>
        <li style={liStyle}>Background: #ffffff</li>
        <li style={liStyle}>Text: #1f2937</li>
        <li style={liStyle}>Primary: #3b82f6</li>
        <li style={liStyle}>Grid Lines: #e5e7eb</li>
      </ul>
      <h3 style={h3Style}>Dark Mode</h3>
      <ul style={{ marginLeft: '1.5rem', marginBottom: '1rem' }}>
        <li style={liStyle}>Background: #111827</li>
        <li style={liStyle}>Text: #f9fafb</li>
        <li style={liStyle}>Primary: #60a5fa</li>
        <li style={liStyle}>Grid Lines: #374151</li>
      </ul>

      {/* API Endpoints */}
      <h2 style={h2Style}>API Endpoints</h2>
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>Endpoint</th>
            <th style={thStyle}>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr><td style={tdStyle}><code>/api/health</code></td><td style={tdStyle}>Health check</td></tr>
          <tr><td style={tdStyle}><code>/api/stocks/history</code></td><td style={tdStyle}>Historical price data</td></tr>
          <tr><td style={tdStyle}><code>/api/stocks/signals</code></td><td style={tdStyle}>Trading signals</td></tr>
          <tr><td style={tdStyle}><code>/api/stocks/forecast</code></td><td style={tdStyle}>Price forecasts</td></tr>
          <tr><td style={tdStyle}><code>/api/stocks/growth</code></td><td style={tdStyle}>Growth metrics</td></tr>
          <tr><td style={tdStyle}><code>/api/stocks/momentum</code></td><td style={tdStyle}>Momentum indicators</td></tr>
          <tr><td style={tdStyle}><code>/api/heatmap</code></td><td style={tdStyle}>Sector heatmap data</td></tr>
        </tbody>
      </table>

      {/* Technical Stack */}
      <h2 style={h2Style}>Technical Stack</h2>
      <ul style={{ marginLeft: '1.5rem', marginBottom: '1.5rem' }}>
        <li style={liStyle}><strong style={strongStyle}>Framework:</strong> Next.js 16 with App Router</li>
        <li style={liStyle}><strong style={strongStyle}>UI Library:</strong> React 19</li>
        <li style={liStyle}><strong style={strongStyle}>Charts:</strong> D3.js, Three.js (3D charts)</li>
        <li style={liStyle}><strong style={strongStyle}>Styling:</strong> Tailwind CSS v4</li>
        <li style={liStyle}><strong style={strongStyle}>Deployment:</strong> Vercel (Serverless Functions)</li>
        <li style={liStyle}><strong style={strongStyle}>Package Manager:</strong> pnpm</li>
      </ul>

      {/* Disclaimers */}
      <h2 style={h2Style}>Important Disclaimers</h2>
      <ol style={{ marginLeft: '1.5rem', color: '#1f2937', lineHeight: 1.8 }}>
        <li style={liStyle}><strong style={strongStyle}>Data Accuracy</strong> - Stock data from Yahoo Finance. Verify critical data independently.</li>
        <li style={liStyle}><strong style={strongStyle}>Past Performance</strong> - Historical data does not guarantee future results.</li>
        <li style={liStyle}><strong style={strongStyle}>Not Financial Advice</strong> - For informational and educational purposes only.</li>
        <li style={liStyle}><strong style={strongStyle}>Real-Time Data</strong> - Data may have 15+ minute delays.</li>
      </ol>
      </div>
    </div>
  );
}