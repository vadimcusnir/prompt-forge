"use client"

import { useEffect, useRef } from 'react'

interface NoiseLayerProps {
  motionLevel: 'auto' | 'medium' | 'minimal'
}

export default function NoiseLayer({ motionLevel }: NoiseLayerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas dimensions
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * window.devicePixelRatio
      canvas.height = rect.height * window.devicePixelRatio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Noise configuration - mai subtil
    const noiseConfig = {
      opacity: motionLevel === 'minimal' ? 0.008 : 0.015, // Reduced opacity
      grainSize: 1,
      animationSpeed: motionLevel === 'minimal' ? 0 : motionLevel === 'medium' ? 0.2 : 0.4 // Reduced animation speed
    }

    // Generate noise pattern
    const generateNoise = () => {
      const imageData = ctx.createImageData(canvas.width, canvas.height)
      const data = imageData.data

      for (let i = 0; i < data.length; i += 4) {
        const noise = Math.random() * 255
        data[i] = noise     // R
        data[i + 1] = noise // G
        data[i + 2] = noise // B
        data[i + 3] = 255   // A
      }

      return imageData
    }

    let time = 0
    let noisePattern = generateNoise()

    const animate = () => {
      if (motionLevel === 'minimal') {
        // Static noise pentru reduced motion
        ctx.putImageData(noisePattern, 0, 0)
        return
      }

      // Animated noise cu subtle movement
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      // Subtle movement based on time - mai subtil
      const offsetX = Math.sin(time * 0.0003 * noiseConfig.animationSpeed) * 1 // Reduced from 2 to 1
      const offsetY = Math.cos(time * 0.0002 * noiseConfig.animationSpeed) * 1 // Reduced from 2 to 1
      
      ctx.putImageData(noisePattern, offsetX, offsetY)
      
      time += 16 // ~60fps
      animationRef.current = requestAnimationFrame(animate)
    }

    if (motionLevel !== 'minimal') {
      animate()
    } else {
      ctx.putImageData(noisePattern, 0, 0)
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [motionLevel])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{
        opacity: motionLevel === 'minimal' ? 0.008 : 0.015, // Reduced opacity
        transition: 'opacity 0.3s ease-out',
        mixBlendMode: 'overlay'
      }}
    />
  )
}
