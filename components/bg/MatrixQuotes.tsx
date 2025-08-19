"use client"

import { useEffect, useRef, useState } from 'react'

interface MatrixQuotesProps {
  motionLevel: 'auto' | 'medium' | 'minimal'
}

interface Quote {
  id: string
  text: string
  x: number
  y: number
  opacity: number
  isActive: boolean
  isTyping: boolean
  currentChar: number
  typeTimer: number
}

export default function MatrixQuotes({ motionLevel }: MatrixQuotesProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [activeQuotes, setActiveQuotes] = useState<Quote[]>([])

  // Quote cap enforcement conform specificațiilor CyberHome_SYS
  const MAX_QUOTES = motionLevel === 'minimal' ? 1 : motionLevel === 'medium' ? 2 : 3
  const TYPING_SPEED_MS = 50 // [40,60]ms conform spec
  const QUOTE_IN_MS = 400 // [300,500]ms conform spec
  const QUOTE_OUT_MS = 1000 // [800,1200]ms conform spec
  const QUOTE_TOTAL_MS = 6000 // ~6s conform spec

  console.log('MatrixQuotes: Component rendered with motionLevel:', motionLevel, 'MAX_QUOTES:', MAX_QUOTES)

  // AI narrative quotes pool - mai scurte și mai subtile
  const quotePool = [
    "Promptul e contractul tău cu viitorul.",
    "Contextul este regele.",
    "Fiecare token contează.",
    "Semantica e în relații.",
    "Vectorii reflectă realitatea.",
    "AI-ul procesează, tu gândești.",
    "Fiecare prompt e o revoluție.",
    "Nu există prompt perfect.",
    "Limbajul e interfața.",
    "Fiecare interacțiune e o lecție."
  ]

  useEffect(() => {
    console.log('MatrixQuotes: useEffect triggered, motionLevel:', motionLevel)
    
    // Early return for minimal motion
    if (motionLevel === 'minimal') {
      console.log('MatrixQuotes: Minimal motion, returning early')
      return
    }

    // Initialize quotes
    const initialQuotes: Quote[] = quotePool.map((text, index) => ({
      id: `quote-${index}`,
      text,
      x: Math.random() * (window.innerWidth - 200),
      y: Math.random() * (window.innerHeight - 80),
      opacity: 0,
      isActive: false,
      isTyping: false,
      currentChar: 0,
      typeTimer: 0
    }))

    setQuotes(initialQuotes)
    console.log('MatrixQuotes: Initialized quotes:', initialQuotes.length)

    // Quote activation cycle
    let quoteIndex = 0
    let lastQuoteTime = Date.now()

    const activateNextQuote = () => {
      // Check motion level again in case it changed
      if (motionLevel === 'minimal') {
        return
      }

      // Enforce quote cap - never exceed MAX_QUOTES
      if (activeQuotes.length >= MAX_QUOTES) {
        console.log('MatrixQuotes: Quote cap reached, skipping activation')
        return
      }

      const now = Date.now()
      const minDelay = motionLevel === 'medium' ? 8000 : 5000  // Redus delay-urile
      const maxDelay = motionLevel === 'medium' ? 12000 : 8000

      if (now - lastQuoteTime < minDelay) return

      console.log('MatrixQuotes: Activating quote:', quoteIndex, 'active count:', activeQuotes.length)

      // Deactivate current quotes
      setActiveQuotes([])

      // Activate new quote
      const nextQuote = initialQuotes[quoteIndex]
      if (nextQuote) {
        const activatedQuote = {
          ...nextQuote,
          isActive: true,
          isTyping: true,
          opacity: 0,
          currentChar: 0
        }

        setActiveQuotes([activatedQuote])

        // Start typing animation
        let charIndex = 0
        const typeInterval = setInterval(() => {
          if (charIndex < nextQuote.text.length) {
            setActiveQuotes(prev => prev.map(q => 
              q.id === nextQuote.id 
                ? { ...q, currentChar: charIndex + 1, opacity: 0.7 } // Mărit opacity pentru vizibilitate
                : q
            ))
            charIndex++
          } else {
            // Typing complete
            setActiveQuotes(prev => prev.map(q => 
              q.id === nextQuote.id 
                ? { ...q, isTyping: false, opacity: 0.7 } // Mărit opacity pentru vizibilitate
                : q
            ))
            clearInterval(typeInterval)

            // Fade out after delay
            setTimeout(() => {
              setActiveQuotes(prev => prev.map(q => 
                q.id === nextQuote.id 
                  ? { ...q, opacity: 0, isActive: false }
                  : q
              ))
            }, 3000) // Redus display time la 3s
          }
        }, motionLevel === 'medium' ? 60 : 40) // Typing mai rapid
      }

      quoteIndex = (quoteIndex + 1) % initialQuotes.length
      lastQuoteTime = now

      // Schedule next quote
      const nextDelay = minDelay + Math.random() * (maxDelay - minDelay)
      setTimeout(activateNextQuote, nextDelay)
    }

    // Start quote cycle - delay scurt pentru a fi vizibil
    const initialDelay = 1000 + Math.random() * 1000 // 1-2s initial delay
    const initialTimer = setTimeout(activateNextQuote, initialDelay)

    return () => {
      clearTimeout(initialTimer)
    }
  }, [motionLevel])

  console.log('MatrixQuotes: Render state:', { motionLevel, activeQuotes: activeQuotes.length })

  // Early return for minimal motion
  if (motionLevel === 'minimal') {
    return null
  }

  return (
    <div ref={containerRef} className="absolute inset-0 pointer-events-none">
      {activeQuotes.map(quote => (
        <div
          key={quote.id}
          className="absolute font-mono text-sm text-teal-400" // Mărit font size pentru vizibilitate
          style={{
            left: quote.x,
            top: quote.y,
            opacity: quote.opacity,
            transition: 'opacity 0.3s ease-out',
            textShadow: '0 0 12px rgba(8, 145, 178, 0.5)', // Mărit shadow pentru vizibilitate
            maxWidth: '250px', // Mărit max width
            lineHeight: '1.3', // Mărit line height
            fontSize: '12px' // Mărit font size
          }}
        >
          {quote.text.substring(0, quote.currentChar)}
          {quote.isTyping && (
            <span 
              className="inline-block w-0.5 h-4 bg-teal-400 ml-1 animate-pulse" // Mărit cursor
              style={{ animationDuration: '1s' }}
            />
          )}
        </div>
      ))}
    </div>
  )
}
