"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowRight, 
  Check, 
  Clock,
  Target,
  Download,
  Zap,
  Shield,
  Users,
  BookOpen,
  TrendingUp,
  Mail,
  User
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ComingSoonProps {
  message?: string
}

export function ComingSoon({ message = "PROMPTFORGE™ v3.0 - Coming Soon!" }: ComingSoonProps) {
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !name) {
      toast({
        title: "Error",
        description: "Please fill in both email and name fields.",
        variant: "destructive"
      })
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, name }),
      })

      if (response.ok) {
        setIsSubmitted(true)
        toast({
          title: "Success!",
          description: "You've been added to our waitlist. We'll notify you when we launch!",
        })
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.message || "Failed to join waitlist. Please try again.",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Network error. Please check your connection and try again.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center px-4 max-w-2xl mx-auto">
          <div className="w-24 h-24 bg-[#d1a954]/10 rounded-full flex items-center justify-center mx-auto mb-8">
            <Check className="w-12 h-12 text-[#d1a954]" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Mulțumim!
          </h1>
          
          <p className="text-xl text-[#5a5a5a] mb-8 max-w-xl mx-auto leading-relaxed">
            Ai fost adăugat cu succes pe lista noastră de așteptare. 
            Vei primi o notificare când lansăm PROMPTFORGE™ v3.0!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => setIsSubmitted(false)}
              variant="ghost" 
              className="text-white border border-[#5a5a5a] hover:border-[#d1a954] hover:text-[#d1a954] px-8 py-3"
            >
              Adaugă altcineva
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center bg-gradient-to-b from-[#0a0a0a] via-[#0e0e0e] to-black overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-[radial-gradient(1200px_600px_at_50%_0%,#10130F_0%,#0B0B0C_60%,#080809_100%)] opacity-60" />
        
        {/* Hero Content */}
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <Badge className="mb-6 bg-[#d1a954]/10 text-[#d1a954] border-[#d1a954]/20 px-4 py-2 text-sm">
            {message}
          </Badge>
          
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight">
            Generatorul tău{" "}
            <span className="text-[#d1a954]">operațional</span>{" "}
            de prompturi
          </h1>
          
          <p className="text-xl md:text-2xl text-[#5a5a5a] mb-8 max-w-3xl mx-auto leading-relaxed">
            50 module. 7 vectori. Exportă în <span className="text-[#d1a954] font-semibold">&lt; 60 secunde</span>.
          </p>
          
          {/* Signup Form */}
          <Card className="bg-[#1a1a1a]/80 border-[#5a5a5a]/30 backdrop-blur-sm max-w-md mx-auto mb-8">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-white text-xl">Joacă-te pe lista de așteptare</CardTitle>
              <CardDescription className="text-[#5a5a5a]">
                Fii primul care testează PROMPTFORGE™ v3.0
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-[#5a5a5a]" />
                    <Input
                      type="text"
                      placeholder="Numele tău"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-10 bg-[#0a0a0a] border-[#5a5a5a]/30 text-white placeholder:text-[#5a5a5a] focus:border-[#d1a954] focus:ring-[#d1a954]/20"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-[#5a5a5a]" />
                    <Input
                      type="email"
                      placeholder="Email-ul tău"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 bg-[#0a0a0a] border-[#5a5a5a]/30 text-white placeholder:text-[#5a5a5a] focus:border-[#d1a954] focus:ring-[#d1a954]/20"
                      required
                    />
                  </div>
                </div>
                
                <Button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#d1a954] hover:bg-[#d1a954]/90 text-black font-bold py-3 text-lg shadow-[0_0_20px_rgba(209,169,84,0.3)] hover:shadow-[0_0_30px_rgba(209,169,84,0.5)] transition-all duration-300"
                >
                  {isSubmitting ? "Se procesează..." : "Adaugă-mă pe listă"}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </form>
            </CardContent>
          </Card>
          
          {/* Proof Bar */}
          <div className="flex flex-wrap justify-center items-center gap-6 text-sm text-[#5a5a5a]">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#d1a954]" />
              <span>TTA &lt; 60s</span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-[#d1a954]" />
              <span>AI Score ≥ 80/100</span>
            </div>
            <div className="flex items-center gap-2">
              <Download className="w-4 h-4 text-[#d1a954]" />
              <span>.md/.json/.pdf export</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 bg-black">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Ce vei putea face
            </h2>
            <p className="text-xl text-[#5a5a5a] max-w-2xl mx-auto">
              PROMPTFORGE™ v3.0 îți oferă toate instrumentele pentru a crea prompturi de calitate profesională.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-[#1a1a1a] border-[#5a5a5a]/30 rounded-xl hover:shadow-[0_0_20px_rgba(209,169,84,0.1)] transition-all duration-300">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-[#d1a954]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-[#d1a954]" />
                </div>
                <CardTitle className="text-white text-xl">50 Module Specializate</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-[#5a5a5a]">
                  De la generarea de conținut până la analiza de date, fiecare modul este optimizat pentru un caz de utilizare specific.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-[#1a1a1a] border-[#5a5a5a]/30 rounded-xl hover:shadow-[0_0_20px_rgba(209,169,84,0.1)] transition-all duration-300">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-[#d1a954]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-[#d1a954]" />
                </div>
                <CardTitle className="text-white text-xl">7 Vectori de Calitate</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-[#5a5a5a]">
                  Sistemul nostru de evaluare asigură că fiecare prompt îndeplinește standardele de calitate profesională.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-[#1a1a1a] border-[#5a5a5a]/30 rounded-xl hover:shadow-[0_0_20px_rgba(209,169,84,0.1)] transition-all duration-300">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-[#d1a954]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Download className="w-8 h-8 text-[#d1a954]" />
                </div>
                <CardTitle className="text-white text-xl">Export Multi-Format</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-[#5a5a5a]">
                  Salvează prompturile în formatul preferat: Markdown, JSON, PDF sau text simplu.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-[#0a0a0a]">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl md:text-4xl font-bold text-[#d1a954] mb-2">50+</div>
              <div className="text-[#5a5a5a] text-sm">Module Specializate</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-[#d1a954] mb-2">&lt;60s</div>
              <div className="text-[#5a5a5a] text-sm">Timp de Răspuns</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-[#d1a954] mb-2">≥80</div>
              <div className="text-[#5a5a5a] text-sm">AI Score Garantat</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-[#d1a954] mb-2">4</div>
              <div className="text-[#5a5a5a] text-sm">Formate Export</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
