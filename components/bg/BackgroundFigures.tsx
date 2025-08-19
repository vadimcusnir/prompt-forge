"use client"

import { useEffect, useRef, useState } from 'react'

interface BackgroundFiguresProps {
  motionLevel: 'auto' | 'medium' | 'minimal'
}

interface Figure {
  id: string
  type: 'axis' | 'bar' | 'curve' | 'dot'
  x: number
  y: number
  size: number
  opacity: number
  rotation: number
  color: string
  isActive: boolean
  animationPhase: number
}

export default function BackgroundFigures({ motionLevel }: BackgroundFiguresProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [figures, setFigures] = useState<Figure[]>([])

  useEffect(() => {
    if (motionLevel === 'minimal') {
      return
    }

    // Initialize figures with diverse sizes and types
    const initialFigures: Figure[] = [
      // Axe analitice - font mare (L3)
      {
        id: 'axis-1',
        type: 'axis',
        x: 100,
        y: 200,
        size: 120,
        opacity: 0.15,
        rotation: 0,
        color: 'rgba(8, 145, 178, 0.6)',
        isActive: true,
        animationPhase: 0
      },
      {
        id: 'axis-2',
        type: 'axis',
        x: 300,
        y: 150,
        size: 80,
        opacity: 0.12,
        rotation: 90,
        color: 'rgba(190, 18, 60, 0.5)',
        isActive: true,
        animationPhase: 0.5
      },
      
      // Bare de date - font mediu (L3)
      {
        id: 'bar-1',
        type: 'bar',
        x: 150,
        y: 300,
        size: 60,
        opacity: 0.18,
        rotation: 0,
        color: 'rgba(8, 145, 178, 0.4)',
        isActive: true,
        animationPhase: 0.3
      },
      {
        id: 'bar-2',
        type: 'bar',
        x: 250,
        y: 280,
        size: 40,
        opacity: 0.15,
        rotation: 0,
        color: 'rgba(190, 18, 60, 0.4)',
        isActive: true,
        animationPhase: 0.7
      },
      
      // Curbe matematice - font mic (L3)
      {
        id: 'curve-1',
        type: 'curve',
        x: 200,
        y: 100,
        size: 100,
        opacity: 0.10,
        rotation: 45,
        color: 'rgba(8, 145, 178, 0.3)',
        isActive: true,
        animationPhase: 0.2
      },
      
      // Puncte de date - font foarte mic (L3)
      {
        id: 'dot-1',
        type: 'dot',
        x: 180,
        y: 180,
        size: 8,
        opacity: 0.20,
        rotation: 0,
        color: 'rgba(190, 18, 60, 0.6)',
        isActive: true,
        animationPhase: 0.8
      },
      {
        id: 'dot-2',
        type: 'dot',
        x: 320,
        y: 220,
        size: 6,
        opacity: 0.18,
        rotation: 0,
        color: 'rgba(8, 145, 178, 0.5)',
        isActive: true,
        animationPhase: 0.4
      }
    ]

    setFigures(initialFigures)

    // Animation loop
    let animationId: number
    let startTime = Date.now()

    const animate = () => {
      const currentTime = Date.now()
      const elapsed = currentTime - startTime

      setFigures(prev => prev.map(figure => ({
        ...figure,
        animationPhase: (elapsed * 0.001 + figure.animationPhase) % 1,
        rotation: figure.rotation + (motionLevel === 'auto' ? 0.2 : 0.1),
        opacity: figure.opacity + Math.sin(elapsed * 0.001 + figure.animationPhase * Math.PI * 2) * 0.02
      })))

      animationId = requestAnimationFrame(animate)
    }

    if (motionLevel !== 'minimal') {
      animate()
    }

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId)
      }
    }
  }, [motionLevel])

  if (motionLevel === 'minimal') {
    return null
  }

  const renderFigure = (figure: Figure) => {
    const baseSize = figure.size
    const animatedSize = baseSize + Math.sin(figure.animationPhase * Math.PI * 2) * 2

    switch (figure.type) {
      case 'axis':
        return (
          <line
            x1={figure.x}
            y1={figure.y}
            x2={figure.x + (figure.rotation === 0 ? animatedSize : 0)}
            y2={figure.y + (figure.rotation === 90 ? animatedSize : 0)}
            stroke={figure.color}
            strokeWidth="2"
            opacity={figure.opacity}
            style={{
              transform: `rotate(${figure.rotation}deg)`,
              transformOrigin: `${figure.x}px ${figure.y}px`
            }}
          />
        )
      
      case 'bar':
        return (
          <rect
            x={figure.x}
            y={figure.y - animatedSize}
            width="8"
            height={animatedSize}
            fill={figure.color}
            opacity={figure.opacity}
            rx="2"
          />
        )
      
      case 'curve':
        return (
          <path
            d={`M ${figure.x} ${figure.y} Q ${figure.x + animatedSize/2} ${figure.y - animatedSize/2} ${figure.x + animatedSize} ${figure.y}`}
            fill="none"
            stroke={figure.color}
            strokeWidth="1.5"
            opacity={figure.opacity}
            style={{
              transform: `rotate(${figure.rotation}deg)`,
              transformOrigin: `${figure.x}px ${figure.y}px`
            }}
          />
        )
      
      case 'dot':
        return (
          <circle
            cx={figure.x}
            cy={figure.y}
            r={animatedSize / 2}
            fill={figure.color}
            opacity={figure.opacity}
          />
        )
      
      default:
        return null
    }
  }

  return (
    <div ref={containerRef} className="absolute inset-0 pointer-events-none">
      <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        {figures.map(figure => (
          <g key={figure.id}>
            {renderFigure(figure)}
          </g>
        ))}
      </svg>
    </div>
  )
}
