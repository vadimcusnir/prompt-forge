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

  // AI narrative quotes pool
  const quotePool = [
    "Promptul e contractul tău scris cu viitorul.",
    "Contextul este regele, promptul este doar mesagerul.",
    "Fiecare token contează, fiecare context se amplifică.",
    "Semantica nu e în cuvinte, e în relațiile dintre ele.",
    "Vectorii nu mint, doar reflectă realitatea pe care o construiești.",
    "AI-ul nu gândește, procesează. Tu gândești prin el.",
    "Fiecare prompt e o mică revoluție semantică.",
    "Nu există prompt perfect, doar prompt adaptat la context.",
    "Limbajul e interfața între intenția ta și inteligența artificială.",
    "Fiecare interacțiune cu AI-ul e o lecție de claritate."
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
      x: Math.random() * (window.innerWidth - 300),
      y: Math.random() * (window.innerHeight - 100),
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
      const minDelay = motionLevel === 'medium' ? 20000 : 15000
      const maxDelay = motionLevel === 'medium' ? 30000 : 25000

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
                ? { ...q, currentChar: charIndex + 1, opacity: 0.8 }
                : q
            ))
            charIndex++
          } else {
            // Typing complete
            setActiveQuotes(prev => prev.map(q => 
              q.id === nextQuote.id 
                ? { ...q, isTyping: false, opacity: 0.8 }
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
            }, 6000) // 6s display time
          }
        }, motionLevel === 'medium' ? 60 : 40) // Typing speed
      }

      quoteIndex = (quoteIndex + 1) % initialQuotes.length
      lastQuoteTime = now

      // Schedule next quote
      const nextDelay = minDelay + Math.random() * (maxDelay - minDelay)
      setTimeout(activateNextQuote, nextDelay)
    }

    // Start quote cycle
    const initialDelay = 3000 + Math.random() * 2000 // 3-5s initial delay
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
          className="absolute font-mono text-sm text-teal-400"
          style={{
            left: quote.x,
            top: quote.y,
            opacity: quote.opacity,
            transition: 'opacity 0.3s ease-out',
            textShadow: '0 0 10px rgba(8, 145, 178, 0.5)',
            maxWidth: '300px',
            lineHeight: '1.4'
          }}
        >
          {quote.text.substring(0, quote.currentChar)}
          {quote.isTyping && (
            <span 
              className="inline-block w-0.5 h-4 bg-teal-400 ml-1 animate-pulse"
              style={{ animationDuration: '1s' }}
            />
          )}
        </div>
      ))}
    </div>
  )
}
