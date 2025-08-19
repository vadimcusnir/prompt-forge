"use client"

import { useEffect, useState, useRef, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { getMotionLevel } from '@/lib/motion'
import { getDensity, getMaxQuotes, isBackgroundEnabled } from '@/lib/bg.routes'

// Dynamic imports pentru componentele animate
const MatrixTokens = dynamic(() => import('./MatrixTokens'), { 
  ssr: false,
  loading: () => null
})
const MatrixQuotes = dynamic(() => import('./MatrixQuotes'), { 
  ssr: false,
  loading: () => null
})
const BackgroundFigures = dynamic(() => import('./BackgroundFigures'), { 
  ssr: false,
  loading: () => null
})
const MicroUI = dynamic(() => import('./MicroUI'), { 
  ssr: false,
  loading: () => null
})

interface BackgroundRootProps {
  profile?: 'ambient_minimal' | 'full'
  routeKey?: string
  motionLevel?: 'auto' | 'medium' | 'minimal'
  enableMatrix?: boolean
  enableQuotes?: boolean
  enableFigures?: boolean
  enableMicroUI?: boolean
}

export default function BackgroundRoot({
  profile = 'ambient_minimal',
  routeKey,
  motionLevel: propMotionLevel,
  enableMatrix = true,
  enableQuotes = true,
  enableFigures = true,
  enableMicroUI = true
}: BackgroundRootProps) {
  const [isClient, setIsClient] = useState(false)
  const [ready, setReady] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Motion level stabil - calculează o singură dată per sesiune
  const motion = useMemo(() => getMotionLevel(), [])
  
  // Route-based configuration
  const density = useMemo(() => getDensity({ routeKey }), [routeKey])
  const maxQuotes = useMemo(() => getMaxQuotes({ routeKey }), [routeKey])
  const isEnabled = useMemo(() => isBackgroundEnabled({ routeKey }), [routeKey])

  useEffect(() => {
    setIsClient(true)
    
    // Gate all motion behind .matrix-animations-ready (activate only after CSS+JS complete)
    const enableAnimations = () => {
      setReady(true)
      document.documentElement.classList.add('matrix-animations-ready')
    }
    
    // Use requestIdleCallback for optimal timing, fallback to setTimeout
    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(enableAnimations, { timeout: 150 })
    } else {
      setTimeout(enableAnimations, 150)
    }
    
    return () => {
      document.documentElement.classList.remove('matrix-animations-ready')
    }
  }, [])

  // Early return if background is disabled for this route
  if (!isEnabled) {
    return null
  }

  // Render immediately on both server and client
  return (
    <div 
      ref={containerRef}
      className={`fixed inset-0 z-0 pointer-events-none bg-[#0a0a0a] bg-fixed-root`}
      style={{
        contain: 'layout paint style'
      }}
      aria-hidden="true"
    >
      {/* L0: Base Canvas - Static (#0a0a0a) */}
      <div className="absolute inset-0 bg-[#0a0a0a]" />
      
      {/* L1: Grid Lines - Cu animație CSS pentru drift - STATIC, mereu vizibil */}
      <div className="absolute inset-0 opacity-[0.25] animate-grid-drift">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse">
              <path d="M 100 0 L 0 0 0 100" fill="none" stroke="rgba(8, 145, 178, 0.8)" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>
      
      {/* L2: Matrix Tokens - Cuvintele care apar și dispar (font mic - L2) */}
      {enableMatrix && isClient && ready && (
        <MatrixTokens motionLevel={motion} density={density} ready={ready} />
      )}
      
      {/* L3: Background Figures - Profunzime analitică cu SVG (font mediu - L3) */}
      {enableFigures && isClient && ready && (
        <BackgroundFigures motionLevel={motion} />
      )}
      
      {/* L4: Matrix Quotes - Citatele narative (font mare - L4) - opțional pe rute */}
      {enableQuotes && maxQuotes > 0 && isClient && ready && (
        <MatrixQuotes motionLevel={motion} maxQuotes={maxQuotes} />
      )}
      
      {/* L5: Noise Effect - Cu animație subtilă - STATIC, mereu vizibil */}
      <div className="absolute inset-0 opacity-[0.30] animate-noise-float">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <filter id="noise">
            <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" stitchTiles="stitch"/>
            <feColorMatrix type="saturate" values="0"/>
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.2"/>
            </feComponentTransfer>
          </filter>
          <rect width="100%" height="100%" filter="url(#noise)" />
        </svg>
      </div>
      
      {/* L6: Hero Content - Promisiune & CTA (deja implementat în page.tsx) */}
      {/* Acest layer este gestionat de componenta principală */}
      
      {/* L7: Micro-UI - Feedback interactiv (font foarte mic - L7) */}
      {enableMicroUI && isClient && ready && (
        <MicroUI motionLevel={motion} />
      )}
      
      {/* L5: Glow Effects - Cu animație pulsantă */}
      {isClient && (
        <>
          {/* Top glow - cu animație */}
          <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-teal-500/[0.50] to-transparent animate-glow-pulse" />
          {/* Bottom glow - cu animație */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-crimson-500/[0.45] to-transparent animate-glow-pulse-delayed" />
        </>
      )}
    </div>
  )
}
