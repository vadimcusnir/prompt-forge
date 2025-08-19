"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import BackgroundRoot from "@/components/bg/BackgroundRoot"

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
      <div className="pf-hero bg-background flex items-center justify-center p-4 sm:p-6 lg:p-8">
        {/* Background System pentru pagina de confirmare */}
        <BackgroundRoot 
          motionLevel="medium"
          enableMatrix={false}
          enableQuotes={false}
          enableFigures={false}
          enableMicroUI={false}
        />
        
        <Card className="glass-strong w-full max-w-sm sm:max-w-md lg:max-w-2xl p-6 sm:p-8 lg:p-12 text-center animate-fade-in relative z-10">
          <div className="mb-6 sm:mb-8">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <div className="w-6 h-6 sm:w-8 sm:w-8 bg-primary rounded-full"></div>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-extrabold text-foreground mb-4 sm:mb-6">
              You're on the list.
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-muted-foreground">
              We'll notify you when PROMPTFORGE™ v3.0 is ready for launch.
            </p>
          </div>
          
          <div className="space-y-2 sm:space-y-3 lg:space-y-4 text-xs sm:text-sm text-muted-foreground mb-6 sm:mb-8">
            <p>✓ Email securely saved</p>
            <p>✓ Development updates enabled</p>
            <p>✓ Priority access granted</p>
          </div>
          
          <Button 
            onClick={() => setIsSubmitted(false)}
            variant="outline"
            className="w-full max-w-xs sm:max-w-sm lg:max-w-md h-10 sm:h-11 lg:h-12 text-sm sm:text-base"
          >
            Join with another email
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="pf-hero bg-background">
      {/* AI-IDEI™ Background System - 8 layere animate */}
      <BackgroundRoot 
        motionLevel="auto"
        enableMatrix={true}
        enableQuotes={true}
        enableFigures={true}
        enableMicroUI={true}
      />
      
      {/* Header - Mobile First */}
      <header className="container max-w-screen-xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
          {/* Logo & Brand */}
          <div className="flex items-center justify-center sm:justify-start space-x-2 sm:space-x-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 sm:w-6 sm:h-6 bg-primary-foreground rounded-sm"></div>
            </div>
            <div className="text-center sm:text-left">
              <h1 className="text-lg sm:text-xl lg:text-2xl font-heading font-bold text-foreground">PROMPTFORGE™</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">v3.0</p>
            </div>
          </div>
          
          {/* Badges - Stack pe mobile, inline pe desktop */}
          <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-3 lg:space-x-4">
            <Badge variant="secondary" className="text-xs text-blue-400 w-full sm:w-auto justify-center">
              V3 Content & Education
            </Badge>
            <Badge variant="secondary" className="text-xs text-purple-400 w-full sm:w-auto justify-center">
              V5 Branding
            </Badge>
          </div>
        </div>
      </header>

      {/* Hero Section - Mobile First Design */}
      <main className="container max-w-screen-xl mx-auto px-3 sm:px-4 lg:px-8 py-8 sm:py-12 lg:py-16 relative z-10">
        <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:gap-8">
          <div className="w-full max-w-2xl mx-auto">
            <div className="glass-effect p-6 sm:p-8 lg:p-10 rounded-xl sm:rounded-2xl text-center animate-fade-in">
              {/* Hero Title - Responsive Typography */}
              <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-heading font-extrabold text-foreground mb-4 sm:mb-6 leading-tight">
                PROMPTFORGE™ is coming.
              </h1>
              
              {/* Hero Subtitle - Responsive */}
              <p className="text-base sm:text-lg lg:text-xl xl:text-2xl text-muted-foreground mb-6 sm:mb-8 max-w-xl mx-auto leading-relaxed">
                Build prompt systems, not throwaway lines.
              </p>
              
              {/* Formular optimizat mobile-first */}
              <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                {/* Name Input - Full width pe mobile */}
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Full Name"
                  className="w-full h-11 sm:h-12 text-base sm:text-lg glass-effect p-3 sm:p-4 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-200"
                  required
                />
                
                {/* Email Input - Full width pe mobile */}
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="your@email.com"
                  className="w-full h-11 sm:h-12 text-base sm:text-lg glass-effect p-3 sm:p-4 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-200"
                  required
                />
                
                {/* Submit Button - Full width, touch-friendly */}
                <Button 
                  type="submit" 
                  className="w-full h-12 sm:h-14 text-base sm:text-lg font-semibold btn btn-primary glow-primary transform transition-all duration-200 ease-out hover:-translate-y-[1px] hover:scale-[1.01] active:scale-[0.98] touch-manipulation"
                  disabled={isLoading}
                >
                  {isLoading ? "Processing..." : "Join the Waitlist"}
                </Button>
              </form>

              {/* Proof-bar - Responsive Layout */}
              <div className="glass-strong mt-4 sm:mt-5 lg:mt-6 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-muted-foreground rounded-lg sm:rounded-xl flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0 animate-slide-up">
                <span className="text-center sm:text-left">TTA &lt; 60s</span>
                <span className="text-center sm:text-left">AI Score ≥ 80</span>
                <span className="text-center sm:text-left">Export .md/.json/.pdf</span>
              </div>
              
              {/* Mesaj anti-spam - Responsive */}
              <p className="mt-2 sm:mt-3 text-xs sm:text-sm text-muted-foreground px-2">
                Zero spam. Doar notificări de lansare.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer - Mobile First */}
      <footer className="container max-w-screen-xl mx-auto px-3 sm:px-4 lg:px-8 py-8 sm:py-10 lg:py-12 mt-16 sm:mt-24 lg:mt-32 relative z-10">
        <div className="text-center text-muted-foreground text-xs sm:text-sm">
          <p>© PromptForge™ 2025 • <a href="/terms" className="underline hover:text-foreground transition-colors duration-200">Privacy / Terms</a></p>
        </div>
      </footer>
    </div>
  )
}
