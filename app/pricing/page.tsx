"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckoutModal } from "@/components/checkout-modal"
import { 
  CheckCircle, 
  XCircle, 
  Zap, 
  Shield, 
  Building2, 
  Users, 
  Download, 
  Cpu, 
  FileText, 
  Package, 
  Globe, 
  Lock,
  Star,
  Clock,
  Target,
  Settings,
  Code,
  Database,
  BarChart3,
  Crown
} from "lucide-react"

export default function PricingPage() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [showEnterpriseContact, setShowEnterpriseContact] = useState(false)
  const [checkoutPlan, setCheckoutPlan] = useState<any>(null)
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)

  // Planuri cu entitlements clare
  const plans = [
    {
      id: "pilot",
      name: "Pilot",
      tagline: "Ship the core",
      price: "0€",
      period: "",
      description: "Începe cu generatorul de bază și primele 12 module",
      features: [
        { text: "Generator + 12 module de bază", included: true },
        { text: "Export .md/.txt cu watermark", included: true },
        { text: "Linter + scor AI", included: true },
        { text: "Export .json/.pdf", included: false },
        { text: "Test GPT real", included: false },
        { text: "Branding tokens", included: false },
        { text: "API access", included: false },
        { text: "Bundle .zip", included: false }
      ],
      cta: "Rulează primele module",
      popular: false,
      color: "border-gray-600",
      badgeColor: "bg-gray-500/10 text-gray-400 border-gray-500/20"
    },
    {
      id: "pro",
      name: "Pro",
      tagline: "Ship at scale",
      price: "49€",
      period: "/lună",
      description: "Acces complet la toate modulele și funcțiile avansate",
      features: [
        { text: "Acces complet M01–M50", included: true },
        { text: "Export .json/.pdf fără watermark", included: true },
        { text: "Branding tokens + test GPT real", included: true },
        { text: "Cloud History", included: true },
        { text: "API access", included: false },
        { text: "Bundle .zip", included: false },
        { text: "White-label", included: false },
        { text: "Suport echipă", included: false }
      ],
      cta: "Deschide toate funcțiile",
      popular: true,
      color: "border-[#d1a954]",
      badgeColor: "bg-[#d1a954]/10 text-[#d1a954] border-[#d1a954]/20"
    },
    {
      id: "enterprise",
      name: "Enterprise",
      tagline: "Ship with governance",
      price: "299€",
      period: "/lună",
      description: "Soluții custom cu API, white-label și suport dedicat",
      features: [
        { text: "Custom modules + API run endpoint", included: true },
        { text: "Bundle .zip + telemetry logging", included: true },
        { text: "Licențe pe industrie + suport echipă", included: true },
        { text: "White-label complet", included: true },
        { text: "Dashboard echipă", included: true },
        { text: "Audit trimestrial", included: true },
        { text: "Suport 1-la-1", included: true },
        { text: "Licențe pe industrie", included: true }
      ],
      cta: "Activează licența strategică",
      popular: false,
      color: "border-gray-600",
      badgeColor: "bg-purple-500/10 text-purple-400 border-purple-500/20"
    }
  ]

  // Pachete licență pe industrie (Enterprise add-on)
  const industryPacks = [
    {
      name: "FinTech",
      modules: ["M07", "M13", "M41", "M47"],
      price: "1.990€/an",
      description: "Compliance PCI DSS, SOX, KYC/AML",
      color: "text-green-400"
    },
    {
      name: "Educație",
      modules: ["M03", "M18", "M25", "M29"],
      price: "1.490€/an",
      description: "Cursuri automate, handout exportabil",
      color: "text-blue-400"
    },
    {
      name: "Consultanță + Funneluri",
      modules: ["M01", "M03", "M21", "M50"],
      price: "1.750€/an",
      description: "SOP-uri client-ready cu KPI",
      color: "text-purple-400"
    },
    {
      name: "Copywriting Agency",
      modules: ["M05", "M09", "M30", "M44"],
      price: "1.690€/an",
      description: "Stack complet pentru agenții",
      color: "text-orange-400"
    }
  ]

  // Add-ons extensibili
  const addOns = [
    {
      name: "Export Branding PDF no-logo",
      description: "Elimină watermark PROMPTFORGE din .pdf",
      price: "12€/lună",
      icon: FileText
    },
    {
      name: "Branding Tokens UI",
      description: "Acces .tokens.css și .tokens.json",
      price: "29€/lună",
      icon: Settings
    },
    {
      name: "Prompt Audit Score Diff",
      description: "Compară versiunile și generează rapoarte",
      price: "19€/lună",
      icon: BarChart3
    },
    {
      name: "GPT Agent Orchestrator",
      description: "Trimite prompturi direct în agent GPT specific",
      price: "39€/lună",
      icon: Cpu
    }
  ]

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId)
    if (planId === "enterprise") {
      setShowEnterpriseContact(true)
    } else if (planId === "pro") {
      const plan = plans.find(p => p.id === planId)
      setCheckoutPlan(plan)
      setIsCheckoutOpen(true)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="glass-effect border-b border-border/50 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="text-center">
            <h1 className="text-3xl font-black font-[var(--font-heading)] text-foreground">
              Alege forja potrivită
            </h1>
            <p className="text-muted-foreground mt-2">
              Plătești pentru sistem, nu pentru volum. Entitlements clare, fără "unlimited" vag.
            </p>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Cât timp vrei să pierzi fără prompturi bune?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Activează PromptForge și scapă de blocaje. Fiecare plan include exact ce ai nevoie pentru a livra prompturi operaționale.
          </p>
          
          {/* Promo Banner */}
          <div className="mt-6 inline-flex items-center gap-2 bg-[#d1a954]/10 text-[#d1a954] px-4 py-2 rounded-full border border-[#d1a954]/20">
            <Clock className="w-4 h-4" />
            <span className="text-sm font-medium">Promoția se încheie în 12h: -20% la Pro</span>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan) => (
            <Card 
              key={plan.id}
              className={`glass-effect p-6 relative transition-all duration-300 hover:shadow-xl ${
                plan.popular ? 'scale-105 ring-2 ring-[#d1a954]' : ''
              } ${plan.color}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className={plan.badgeColor}>
                    <Star className="w-3 h-3 mr-1" />
                    Cel mai ales
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold text-foreground">{plan.name}</CardTitle>
                <CardDescription className="text-muted-foreground">{plan.tagline}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                  {plan.period && <span className="text-lg text-muted-foreground">{plan.period}</span>}
                </div>
                <p className="text-sm text-muted-foreground mt-2">{plan.description}</p>
              </CardHeader>
              
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      {feature.included ? (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      ) : (
                        <XCircle className="w-4 h-4 text-muted-foreground/50" />
                      )}
                      <span className={feature.included ? "text-foreground" : "text-muted-foreground/50"}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  className={`w-full ${
                    plan.popular 
                      ? 'bg-[#d1a954] text-black hover:bg-[#d1a954]/90 font-bold' 
                      : 'variant="outline"'
                  }`}
                  onClick={() => handlePlanSelect(plan.id)}
                >
                  {plan.cta}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Industry Packs */}
        <Card className="glass-effect p-6 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Globe className="w-5 h-5 text-purple-400" />
              <span>Pachete Licență pe Industrie (Enterprise Add-on)</span>
            </CardTitle>
            <CardDescription>
              Configurări presetate cu module specifice industriei, preset 7-D și KPIs relevanți
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {industryPacks.map((pack) => (
                <div key={pack.name} className="p-4 border border-border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-foreground">{pack.name}</h4>
                    <Badge variant="outline" className="text-xs">
                      {pack.modules.join(", ")}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{pack.description}</p>
                  <div className="text-lg font-bold text-foreground">{pack.price}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Add-ons */}
        <Card className="glass-effect p-6 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Package className="w-5 h-5 text-blue-400" />
              <span>Add-ons Extensibili</span>
            </CardTitle>
            <CardDescription>
              Extinde funcționalitatea planului tău cu module specializate
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {addOns.map((addon) => {
                const IconComponent = addon.icon
                return (
                  <div key={addon.name} className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <IconComponent className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <h4 className="font-medium text-foreground">{addon.name}</h4>
                        <p className="text-sm text-muted-foreground">{addon.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-foreground">{addon.price}</div>
                      <Button variant="ghost" size="sm">Adaugă</Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Comparison Table */}
        <Card className="glass-effect p-6 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-cyan-400" />
              <span>Comparație Detaliată</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-medium text-foreground">Funcționalitate</th>
                    <th className="text-center py-3 px-4 font-medium text-foreground">Pilot</th>
                    <th className="text-center py-3 px-4 font-medium text-foreground">Pro</th>
                    <th className="text-center py-3 px-4 font-medium text-foreground">Enterprise</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border/50">
                    <td className="py-3 px-4 text-sm text-foreground">Generator 7-D</td>
                    <td className="text-center py-3 px-4"><CheckCircle className="w-4 h-4 text-green-400 mx-auto" /></td>
                    <td className="text-center py-3 px-4"><CheckCircle className="w-4 h-4 text-green-400 mx-auto" /></td>
                    <td className="text-center py-3 px-4"><CheckCircle className="w-4 h-4 text-green-400 mx-auto" /></td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-3 px-4 text-sm text-foreground">Module disponibile</td>
                    <td className="text-center py-3 px-4 text-sm text-muted-foreground">12 de bază</td>
                    <td className="text-center py-3 px-4 text-sm text-foreground">M01-M50</td>
                    <td className="text-center py-3 px-4 text-sm text-foreground">Custom + M01-M50</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-3 px-4 text-sm text-foreground">Export .txt, .md</td>
                    <td className="text-center py-3 px-4"><CheckCircle className="w-4 h-4 text-green-400 mx-auto" /></td>
                    <td className="text-center py-3 px-4"><CheckCircle className="w-4 h-4 text-green-400 mx-auto" /></td>
                    <td className="text-center py-3 px-4"><CheckCircle className="w-4 h-4 text-green-400 mx-auto" /></td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-3 px-4 text-sm text-foreground">Export .json, .pdf</td>
                    <td className="text-center py-3 px-4"><XCircle className="w-4 h-4 text-muted-foreground/50 mx-auto" /></td>
                    <td className="text-center py-3 px-4"><CheckCircle className="w-4 h-4 text-green-400 mx-auto" /></td>
                    <td className="text-center py-3 px-4"><CheckCircle className="w-4 h-4 text-green-400 mx-auto" /></td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-3 px-4 text-sm text-foreground">Export .zip bundle</td>
                    <td className="text-center py-3 px-4"><XCircle className="w-4 h-4 text-muted-foreground/50 mx-auto" /></td>
                    <td className="text-center py-3 px-4"><XCircle className="w-4 h-4 text-muted-foreground/50 mx-auto" /></td>
                    <td className="text-center py-3 px-4"><CheckCircle className="w-4 h-4 text-green-400 mx-auto" /></td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-3 px-4 text-sm text-foreground">Test GPT real</td>
                    <td className="text-center py-3 px-4"><XCircle className="w-4 h-4 text-muted-foreground/50 mx-auto" /></td>
                    <td className="text-center py-3 px-4"><CheckCircle className="w-4 h-4 text-green-400 mx-auto" /></td>
                    <td className="text-center py-3 px-4"><CheckCircle className="w-4 h-4 text-green-400 mx-auto" /></td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-3 px-4 text-sm text-foreground">API access</td>
                    <td className="text-center py-3 px-4"><XCircle className="w-4 h-4 text-muted-foreground/50 mx-auto" /></td>
                    <td className="text-center py-3 px-4"><XCircle className="w-4 h-4 text-muted-foreground/50 mx-auto" /></td>
                    <td className="text-center py-3 px-4"><CheckCircle className="w-4 h-4 text-green-400 mx-auto" /></td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-3 px-4 text-sm text-foreground">Watermark</td>
                    <td className="text-center py-3 px-4 text-sm text-muted-foreground">Da</td>
                    <td className="text-center py-3 px-4 text-sm text-muted-foreground">Nu</td>
                    <td className="text-center py-3 px-4 text-sm text-muted-foreground">Nu</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Trust & Guarantees */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="glass-effect p-6 text-center">
            <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-6 h-6 text-green-400" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">7 zile money-back</h3>
            <p className="text-sm text-muted-foreground">Anulezi oricând. 7 zile money-back garantat.</p>
          </Card>
          
          <Card className="glass-effect p-6 text-center">
            <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Database className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Stripe Verified</h3>
            <p className="text-sm text-muted-foreground">Plăți securizate cu Stripe. GDPR compliant.</p>
          </Card>
          
          <Card className="glass-effect p-6 text-center">
            <div className="w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Suport echipă</h3>
            <p className="text-sm text-muted-foreground">Suport dedicat pentru Pro și Enterprise.</p>
          </Card>
        </div>

        {/* FAQ */}
        <Card className="glass-effect p-6 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Code className="w-5 h-5 text-yellow-400" />
              <span>Întrebări Frecvente</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium text-foreground mb-2">Dacă încerc Basic, pot face upgrade?</h4>
              <p className="text-sm text-muted-foreground">Da, instant. Upgrade-ul se activează imediat și primești credit pentru zilele rămase din perioada curentă.</p>
            </div>
            
            <div>
              <h4 className="font-medium text-foreground mb-2">De ce Pro e mai scump?</h4>
              <p className="text-sm text-muted-foreground">Pentru că include tot ce-ți lipsește în Basic: export .json/.pdf, test GPT real, branding tokens și cloud history.</p>
            </div>
            
            <div>
              <h4 className="font-medium text-foreground mb-2">Ce se întâmplă dacă depășesc limita?</h4>
              <p className="text-sm text-muted-foreground">Ești notificat și poți face upgrade instant. Nu există suprataxare - doar upgrade la planul superior.</p>
            </div>
            
            <div>
              <h4 className="font-medium text-foreground mb-2">Pot anula oricând?</h4>
              <p className="text-sm text-muted-foreground">Da, anulezi oricând din dashboard. Accesul rămâne activ până la sfârșitul perioadei plătite.</p>
            </div>
          </CardContent>
        </Card>

        {/* CTA Final */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Construiești sisteme de prompturi, nu piese unice
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Setezi 7‑D, apeși Start, scoți artefacte vândabile. Fără filler. Doar valoare operațională.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-[#d1a954] hover:bg-[#d1a954]/90 text-black font-bold px-8 py-4 text-lg"
            >
              Pornește forja acum
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="px-8 py-4 text-lg"
            >
              Vezi toate modulele
            </Button>
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      {checkoutPlan && (
        <CheckoutModal
          plan={checkoutPlan}
          isOpen={isCheckoutOpen}
          onClose={() => {
            setIsCheckoutOpen(false)
            setCheckoutPlan(null)
          }}
        />
      )}
    </div>
  )
}
