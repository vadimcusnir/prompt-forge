"use client"

import { useEffect, useState } from 'react'

interface MicroUIProps {
  motionLevel: 'auto' | 'medium' | 'minimal'
}

interface Tooltip {
  id: string
  text: string
  x: number
  y: number
  fontSize: 'xs' | 'sm' | 'base' | 'lg'
  isVisible: boolean
  opacity: number
  color: string
}

export default function MicroUI({ motionLevel }: MicroUIProps) {
  const [tooltips, setTooltips] = useState<Tooltip[]>([])
  const [hoverState, setHoverState] = useState<string | null>(null)

  useEffect(() => {
    if (motionLevel === 'minimal') {
      return
    }

    // Initialize tooltips with diverse font sizes per layer
    const initialTooltips: Tooltip[] = [
      // L7: Micro-UI - Font foarte mic pentru tooltips
      {
        id: 'tooltip-1',
        text: 'AI Score',
        x: 50,
        y: 50,
        fontSize: 'xs',
        isVisible: false,
        opacity: 0,
        color: 'rgba(8, 145, 178, 0.8)'
      },
      {
        id: 'tooltip-2',
        text: 'Prompt Quality',
        x: 150,
        y: 80,
        fontSize: 'sm',
        isVisible: false,
        opacity: 0,
        color: 'rgba(190, 18, 60, 0.7)'
      },
      {
        id: 'tooltip-3',
        text: 'Semantic Depth',
        x: 250,
        y: 120,
        fontSize: 'base',
        isVisible: false,
        opacity: 0,
        color: 'rgba(8, 145, 178, 0.6)'
      },
      {
        id: 'tooltip-4',
        text: 'Context Relevance',
        x: 350,
        y: 90,
        fontSize: 'lg',
        isVisible: false,
        opacity: 0,
        color: 'rgba(190, 18, 60, 0.5)'
      }
    ]

    setTooltips(initialTooltips)

    // Simulate hover interactions
    const interval = setInterval(() => {
      setTooltips(prev => prev.map(tooltip => {
        const shouldShow = Math.random() > 0.7
        return {
          ...tooltip,
          isVisible: shouldShow,
          opacity: shouldShow ? 0.9 : 0
        }
      }))
    }, 3000)

    return () => clearInterval(interval)
  }, [motionLevel])

  if (motionLevel === 'minimal') {
    return null
  }

  const getFontSize = (size: 'xs' | 'sm' | 'base' | 'lg') => {
    switch (size) {
      case 'xs': return 'text-xs' // 12px - L7 Micro
      case 'sm': return 'text-sm' // 14px - L7 Small
      case 'base': return 'text-base' // 16px - L7 Base
      case 'lg': return 'text-lg' // 18px - L7 Large
      default: return 'text-sm'
    }
  }

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Tooltips with diverse font sizes */}
      {tooltips.map(tooltip => (
        <div
          key={tooltip.id}
          className={`absolute ${getFontSize(tooltip.fontSize)} font-mono`}
          style={{
            left: tooltip.x,
            top: tooltip.y,
            opacity: tooltip.opacity,
            color: tooltip.color,
            textShadow: `0 0 8px ${tooltip.color}`,
            transform: tooltip.isVisible ? 'scale(1.05)' : 'scale(1)',
            transition: 'opacity 0.5s ease-out, transform 0.5s ease-out'
          }}
        >
          {tooltip.text}
        </div>
      ))}

      {/* Hover feedback indicators */}
      <div className="absolute bottom-4 right-4">
        <div className="flex space-x-2">
          {/* Status indicator */}
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse"></div>
            <span className="text-xs text-teal-400 font-mono opacity-60">
              PromptForge Active
            </span>
          </div>
          
          {/* Motion level indicator */}
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-crimson-400 rounded-full animate-pulse"></div>
            <span className="text-xs text-crimson-400 font-mono opacity-60">
              {motionLevel.toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* Corner info panel */}
      <div className="absolute top-4 left-4 opacity-40 hover:opacity-80" style={{ transition: 'opacity 0.3s ease-out' }}>
        <div className="bg-black/20 rounded-lg p-2 border border-white/10" style={{ filter: 'blur(4px)' }}>
          <div className="text-xs text-teal-400 font-mono">
            <div>Layer 7: Micro-UI</div>
            <div className="text-crimson-400">Interactive Feedback</div>
          </div>
        </div>
      </div>
    </div>
  )
}
