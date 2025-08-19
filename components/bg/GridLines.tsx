"use client"

import { useEffect, useRef, useState } from 'react'

interface GridLinesProps {
  motionLevel: 'auto' | 'medium' | 'minimal'
}

export default function GridLines({ motionLevel }: GridLinesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | undefined>(undefined)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas dimensions
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect()
      const width = rect.width
      const height = rect.height
      
      canvas.width = width * window.devicePixelRatio
      canvas.height = height * window.devicePixelRatio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
      
      setDimensions({ width, height })
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Grid configuration - mai subtile
    const gridConfig = {
      spacing: 100, // Increased from 80 to 100 for more subtle appearance
      opacity: motionLevel === 'minimal' ? 0.01 : 0.02, // Reduced opacity
      driftSpeed: motionLevel === 'minimal' ? 0 : motionLevel === 'medium' ? 0.3 : 0.6, // Reduced drift speed
      driftRange: motionLevel === 'minimal' ? 0 : motionLevel === 'medium' ? 0.5 : 1.0 // Reduced drift range
    }

    let time = 0
    let driftOffset = 0

    const animate = () => {
      if (motionLevel === 'minimal') {
        // Static grid pentru reduced motion
        drawStaticGrid(ctx, dimensions, gridConfig)
        return
      }

      // Animated grid cu drift
      ctx.clearRect(0, 0, dimensions.width, dimensions.height)
      
      // Drift calculation
      driftOffset = Math.sin(time * 0.001 * gridConfig.driftSpeed) * gridConfig.driftRange
      
      drawAnimatedGrid(ctx, dimensions, gridConfig, driftOffset)
      
      time += 16 // ~60fps
      animationRef.current = requestAnimationFrame(animate)
    }

    if (motionLevel !== 'minimal') {
      animate()
    } else {
      drawStaticGrid(ctx, dimensions, gridConfig)
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [motionLevel, dimensions])

  const drawStaticGrid = (
    ctx: CanvasRenderingContext2D, 
    dims: { width: number; height: number }, 
    config: any
  ) => {
    ctx.strokeStyle = `rgba(8, 145, 178, ${config.opacity})`
    ctx.lineWidth = 0.3 // Reduced from 0.5 to 0.3

    // Vertical lines
    for (let x = 0; x <= dims.width; x += config.spacing) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, dims.height)
      ctx.stroke()
    }

    // Horizontal lines
    for (let y = 0; y <= dims.height; y += config.spacing) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(dims.width, y)
      ctx.stroke()
    }
  }

  const drawAnimatedGrid = (
    ctx: CanvasRenderingContext2D, 
    dims: { width: number; height: number }, 
    config: any, 
    drift: number
  ) => {
    ctx.strokeStyle = `rgba(8, 145, 178, ${config.opacity})`
    ctx.lineWidth = 0.3 // Reduced from 0.5 to 0.3

    // Vertical lines cu drift
    for (let x = 0; x <= dims.width; x += config.spacing) {
      const driftX = x + drift
      ctx.beginPath()
      ctx.moveTo(driftX, 0)
      ctx.lineTo(driftX, dims.height)
      ctx.stroke()
    }

    // Horizontal lines cu drift
    for (let y = 0; y <= dims.height; y += config.spacing) {
      const driftY = y + drift * 0.5 // Parallax effect
      ctx.beginPath()
      ctx.moveTo(0, driftY)
      ctx.lineTo(dims.width, driftY)
      ctx.stroke()
    }
  }

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{
        opacity: motionLevel === 'minimal' ? 0.01 : 0.02, // Reduced opacity
        transition: 'opacity 0.3s ease-out'
      }}
    />
  )
}
