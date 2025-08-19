"use client"

import { useEffect, useState, useRef } from 'react'
import dynamic from 'next/dynamic'

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
  motionLevel?: 'auto' | 'medium' | 'minimal'
  enableMatrix?: boolean
  enableQuotes?: boolean
  enableFigures?: boolean
  enableMicroUI?: boolean
}

export default function BackgroundRoot({
  motionLevel = 'auto',
  enableMatrix = true,
  enableQuotes = true,
  enableFigures = true,
  enableMicroUI = true
}: BackgroundRootProps) {
  const [isClient, setIsClient] = useState(false)
  const [isAnimationsReady, setIsAnimationsReady] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    console.log('BackgroundRoot: useEffect triggered, motionLevel:', motionLevel)
    setIsClient(true)
    
    // Gate all motion behind .matrix-animations-ready (activate only after CSS+JS complete)
    const enableAnimations = () => {
      console.log('BackgroundRoot: Enabling animations after CSS+JS ready')
      setIsAnimationsReady(true)
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
  }, [motionLevel])

  console.log('BackgroundRoot: Render state:', { isClient, isAnimationsReady, motionLevel })

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
      
      {/* L1: Grid Lines - Cu animație CSS pentru drift */}
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
      {enableMatrix && isClient && isAnimationsReady && (
        <MatrixTokens motionLevel={motionLevel} />
      )}
      
      {/* L3: Background Figures - Profunzime analitică cu SVG (font mediu - L3) */}
      {enableFigures && isClient && isAnimationsReady && (
        <BackgroundFigures motionLevel={motionLevel} />
      )}
      
      {/* L4: Matrix Quotes - Citatele narative (font mare - L4) */}
      {enableQuotes && isClient && isAnimationsReady && (
        <MatrixQuotes motionLevel={motionLevel} />
      )}
      
      {/* L5: Noise Effect - Cu animație subtilă */}
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
      {enableMicroUI && isClient && isAnimationsReady && (
        <MicroUI motionLevel={motionLevel} />
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
