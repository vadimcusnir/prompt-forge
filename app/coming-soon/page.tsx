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
      setError("Eroare la înscrierea în waitlist. Încearcă din nou.")
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
              Mulțumim pentru interes!
            </h1>
            <p className="text-muted-foreground text-lg">
              Ești pe lista de așteptare pentru PROMPTFORGE™ v3.0. 
              Te vom contacta când aplicația va fi gata de lansare.
            </p>
          </div>
          
          <div className="space-y-4 text-sm text-muted-foreground">
            <p>✅ Email-ul tău a fost salvat în siguranță</p>
            <p>✅ Vei primi notificări despre progresul dezvoltării</p>
            <p>✅ Vei avea acces prioritar la lansare</p>
          </div>
          
          <Button 
            onClick={() => setIsSubmitted(false)}
            className="mt-6"
            variant="outline"
          >
            Înscrie alt email
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
            🚀 Lansare în curând
          </Badge>
          
          <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6 leading-tight">
            Construiești sisteme de prompturi,<br />
            <span className="text-transparent bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text">
              nu piese de unică folosință
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            PROMPTFORGE™ este generatorul operațional cu 50 module reale și un engine 7‑D. 
            Configurezi o dată, exporți artefacte repetabile în &lt; 60 secunde.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <Card className="glass-effect p-6 text-center">
            <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Shield className="w-6 h-6 text-cyan-400" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              50 Module V1-V7
            </h3>
            <p className="text-muted-foreground text-sm">
              Module ca micro-servicii cu vectori semantici și categorii specializate
            </p>
          </Card>

          <Card className="glass-effect p-6 text-center">
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Rocket className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Engine 7-D
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
              E-commerce, Education, FinTech cu jargon și KPI-uri specifice
            </p>
          </Card>
        </div>

        {/* Waitlist Form */}
        <Card className="glass-effect max-w-2xl mx-auto p-8">
          <div className="text-center mb-6">
            <Clock className="w-12 h-12 text-amber-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Fii primul care testează
            </h2>
            <p className="text-muted-foreground">
              Înscrie-te în lista de așteptare pentru acces prioritar la lansare
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-foreground">
                Nume complet
              </Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Introdu numele tău"
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
                placeholder="Introdu email-ul tău"
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
              {isLoading ? "Se procesează..." : "Înscrie-mă în waitlist"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-muted-foreground">
              Prin înscrierea în waitlist, ești de acord să primești notificări despre 
              progresul dezvoltării PROMPTFORGE™ v3.0.
            </p>
          </div>
        </Card>

        {/* Stats */}
        <div className="text-center mt-16">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="text-3xl font-bold text-cyan-400 mb-2">50+</div>
              <div className="text-muted-foreground">Module V1-V7</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-400 mb-2">7D</div>
              <div className="text-muted-foreground">Engine Parametric</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-400 mb-2">3</div>
              <div className="text-muted-foreground">Industry Packs</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-400 mb-2">&lt;60s</div>
              <div className="text-muted-foreground">Timp de generare</div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 mt-16">
        <div className="text-center text-muted-foreground text-sm">
          <p>© 2025 PROMPTFORGE™ v3.0 - The Future of AI Prompt Engineering</p>
          <p className="mt-2">
            Un sistem de forjă: intră contextul, iese artefactul calibrat. Nu "texte frumoase". Execuție.
          </p>
        </div>
      </footer>
    </div>
  )
}
