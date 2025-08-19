'use client';
import { useEffect, useState, useMemo } from 'react';
import { getDensity, getMaxQuotes } from '@/lib/bg.routes';
import MatrixTokens from './MatrixTokens';
import MatrixQuotes from './MatrixQuotes';

export default function BackgroundRoot({ profile='ambient_minimal', routeKey }:{
  profile?: 'ambient_minimal'|'full'; routeKey?: string
}) {
  const [ready, setReady] = useState(false);
  
  // Calculează density și maxQuotes bazat pe rută
  const density = useMemo(() => getDensity(routeKey), [routeKey]);
  const maxQuotes = useMemo(() => getMaxQuotes(routeKey), [routeKey]);
  
  // Mapează profile la motionLevel pentru MatrixQuotes
  const motionLevel = useMemo(() => {
    return profile === 'ambient_minimal' ? 'minimal' : 'medium';
  }, [profile]);
  
  useEffect(() => {
    // Gating post-LCP - obligatoriu
    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(() => setReady(true));
    } else {
      setTimeout(() => setReady(true), 150);
    }
    
    // Adaugă clasa pentru animații
    if (typeof document !== 'undefined') {
      document.documentElement.classList.add('matrix-animations-ready');
    }
  }, []);
  
  return (
    <div className="bg-fixed-root" aria-hidden="true">
      {/* Layer-uri statice - mereu vizibile */}
      <div className="bg-grid absolute inset-0 opacity-5" />
      <div className="bg-noise absolute inset-0 opacity-5" />
      
      {/* Layer-uri animate - montate doar post-LCP când ready===true */}
      {ready && (
        <>
          {/* MatrixTokens - tokens ON pentru /coming-soon */}
          <MatrixTokens density={density} />
          
          {/* MatrixQuotes - quotes OFF pentru /coming-soon (maxQuotes: 0) */}
          {maxQuotes > 0 && (
            <MatrixQuotes 
              motionLevel={motionLevel}
              maxQuotes={maxQuotes}
            />
          )}
        </>
      )}
    </div>
  );
}
