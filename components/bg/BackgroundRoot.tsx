"use client"

import { useEffect, useState, useRef } from 'react'

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
  const [isClient, setIsClient] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Render immediately on both server and client
  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-0 pointer-events-none bg-[#0a0a0a]"
      style={{
        contain: 'layout paint style'
      }}
      aria-hidden="true"
    >
      {/* L0: Base Canvas - Static (#0a0a0a) */}
      <div className="absolute inset-0 bg-[#0a0a0a]" />
      
      {/* L1: Simple Grid Lines - More visible */}
      <div className="absolute inset-0 opacity-20">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse">
              <path d="M 100 0 L 0 0 0 100" fill="none" stroke="rgba(8, 145, 178, 0.3)" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>
      
      {/* L2: Simple Noise Effect - More visible */}
      <div className="absolute inset-0 opacity-25">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <filter id="noise">
            <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" stitchTiles="stitch"/>
            <feColorMatrix type="saturate" values="0"/>
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.2"/>
            </feComponentTransfer>
          </filter>
          <rect width="100%" height="100%" filter="url(#noise)"/>
        </svg>
      </div>
      
      {/* L3: Subtle Glow Effects - Client-side only */}
      {isClient && (
        <>
          {/* Top glow */}
          <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-teal-500/15 to-transparent" />
          {/* Bottom glow */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-crimson-500/15 to-transparent" />
        </>
      )}
    </div>
  )
}
