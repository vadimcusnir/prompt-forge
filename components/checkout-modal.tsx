"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { createCheckoutSession } from "@/lib/stripe/client"
import { 
  CreditCard, 
  CheckCircle, 
  Lock, 
  Shield, 
  Zap,
  Crown,
  Building2,
  Users,
  Download,
  Cpu
} from "lucide-react"

interface CheckoutModalProps {
  plan: {
    id: string
    name: string
    price: string
    period: string
    description: string
    features: string[]
  }
  isOpen: boolean
  onClose: () => void
}

export function CheckoutModal({ plan, isOpen, onClose }: CheckoutModalProps) {
  const [step, setStep] = useState<"plan" | "billing" | "payment" | "success">("plan")
  const [billingInfo, setBillingInfo] = useState({
    email: "",
    company: "",
    country: "Romania"
  })

  const handleUpgrade = () => {
    setStep("billing")
  }

  const handleBillingSubmit = () => {
    setStep("payment")
  }

  const handlePaymentSubmit = async () => {
    try {
      // Create Stripe checkout session
      const session = await createCheckoutSession({
        planId: plan.id,
        planName: plan.name,
        priceId: getStripePriceId(plan.id), // Get Stripe price ID
        successUrl: `${window.location.origin}/pricing?success=true&session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${window.location.origin}/pricing?canceled=true`,
        customerEmail: billingInfo.email,
        metadata: {
          source: 'checkout_modal',
          plan: plan.id,
          company: billingInfo.company,
          country: billingInfo.country
        }
      })

      // Redirect to Stripe checkout
      if (session.url) {
        window.location.href = session.url
      }
    } catch (error) {
      console.error('Error creating checkout session:', error)
      // Handle error - show toast or error message
    }
  }

  const getStripePriceId = (planId: string): string => {
    // These should match your Stripe product price IDs
    switch (planId) {
      case 'pro': return 'price_1RnpkGGcCmkUZPV6WsuUqFGVI7Gml7GikSnb4sS3xkVX2Dk3bC9KlvtSNiePtw6LmPmjuzqrf08BSUTn1pOf0tox004OnZzCJt'
      case 'enterprise': return 'price_enterprise_placeholder' // Replace with actual Enterprise price ID
      default: return 'price_pilot_placeholder'
    }
  }

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case 'pro': return <Crown className="w-5 h-5" />
      case 'enterprise': return <Building2 className="w-5 h-5" />
      default: return <Zap className="w-5 h-5" />
    }
  }

  const getPlanColor = (planId: string) => {
    switch (planId) {
      case 'pro': return 'bg-[#d1a954]'
      case 'enterprise': return 'bg-gradient-to-r from-purple-600 to-pink-600'
      default: return 'bg-blue-500'
    }
  }

  const getPlanFeatures = (planId: string) => {
    switch (planId) {
      case 'pro':
        return [
          "Acces complet M01–M50",
          "Export .json/.pdf fără watermark",
          "Branding tokens + test GPT real",
          "Cloud History",
          "Suport email"
        ]
      case 'enterprise':
        return [
          "Custom modules + API run endpoint",
          "Bundle .zip + telemetry logging",
          "Licențe pe industrie + suport echipă",
          "White-label complet",
          "Dashboard echipă",
          "Suport 1-la-1",
          "Audit trimestrial"
        ]
      default:
        return []
    }
  }

  if (step === "success") {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">🎉 Upgrade Reușit!</DialogTitle>
            <DialogDescription className="text-center">
              Felicitări! Ai acces acum la toate funcționalitățile planului {plan.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Ce urmează?</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Primești un email de confirmare și poți începe să folosești toate funcționalitățile imediat.
              </p>
            </div>
            <button onClick={onClose} className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 px-4 py-2 bg-primary text-primary-foreground shadow-xs hover:bg-primary/90">
              Închide
            </button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getPlanColor(plan.id)} text-white`}>
              {getPlanIcon(plan.id)}
            </div>
            <span>Upgrade la {plan.name}</span>
          </DialogTitle>
          <DialogDescription>
            {plan.description}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Plan Summary */}
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${getPlanColor(plan.id)} text-white`}>
                  {getPlanIcon(plan.id)}
                </div>
                <span>{plan.name}</span>
              </CardTitle>
              <CardDescription>
                <span className="text-2xl font-bold text-foreground">{plan.price}</span>
                {plan.period && <span className="text-muted-foreground">{plan.period}</span>}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {getPlanFeatures(plan.id).map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Form Steps */}
          <div className="space-y-4">
            {step === "plan" && (
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="font-semibold text-foreground mb-2">Confirmă upgrade-ul</h3>
                  <p className="text-sm text-muted-foreground">
                    Vei fi facturat {plan.price}{plan.period} și vei avea acces imediat la toate funcționalitățile.
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button onClick={onClose} className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 px-4 py-2 border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground">
                    Anulează
                  </button>
                  <button onClick={handleUpgrade} className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:opacity-50 px-4 py-2 bg-primary text-primary-foreground shadow-xs hover:bg-primary/90">
                    Continuă
                  </button>
                </div>
              </div>
            )}

            {step === "billing" && (
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground">Informații de facturare</h3>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={billingInfo.email}
                      onChange={(e) => setBillingInfo({ ...billingInfo, email: e.target.value })}
                      placeholder="email@exemplu.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="company">Companie (opțional)</Label>
                    <Input
                      id="company"
                      value={billingInfo.company}
                      onChange={(e) => setBillingInfo({ ...billingInfo, company: e.target.value })}
                      placeholder="Numele companiei"
                    />
                  </div>
                  <div>
                    <Label htmlFor="country">Țară</Label>
                    <Input
                      id="country"
                      value={billingInfo.country}
                      onChange={(e) => setBillingInfo({ ...billingInfo, country: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button onClick={() => setStep("plan")} className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 px-4 py-2 border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground">
                    Înapoi
                  </button>
                  <button onClick={handleBillingSubmit} className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 px-4 py-2 bg-primary text-primary-foreground shadow-xs hover:bg-primary/90">
                    Continuă la plată
                  </button>
                </div>
              </div>
            )}

            {step === "payment" && (
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground">Metodă de plată</h3>
                
                {/* Stripe-like payment form */}
                <Card className="border-2 border-dashed border-border/50">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <CreditCard className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-foreground">Card bancar</p>
                        <p className="text-sm text-muted-foreground">Visa, Mastercard, American Express</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Security badges */}
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-2">
                    <Shield className="w-4 h-4" />
                    <span>Plată securizată</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Lock className="w-4 h-4" />
                    <span>SSL 256-bit</span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button onClick={() => setStep("billing")} className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 px-4 py-2 border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground">
                    Înapoi
                  </button>
                  <button onClick={handlePaymentSubmit} className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 px-4 py-2 bg-primary text-primary-foreground shadow-xs hover:bg-primary/90">
                    Finalizează upgrade-ul
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-border/50 pt-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Anulezi oricând • 7 zile money-back garantat</span>
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4" />
              <span>Stripe Verified</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
