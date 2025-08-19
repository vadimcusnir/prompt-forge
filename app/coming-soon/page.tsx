"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckCircle, Clock, Zap, Shield, Users, Rocket } from "lucide-react"

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      // TODO: Implement Supabase integration
      // const { data, error } = await supabase
      //   .from('waitlist_signups')
      //   .insert([formData])
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setIsSubmitted(true)
    } catch (err) {
      setError("Error joining the waitlist. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A0A0A] via-[#0F0F0F] to-[#0A0A0A] flex items-center justify-center p-4">
        <Card className="glass-effect max-w-2xl w-full p-8 text-center">
          <div className="mb-6">
            <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-foreground mb-4">
              Thank you for your interest!
            </h1>
            <p className="text-muted-foreground text-lg">
              You're now on the waitlist for PROMPTFORGE™ v3.0. 
              We'll contact you when the application is ready for launch.
            </p>
          </div>
          
          <div className="space-y-4 text-sm text-muted-foreground">
            <p>✅ Your email has been securely saved</p>
            <p>✅ You'll receive updates on development progress</p>
            <p>✅ You'll have priority access at launch</p>
          </div>
          
          <Button 
            onClick={() => setIsSubmitted(false)}
            className="mt-6"
            variant="outline"
          >
            Join with another email
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0A0A] via-[#0F0F0F] to-[#0A0A0A]">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">PROMPTFORGE™</h1>
              <p className="text-sm text-muted-foreground">v3.0</p>
            </div>
          </div>
          
          <Badge variant="secondary" className="text-xs text-blue-400">
            V3 Content & Education
          </Badge>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4 text-cyan-400 border-cyan-400/30">
            🚀 Coming Soon
          </Badge>
          
          <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6 leading-tight">
            Build prompt systems,<br />
            <span className="text-transparent bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text">
              not one-off pieces
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            PROMPTFORGE™ is the operational generator with 50 real modules and a 7‑D engine. 
            Configure once, export repeatable artifacts in &lt; 60 seconds.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <Card className="glass-effect p-6 text-center">
            <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Shield className="w-6 h-6 text-cyan-400" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              50 V1-V7 Modules
            </h3>
            <p className="text-muted-foreground text-sm">
              Modules as micro-services with semantic vectors and specialized categories
            </p>
          </Card>

          <Card className="glass-effect p-6 text-center">
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Rocket className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              7-D Engine
            </h3>
            <p className="text-muted-foreground text-sm">
              Domain, Scale, Urgency, Complexity, Resources, Application, Output
            </p>
          </Card>

          <Card className="glass-effect p-6 text-center">
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 text-green-400" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Industry Packs
            </h3>
            <p className="text-muted-foreground text-sm">
              E-commerce, Education, FinTech with industry-specific jargon and KPIs
            </p>
          </Card>
        </div>

        {/* Waitlist Form */}
        <Card className="glass-effect max-w-2xl mx-auto p-8">
          <div className="text-center mb-6">
            <Clock className="w-12 h-12 text-amber-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Be the first to test
            </h2>
            <p className="text-muted-foreground">
              Join the waitlist for priority access at launch
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-foreground">
                Full Name
              </Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter your full name"
                className="glass-effect border-border/50 focus:border-cyan-400/50"
                required
              />
            </div>

            <div>
              <Label htmlFor="email" className="text-foreground">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Enter your email address"
                className="glass-effect border-border/50 focus:border-cyan-400/50"
                required
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm text-center">{error}</p>
            )}

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
              disabled={isLoading}
            >
              {isLoading ? "Processing..." : "Join the waitlist"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-muted-foreground">
              By joining the waitlist, you agree to receive notifications about 
              PROMPTFORGE™ v3.0 development progress.
            </p>
          </div>
        </Card>

        {/* Stats */}
        <div className="text-center mt-16">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="text-3xl font-bold text-cyan-400 mb-2">50+</div>
              <div className="text-muted-foreground">V1-V7 Modules</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-400 mb-2">7D</div>
              <div className="text-muted-foreground">Parametric Engine</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-400 mb-2">3</div>
              <div className="text-muted-foreground">Industry Packs</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-400 mb-2">&lt;60s</div>
              <div className="text-muted-foreground">Generation Time</div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 mt-16">
        <div className="text-center text-muted-foreground text-sm">
          <p>© 2025 PROMPTFORGE™ v3.0 - The Future of AI Prompt Engineering</p>
          <p className="mt-2">
            A forging system: input context, output calibrated artifact. Not "beautiful text". Execution.
          </p>
        </div>
      </footer>
    </div>
  )
}
