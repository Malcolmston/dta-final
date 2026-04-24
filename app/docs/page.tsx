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
          <div className="asyncapi-wrapper" style={{ '--async-bg': palette.background, '--async-text': palette.text, '--async-border': palette.gridLines } as React.CSSProperties}>
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
        .asyncapi-wrapper {
          --async-bg: ${palette.background};
          --async-text: ${palette.text};
          --async-border: ${palette.gridLines};
        }
        .asyncapi-wrapper .aui-root,
        .asyncapi-wrapper :host,
        .asyncapi-wrapper [class*="asyncapi"],
        .asyncapi-wrapper *::slotted(*) {
          font-family: var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif !important;
          background-color: ${palette.background} !important;
          color: ${palette.text} !important;
        }

        /* ── Right side content panel ── */
        .asyncapi-wrapper .aui-root .panel,
        .asyncapi-wrapper .aui-root .content,
        .asyncapi-wrapper .aui-root .operation-content,
        .asyncapi-wrapper .aui-root .message-content,
        .asyncapi-wrapper .aui-root .schema-content {
          background-color: ${palette.background} !important;
          color: ${palette.text} !important;
        }

        /* ── All elements in main content area ── */
        .asyncapi-wrapper .aui-root .panel *,
        .asyncapi-wrapper .aui-root .content *,
        .asyncapi-wrapper .aui-root .operation-content *,
        .asyncapi-wrapper .aui-root .message-content *,
        .asyncapi-wrapper .aui-root .schema-content * {
          color: ${palette.text} !important;
        }

        /* ── Override any remaining black text ── */
        .asyncapi-wrapper .aui-root .panel [style*="color"],
        .asyncapi-wrapper .aui-root .content [style*="color"],
        .asyncapi-wrapper .aui-root [style*="color: black"],
        .asyncapi-wrapper .aui-root [style*="color:#000000"],
        .asyncapi-wrapper .aui-root [style*="color: #000000"],
        .asyncapi-wrapper .aui-root [style*="color: rgb"],
        .asyncapi-wrapper .aui-root span[style*="color"],
        .asyncapi-wrapper .aui-root p[style*="color"] {
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
        .asyncapi-wrapper .aui-root [style*="color: black"],
        .asyncapi-wrapper .aui-root [style*="color:#000"],
        .asyncapi-wrapper .aui-root [style*="color: #000"] {
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

        /* ── Panel layout overrides ── */
        .asyncapi-wrapper .aui-root .panel-item--right {
          background-color: ${palette.background} !important;
          width: 100% !important;
        }
        .asyncapi-wrapper .aui-root .panel--center {
          display: block !important;
        }
        .asyncapi-wrapper .aui-root .panel-item--center,
        .asyncapi-wrapper .aui-root .panel-item--right {
          width: 100% !important;
        }

        /* ── Shadow / card sections ── */
        .asyncapi-wrapper .aui-root .shadow {
          box-shadow: 0 1px 3px 0 rgba(0,0,0,0.06), 0 1px 2px 0 rgba(0,0,0,0.04) !important;
        }
        .asyncapi-wrapper .aui-root .rounded {
          border-radius: 0.375rem;
        }

        /* ── Right side main content area - catch all ── */
        .asyncapi-wrapper .aui-root #undefined,
        .asyncapi-wrapper .aui-root .operation,
        .asyncapi-wrapper .aui-root .operation-details,
        .asyncapi-wrapper .aui-root .channels,
        .asyncapi-wrapper .aui-root .channel {
          background-color: ${palette.background} !important;
        }
        .asyncapi-wrapper .aui-root #undefined *,
        .asyncapi-wrapper .aui-root .operation-details *,
        .asyncapi-wrapper .aui-root .channels *,
        .asyncapi-wrapper .aui-root .channel * {
          color: ${palette.text} !important;
        }

        /* ── Aggressive black text override ── */
        .asyncapi-wrapper .aui-root font[color="black"],
        .asyncapi-wrapper .aui-root font[color="#000000"],
        .asyncapi-wrapper .aui-root span[style*="color: black"],
        .asyncapi-wrapper .aui-root span[style*="color:#000"],
        .asyncapi-wrapper .aui-root span[style*="color: #000"],
        .asyncapi-wrapper .aui-root p[style*="color: black"],
        .asyncapi-wrapper .aui-root div[style*="color: black"],
        .asyncapi-wrapper .aui-root td[style*="color"],
        .asyncapi-wrapper .aui-root th[style*="color"] {
          color: ${palette.text} !important;
        }

        /* ── Ultimate override - force everything to use palette colors ── */
        .asyncapi-wrapper .aui-root > div,
        .asyncapi-wrapper .aui-root section,
        .asyncapi-wrapper .aui-root main,
        .asyncapi-wrapper .aui-root article,
        .asyncapi-wrapper .aui-root aside {
          background-color: ${palette.background} !important;
        }
        .asyncapi-wrapper .aui-root span,
        .asyncapi-wrapper .aui-root p,
        .asyncapi-wrapper .aui-root div,
        .asyncapi-wrapper .aui-root td,
        .asyncapi-wrapper .aui-root th,
        .asyncapi-wrapper .aui-root li,
        .asyncapi-wrapper .aui-root label {
          color: ${palette.text} !important;
        }

        /* ── Override hardcoded black backgrounds ── */
        .asyncapi-wrapper .aui-root [style*="background-color: black"],
        .asyncapi-wrapper .aui-root [style*="background-color:#000"],
        .asyncapi-wrapper .aui-root [style*="background-color: #000"],
        .asyncapi-wrapper .aui-root [style*="background:#000"],
        .asyncapi-wrapper .aui-root [style*="background: black"],
        .asyncapi-wrapper .aui-root [bgcolor="black"],
        .asyncapi-wrapper .aui-root [bgcolor="#000000"] {
          background-color: ${palette.background} !important;
        }

        /* ── Override any remaining black text in all elements ── */
        .asyncapi-wrapper .aui-root *:not(code):not(pre) {
          color: ${palette.text} !important;
        }

        /* ── Make code blocks keep dark theme ── */
        .asyncapi-wrapper .aui-root code,
        .asyncapi-wrapper .aui-root pre {
          background-color: #1e2433 !important;
          color: #e2e8f0 !important;
        }

        /* ── Override inline styles with black values ── */
        .asyncapi-wrapper .aui-root [style*="color:rgb(0,0,0)"],
        .asyncapi-wrapper .aui-root [style*="color: rgb(0, 0, 0)"],
        .asyncapi-wrapper .aui-root [style*="Color: black"],
        .asyncapi-wrapper .aui-root [STYLE*="color: black"],
        .asyncapi-wrapper .aui-root font:not([color]) {
          color: ${palette.text} !important;
        }

        /* ── Table cells and rows ── */
        .asyncapi-wrapper .aui-root tr,
        .asyncapi-wrapper .aui-root tbody,
        .asyncapi-wrapper .aui-root thead,
        .asyncapi-wrapper .aui-root table {
          background-color: ${palette.background} !important;
          color: ${palette.text} !important;
        }

        /* ── Schema/parameter tables ── */
        .asyncapi-wrapper .aui-root .table-wrapper,
        .asyncapi-wrapper .aui-root .schema-table,
        .asyncapi-wrapper .aui-root .parameters-table {
          background-color: ${palette.background} !important;
        }
        .asyncapi-wrapper .aui-root .table-wrapper td,
        .asyncapi-wrapper .aui-root .table-wrapper th,
        .asyncapi-wrapper .aui-root .schema-table td,
        .asyncapi-wrapper .aui-root .schema-table th {
          background-color: ${palette.background} !important;
          color: ${palette.text} !important;
          border-color: ${palette.gridLines} !important;
        }

        /* ── Specific AsyncAPI sections ── */
        .asyncapi-wrapper .aui-root .server,
        .asyncapi-wrapper .aui-root .channel-item,
        .asyncapi-wrapper .aui-root .operation-item,
        .asyncapi-wrapper .aui-root .message-item,
        .asyncapi-wrapper .aui-root .schema-item {
          background-color: ${palette.background} !important;
        }
        .asyncapi-wrapper .aui-root .server *,
        .asyncapi-wrapper .aui-root .channel-item *,
        .asyncapi-wrapper .aui-root .operation-item *,
        .asyncapi-wrapper .aui-root .message-item *,
        .asyncapi-wrapper .aui-root .schema-item * {
          color: ${palette.text} !important;
        }

        /* ── Force everything under aui-root to use palette ── */
        .asyncapi-wrapper .aui-root .row,
        .asyncapi-wrapper .aui-root .col,
        .asyncapi-wrapper .aui-root .card,
        .asyncapi-wrapper .aui-root .badge,
        .asyncapi-wrapper .aui-root .tag,
        .asyncapi-wrapper .aui-root .label {
          background-color: ${palette.background} !important;
          color: ${palette.text} !important;
        }

        /* ── Last resort: any element with black background ── */
        .asyncapi-wrapper .aui-root [style*="000"] {
          background-color: ${palette.background} !important;
        }

        /* ── Override specific dark patterns ── */
        .asyncapi-wrapper .aui-root .bg-gray-400,
        .asyncapi-wrapper .aui-root .bg-gray-500,
        .asyncapi-wrapper .aui-root .bg-gray-600,
        .asyncapi-wrapper .aui-root .bg-gray-700 {
          background-color: ${palette.gridLines} !important;
        }

        /* ── Override dark text classes ── */
        .asyncapi-wrapper .aui-root .text-black {
          color: ${palette.text} !important;
        }

        /* ── Override any RGB black ── */
        .asyncapi-wrapper .aui-root [style*="rgb(0, 0, 0)"],
        .asyncapi-wrapper .aui-root [style*="rgb(0,0,0)"],
        .asyncapi-wrapper .aui-root [style*="#00000000"] {
          background-color: ${palette.background} !important;
          color: ${palette.text} !important;
        }

        /* ── Override flex containers ── */
        .asyncapi-wrapper .aui-root .flex,
        .asyncapi-wrapper .aui-root .inline-flex {
          background-color: ${palette.background} !important;
        }

        /* ── Override specific asyncapi classes ── */
        .asyncapi-wrapper .aui-root .asyncapi-section,
        .asyncapi-wrapper .aui-root .channels-section,
        .asyncapi-wrapper .aui-root .operations-section,
        .asyncapi-wrapper .aui-root .servers-section,
        .asyncapi-wrapper .aui-root .schemas-section,
        .asyncapi-wrapper .aui-root .messages-section {
          background-color: ${palette.background} !important;
        }

        /* ── Override description/info sections ── */
        .asyncapi-wrapper .aui-root .description,
        .asyncapi-wrapper .aui-root .description-content,
        .asyncapi-wrapper .aui-root .info {
          background-color: ${palette.background} !important;
          color: ${palette.text} !important;
        }

        /* ── Override collapsible sections ── */
        .asyncapi-wrapper .aui-root .collapsible,
        .asyncapi-wrapper .aui-root .collapsible-content {
          background-color: ${palette.background} !important;
        }

        /* ── Override headers/titles in content ── */
        .asyncapi-wrapper .aui-root .content-header,
        .asyncapi-wrapper .aui-root .content-title {
          color: ${palette.text} !important;
        }

        /* ── Override list items ── */
        .asyncapi-wrapper .aui-root li,
        .asyncapi-wrapper .aui-root ul,
        .asyncapi-wrapper .aui-root ol {
          background-color: ${palette.background} !important;
          color: ${palette.text} !important;
        }

        /* ── Override any remaining inline styles with explicit black ── */
        .asyncapi-wrapper .aui-root [STYLE] {
          background-color: ${palette.background} !important;
          color: ${palette.text} !important;
        }

        /* ── But preserve code block styling ── */
        .asyncapi-wrapper .aui-root pre[style],
        .asyncapi-wrapper .aui-root code[style] {
          background-color: #1e2433 !important;
          color: #e2e8f0 !important;
        }

        /* ── Absolute override for any remaining dark elements ── */
        .asyncapi-wrapper .aui-root div:empty,
        .asyncapi-wrapper .aui-root span:empty {
          background-color: ${palette.background} !important;
        }

        /* ── Override all direct children ── */
        .asyncapi-wrapper .aui-root > * {
          background-color: ${palette.background} !important;
          color: ${palette.text} !important;
        }

        /* ── Override any shadow DOM elements ── */
        .asyncapi-wrapper .aui-root ::slotted(*) {
          background-color: ${palette.background} !important;
          color: ${palette.text} !important;
        }

        /* ── Target specific element types ── */
        .asyncapi-wrapper .aui-root article,
        .asyncapi-wrapper .aui-root section,
        .asyncapi-wrapper .aui-root nav,
        .asyncapi-wrapper .aui-root header,
        .asyncapi-wrapper .aui-root footer {
          background-color: ${palette.background} !important;
        }

        /* ── Override input elements ── */
        .asyncapi-wrapper .aui-root input,
        .asyncapi-wrapper .aui-root select,
        .asyncapi-wrapper .aui-root textarea {
          background-color: ${palette.background} !important;
          color: ${palette.text} !important;
          border-color: ${palette.gridLines} !important;
        }

        /* ── Override scrollbar ── */
        .asyncapi-wrapper .aui-root ::-webkit-scrollbar,
        .asyncapi-wrapper .aui-root ::-webkit-scrollbar-track,
        .asyncapi-wrapper .aui-root ::-webkit-scrollbar-thumb {
          background-color: ${palette.gridLines} !important;
        }

        /* ── Override svg/icons ── */
        .asyncapi-wrapper .aui-root svg {
          fill: ${palette.text} !important;
        }

        /* ── Override anchor links ── */
        .asyncapi-wrapper .aui-root a {
          color: ${palette.primary} !important;
        }

        /* ── Override headings ── */
        .asyncapi-wrapper .aui-root h1,
        .asyncapi-wrapper .aui-root h2,
        .asyncapi-wrapper .aui-root h3,
        .asyncapi-wrapper .aui-root h4,
        .asyncapi-wrapper .aui-root h5,
        .asyncapi-wrapper .aui-root h6 {
          color: ${palette.text} !important;
        }

        /* ── Override horizontal rules ── */
        .asyncapi-wrapper .aui-root hr {
          border-color: ${palette.gridLines} !important;
        }

        /* ── Make sure no section has dark background ── */
        .asyncapi-wrapper .aui-root [class*="panel"],
        .asyncapi-wrapper .aui-root [class*="sidebar"],
        .asyncapi-wrapper .aui-root [class*="content"],
        .asyncapi-wrapper .aui-root [class*="header"],
        .asyncapi-wrapper .aui-root [class*="footer"] {
          background-color: ${palette.background} !important;
        }

        /* ── Override badge/indicator colors ── */
        .asyncapi-wrapper .aui-root .bg-yellow-600,
        .asyncapi-wrapper .aui-root .bg-red-600,
        .asyncapi-wrapper .aui-root .bg-green-600,
        .asyncapi-wrapper .aui-root .bg-orange-600 {
          background-color: ${palette.primary} !important;
        }

        /* ── Override text with specific colors ── */
        .asyncapi-wrapper .aui-root .text-red-500,
        .asyncapi-wrapper .aui-root .text-red-600,
        .asyncapi-wrapper .aui-root .text-yellow-500,
        .asyncapi-wrapper .aui-root .text-green-500,
        .asyncapi-wrapper .aui-root .text-orange-500 {
          color: ${palette.text} !important;
        }
      `}</style>
    </div>
  );
}
