'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';

const AsyncApiComponent = dynamic(
  () => import('@asyncapi/react-component').then((m) => m.default),
  { ssr: false, loading: () => <p className="p-6 text-gray-500">Loading AsyncAPI docs…</p> },
);

type Tab = 'rest' | 'async';

export default function DocsPage() {
  const [tab, setTab] = useState<Tab>('rest');

  return (
    <div className="min-h-screen bg-white">
      <div className="border-b border-gray-200 px-6 pt-4">
        <h1 className="text-2xl font-semibold text-gray-900 mb-4">API Documentation</h1>
        <nav className="flex gap-1">
          <button
            onClick={() => setTab('rest')}
            className={`px-4 py-2 text-sm font-medium rounded-t-md border-b-2 transition-colors ${
              tab === 'rest'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            REST API
          </button>
          <button
            onClick={() => setTab('async')}
            className={`px-4 py-2 text-sm font-medium rounded-t-md border-b-2 transition-colors ${
              tab === 'async'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Async API
          </button>
        </nav>
      </div>

      <div className="p-4">
        {tab === 'rest' && <SwaggerUI url="/openapi.yml" />}
        {tab === 'async' && (
          <AsyncApiComponent
            schema={{ url: '/asyncapi.yml' }}
            config={{ show: { sidebar: true } }}
          />
        )}
      </div>
    </div>
  );
}
