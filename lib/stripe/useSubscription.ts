/**
 * lib/stripe/useSubscription.ts — Subscription Management Hook
 * 
 * Provides subscription management functionality for Stripe
 */

import { useState, useEffect } from 'react'
import { createCustomerPortalSession } from './client'

export interface Subscription {
  id: string
  status: 'active' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'past_due' | 'trialing' | 'unpaid'
  planId: string
  planName: string
  currentPeriodStart: number
  currentPeriodEnd: number
  cancelAtPeriodEnd: boolean
  customerId: string
}

export interface UseSubscriptionReturn {
  subscription: Subscription | null
  isLoading: boolean
  error: string | null
  manageSubscription: () => Promise<void>
  cancelSubscription: () => Promise<void>
  refreshSubscription: () => Promise<void>
}

export function useSubscription(): UseSubscriptionReturn {
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load subscription data
  const loadSubscription = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // This would typically fetch from your API
      const response = await fetch('/api/stripe/subscription')
      
      if (response.ok) {
        const data = await response.json()
        setSubscription(data.subscription)
      } else {
        setError('Failed to load subscription')
      }
    } catch (err) {
      setError('Error loading subscription')
      console.error('Error loading subscription:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // Manage subscription (redirect to Stripe portal)
  const manageSubscription = async () => {
    if (!subscription?.customerId) {
      setError('No customer ID found')
      return
    }

    try {
      const url = await createCustomerPortalSession(
        subscription.customerId,
        window.location.href
      )
      
      if (url) {
        window.location.href = url
      }
    } catch (err) {
      setError('Failed to open customer portal')
      console.error('Error opening customer portal:', err)
    }
  }

  // Cancel subscription
  const cancelSubscription = async () => {
    if (!subscription?.id) {
      setError('No subscription ID found')
      return
    }

    try {
      const response = await fetch(`/api/stripe/subscriptions/${subscription.id}/cancel`, {
        method: 'POST',
      })

      if (response.ok) {
        await loadSubscription() // Refresh data
      } else {
        setError('Failed to cancel subscription')
      }
    } catch (err) {
      setError('Error canceling subscription')
      console.error('Error canceling subscription:', err)
    }
  }

  // Refresh subscription data
  const refreshSubscription = async () => {
    await loadSubscription()
  }

  // Load subscription on mount
  useEffect(() => {
    loadSubscription()
  }, [])

  return {
    subscription,
    isLoading,
    error,
    manageSubscription,
    cancelSubscription,
    refreshSubscription,
  }
}
