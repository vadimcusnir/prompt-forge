"use client"

import { useEffect, useRef, useState } from 'react'

interface MatrixTokensProps {
  motionLevel: 'auto' | 'medium' | 'minimal'
}

interface Token {
  id: string
  text: string
  x: number
  y: number
  opacity: number
  driftX: number
  driftY: number
  glitchTimer: number
  isGlitching: boolean
}

export default function MatrixTokens({ motionLevel }: MatrixTokensProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | undefined>(undefined)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const tokensRef = useRef<Token[]>([])

  // AI metric tokens pool - mai scurte și mai subtile
  const tokenPool = [
    'prompt', 'ctx', 'sem', 'vec', 'emb', 'tok', 'chunk',
    'sim', 'cos', 'euc', 'man', 'jac', 'dice',
    'prec', 'rec', 'f1', 'acc', 'bleu', 'rouge', 'bert',
    'gpt', 'llm', 'trans', 'attn', 'multi', 'pos',
    'act', 'relu', 'sig', 'tanh', 'soft', 'drop',
    'batch', 'epoch', 'grad', 'back', 'opt', 'adam',
    'mom', 'lr', 'loss', 'ce', 'mse', 'mae'
  ]

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

    // Token configuration - mai subtile
    const tokenConfig = {
      density: motionLevel === 'minimal' ? 0 : motionLevel === 'medium' ? 8 : 12, // Reduced density
      maxTokens: motionLevel === 'minimal' ? 0 : motionLevel === 'medium' ? 12 : 18, // Reduced max tokens
      spawnDelay: motionLevel === 'minimal' ? 0 : motionLevel === 'medium' ? 600 : 400, // Increased spawn delay
      glitchInterval: motionLevel === 'minimal' ? 0 : motionLevel === 'medium' ? 8000 : 6000, // Increased glitch interval
      driftSpeed: motionLevel === 'minimal' ? 0 : motionLevel === 'medium' ? 0.6 : 0.8 // Reduced drift speed
    }

    let time = 0
    let lastSpawn = 0

    // Initialize tokens
    const initializeTokens = () => {
      tokensRef.current = []
      for (let i = 0; i < tokenConfig.maxTokens; i++) {
        spawnToken()
      }
    }

    // Spawn new token
    const spawnToken = () => {
      if (tokensRef.current.length >= tokenConfig.maxTokens) return

      const token: Token = {
        id: Math.random().toString(36).substr(2, 9),
        text: tokenPool[Math.floor(Math.random() * tokenPool.length)],
        x: Math.random() * dimensions.width,
        y: Math.random() * dimensions.height,
        opacity: 0.15 + Math.random() * 0.25, // Reduced opacity range
        driftX: (Math.random() - 0.5) * 1.5, // Reduced drift range
        driftY: (Math.random() - 0.5) * 1.5,
        glitchTimer: Math.random() * tokenConfig.glitchInterval,
        isGlitching: false
      }

      tokensRef.current.push(token)
    }

    // Update token positions and states
    const updateTokens = (deltaTime: number) => {
      tokensRef.current.forEach((token, index) => {
        // Drift movement
        token.x += token.driftX * deltaTime * 0.001 * tokenConfig.driftSpeed
        token.y += token.driftY * deltaTime * 0.001 * tokenConfig.driftSpeed

        // Wrap around edges
        if (token.x < -80) token.x = dimensions.width + 80 // Reduced wrap distance
        if (token.x > dimensions.width + 80) token.x = -80
        if (token.y < -40) token.y = dimensions.height + 40
        if (token.y > dimensions.height + 40) token.y = -40

        // Glitch effect
        token.glitchTimer -= deltaTime
        if (token.glitchTimer <= 0) {
          token.isGlitching = true
          token.glitchTimer = Math.random() * tokenConfig.glitchInterval
          
          // Reset glitch after short duration
          setTimeout(() => {
            token.isGlitching = false
          }, 30 + Math.random() * 30) // Reduced glitch duration
        }
      })
    }

    // Render tokens
    const renderTokens = () => {
      ctx.clearRect(0, 0, dimensions.width, dimensions.height)
      
      tokensRef.current.forEach(token => {
        ctx.save()
        
        // Glitch effect
        if (token.isGlitching) {
          ctx.fillStyle = `rgba(190, 18, 60, ${token.opacity})` // Crimson for glitch
          ctx.shadowColor = 'rgba(190, 18, 60, 0.3)' // Reduced shadow
          ctx.shadowBlur = 6 // Reduced blur
        } else {
          ctx.fillStyle = `rgba(8, 145, 178, ${token.opacity})` // Teal normal
        }

        ctx.font = '9px "JetBrains Mono", monospace' // Reduced font size from 12px to 9px
        ctx.textAlign = 'left'
        ctx.textBaseline = 'top'
        
        // Draw token text
        ctx.fillText(token.text, token.x, token.y)
        
        ctx.restore()
      })
    }

    const animate = (currentTime: number) => {
      if (motionLevel === 'minimal') {
        return
      }

      const deltaTime = currentTime - time
      time = currentTime

      // Spawn new tokens
      if (currentTime - lastSpawn > tokenConfig.spawnDelay) {
        spawnToken()
        lastSpawn = currentTime
      }

      // Update and render
      updateTokens(deltaTime)
      renderTokens()

      animationRef.current = requestAnimationFrame(animate)
    }

    if (motionLevel !== 'minimal') {
      initializeTokens()
      animationRef.current = requestAnimationFrame(animate)
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [motionLevel, dimensions])

  if (motionLevel === 'minimal') {
    return null
  }

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{
        opacity: 0.4, // Reduced from 0.6 to 0.4
        transition: 'opacity 0.3s ease-out'
      }}
    />
  )
}
