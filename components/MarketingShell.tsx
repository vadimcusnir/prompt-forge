'use client';

import { useEffect, useState } from 'react';

export default function MarketingShell({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const enable = () => setReady(true);
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      (window as any).requestIdleCallback(enable);
    } else {
      setTimeout(enable, 150);
    }
    if (typeof document !== 'undefined') {
      document.documentElement.classList.add('matrix-animations-ready');
    }
  }, []);

  return (
    <>
      {/* Background inline - "safe" */}
      <div className="bg-fixed-root" aria-hidden="true">
        <div className="bg-grid absolute inset-0 opacity-5" />
        <div className="bg-noise absolute inset-0 opacity-5" />
        {ready && (
          <>
            {/* MatrixTokens / Figures / Quotes client-only, montate post-LCP */}
          </>
        )}
      </div>
      {children}
    </>
  );
}
