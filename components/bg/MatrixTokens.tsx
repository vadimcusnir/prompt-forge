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
  lifePhase: number // 0 = spawning, 1 = active, 2 = fading
  spawnTime: number
  fadeStartTime: number
}

export default function MatrixTokens({ motionLevel }: MatrixTokensProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | undefined>(undefined)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const tokensRef = useRef<Token[]>([])

  // Verifică dacă animațiile sunt blocate de sistem
  const isMotionReduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  console.log('MatrixTokens: Component rendered with motionLevel:', motionLevel, 'isMotionReduced:', isMotionReduced)

  // AI metric tokens pool - extins pentru mai multă varietate
  const tokenPool = [
    'prompt', 'ctx', 'sem', 'vec', 'emb', 'tok', 'chunk',
    'sim', 'cos', 'euc', 'man', 'jac', 'dice',
    'prec', 'rec', 'f1', 'acc', 'bleu', 'rouge', 'bert',
    'gpt', 'llm', 'trans', 'attn', 'multi', 'pos',
    'act', 'relu', 'sig', 'tanh', 'soft', 'drop',
    'batch', 'epoch', 'grad', 'back', 'opt', 'adam',
    'mom', 'lr', 'loss', 'ce', 'mse', 'mae',
    'rnn', 'lstm', 'gru', 'cnn', 'pool', 'conv',
    'norm', 'batch', 'layer', 'drop', 'reg', 'l1',
    'l2', 'adam', 'sgd', 'momentum', 'nesterov', 'rmsprop',
    'transformer', 'attention', 'self-attn', 'cross-attn',
    'positional', 'embedding', 'tokenization', 'subword',
    'bpe', 'wordpiece', 'sentencepiece', 'vocabulary',
    'corpus', 'dataset', 'training', 'validation', 'test',
    'overfitting', 'underfitting', 'generalization', 'bias',
    'variance', 'ensemble', 'bagging', 'boosting', 'stacking'
  ]

  useEffect(() => {
    console.log('MatrixTokens: useEffect triggered, motionLevel:', motionLevel, 'dimensions:', dimensions)
    
    // Verifică dacă animațiile sunt blocate de sistem
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      console.log('MatrixTokens: Motion reduced by system, skipping animations')
      return
    }
    
    // Early return for minimal motion
    if (motionLevel === 'minimal') {
      console.log('MatrixTokens: Minimal motion, returning early')
      return
    }
    
    const canvas = canvasRef.current
    if (!canvas) {
      console.log('MatrixTokens: No canvas ref')
      return
    }

    const ctx = canvas.getContext('2d')
    if (!ctx) {
      console.log('MatrixTokens: No canvas context')
      return
    }

    console.log('MatrixTokens: Canvas setup complete, dimensions:', dimensions)

    // Set canvas dimensions
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect()
      const width = rect.width || window.innerWidth
      const height = rect.height || window.innerHeight
      
      console.log('MatrixTokens: Resizing canvas to:', width, 'x', height)
      
      canvas.width = width * window.devicePixelRatio
      canvas.height = height * window.devicePixelRatio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
      
      setDimensions({ width, height })
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)
    
    // Forțează o dimensiune minimă dacă canvas-ul nu are dimensiuni
    if (dimensions.width === 0 || dimensions.height === 0) {
      console.log('MatrixTokens: Forcing default dimensions')
      setDimensions({ width: window.innerWidth, height: window.innerHeight })
    }

    // Token configuration - conform specificațiilor CyberHome_SYS
    const tokenConfig = {
      maxTokens: motionLevel === 'minimal' ? 15 : motionLevel === 'medium' ? 25 : 35,
      spawnDelay: Math.random() * 700 + 100, // [100,800]ms random conform spec
      tokensPerBeat: motionLevel === 'minimal' ? 2 : motionLevel === 'medium' ? 3 : 4,
      spawnDuration: 200, // ms pentru spawn
      activeDuration: 3000, // ms pentru starea activă
      fadeDuration: 6000, // ms pentru fade-out
      glitchInterval: motionLevel === 'minimal' ? 5000 : motionLevel === 'medium' ? 3500 : 2000,
      driftSpeed: motionLevel === 'minimal' ? 0.3 : motionLevel === 'medium' ? 0.5 : 0.8, // ±2-3px pentru ambient_minimal
      driftAmplitude: motionLevel === 'minimal' ? 2.5 : motionLevel === 'medium' ? 3.0 : 4.0 // Conform spec ambient_minimal
    }

    let lastSpawnTime = Date.now()
    let time = 0

    // Spawn new tokens with proper random delay [100,800]ms
    const spawnTokens = () => {
      const now = Date.now()
      if (now - lastSpawnTime < tokenConfig.spawnDelay) return

      console.log('MatrixTokens: Spawning tokens, current count:', tokensRef.current.length, 'spawnDelay:', tokenConfig.spawnDelay)

      // Spawn tokens per beat
      for (let i = 0; i < tokenConfig.tokensPerBeat; i++) {
        if (tokensRef.current.length >= tokenConfig.maxTokens) continue

        const token: Token = {
          id: Math.random().toString(36).substr(2, 9),
          text: tokenPool[Math.floor(Math.random() * tokenPool.length)],
          x: Math.random() * dimensions.width, // Poziționare aleatorie pe toată suprafața
          y: Math.random() * dimensions.height,
          opacity: 0,
          driftX: (Math.random() - 0.5) * tokenConfig.driftAmplitude, // Conform spec ±2-3px
          driftY: (Math.random() - 0.5) * tokenConfig.driftAmplitude, // Conform spec ±2-3px
          glitchTimer: Math.random() * tokenConfig.glitchInterval,
          isGlitching: false,
          lifePhase: 0, // Spawning
          spawnTime: now,
          fadeStartTime: now + tokenConfig.spawnDuration + tokenConfig.activeDuration
        }

        tokensRef.current.push(token)
        console.log('MatrixTokens: Spawned token:', token.text, 'at', token.x, token.y)
      }

      // Reset spawn delay for next cycle
      lastSpawnTime = now
      tokenConfig.spawnDelay = Math.random() * 700 + 100 // [100,800]ms random
    }

    // Update token states and positions
    const updateTokens = (deltaTime: number) => {
      const now = Date.now()
      
      tokensRef.current.forEach((token, index) => {
        // Update life phases
        if (token.lifePhase === 0 && now - token.spawnTime >= tokenConfig.spawnDuration) {
          token.lifePhase = 1 // Active
        } else if (token.lifePhase === 1 && now >= token.fadeStartTime) {
          token.lifePhase = 2 // Fading
        }

        // Update opacity based on life phase
        if (token.lifePhase === 0) {
          // Spawning: fade in
          token.opacity = Math.min(1.0, (now - token.spawnTime) / tokenConfig.spawnDuration * 1.0)
        } else if (token.lifePhase === 1) {
          // Active: full opacity
          token.opacity = 1.0
        } else if (token.lifePhase === 2) {
          // Fading: fade out over 2.5x longer duration
          const fadeProgress = (now - token.fadeStartTime) / tokenConfig.fadeDuration
          token.opacity = Math.max(0, 1.0 * (1 - fadeProgress))
        }

        // Drift movement only when active
        if (token.lifePhase === 1) {
          token.x += token.driftX * deltaTime * 0.001 * tokenConfig.driftSpeed
          token.y += token.driftY * deltaTime * 0.001 * tokenConfig.driftSpeed

          // Wrap around edges
          if (token.x < -80) token.x = dimensions.width + 80
          if (token.x > dimensions.width + 80) token.x = -80
          if (token.y < -40) token.y = dimensions.height + 40
          if (token.y > dimensions.height + 40) token.y = -40
        }

        // Glitch effect
        token.glitchTimer -= deltaTime
        if (token.glitchTimer <= 0) {
          token.isGlitching = true
          token.glitchTimer = Math.random() * tokenConfig.glitchInterval
          
          setTimeout(() => {
            token.isGlitching = false
          }, 50 + Math.random() * 50)
        }
      })

      // Remove dead tokens
      tokensRef.current = tokensRef.current.filter(token => 
        token.lifePhase !== 2 || token.opacity > 0
      )
    }

    // Render tokens
    const renderTokens = () => {
      ctx.clearRect(0, 0, dimensions.width, dimensions.height)
      
      if (tokensRef.current.length === 0) {
        console.log('MatrixTokens: No tokens to render')
        return
      }
      
      console.log('MatrixTokens: Rendering', tokensRef.current.length, 'tokens')
      
      tokensRef.current.forEach((token, index) => {
        if (token.opacity <= 0) return

        ctx.save()
        
        // Glitch effect
        if (token.isGlitching) {
          ctx.fillStyle = `rgba(190, 18, 60, ${token.opacity})`
          ctx.shadowColor = 'rgba(190, 18, 60, 0.8)'
          ctx.shadowBlur = 12
        } else {
          ctx.fillStyle = `rgba(8, 145, 178, ${token.opacity})`
          ctx.shadowColor = 'rgba(8, 145, 178, 0.6)'
          ctx.shadowBlur = 8
        }

        ctx.font = '12px "JetBrains Mono", monospace'
        ctx.textAlign = 'left'
        ctx.textBaseline = 'top'
        
        ctx.fillText(token.text, token.x, token.y)
        
        // Debug: desenează un cerc mic pentru a vedea poziția
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.arc(token.x, token.y, 2, 0, 2 * Math.PI)
        ctx.stroke()
        
        ctx.restore()
      })
    }

    const animate = (currentTime: number) => {
      const deltaTime = currentTime - time
      time = currentTime

      // Spawn tokens in heartbeat rhythm
      spawnTokens()

      // Update and render
      updateTokens(deltaTime)
      renderTokens()

      // Debug: log la fiecare 60 de frame-uri (aproximativ o dată pe secundă)
      if (Math.floor(currentTime / 1000) % 1 === 0 && Math.floor(currentTime / 16.67) % 60 === 0) {
        console.log('MatrixTokens: Animation frame, tokens:', tokensRef.current.length, 'deltaTime:', deltaTime)
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    // Pornește animația imediat
    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [motionLevel, dimensions])

  // Nu mai verifică motionLevel - renderizează întotdeauna
  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{
        opacity: 1.0,
        transition: 'opacity 0.3s ease-out'
      }}
    />
  )
}
