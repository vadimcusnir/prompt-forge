"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface WaitlistSignup {
  email: string
  name: string
}

export default function ComingSoonPage() {
  const [formData, setFormData] = useState<WaitlistSignup>({
    email: "",
    name: ""
  })
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  // PROMPTFORGE™ VH fallback pentru Safari vechi
  useEffect(() => {
    function setVH() {
      document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
    }
    setVH();
    window.addEventListener('resize', setVH, { passive: true });
    return () => window.removeEventListener('resize', setVH);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        throw new Error('Failed to join waitlist')
      }

      setIsSubmitted(true)
    } catch (err) {
      setError("Error joining the waitlist. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-[100dvh] bg-background flex items-center justify-center p-4">
        <Card className="glass-strong max-w-2xl w-full p-12 text-center animate-fade-in">
          <div className="mb-8">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <div className="w-8 h-8 bg-primary rounded-full"></div>
            </div>
            <h1 className="text-4xl font-heading font-extrabold text-foreground mb-6">
              You're on the list.
            </h1>
            <p className="text-muted-foreground text-lg">
              We'll notify you when PROMPTFORGE™ v3.0 is ready for launch.
            </p>
          </div>
          
          <div className="space-y-4 text-sm text-muted-foreground mb-8">
            <p>✓ Email securely saved</p>
            <p>✓ Development updates enabled</p>
            <p>✓ Priority access granted</p>
          </div>
          
          <Button 
            onClick={() => setIsSubmitted(false)}
            variant="outline"
            className="w-full max-w-md"
          >
            Join with another email
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-[100dvh] bg-background">
      {/* Header */}
      <header className="container max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <div className="w-6 h-6 bg-primary-foreground rounded-sm"></div>
            </div>
            <div>
              <h1 className="text-2xl font-heading font-bold text-foreground">PROMPTFORGE™</h1>
              <p className="text-sm text-muted-foreground">v3.0</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Badge variant="secondary" className="text-xs text-blue-400">
              V3 Content & Education
            </Badge>
            <Badge variant="secondary" className="text-xs text-purple-400">
              V5 Branding
            </Badge>
          </div>
        </div>
      </header>

      {/* Hero Section - Optimizat pentru mobil */}
      <main className="container max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 sm:col-span-8 sm:col-start-3">
            <div className="glass-effect p-10 rounded-xl text-center animate-fade-in">
              <h1 className="text-4xl font-heading font-extrabold text-foreground mb-6">
                PROMPTFORGE™ is coming.
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Build prompt systems, not throwaway lines.
              </p>
              
              {/* Formular optimizat cu grid 12 coloane */}
              <form onSubmit={handleSubmit} className="mt-8 grid grid-cols-12 gap-3">
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Full Name"
                  className="col-span-12 sm:col-span-8 glass-effect p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  required
                />
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="your@email.com"
                  className="col-span-12 sm:col-span-8 glass-effect p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  required
                />
                <Button 
                  type="submit" 
                  className="col-span-12 sm:col-span-4 btn btn-primary glow-primary h-12 min-h-[48px] transform transition-all duration-200 ease-out hover:-translate-y-[1px] hover:scale-[1.01]"
                  disabled={isLoading}
                >
                  {isLoading ? "Processing..." : "Join the Waitlist"}
                </Button>
              </form>

              {/* Proof-bar */}
              <div className="glass-strong mt-5 px-4 py-2 text-sm text-muted-foreground rounded-md flex justify-between animate-slide-up">
                <span>TTA &lt; 60s</span>
                <span>AI Score ≥ 80</span>
                <span>Export .md/.json/.pdf</span>
              </div>
              
              {/* Mesaj anti-spam */}
              <p className="mt-2 text-sm text-muted-foreground">
                Zero spam. Doar notificări de lansare.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="container max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-12 mt-32">
        <div className="text-center text-muted-foreground text-sm">
          <p>© PromptForge™ 2025 • <a href="/terms" className="underline hover:text-foreground transition-colors duration-200">Privacy / Terms</a></p>
        </div>
      </footer>
    </div>
    )
}
