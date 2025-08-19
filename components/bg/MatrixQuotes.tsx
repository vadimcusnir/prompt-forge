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
    // Early return for minimal motion
    if (motionLevel === 'minimal') {
      return
    }

    // Initialize quotes
    const initialQuotes: Quote[] = quotePool.map((text, index) => ({
      id: `quote-${index}`,
      text,
      x: Math.random() * (window.innerWidth - 200), // Reduced width
      y: Math.random() * (window.innerHeight - 80),  // Reduced height
      opacity: 0,
      isActive: false,
      isTyping: false,
      currentChar: 0,
      typeTimer: 0
    }))

    setQuotes(initialQuotes)

    // Quote activation cycle
    let quoteIndex = 0
    let lastQuoteTime = Date.now()

    const activateNextQuote = () => {
      // Check motion level again in case it changed
      if (motionLevel === 'minimal') {
        return
      }

      const now = Date.now()
      const minDelay = motionLevel === 'medium' ? 25000 : 20000  // Increased delays
      const maxDelay = motionLevel === 'medium' ? 35000 : 30000

      if (now - lastQuoteTime < minDelay) return

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
                ? { ...q, currentChar: charIndex + 1, opacity: 0.4 } // Reduced opacity
                : q
            ))
            charIndex++
          } else {
            // Typing complete
            setActiveQuotes(prev => prev.map(q => 
              q.id === nextQuote.id 
                ? { ...q, isTyping: false, opacity: 0.4 } // Reduced opacity
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
            }, 4000) // Reduced display time to 4s
          }
        }, motionLevel === 'medium' ? 80 : 60) // Slower typing speed
      }

      quoteIndex = (quoteIndex + 1) % initialQuotes.length
      lastQuoteTime = now

      // Schedule next quote
      const nextDelay = minDelay + Math.random() * (maxDelay - minDelay)
      setTimeout(activateNextQuote, nextDelay)
    }

    // Start quote cycle
    const initialDelay = 5000 + Math.random() * 3000 // 5-8s initial delay
    const initialTimer = setTimeout(activateNextQuote, initialDelay)

    return () => {
      clearTimeout(initialTimer)
    }
  }, [motionLevel])

  // Early return for minimal motion
  if (motionLevel === 'minimal') {
    return null
  }

  return (
    <div ref={containerRef} className="absolute inset-0 pointer-events-none">
      {activeQuotes.map(quote => (
        <div
          key={quote.id}
          className="absolute font-mono text-xs text-teal-400" // Reduced from text-sm to text-xs
          style={{
            left: quote.x,
            top: quote.y,
            opacity: quote.opacity,
            transition: 'opacity 0.3s ease-out',
            textShadow: '0 0 8px rgba(8, 145, 178, 0.3)', // Reduced shadow
            maxWidth: '180px', // Reduced from 300px
            lineHeight: '1.2', // Reduced line height
            fontSize: '10px' // Explicit small font size
          }}
        >
          {quote.text.substring(0, quote.currentChar)}
          {quote.isTyping && (
            <span 
              className="inline-block w-0.5 h-3 bg-teal-400 ml-1 animate-pulse" // Reduced height from h-4 to h-3
              style={{ animationDuration: '1s' }}
            />
          )}
        </div>
      ))}
    </div>
  )
}
