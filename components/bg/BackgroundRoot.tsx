'use client';

import dynamic from 'next/dynamic';
import { useEffect, useMemo, useState } from 'react';
import { getDensity, getMaxQuotes } from '@/lib/bg.routes';

const MatrixTokens = dynamic(() => import('./bg/MatrixTokens'), { ssr: false });
const MatrixQuotes = dynamic(() => import('./bg/MatrixQuotes'), { ssr: false });

type Props = {
  profile?: 'ambient_minimal' | 'full';
  routeKey?: string;
};

export default function BackgroundRoot({ profile = 'ambient_minimal', routeKey }: Props) {
  const [ready, setReady] = useState(false);

  // Derivă parametrii vizuali din rută
  const density = useMemo(() => getDensity(routeKey), [routeKey]);
  const maxQuotes = useMemo(() => getMaxQuotes(routeKey), [routeKey]);

  // Profile → motion level pentru citate
  const motionLevel = useMemo<'minimal' | 'medium'>(() => {
    return profile === 'ambient_minimal' ? 'minimal' : 'medium';
  }, [profile]);

  // Montează animațiile doar post-LCP (idle) + setează clasa pentru fade-in
  useEffect(() => {
    const enable = () => {
      setReady(true);
      if (typeof document !== 'undefined') {
        document.documentElement.classList.add('matrix-animations-ready');
      }
    };
    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(enable);
    } else {
      setTimeout(enable, 150);
    }
  }, []);

  return (
    <div className="bg-fixed-root" aria-hidden>
      {/* Layer-uri statice (safe) */}
      <div className="bg-grid absolute inset-0" style={{ opacity: 0.05 }} />
      <div className="bg-noise absolute inset-0" style={{ opacity: 0.05 }} />

      {/* Layer-uri animate – doar când ready === true */}
      {ready && (
        <div className="bg-anim absolute inset-0">
          {/* Tokens: ON/OFF în funcție de density (ex: /coming-soon poate avea density > 0) */}
          <MatrixTokens density={density} />

          {/* Quotes: dezactivate când maxQuotes = 0 (ex: /coming-soon) */}
          {maxQuotes > 0 && (
            <MatrixQuotes motionLevel={motionLevel} maxQuotes={maxQuotes} />
          )}
        </div>
      )}
    </div>
  );
}
