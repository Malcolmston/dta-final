'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';
import '@asyncapi/react-component/styles/default.min.css';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const AsyncApiComponent = dynamic(
  () => import('@asyncapi/react-component').then((m) => m.default),
  { ssr: false, loading: () => <p className="p-6 text-sm" style={{ color: '#1f2937', opacity: 0.5 }}>Loading AsyncAPI docs…</p> },
);

type Tab = 'rest' | 'async' | 'cron' | 'webhook' | 'plots';

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
            {(['rest', 'async', 'cron', 'webhook', 'plots'] as Tab[]).map((t) => (
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
                {t === 'rest' ? 'REST API' : t === 'async' ? 'Async API' : t === 'cron' ? 'Cron Jobs' : t === 'webhook' ? 'Webhooks' : 'Plots'}
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
            {plotsContent ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {plotsContent}
              </ReactMarkdown>
            ) : (
              <p style={{ color: '#1f2937', opacity: 0.6 }}>Loading PLOTS.md...</p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}