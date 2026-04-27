'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';
import '@asyncapi/react-component/styles/default.min.css';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import mermaid from 'mermaid';

const AsyncApiComponent = dynamic(
  () => import('@asyncapi/react-component').then((m) => m.default),
  { ssr: false, loading: () => <p className="p-6 text-sm" style={{ color: '#1f2937', opacity: 0.5 }}>Loading AsyncAPI docs…</p> },
);

// Initialize mermaid with white background
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

// Mermaid diagram renderer component
function MermaidDiagram({ code }: { code: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>('');

  useEffect(() => {
    const renderDiagram = async () => {
      try {
        // Clean up any init comments from the code
        const cleanCode = code.replace(/%%[\s\S]*?%%/g, '').trim();
        const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
        const { svg: renderedSvg } = await mermaid.render(id, cleanCode);
        // Inject white background
        const svgWithBg = renderedSvg.replace(/<svg/, '<svg style="background-color: #ffffff;"');
        setSvg(svgWithBg);
      } catch (err) {
        console.error('Mermaid render error:', err);
        setSvg(`<pre class="text-red-500">Error rendering diagram: ${err}</pre>`);
      }
    };
    renderDiagram();
  }, [code]);

  return (
    <div
      ref={ref}
      className="mermaid-diagram my-6 p-4 border rounded-lg overflow-x-auto"
      style={{ backgroundColor: '#ffffff', borderColor: '#e5e7eb' }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

// Color swatch component for hex codes
function ColorSwatch({ hex }: { hex: string }) {
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

// Custom components for ReactMarkdown
function MarkdownComponents() {
  return {
    code({ node, className, children, ...props }: any) {
      const match = /language-(\w+)/.exec(className || '');
      const codeString = String(children).replace(/\n$/, '');

      if (match && match[1] === 'mermaid') {
        return <MermaidDiagram code={codeString} />;
      }

      return (
        <code className={className} {...props}>
          {children}
        </code>
      );
    },
    td({ children, ...props }: any) {
      // Check if the cell content is a hex color
      const content = String(children);
      const hexMatch = content.match(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/);

      if (hexMatch) {
        return (
          <td {...props}>
            <ColorSwatch hex={hexMatch[0]} />
            {content}
          </td>
        );
      }

      return <td {...props}>{children}</td>;
    },
    th({ children, ...props }: any) {
      const content = String(children);
      const hexMatch = content.match(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/);

      if (hexMatch) {
        return (
          <th {...props}>
            <ColorSwatch hex={hexMatch[0]} />
            {content}
          </th>
        );
      }

      return <th {...props}>{children}</th>;
    },
  };
}

type Tab = 'rest' | 'async' | 'cron' | 'webhook' | 'plots' | 'layout';

export default function DocsPage() {
  const [tab, setTab] = useState<Tab>('rest');
  const [plotsContent, setPlotsContent] = useState<string>('');

  useEffect(() => {
    if (tab === 'plots' && !plotsContent) {
      fetch('/PLOTS.md')
        .then(res => res.text())
        .then(text => setPlotsContent(text))
        .catch(err => console.error('Failed to load PLOTS.md:', err));
    }
  }, [tab, plotsContent]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#ffffff', color: '#1f2937' }}>
      {/* Header */}
      <header
        className="border-b sticky top-0 z-40"
        style={{ backgroundColor: '#ffffff', borderColor: '#e5e7eb' }}
      >
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-2xl font-bold tracking-tight" style={{ color: '#1f2937' }}>
                API Documentation
              </h1>
              <p className="text-sm mt-0.5" style={{ color: '#1f2937', opacity: 0.6 }}>
                REST, Async API, Cron Jobs &amp; Webhooks reference
              </p>
            </div>
            <Link
              href="/"
              className="flex items-center gap-1.5 text-sm transition-opacity hover:opacity-100"
              style={{ color: '#1f2937', opacity: 0.6 }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Dashboard
            </Link>
          </div>

          {/* Tabs */}
          <nav className="flex gap-1 -mb-px" role="tablist" aria-label="Documentation sections">
            {(['rest', 'async', 'cron', 'webhook', 'plots', 'layout'] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                role="tab"
                aria-selected={tab === t}
                aria-controls={`panel-${t}`}
                className="px-5 py-2 text-sm font-medium border-b-2 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2"
                style={{
                  borderBottomColor: tab === t ? '#3b82f6' : 'transparent',
                  color: tab === t ? '#3b82f6' : '#1f2937',
                  opacity: tab === t ? 1 : 0.6,
                } as React.CSSProperties}
              >
                {t === 'rest' ? 'REST API' : t === 'async' ? 'Async API' : t === 'cron' ? 'Cron Jobs' : t === 'webhook' ? 'Webhooks' : t === 'plots' ? 'Plots' : 'Layout'}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Content */}
      <main className={`${tab === 'rest' || tab === 'cron' || tab === 'webhook' ? 'p-4' : ''}`}>
        {tab === 'rest' && (
          <div className="swagger-wrapper">
            <SwaggerUI url="/openapi.yml" />
          </div>
        )}

        {tab === 'cron' && (
          <div className="swagger-wrapper">
            <SwaggerUI url="/openapi-crons.yml" />
          </div>
        )}

        {tab === 'webhook' && (
          <div className="swagger-wrapper">
            <SwaggerUI url="/openapi-webhooks.yml" />
          </div>
        )}

        {tab === 'async' && (
          <div className="asyncapi-wrapper">
            <AsyncApiComponent
              schema={{ url: '/asyncapi.yml' }}
              config={{
                show: {
                  sidebar: true,
                  info: true,
                  servers: true,
                  operations: true,
                  messages: true,
                  schemas: true,
                  errors: true,
                },
                sidebar: { showOperations: 'byDefault' },
              }}
            />
            <style>{`
              .asyncapi-wrapper .aui-root .panel--right,
              .asyncapi-wrapper .aui-root [class*="panel-item--right"],
              .asyncapi-wrapper .aui-root [class*="right"],
              .asyncapi-wrapper .aui-root .operation-content,
              .asyncapi-wrapper .aui-root .message-content,
              .asyncapi-wrapper .aui-root .schema-content {
                display: none !important;
              }
            `}</style>
          </div>
        )}

        {tab === 'plots' && (
          <div className="p-6 max-w-4xl mx-auto" style={{ color: '#1f2937' }}>
            <style>{`
              .plots-content table {
                border-collapse: collapse;
                width: 100%;
                margin: 1rem 0;
              }
              .plots-content th,
              .plots-content td {
                border: 1px solid #e5e7eb;
                padding: 0.5rem 0.75rem;
                text-align: left;
              }
              .plots-content th {
                background-color: #f9fafb;
                font-weight: 600;
              }
              .plots-content tr:nth-child(even) {
                background-color: #f9fafb;
              }
              .plots-content h1,
              .plots-content h2,
              .plots-content h3 {
                margin-top: 1.5rem;
                margin-bottom: 0.75rem;
                font-weight: 700;
              }
              .plots-content p {
                margin-bottom: 1rem;
                line-height: 1.6;
              }
              .plots-content ul,
              .plots-content ol {
                margin-left: 1.5rem;
                margin-bottom: 1rem;
              }
              .plots-content li {
                margin-bottom: 0.25rem;
              }
            `}</style>
            {plotsContent ? (
              <div className="plots-content">
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={MarkdownComponents()}>
                  {plotsContent}
                </ReactMarkdown>
              </div>
            ) : (
              <p style={{ color: '#1f2937', opacity: 0.6 }}>Loading PLOTS.md...</p>
            )}
          </div>
        )}

                {tab === 'layout' && (
          <div className="h-[calc(100vh-8rem)] p-4">
            <div className="h-full rounded-lg border border-gray-200 overflow-hidden">
              <iframe
                src="https://app.diagrams.net/?lightbox=1&highlight=0000ff&edit=_blank&layers=1&nav=1&title=dashboard-layout.drawio#Uhttps%3A%2F%2Fstock-henna-six.vercel.app%2Fdashboard-layout.drawio"
                className="w-full h-full"
                title="Dashboard Layout"
              />
            </div>
            <p className="text-sm text-gray-500 mt-2 text-center">
              Download: <a href="/dashboard-layout.drawio" className="text-blue-600 hover:underline">dashboard-layout.drawio</a>
            </p>
          </div>
        )}

      </main>
    </div>
  );
}