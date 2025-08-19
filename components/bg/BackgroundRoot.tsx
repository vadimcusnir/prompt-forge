'use client'

import { useEffect, useState, useMemo } from 'react'
import { getDensity } from '@/lib/bg.routes'
import { getMotionLevel } from '@/lib/motion'
import GridLines from './GridLines'
import NoiseLayer from './NoiseLayer'
import MatrixTokens from './MatrixTokens'

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
  const motionLevel = useMemo(() => getMotionLevel(), []) // FIX: Adaug motionLevel

  return (
    <div className="bg-fixed-root" aria-hidden="true">
      <GridLines motionLevel={motionLevel} /> {/* FIX: Trimite motionLevel */}
      <NoiseLayer motionLevel={motionLevel} /> {/* FIX: Trimite motionLevel */}
      {ready && (
        <>
          <MatrixTokens density={density} />
        </>
      )}
    </div>
  )
}
