/**
 * lib/stripe/client.ts — Stripe Client Integration
 * 
 * Provides real Stripe checkout integration for Pro/Enterprise plans
 */

import { loadStripe, Stripe } from '@stripe/stripe-js'

let stripePromise: Promise<Stripe | null>

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
  }
  return stripePromise
}

export interface CreateCheckoutSessionParams {
  planId: string
  planName: string
  priceId: string
  successUrl: string
  cancelUrl: string
  customerEmail?: string
  metadata?: Record<string, string>
}

export interface CreateCheckoutSessionResponse {
  sessionId: string
  url: string
}

/**
 * Create a Stripe checkout session
 */
export async function createCheckoutSession(params: CreateCheckoutSessionParams): Promise<CreateCheckoutSessionResponse> {
  try {
    const response = await fetch('/api/stripe/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    })

    if (!response.ok) {
      throw new Error('Failed to create checkout session')
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error creating checkout session:', error)
    throw error
  }
}

/**
 * Create a customer portal session for subscription management
 */
export async function createCustomerPortalSession(customerId: string, returnUrl: string): Promise<string> {
  try {
    const response = await fetch('/api/stripe/create-portal-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customerId,
        returnUrl,
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to create portal session')
    }

    const data = await response.json()
    return data.url
  } catch (error) {
    console.error('Error creating portal session:', error)
    throw error
  }
}

/**
 * Get subscription details
 */
export async function getSubscription(subscriptionId: string) {
  try {
    const response = await fetch(`/api/stripe/subscriptions/${subscriptionId}`)
    
    if (!response.ok) {
      throw new Error('Failed to get subscription')
    }

    return await response.json()
  } catch (error) {
    console.error('Error getting subscription:', error)
    throw error
  }
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(subscriptionId: string, reason?: string) {
  try {
    const response = await fetch(`/api/stripe/subscriptions/${subscriptionId}/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reason }),
    })

    if (!response.ok) {
      throw new Error('Failed to cancel subscription')
    }

    return await response.json()
  } catch (error) {
    console.error('Error canceling subscription:', error)
    throw error
  }
}
