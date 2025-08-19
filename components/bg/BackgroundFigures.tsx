"use client"

import { useEffect, useRef, useState } from 'react'

interface BackgroundFiguresProps {
  motionLevel: 'auto' | 'medium' | 'minimal'
}

interface Figure {
  id: string
  type: 'axis' | 'bar' | 'curve'
  x: number
  y: number
  width: number
  height: number
  opacity: number
  color: string
  animationPhase: number
}

export default function BackgroundFigures({ motionLevel }: BackgroundFiguresProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [figures, setFigures] = useState<Figure[]>([])
  const animationRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    // Early return for minimal motion
    if (motionLevel === 'minimal') {
      return
    }

    // Initialize figures - mai subtile
    const initialFigures: Figure[] = [
      // X-axis
      {
        id: 'axis-x',
        type: 'axis',
        x: 50,
        y: window.innerHeight - 100,
        width: window.innerWidth - 100,
        height: 2,
        opacity: 0.06, // Reduced from 0.1 to 0.06
        color: '#0891B2',
        animationPhase: 0
      },
      // Y-axis
      {
        id: 'axis-y',
        type: 'axis',
        x: 100,
        y: 50,
        width: 2,
        height: window.innerHeight - 100,
        opacity: 0.06, // Reduced from 0.1 to 0.06
        color: '#0891B2',
        animationPhase: 0
      },
      // Data bars - mai subtile
      ...Array.from({ length: 4 }, (_, i) => ({ // Reduced from 5 to 4 bars
        id: `bar-${i}`,
        type: 'bar' as const,
        x: 150 + i * 140, // Increased spacing from 120 to 140
        y: window.innerHeight - 150,
        width: 50, // Reduced from 60 to 50
        height: 60 + Math.random() * 80, // Reduced height range
        opacity: 0.04, // Reduced from 0.08 to 0.04
        color: '#0891B2',
        animationPhase: Math.random() * Math.PI * 2
      })),
      // Curved line - mai subtil
      {
        id: 'curve-1',
        type: 'curve',
        x: 100,
        y: window.innerHeight - 200,
        width: window.innerWidth - 200,
        height: 80, // Reduced from 100 to 80
        opacity: 0.08, // Reduced from 0.12 to 0.08
        color: '#BE123C',
        animationPhase: 0
      }
    ]

    setFigures(initialFigures)

    // Animation loop
    let time = 0
    const animate = (currentTime: number) => {
      // Check motion level again in case it changed
      if (motionLevel === 'minimal') {
        return
      }

      const deltaTime = currentTime - time
      time = currentTime

      setFigures(prev => prev.map(figure => ({
        ...figure,
        animationPhase: (figure.animationPhase + deltaTime * 0.0005) % (Math.PI * 2) // Reduced animation speed
      })))

      animationRef.current = requestAnimationFrame(animate)
    }

    // Start animation for non-minimal motion levels
    if (motionLevel === 'auto' || motionLevel === 'medium') {
      animationRef.current = requestAnimationFrame(animate)
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [motionLevel])

  // Early return for minimal motion
  if (motionLevel === 'minimal') {
    return null
  }

  const renderFigure = (figure: Figure) => {
    switch (figure.type) {
      case 'axis':
        return (
          <line
            key={figure.id}
            x1={figure.x}
            y1={figure.y}
            x2={figure.x + figure.width}
            y2={figure.y + figure.height}
            stroke={figure.color}
            strokeWidth={figure.width > figure.height ? figure.height : figure.width}
            opacity={figure.opacity}
            style={{
              filter: 'blur(0.5px)',
              transition: 'opacity 0.3s ease-out'
            }}
          />
        )

      case 'bar':
        const animatedHeight = figure.height + Math.sin(figure.animationPhase) * 6 // Reduced from 10 to 6
        return (
          <rect
            key={figure.id}
            x={figure.x}
            y={figure.y - animatedHeight}
            width={figure.width}
            height={animatedHeight}
            fill={figure.color}
            opacity={figure.opacity}
            style={{
              filter: 'blur(0.5px)',
              transition: 'opacity 0.3s ease-out'
            }}
          />
        )

      case 'curve':
        const points = []
        const segments = 20
        for (let i = 0; i <= segments; i++) {
          const x = figure.x + (i / segments) * figure.width
          const wave = Math.sin(figure.animationPhase + i * 0.3) * 10 // Reduced from 15 to 10
          const y = figure.y + Math.sin(i * 0.5) * 20 + wave // Reduced from 30 to 20
          points.push(`${x},${y}`)
        }
        
        return (
          <polyline
            key={figure.id}
            points={points.join(' ')}
            fill="none"
            stroke={figure.color}
            strokeWidth="1.5" // Reduced from 2 to 1.5
            opacity={figure.opacity}
            style={{
              filter: 'blur(0.5px)',
              transition: 'opacity 0.3s ease-out'
            }}
          />
        )

      default:
        return null
    }
  }

  return (
    <svg
      ref={svgRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{
        opacity: 0.6, // Reduced from 0.8 to 0.6
        transition: 'opacity 0.3s ease-out'
      }}
    >
      {figures.map(renderFigure)}
    </svg>
  )
}
