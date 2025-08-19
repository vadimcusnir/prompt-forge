'use client'

import { useEffect, useState, useMemo } from 'react'
import { getDensity } from '@/lib/bg.routes'
import GridLines from './GridLines'
import NoiseLayer from './NoiseLayer'
import MatrixTokens from './MatrixTokens'
// (opțional) import BackgroundFigures, MatrixQuote

export default function BackgroundRoot({ 
  profile = 'ambient_minimal', 
  routeKey 
}: {
  profile?: 'ambient_minimal' | 'full'
  routeKey?: string
}) {
  const [ready, setReady] = useState(false)
  
  useEffect(() => {
    const enable = () => setReady(true)
    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(enable)
    } else {
      setTimeout(enable, 150)
    }
    document.documentElement.classList.add('matrix-animations-ready')
  }, [])
  
  const density = useMemo(() => getDensity({ routeKey }), [routeKey])

  return (
    <div className="bg-fixed-root" aria-hidden="true">
      <GridLines/>
      <NoiseLayer/>
      {ready && (
        <>
          <MatrixTokens density={density} />
          {/* profile==='full' && <BackgroundFigures/> */}
          {/* profile==='full' && <MatrixQuote/>  */}
        </>
      )}
    </div>
  )
}
