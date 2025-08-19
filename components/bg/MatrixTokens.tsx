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

  // AI metric tokens pool
  const tokenPool = [
    'prompt', 'context', 'semantic', 'vector', 'embedding', 'token', 'chunk',
    'similarity', 'cosine', 'euclidean', 'manhattan', 'jaccard', 'dice',
    'precision', 'recall', 'f1', 'accuracy', 'bleu', 'rouge', 'bert',
    'gpt', 'llm', 'transformer', 'attention', 'multihead', 'positional',
    'activation', 'relu', 'sigmoid', 'tanh', 'softmax', 'dropout',
    'batch', 'epoch', 'gradient', 'backprop', 'optimizer', 'adam',
    'momentum', 'learning_rate', 'loss', 'cross_entropy', 'mse', 'mae'
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

    // Token configuration
    const tokenConfig = {
      density: motionLevel === 'minimal' ? 0 : motionLevel === 'medium' ? 15 : 25,
      maxTokens: motionLevel === 'minimal' ? 0 : motionLevel === 'medium' ? 20 : 30,
      spawnDelay: motionLevel === 'minimal' ? 0 : motionLevel === 'medium' ? 400 : 200,
      glitchInterval: motionLevel === 'minimal' ? 0 : motionLevel === 'medium' ? 5000 : 3000,
      driftSpeed: motionLevel === 'minimal' ? 0 : motionLevel === 'medium' ? 0.8 : 1.2
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
        opacity: 0.3 + Math.random() * 0.4,
        driftX: (Math.random() - 0.5) * 2,
        driftY: (Math.random() - 0.5) * 2,
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
        if (token.x < -100) token.x = dimensions.width + 100
        if (token.x > dimensions.width + 100) token.x = -100
        if (token.y < -50) token.y = dimensions.height + 50
        if (token.y > dimensions.height + 50) token.y = -50

        // Glitch effect
        token.glitchTimer -= deltaTime
        if (token.glitchTimer <= 0) {
          token.isGlitching = true
          token.glitchTimer = Math.random() * tokenConfig.glitchInterval
          
          // Reset glitch after short duration
          setTimeout(() => {
            token.isGlitching = false
          }, 50 + Math.random() * 50)
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
          ctx.shadowColor = 'rgba(190, 18, 60, 0.5)'
          ctx.shadowBlur = 10
        } else {
          ctx.fillStyle = `rgba(8, 145, 178, ${token.opacity})` // Teal normal
        }

        ctx.font = '12px "JetBrains Mono", monospace'
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
        opacity: 0.6,
        transition: 'opacity 0.3s ease-out'
      }}
    />
  )
}
