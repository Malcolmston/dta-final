'use client';

import { useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';
import '@asyncapi/react-component/styles/default.min.css';
import { useColorPalette } from '../context/ColorPaletteContext';

const AsyncApiComponent = dynamic(
  () => import('@asyncapi/react-component').then((m) => m.default),
  { ssr: false, loading: () => <p className="p-6 text-sm" style={{ color: 'var(--foreground)', opacity: 0.5 }}>Loading AsyncAPI docs…</p> },
);

type Tab = 'rest' | 'async' | 'cron' | 'webhook';

export default function DocsPage() {
  const [tab, setTab] = useState<Tab>('rest');
  const { palette } = useColorPalette();

  return (
    <div className="min-h-screen transition-colors duration-300" style={{ backgroundColor: palette.background, color: palette.text }}>

      {/* Header — mirrors the main app header style */}
      <header
        className="border-b sticky top-0 z-40 transition-colors duration-300"
        style={{ backgroundColor: palette.background, borderColor: palette.gridLines }}
      >
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-2xl font-bold tracking-tight" style={{ color: palette.text }}>
                API Documentation
              </h1>
              <p className="text-sm mt-0.5" style={{ color: palette.text, opacity: 0.6 }}>
                REST, Async API, Cron Jobs &amp; Webhooks reference
              </p>
            </div>
            <Link
              href="/"
              className="flex items-center gap-1.5 text-sm transition-opacity hover:opacity-100"
              style={{ color: palette.text, opacity: 0.6 }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Dashboard
            </Link>
          </div>

          {/* Tabs */}
          <nav className="flex gap-1 -mb-px">
            {(['rest', 'async', 'cron', 'webhook'] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className="px-5 py-2 text-sm font-medium border-b-2 transition-colors"
                style={{
                  borderBottomColor: tab === t ? palette.primary : 'transparent',
                  color: tab === t ? palette.primary : palette.text,
                  opacity: tab === t ? 1 : 0.6,
                }}
              >
                {t === 'rest' ? 'REST API' : t === 'async' ? 'Async API' : t === 'cron' ? 'Cron Jobs' : 'Webhooks'}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Content */}
      <div className={tab === 'rest' || tab === 'cron' ? 'p-4' : ''}>
        {tab === 'rest' && <SwaggerUI url="/openapi.yml" />}
        {tab === 'cron' && <SwaggerUI url="/openapi-crons.yml" />}

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
          </div>
        )}

        {tab === 'webhook' && <SwaggerUI url="/openapi-webhooks.yml" />}
      </div>

      <style>{`
        /* ── Layout ── */
        .asyncapi-wrapper {
          min-height: calc(100vh - 113px);
          display: flex;
          flex-direction: column;
        }
        .asyncapi-wrapper > * { flex: 1; }

        /* ── Root font & background ── */
        .asyncapi-wrapper .aui-root {
          font-family: var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif !important;
          background-color: ${palette.background} !important;
          color: ${palette.text} !important;
        }

        /* ── Sidebar ── */
        .asyncapi-wrapper .aui-root .sidebar,
        .asyncapi-wrapper .aui-root .sidebar--wrapper {
          background-color: ${palette.background} !important;
          border-right: 1px solid ${palette.gridLines} !important;
          box-shadow: none !important;
        }
        .asyncapi-wrapper .aui-root .sidebar--content {
          background-color: ${palette.background} !important;
        }
        .asyncapi-wrapper .aui-root .bg-gray-200 {
          background-color: ${palette.background} !important;
        }

        /* ── Sidebar nav items ── */
        .asyncapi-wrapper .aui-root .sidebar a,
        .asyncapi-wrapper .aui-root .sidebar button,
        .asyncapi-wrapper .aui-root .sidebar span {
          color: ${palette.text} !important;
          font-family: var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif !important;
        }
        .asyncapi-wrapper .aui-root .hover\\:bg-gray-700:hover,
        .asyncapi-wrapper .aui-root .hover\\:bg-gray-100:hover {
          background-color: ${palette.gridLines} !important;
        }
        .asyncapi-wrapper .aui-root .border-gray-400,
        .asyncapi-wrapper .aui-root .border-gray-300 {
          border-color: ${palette.gridLines} !important;
        }

        /* ── Main content backgrounds ── */
        .asyncapi-wrapper .aui-root .bg-white,
        .asyncapi-wrapper .aui-root .bg-gray-50 {
          background-color: ${palette.background} !important;
        }
        .asyncapi-wrapper .aui-root .bg-gray-100 {
          background-color: ${palette.gridLines}55 !important;
        }

        /* ── All text classes ── */
        .asyncapi-wrapper .aui-root .text-white {
          color: ${palette.text} !important;
        }
        .asyncapi-wrapper .aui-root .text-gray-900,
        .asyncapi-wrapper .aui-root .text-gray-800,
        .asyncapi-wrapper .aui-root .text-gray-700 {
          color: ${palette.text} !important;
        }
        .asyncapi-wrapper .aui-root .text-gray-600,
        .asyncapi-wrapper .aui-root .text-gray-500 {
          color: ${palette.text} !important;
          opacity: 0.65;
        }
        .asyncapi-wrapper .aui-root .text-gray-400,
        .asyncapi-wrapper .aui-root .text-gray-300,
        .asyncapi-wrapper .aui-root .text-gray-200 {
          color: ${palette.text} !important;
          opacity: 0.45;
        }
        .asyncapi-wrapper .aui-root .prose,
        .asyncapi-wrapper .aui-root p,
        .asyncapi-wrapper .aui-root h1,
        .asyncapi-wrapper .aui-root h2,
        .asyncapi-wrapper .aui-root h3,
        .asyncapi-wrapper .aui-root h4 {
          color: ${palette.text} !important;
        }

        /* ── Borders ── */
        .asyncapi-wrapper .aui-root .border-gray-200,
        .asyncapi-wrapper .aui-root .border-gray-300 {
          border-color: ${palette.gridLines} !important;
        }
        .asyncapi-wrapper .aui-root .divide-gray-200 > * + * {
          border-color: ${palette.gridLines} !important;
        }

        /* ── Accent / badge colors → palette primary ── */
        .asyncapi-wrapper .aui-root .bg-blue-500,
        .asyncapi-wrapper .aui-root .bg-blue-600 {
          background-color: ${palette.primary} !important;
        }
        .asyncapi-wrapper .aui-root .text-blue-500,
        .asyncapi-wrapper .aui-root .text-blue-600 {
          color: ${palette.primary} !important;
        }
        .asyncapi-wrapper .aui-root .border-blue-600 {
          border-color: ${palette.primary} !important;
        }

        /* ── Code blocks: keep dark for readability (same as Swagger) ── */
        .asyncapi-wrapper .aui-root .bg-gray-800,
        .asyncapi-wrapper .aui-root .bg-gray-900 {
          background-color: #1e2433 !important;
        }
        .asyncapi-wrapper .aui-root .bg-gray-800 .text-white,
        .asyncapi-wrapper .aui-root .bg-gray-800 span,
        .asyncapi-wrapper .aui-root .bg-gray-800 p,
        .asyncapi-wrapper .aui-root .bg-gray-900 .text-white,
        .asyncapi-wrapper .aui-root .bg-gray-900 span,
        .asyncapi-wrapper .aui-root .bg-gray-900 p {
          color: #e2e8f0 !important;
          opacity: 1 !important;
        }

        /* ── Examples section overrides ── */
        .asyncapi-wrapper .aui-root .examples {
          background-color: ${palette.background} !important;
        }
        .asyncapi-wrapper .aui-root .examples .bg-gray-800,
        .asyncapi-wrapper .aui-root .examples pre {
          background-color: #1e2433 !important;
        }
        .asyncapi-wrapper .aui-root .examples * {
          color: ${palette.text} !important;
        }
        .asyncapi-wrapper .aui-root .examples .text-black {
          color: ${palette.text} !important;
        }
        .asyncapi-wrapper .aui-root .examples pre,
        .asyncapi-wrapper .aui-root .examples code {
          color: #e2e8f0 !important;
        }
        .asyncapi-wrapper .aui-root .examples .text-gray-400,
        .asyncapi-wrapper .aui-root .examples .text-gray-500 {
          color: #94a3b8 !important;
        }

        /* ── Shadow / card sections ── */
        .asyncapi-wrapper .aui-root .shadow {
          box-shadow: 0 1px 3px 0 rgba(0,0,0,0.06), 0 1px 2px 0 rgba(0,0,0,0.04) !important;
        }
        .asyncapi-wrapper .aui-root .rounded {
          border-radius: 0.375rem;
        }
      `}</style>
    </div>
  );
}
