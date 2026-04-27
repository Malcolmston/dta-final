'use client';

import { useState, useEffect, useRef } from 'react';
import mermaid from 'mermaid';

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
      className="my-6 p-4 rounded-lg overflow-x-auto"
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
    marginBottom: '1.5rem',
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
    marginBottom: '1.5rem',
    color: '#1f2937',
  };

  const h2Style: React.CSSProperties = {
    fontSize: '1.25rem',
    fontWeight: 600,
    marginTop: '2rem',
    marginBottom: '1rem',
    color: '#1f2937',
  };

  return (
    <div style={{ padding: '1.5rem', maxWidth: '56rem', margin: '0 auto', color: '#1f2937' }}>
      <h1 style={h1Style}>Dashboard Plots Documentation</h1>

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

      <h2 style={h2Style}>User Flow</h2>
      <MermaidDiagram code={`flowchart LR
    A["User Entry"] --> B{"Select Mode"}
    B -->|Simple| C[SIMPLE MODE]
    B -->|Detailed| D[DETAILED MODE]
    C --> C1[Basic Charts]
    C --> C2[Tooltips Only]
    D --> D1[Full Features]
    D --> D2[Interactive Controls]`} />

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

      <h2 style={h2Style}>Dashboard Sections</h2>
      <ul style={{ marginLeft: '1.5rem', marginBottom: '1.5rem', color: '#1f2937', lineHeight: 1.8 }}>
        <li><strong style={{ color: '#1f2937' }}>Overview</strong> - Landing page with Market Predictor, Portfolio Pie Chart, Candlestick Chart</li>
        <li><strong style={{ color: '#1f2937' }}>Trends</strong> - Historical price data, candlestick charts, volume charts, streamgraph, 3D price ribbon</li>
        <li><strong style={{ color: '#1f2937' }}>Factors</strong> - Economic factors, dual-axis plots, lag correlation</li>
        <li><strong style={{ color: '#1f2937' }}>Sectors</strong> - Heatmap, treemap visualizations</li>
        <li><strong style={{ color: '#1f2937' }}>Analysis</strong> - Technical indicators (RSI, MACD, Bollinger Bands), network graph</li>
        <li><strong style={{ color: '#1f2937' }}>Portfolio</strong> - Portfolio manager, holdings tracking, P&amp;L</li>
        <li><strong style={{ color: '#1f2937' }}>Wealth</strong> - Retirement calculator, goal tracking, risk metrics</li>
      </ul>

      <h2 style={h2Style}>Technical Stack</h2>
      <ul style={{ marginLeft: '1.5rem', color: '#1f2937', lineHeight: 1.8 }}>
        <li><strong style={{ color: '#1f2937' }}>Framework:</strong> Next.js 16 with App Router</li>
        <li><strong style={{ color: '#1f2937' }}>UI Library:</strong> React 19</li>
        <li><strong style={{ color: '#1f2937' }}>Charts:</strong> D3.js, Three.js (3D charts)</li>
        <li><strong style={{ color: '#1f2937' }}>Styling:</strong> Tailwind CSS v4</li>
        <li><strong style={{ color: '#1f2937' }}>Deployment:</strong> Vercel (Serverless Functions)</li>
      </ul>
    </div>
  );
}