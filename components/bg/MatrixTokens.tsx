'use client'

import React, { useEffect, useRef } from 'react'

export default function MatrixTokens({ density = 24 }: { density?: number }) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null)
  const tokensRef = useRef<{ x: number; y: number; vx: number; vy: number }[] | null>(null)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctxRef.current = ctx

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const el = wrapRef.current!
    const w = el.clientWidth, h = el.clientHeight
    canvas.width = Math.max(1, Math.round(w * dpr))
    canvas.height = Math.max(1, Math.round(h * dpr))
    canvas.style.width = `${w}px`
    canvas.style.height = `${h}px`
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    if (density > 0) {
      const arr = new Array(density).fill(0).map(() => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.08,
        vy: (Math.random() - 0.5) * 0.08
      }))
      tokensRef.current = arr
    } else {
      tokensRef.current = null
    }

    let last = performance.now()
    const tick = (now: number) => {
      const dt = now - last
      last = now
      const ctx = ctxRef.current!
      const tokens = tokensRef.current
      ctx.clearRect(0, 0, w, h)
      if (tokens) {
        for (const t of tokens) {
          t.x += t.vx * dt * 0.06
          t.y += t.vy * dt * 0.06
          if (t.x < 0) t.x = w
          if (t.x > w) t.x = 0
          if (t.y < 0) t.y = h
          if (t.y > h) t.y = 0
          ctx.globalAlpha = 0.8
          ctx.fillRect(t.x, t.y, 1, 1)
        }
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [density])

  return (
    <div ref={wrapRef} className="bg-anim absolute inset-0">
      <canvas ref={canvasRef} />
    </div>
  )
}
