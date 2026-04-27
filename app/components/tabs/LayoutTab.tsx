'use client';

import { useEffect, useState } from 'react';

export default function LayoutTab() {
  const [origin, setOrigin] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin);
      setLoading(false);
    }
  }, []);

  const iframeSrc = origin
    ? `https://app.diagrams.net/?lightbox=1&highlight=0000ff&edit=_blank&layers=1&nav=1&title=dashboard-layout.drawio#U${origin}/dashboard-layout.drawio`
    : '';

  if (loading) {
    return (
      <div style={{ padding: '1.5rem', color: '#6b7280' }}>
        Loading layout...
      </div>
    );
  }

  return (
    <div style={{ height: 'calc(100vh - 8rem)', padding: '1rem' }}>
      <div style={{ height: '100%', borderRadius: '0.5rem', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
        {iframeSrc ? (
          <iframe
            src={iframeSrc}
            style={{ width: '100%', height: '100%', border: 'none' }}
            title="Dashboard Layout"
            allow="fullscreen"
          />
        ) : (
          <div style={{ padding: '2rem', color: '#6b7280', textAlign: 'center' }}>
            Unable to load layout diagram
          </div>
        )}
      </div>
      <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem', textAlign: 'center' }}>
        Download: <a href="/dashboard-layout.drawio" style={{ color: '#3b82f6' }}>dashboard-layout.drawio</a>
      </p>
    </div>
  );
}