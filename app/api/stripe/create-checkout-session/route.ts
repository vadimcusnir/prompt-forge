/**
 * app/api/stripe/create-checkout-session/route.ts — Stripe Checkout Session
 * 
 * Creates Stripe checkout sessions for subscription plans
 * Handles Free, Creator, Pro, and Enterprise plans with trial periods
 */

import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { sessionManager } from '@/lib/auth/session-manager'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
})

// Plan configuration with pricing and features
const PLANS = {
  free: {
    name: 'Free',
    description: 'Get started with basic prompt optimization',
    price_monthly: 0,
    price_yearly: 0,
    features: ['Basic modules', 'Text export only', 'Limited runs']
  },
  creator: {
    name: 'Creator',
    description: 'Content creator focused with markdown export',
    price_monthly: 900, // $9.00 in cents
    price_yearly: 9000, // $90.00 in cents
    features: ['All modules', 'Markdown export', '50 runs/month']
  },
  pro: {
    name: 'Pro',
    description: 'Professional prompt engineering with advanced features',
    price_monthly: 2900, // $29.00 in cents
    price_yearly: 29000, // $290.00 in cents
    features: ['All modules', 'PDF/JSON export', 'Live GPT testing', 'Cloud history', '100 runs/month'],
    trial_days: 7
  },
  enterprise: {
    name: 'Enterprise',
    description: 'Enterprise-grade with full API access and bundle exports',
    price_monthly: 9900, // $99.00 in cents
    price_yearly: 99000, // $990.00 in cents
    features: ['All modules', 'All exports', 'API access', 'White-label', 'Bundle exports', '1000 runs/month']
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user session
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized - Bearer token required' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const authResult = await sessionManager.validateSession(token)
    
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    const { planId, billingCycle = 'monthly' } = await request.json()

    if (!planId || !PLANS[planId as keyof typeof PLANS]) {
      return NextResponse.json(
        { error: 'Invalid plan ID' },
        { status: 400 }
      )
    }

    const plan = PLANS[planId as keyof typeof PLANS]
    const userId = authResult.user.id
    const orgId = authResult.user.orgId

    if (!orgId) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 400 }
      )
    }

    // Free plan doesn't require checkout
    if (planId === 'free') {
      return NextResponse.json({
        success: true,
        message: 'Free plan activated',
        plan: planId
      })
    }

    // Get or create Stripe customer
    let customerId: string
    const existingCustomer = await findExistingCustomer(orgId)
    
    if (existingCustomer) {
      customerId = existingCustomer.id
    } else {
      const customer = await stripe.customers.create({
        email: authResult.user.email,
        metadata: {
          org_id: orgId,
          user_id: userId
        }
      })
      customerId = customer.id
    }

    // Get price ID for the plan and billing cycle
    const priceId = await getPriceId(planId, billingCycle)
    if (!priceId) {
      return NextResponse.json(
        { error: 'Price not found for plan' },
        { status: 400 }
      )
    }

    // Create checkout session
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1
        }
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
      metadata: {
        plan_id: planId,
        org_id: orgId,
        user_id: userId,
        billing_cycle: billingCycle
      },
      subscription_data: {
        metadata: {
          plan_id: planId,
          org_id: orgId
        }
      }
    }

    // Add trial period for Pro plan
    if (planId === 'pro' && plan.trial_days) {
      sessionParams.subscription_data!.trial_period_days = plan.trial_days
    }

    // Add billing address collection for Enterprise
    if (planId === 'enterprise') {
      sessionParams.billing_address_collection = 'required'
    }

    const session = await stripe.checkout.sessions.create(sessionParams)

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      url: session.url,
      plan: planId,
      billingCycle
    })

  } catch (error) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Find existing Stripe customer for organization
 */
async function findExistingCustomer(orgId: string): Promise<Stripe.Customer | null> {
  try {
    const customers = await stripe.customers.list({
      limit: 100,
      metadata: { org_id: orgId }
    })

    return customers.data[0] || null
  } catch (error) {
    console.error('Error finding existing customer:', error)
    return null
  }
}

/**
 * Get Stripe price ID for plan and billing cycle
 */
async function getPriceId(planId: string, billingCycle: string): Promise<string | null> {
  try {
    // In production, you would store these price IDs in your database
    // For now, we'll use a mapping
    const priceMapping: Record<string, Record<string, string>> = {
      creator: {
        monthly: 'price_creator_monthly',
        yearly: 'price_creator_yearly'
      },
      pro: {
        monthly: 'price_pro_monthly',
        yearly: 'price_pro_yearly'
      },
      enterprise: {
        monthly: 'price_enterprise_monthly',
        yearly: 'price_enterprise_yearly'
      }
    }

    const priceId = priceMapping[planId]?.[billingCycle]
    if (!priceId) return null

    // Verify price exists in Stripe
    const price = await stripe.prices.retrieve(priceId)
    return price.id

  } catch (error) {
    console.error('Error getting price ID:', error)
    return null
  }
}
