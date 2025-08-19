"use client"

import { useEffect, useState, useRef } from 'react'
import dynamic from 'next/dynamic'

// Dynamic imports pentru componentele de background (CSR-only)
const GridLines = dynamic(() => import('./GridLines'), { ssr: false })
const NoiseLayer = dynamic(() => import('./NoiseLayer'), { ssr: false })
const MatrixTokens = dynamic(() => import('./MatrixTokens'), { ssr: false })
const MatrixQuotes = dynamic(() => import('./MatrixQuotes'), { ssr: false })
const BackgroundFigures = dynamic(() => import('./BackgroundFigures'), { ssr: false })

interface BackgroundRootProps {
  motionLevel?: 'auto' | 'medium' | 'minimal'
  enableMatrix?: boolean
  enableQuotes?: boolean
  enableFigures?: boolean
}

export default function BackgroundRoot({
  motionLevel = 'auto',
  enableMatrix = true,
  enableQuotes = true,
  enableFigures = false
}: BackgroundRootProps) {
  const [isReady, setIsReady] = useState(false)
  const [isAnimationsReady, setIsAnimationsReady] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)

  useEffect(() => {
    // Pasul 1: Hydration complet
    setIsReady(true)

    // Pasul 2: Așteaptă idle pentru a activa animațiile
    const activateAnimations = () => {
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
          setIsAnimationsReady(true)
        }, { timeout: 1000 })
      } else {
        // Fallback pentru browsere vechi
        timeoutRef.current = setTimeout(() => {
          setIsAnimationsReady(true)
        }, 1000)
      }
    }

    // Așteaptă 500ms după hydration pentru a nu afecta LCP
    const hydrationDelay = setTimeout(activateAnimations, 500)

    return () => {
      clearTimeout(hydrationDelay)
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  // Verifică preferințele de motion
  const prefersReducedMotion = typeof window !== 'undefined' && 
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  // Aplică nivelul de motion
  const effectiveMotionLevel = prefersReducedMotion ? 'minimal' : motionLevel

  if (!isReady) {
    return null
  }

  return (
    <div 
      ref={containerRef}
      className={`
        bg-fixed-root fixed inset-0 z-0 pointer-events-none
        will-change-transform
        ${isAnimationsReady ? 'matrix-animations-ready' : ''}
        motion-level-${effectiveMotionLevel}
      `}
      style={{
        contain: 'layout paint style'
      }}
      aria-hidden="true"
    >
      {/* L0: Base Canvas - Static (#0a0a0a) */}
      <div className="absolute inset-0 bg-[#0a0a0a]" />
      
      {/* L1: Grid H/V - Drift + Parallax subtil */}
      <GridLines motionLevel={effectiveMotionLevel} />
      
      {/* L2: MATRIX_TOKENS - Flux metric AI (opțional) */}
      {enableMatrix && effectiveMotionLevel !== 'minimal' && (
        <MatrixTokens motionLevel={effectiveMotionLevel} />
      )}
      
      {/* L3: BackgroundFigures - Profunzime analitică SVG (opțional) */}
      {enableFigures && effectiveMotionLevel !== 'minimal' && (
        <BackgroundFigures motionLevel={effectiveMotionLevel} />
      )}
      
      {/* L4: MATRIX_QUOTES - Strat narativ inițiatic (opțional) */}
      {enableQuotes && effectiveMotionLevel !== 'minimal' && (
        <MatrixQuotes motionLevel={effectiveMotionLevel} />
      )}
      
      {/* L5: Noise Layer - Contrast și profunzime */}
      <NoiseLayer motionLevel={effectiveMotionLevel} />
    </div>
  )
}
