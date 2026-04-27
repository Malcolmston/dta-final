'use client';

import { useEffect, useState, useRef } from 'react';
import mermaid from 'mermaid';

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

export default function LayoutTab() {
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

  const containerStyle: React.CSSProperties = {
    padding: '1.5rem',
    maxWidth: '56rem',
    margin: '0 auto',
    color: '#1f2937',
  };

  const h1Style: React.CSSProperties = {
    fontSize: '1.5rem',
    fontWeight: 700,
    marginBottom: '1.5rem',
    color: '#1f2937',
  };

  const h2Style: React.CSSProperties = {
    fontSize: '1.125rem',
    fontWeight: 600,
    marginTop: '1.5rem',
    marginBottom: '0.75rem',
    color: '#1f2937',
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

  const downloadStyle: React.CSSProperties = {
    display: 'inline-block',
    padding: '0.75rem 1.5rem',
    backgroundColor: '#3b82f6',
    color: '#ffffff',
    borderRadius: '0.5rem',
    textDecoration: 'none',
    fontWeight: 500,
    marginTop: '1rem',
  };

  return (
    <div style={containerStyle}>
      <h1 style={h1Style}>Dashboard Layout</h1>

      <p style={pStyle}>
        The Stock Market Dashboard uses a sidebar-based navigation layout with a header for controls.
        Below is a visual representation of the dashboard structure.
      </p>

      {/* Main Layout Diagram */}
      <h2 style={h2Style}>Layout Structure</h2>
      <MermaidDiagram code={`graph TB
    subgraph HEADER["HEADER - Top Bar"]
        direction LR
        Logo["Logo/Title"]
        Ticker["Ticker Search"]
        Mode["Simple/Detailed Toggle"]
        Theme["Theme Toggle"]
    end

    subgraph SIDEBAR["LEFT SIDEBAR - Navigation"]
        direction TB
        O["Overview"]
        T["Trends"]
        F["Factors"]
        S["Sectors"]
        A["Analysis"]
        P["Portfolio"]
        W["Wealth"]
    end

    subgraph MAIN["MAIN CONTENT AREA"]
        direction TB
        Charts["Charts & Visualizations"]
        Tables["Tables & Data"]
        Tools["Analysis Tools"]
    end

    HEADER --> SIDEBAR
    SIDEBAR --> MAIN

    style HEADER fill:#dbeafe,stroke:#3b82f6
    style SIDEBAR fill:#dcfce7,stroke:#22c55e
    style MAIN fill:#fef3c7,stroke:#f59e0b`} />

      {/* Component Details */}
      <h2 style={h2Style}>Header Components</h2>
      <ul style={{ marginLeft: '1.5rem', marginBottom: '1rem' }}>
        <li style={liStyle}><strong style={strongStyle}>Logo/Title</strong> - App branding</li>
        <li style={liStyle}><strong style={strongStyle}>Ticker Search</strong> - Search and select stock symbols</li>
        <li style={liStyle}><strong style={strongStyle}>Simple/Detailed Toggle</strong> - Switch between view modes</li>
        <li style={liStyle}><strong style={strongStyle}>Theme Toggle</strong> - Switch between light/dark mode</li>
      </ul>

      <h2 style={h2Style}>Sidebar Navigation</h2>
      <p style={pStyle}>The sidebar provides quick access to 7 main sections:</p>
      <ul style={{ marginLeft: '1.5rem', marginBottom: '1rem' }}>
        <li style={liStyle}><strong style={strongStyle}>Overview</strong> - Landing page with key metrics</li>
        <li style={liStyle}><strong style={strongStyle}>Trends</strong> - Price charts and historical data</li>
        <li style={liStyle}><strong style={strongStyle}>Factors</strong> - Market factor analysis</li>
        <li style={liStyle}><strong style={strongStyle}>Sectors</strong> - Sector performance visualization</li>
        <li style={liStyle}><strong style={strongStyle}>Analysis</strong> - Technical analysis tools</li>
        <li style={liStyle}><strong style={strongStyle}>Portfolio</strong> - Investment portfolio management</li>
        <li style={liStyle}><strong style={strongStyle}>Wealth</strong> - Financial planning tools</li>
      </ul>

      <h2 style={h2Style}>Main Content Area</h2>
      <p style={pStyle}>The main content area displays different content based on the selected sidebar section:</p>
      <ul style={{ marginLeft: '1.5rem', marginBottom: '1.5rem' }}>
        <li style={liStyle}><strong style={strongStyle}>Charts & Visualizations</strong> - D3.js charts, 3D visualizations, heatmaps</li>
        <li style={liStyle}><strong style={strongStyle}>Tables & Data</strong> - Stock data, portfolio holdings, metrics</li>
        <li style={liStyle}><strong style={strongStyle}>Analysis Tools</strong> - Calculators, goal trackers, risk analyzers</li>
      </ul>

      {/* Color Legend */}
      <h2 style={h2Style}>Color Legend</h2>
      <ul style={{ marginLeft: '1.5rem', marginBottom: '1.5rem' }}>
        <li style={liStyle}><span style={{ display: 'inline-block', width: '12px', height: '12px', backgroundColor: '#dbeafe', border: '1px solid #3b82f6', marginRight: '8px' }}></span><strong style={strongStyle}>Header</strong> - Blue: App controls and branding</li>
        <li style={liStyle}><span style={{ display: 'inline-block', width: '12px', height: '12px', backgroundColor: '#dcfce7', border: '1px solid #22c55e', marginRight: '8px' }}></span><strong style={strongStyle}>Sidebar</strong> - Green: Navigation</li>
        <li style={liStyle}><span style={{ display: 'inline-block', width: '12px', height: '12px', backgroundColor: '#fef3c7', border: '1px solid #f59e0b', marginRight: '8px' }}></span><strong style={strongStyle}>Main</strong> - Yellow: Content area</li>
      </ul>

      {/* Download Link */}
      <div style={{ marginTop: '2rem', padding: '1.5rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem', textAlign: 'center' }}>
        <p style={{ marginBottom: '1rem', color: '#1f2937' }}>
          Download the full dashboard layout diagram to edit in diagrams.net
        </p>
        <a href="/dashboard-layout.drawio" style={downloadStyle}>
          Download dashboard-layout.drawio
        </a>
      </div>
    </div>
  );
}