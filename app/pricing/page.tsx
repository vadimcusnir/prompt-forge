"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

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

  // Plans with clear entitlements
  const plans = [
    {
      id: "pilot",
      name: "Pilot",
      tagline: "Ship the core",
      price: "0€",
      period: "",
      description: "Start with the core generator and first modules",
      features: [
        { text: "Access to M01, M10, M18", included: true },
        { text: "Export .txt with watermark", included: true },
        { text: "Linter + AI scoring", included: true },
        { text: "Limited branding tokens", included: true },
        { text: "Simulated test engine", included: true },
        { text: "Export .json/.pdf", included: false },
        { text: "Real GPT testing", included: false },
        { text: "Bundle .zip export", included: false }
      ],
      cta: "Run first modules",
      popular: false,
      color: "border-gray-600",
      badgeColor: "bg-gray-500/10 text-gray-400 border-gray-500/20"
    },
    {
      id: "pro",
      name: "Pro",
      tagline: "Ship at scale",
      price: "49€",
      period: "/month",
      description: "Complete access to all modules and advanced features",
      features: [
        { text: "Complete access M01-M50", included: true },
        { text: "Export .json/.pdf without watermark", included: true },
        { text: "Branding tokens + real GPT testing", included: true },
        { text: "Cloud History", included: true },
        { text: "Bundle .zip export", included: true },
        { text: "Email support", included: true },
        { text: "API access", included: false },
        { text: "White-label", included: false }
      ],
      cta: "Unlock all features",
      popular: true,
      color: "border-gold-industrial",
      badgeColor: "bg-gold-industrial/10 text-gold-industrial border-gold-industrial/20"
    },
    {
      id: "enterprise",
      name: "Enterprise",
      tagline: "Ship with governance",
      price: "299€",
      period: "/month",
      description: "Custom solutions with API, white-label and dedicated support",
      features: [
        { text: "Custom modules and API", included: true },
        { text: "Complete export with manifest & checksum", included: true },
        { text: "White-label solution", included: true },
        { text: "Team seats management", included: true },
        { text: "Rate limits & quotas", included: true },
        { text: "Bundle .zip export", included: true },
        { text: "Dedicated support", included: true },
        { text: "Industry license packages", included: true }
      ],
      cta: "Activate strategic license",
      popular: false,
      color: "border-gray-600",
      badgeColor: "bg-purple-500/10 text-purple-400 border-purple-500/20"
    }
  ]

  // Industry license packages (Enterprise add-on)
  const industryPacks = [
    {
      name: "FinTech",
      modules: ["M07", "M13", "M41", "M47"],
      price: "1,990€/year",
      description: "PCI DSS, SOX, KYC/AML compliance",
      color: "text-green-400"
    },
    {
      name: "Education",
      modules: ["M03", "M18", "M25", "M29"],
      price: "1,490€/year",
      description: "Automated courses, exportable handouts",
      color: "text-blue-400"
    },
    {
      name: "Consulting & Funnels",
      modules: ["M01", "M03", "M21", "M50"],
      price: "1,750€/year",
      description: "Client-ready SOPs with KPIs",
      color: "text-purple-400"
    },
    {
      name: "Copywriting Agency",
      modules: ["M05", "M09", "M30", "M44"],
      price: "1,690€/year",
      description: "Complete stack for agencies",
      color: "text-orange-400"
    }
  ]

  // Extensible add-ons
  const addOns = [
    {
      name: "Export Branding PDF no-logo",
      description: "Remove PROMPTFORGE watermark from .pdf",
      price: "12€/month",
      icon: FileText
    },
    {
      name: "Branding Tokens UI",
      description: "Access .tokens.css and .tokens.json",
      price: "29€/month",
      icon: Settings
    },
    {
      name: "Prompt Audit Score Diff",
      description: "Compare versions and generate reports",
      price: "19€/month",
      icon: BarChart3
    },
    {
      name: "GPT Agent Orchestrator",
      description: "Send prompts directly to specific GPT agent",
      price: "39€/month",
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
              Choose the right forge
            </h1>
            <p className="text-muted-foreground mt-2">
              You pay for the system, not for volume. Clear entitlements, no vague "unlimited".
            </p>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            How long do you want to waste without good prompts?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Activate PromptForge and escape the blocks. Each plan includes exactly what you need to deliver operational prompts.
          </p>
          
          {/* Promo Banner */}
          <div className="mt-6 inline-flex items-center gap-2 bg-gold-industrial/10 text-gold-industrial px-4 py-2 rounded-full border border-gold-industrial/20">
            <Clock className="w-4 h-4" />
            <span className="text-sm font-medium">Promotion ends in 12h: -20% on Pro</span>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan) => (
            <Card 
              key={plan.id}
              className={`glass-effect p-6 relative transition-all duration-300 hover:shadow-xl ${
                plan.popular ? 'scale-105 ring-2 ring-gold-industrial' : ''
              } ${plan.color}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className={plan.badgeColor}>
                    <Star className="w-3 h-3 mr-1" />
                    Most Popular
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
                
                <button onClick={() => handlePlanSelect(plan.id)} className={`w-full inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 px-4 py-2 border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground ${
                    plan.popular 
                      ? 'bg-gold-industrial text-pf-black hover:bg-gold-industrial-dark font-bold' 
                      : ''
                  }`}>
                  {plan.cta}
                </button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Industry Packs */}
        <Card className="glass-effect p-6 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Globe className="w-5 h-5 text-purple-400" />
              <span>Industry License Packages (Enterprise Add-on)</span>
            </CardTitle>
            <CardDescription>
              Preset configurations with industry-specific modules, 7-D presets and relevant KPIs
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
              <span>Extensible Add-ons</span>
            </CardTitle>
            <CardDescription>
              Extend your plan's functionality with specialized modules
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
                      <button className="px-3 py-1 text-sm border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded">Add</button>
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
              <span>Detailed Comparison</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-medium text-foreground">Feature</th>
                    <th className="text-center py-3 px-4 font-medium text-foreground">Pilot</th>
                    <th className="text-center py-3 px-4 font-medium text-foreground">Pro</th>
                    <th className="text-center py-3 px-4 font-medium text-foreground">Enterprise</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border/50">
                    <td className="py-3 px-4 text-sm text-foreground">7-D Generator</td>
                    <td className="text-center py-3 px-4"><CheckCircle className="w-4 h-4 text-green-400 mx-auto" /></td>
                    <td className="text-center py-3 px-4"><CheckCircle className="w-4 h-4 text-green-400 mx-auto" /></td>
                    <td className="text-center py-3 px-4"><CheckCircle className="w-4 h-4 text-green-400 mx-auto" /></td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-3 px-4 text-sm text-foreground">Available modules</td>
                    <td className="text-center py-3 px-4 text-sm text-muted-foreground">M01, M10, M18</td>
                    <td className="text-center py-3 px-4 text-sm text-foreground">M01-M50</td>
                    <td className="text-center py-3 px-4 text-sm text-foreground">Custom + M01-M50</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-3 px-4 text-sm text-foreground">Export .md/.txt</td>
                    <td className="text-center py-3 px-4"><CheckCircle className="w-4 h-4 text-green-400 mx-auto" /></td>
                    <td className="text-center py-3 px-4"><CheckCircle className="w-4 h-4 text-green-400 mx-auto" /></td>
                    <td className="text-center py-3 px-4"><CheckCircle className="w-4 h-4 text-green-400 mx-auto" /></td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-3 px-4 text-sm text-foreground">Export .json/.pdf</td>
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
                    <td className="py-3 px-4 text-sm text-foreground">Real GPT testing</td>
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
                    <td className="text-center py-3 px-4 text-sm text-muted-foreground">Yes</td>
                    <td className="text-center py-3 px-4 text-sm text-muted-foreground">No</td>
                    <td className="text-center py-3 px-4 text-sm text-muted-foreground">No</td>
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
            <h3 className="font-semibold text-foreground mb-2">7-day money-back</h3>
            <p className="text-sm text-muted-foreground">Cancel anytime. 7-day money-back guaranteed.</p>
          </Card>
          
          <Card className="glass-effect p-6 text-center">
            <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Database className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Stripe Verified</h3>
            <p className="text-sm text-muted-foreground">Secure payments with Stripe. GDPR compliant.</p>
          </Card>
          
          <Card className="glass-effect p-6 text-center">
            <div className="w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Team support</h3>
            <p className="text-sm text-muted-foreground">Dedicated support for Pro and Enterprise.</p>
          </Card>
        </div>

        {/* FAQ */}
        <Card className="glass-effect p-6 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Code className="w-5 h-5 text-yellow-400" />
              <span>Frequently Asked Questions</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium text-foreground mb-2">If I try Basic, can I upgrade?</h4>
              <p className="text-sm text-muted-foreground">Yes, instantly. The upgrade activates immediately and you receive credit for the remaining days in the current period.</p>
            </div>
            
            <div>
              <h4 className="font-medium text-foreground mb-2">Why is Pro more expensive?</h4>
              <p className="text-sm text-muted-foreground">Because it includes everything you're missing in Basic: .json/.pdf export, real GPT testing, branding tokens and cloud history.</p>
            </div>
            
            <div>
              <h4 className="font-medium text-foreground mb-2">What happens if I exceed the limit?</h4>
              <p className="text-sm text-muted-foreground">You're notified and can upgrade instantly. There's no overcharging - just upgrade to the higher plan.</p>
            </div>
            
            <div>
              <h4 className="font-medium text-foreground mb-2">Can I cancel anytime?</h4>
              <p className="text-sm text-muted-foreground">Yes, cancel anytime from the dashboard. Access remains active until the end of the paid period.</p>
            </div>
          </CardContent>
        </Card>

        {/* Final CTA */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            You're building prompt systems, not unique pieces
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Set 7‑D, press Start, output sellable artifacts. No filler. Just operational value.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              className="bg-gold-industrial hover:bg-gold-industrial-dark text-pf-black font-bold px-8 py-4 text-lg rounded"
            >
              Start the forge now
            </button>
            <button 
              className="px-8 py-4 text-lg border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded"
            >
              See all modules
            </button>
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
