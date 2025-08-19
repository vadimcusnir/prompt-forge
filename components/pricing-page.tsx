'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Check, Star, Zap, Crown, Building2, ShoppingCart, GraduationCap, CreditCard, Mail } from 'lucide-react'
import { PricingActionButton } from './pricing-action-button'

interface Price {
  id: string
  priceId: string
  amount: number
  currency: string
  recurring: any
  formattedPrice: string
}

interface Product {
  id: string
  productId: string
  name: string
  description: string
  prices: Price[]
}

export default function PricingPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/stripe/products')
      if (!response.ok) {
        throw new Error('Failed to fetch products')
      }
      const data = await response.json()
      setProducts(data.products)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const getPlanIcon = (productId: string | null | undefined) => {
    if (typeof productId !== 'string') {
      return <Star className="w-6 h-6 text-gray-500" />
    }
    
    switch (productId) {
      case 'promptforge_free':
        return <Star className="w-6 h-6 text-yellow-500" />
      case 'promptforge_creator':
        return <Zap className="w-6 h-6 text-blue-500" />
      case 'promptforge_pro':
        return <Crown className="w-6 h-6 text-purple-500" />
      case 'promptforge_enterprise':
        return <Building2 className="w-6 h-6 text-green-500" />
      case 'industry_ecommerce':
        return <ShoppingCart className="w-6 h-6 text-orange-500" />
      case 'industry_education':
        return <GraduationCap className="w-6 h-6 text-indigo-500" />
      case 'industry_fintech':
        return <CreditCard className="w-6 h-6 text-emerald-500" />
      default:
        return <Star className="w-6 h-6 text-gray-500" />
    }
  }

  const getPlanFeatures = (productId: string | null | undefined) => {
    if (typeof productId !== 'string') {
      return []
    }
    
    switch (productId) {
      case 'promptforge_free':
        return [
          '5 modules/month',
          'Basic export formats',
          'Community support',
          'Standard templates',
          'Basic analytics'
        ]
      case 'promptforge_creator':
        return [
          '25 modules/month',
          'Advanced export formats',
          'Priority support',
          'Industry packs access',
          'Custom templates',
          'Enhanced analytics'
        ]
      case 'promptforge_pro':
        return [
          'Unlimited modules',
          'Premium export formats',
          'API access',
          'White-label options',
          'Dedicated support',
          'Advanced analytics',
          'Custom integrations'
        ]
      case 'promptforge_enterprise':
        return [
          'Everything in Pro',
          'Custom integrations',
          'SLA guarantee',
          'Dedicated account manager',
          'Custom training',
          'On-premise options',
          'Priority feature requests'
        ]
      case 'industry_ecommerce':
        return [
          '15 e-commerce modules',
          'KPI templates',
          'Conversion optimization',
          'Customer journey mapping',
          'ROI calculators',
          'A/B testing guides'
        ]
      case 'industry_education':
        return [
          '12 education modules',
          'Curriculum templates',
          'Assessment tools',
          'Learning analytics',
          'Student engagement',
          'Performance tracking'
        ]
      case 'industry_fintech':
        return [
          '18 fintech modules',
          'Compliance templates',
          'Risk management',
          'Regulatory guides',
          'Financial modeling',
          'Security protocols'
        ]
      default:
        return []
    }
  }

  const isSubscription = (productId: string | null | undefined) => {
    return typeof productId === 'string' && productId.startsWith('promptforge_')
  }

  const isIndustryPack = (productId: string | null | undefined) => {
    return typeof productId === 'string' && productId.startsWith('industry_')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading pricing plans...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive text-lg">Error loading pricing plans</p>
          <p className="text-muted-foreground">{error}</p>
          <Button onClick={fetchProducts} className="mt-4">Retry</Button>
        </div>
      </div>
    )
  }

  // Reordonez planurile: Free -> Creator -> Pro -> Enterprise
  const subscriptionPlans = products
    .filter(p => isSubscription(p.productId))
    .sort((a, b) => {
      const order = {
        'promptforge_free': 1,
        'promptforge_creator': 2,
        'promptforge_pro': 3,
        'promptforge_enterprise': 4
      }
      return (order[a.productId as keyof typeof order] || 999) - (order[b.productId as keyof typeof order] || 999)
    })
  
  const industryPacks = products.filter(p => isIndustryPack(p.productId))

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold font-[var(--font-heading)] mb-4 text-foreground">
            Choose Your PROMPTFORGE™ Plan
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Unlock the full potential of AI prompt generation with our flexible pricing plans
          </p>
        </div>

        {/* Subscription Plans */}
        <div className="mb-20">
          <h2 className="text-2xl font-bold font-[var(--font-heading)] mb-8 text-center text-foreground">
            Choose Your Plan
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-3xl mx-auto">
            Start with our free plan and scale up as your needs grow. All plans include our core AI prompt generation capabilities.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 max-w-7xl mx-auto">
            {subscriptionPlans.map((product) => {
              const price = product.prices[0]
              if (!price) return null

              return (
                <Card key={product.id} className={`relative overflow-hidden glass-effect hover:glow-primary transition-all duration-300 ${
                  product.productId === 'promptforge_enterprise' 
                    ? 'ring-2 ring-purple-500/50 scale-105' 
                    : ''
                }`}>
                  {product.productId === 'promptforge_pro' && (
                    <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-sm font-medium rounded-bl-lg">
                      Most Popular
                    </div>
                  )}
                  {product.productId === 'promptforge_enterprise' && (
                    <div className="absolute top-0 right-0 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-3 py-1 text-sm font-medium rounded-bl-lg">
                      Enterprise
                    </div>
                  )}
                  <CardHeader className="text-center pb-4">
                    <div className="flex justify-center mb-4">
                      {getPlanIcon(product.productId)}
                    </div>
                    <CardTitle className="text-xl font-bold text-foreground">
                      {product.name.replace('PROMPTFORGE™ ', '')}
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                      {product.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-center pb-4">
                    <div className="mb-6">
                      <span className="text-4xl font-bold text-foreground">
                        {price.formattedPrice}
                      </span>
                      {price.amount === 0 && product.productId === 'promptforge_free' && (
                        <span className="text-muted-foreground ml-2">forever</span>
                      )}
                      {price.amount === 0 && product.productId === 'promptforge_enterprise' && (
                        <span className="text-muted-foreground ml-2">Custom Pricing</span>
                      )}
                    </div>
                    <ul className="space-y-3 text-sm text-muted-foreground">
                      {getPlanFeatures(product.productId).map((feature, index) => (
                        <li key={index} className="flex items-center justify-center">
                          <Check className="w-4 h-4 text-green-500 mr-2" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter className="pt-4">
                    <PricingActionButton
                      priceId={price.priceId}
                      amount={price.amount}
                      currency={price.currency}
                      planName={product.name}
                      isEnterprise={product.productId === 'promptforge_enterprise'}
                    />
                  </CardFooter>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Industry Packs */}
        <div className="mb-20">
          <h2 className="text-2xl font-bold font-[var(--font-heading)] mb-8 text-center text-foreground">
            Industry-Specific Solutions
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-3xl mx-auto">
            Specialized prompt collections designed for specific industries and use cases.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 max-w-6xl mx-auto">
            {industryPacks.map((product) => {
              const price = product.prices[0]
              if (!price) return null

              return (
                <Card key={product.id} className="relative overflow-hidden glass-effect hover:glow-primary transition-all duration-300">
                  <CardHeader className="text-center pb-4">
                    <div className="flex justify-center mb-4">
                      {getPlanIcon(product.productId)}
                    </div>
                    <CardTitle className="text-xl font-bold text-foreground">
                      {product.name}
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                      {product.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-center pb-4">
                    <div className="mb-6">
                      <span className="text-4xl font-bold text-foreground">
                        {price.formattedPrice}
                      </span>
                      <Badge variant="secondary" className="ml-2">One-time</Badge>
                    </div>
                    <ul className="space-y-3 text-sm text-muted-foreground">
                      {getPlanFeatures(product.productId).map((feature, index) => (
                        <li key={index} className="flex items-center justify-center">
                          <Check className="w-4 h-4 text-green-500 mr-2" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter className="pt-4">
                    <PricingActionButton
                      priceId={price.priceId}
                      amount={price.amount}
                      currency={price.currency}
                      planName={product.name}
                      isEnterprise={false}
                    />
                  </CardFooter>
                </Card>
              )
            })}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-20 text-center">
          <h3 className="text-2xl font-bold font-[var(--font-heading)] mb-4 text-foreground">
            Need Help Choosing?
          </h3>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Not sure which plan is right for you? Our team is here to help you find the perfect solution for your needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="outline" size="lg">
              <Mail className="w-4 h-4 mr-2" />
              Contact Sales
            </Button>
            <Button variant="outline" size="lg">
              <GraduationCap className="w-4 h-4 mr-2" />
              View Documentation
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
