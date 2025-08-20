/**
 * lib/entitlements/plan-manager.ts — Plan Management System
 * 
 * Manages subscription plans, billing, and feature entitlements
 * Integrates with Stripe for payment processing
 */

import { createServerSupabaseClient } from '@/lib/supabase/client'
import { analytics } from '@/lib/telemetry/analytics'
import type { Tables, Inserts, Updates } from '@/lib/supabase/types'

export interface PlanFeatures {
  // Core Features
  canUseAllModules: boolean
  canGeneratePrompts: boolean
  canEditPrompts: boolean
  
  // GPT Integration
  canUseGptEditor: boolean
  canUseGptTestReal: boolean
  canUseGptTestSimulated: boolean
  
  // Export & Bundles
  canExportTxt: boolean
  canExportMd: boolean
  canExportJson: boolean
  canExportPdf: boolean
  canExportZip: boolean
  canExportBundle: boolean
  
  // API Access
  canUseApi: boolean
  apiRateLimit: number
  
  // Advanced Features
  canUseCustomModels: boolean
  canUseFineTuning: boolean
  canUseAnalytics: boolean
  canUseTeamFeatures: boolean
}

export interface UsageLimits {
  monthlyPrompts: number
  monthlyGptCalls: number
  monthlyExports: number
  storageGb: number
  teamMembers: number
}

export interface Plan {
  id: string
  name: string
  description: string
  priceMonthly: number
  priceYearly: number
  currency: string
  features: PlanFeatures
  limits: UsageLimits
  isActive: boolean
  stripeProductId?: string
  stripePriceIdMonthly?: string
  stripePriceIdYearly?: string
  createdAt: Date
  updatedAt: Date
}

export interface Subscription {
  id: string
  orgId: string
  planId: string
  status: 'active' | 'canceled' | 'past_due' | 'unpaid' | 'trialing'
  currentPeriodStart: Date
  currentPeriodEnd: Date
  cancelAtPeriodEnd: boolean
  stripeSubscriptionId?: string
  stripeCustomerId?: string
  trialEnd?: Date
  metadata: Record<string, any>
  createdAt: Date
  updatedAt: Date
}

export interface BillingInfo {
  customerId: string
  email: string
  name?: string
  address?: {
    line1: string
    line2?: string
    city: string
    state: string
    postalCode: string
    country: string
  }
  paymentMethod?: {
    id: string
    type: string
    last4: string
    brand: string
    expMonth: number
    expYear: number
  }
}

export class PlanManager {
  private static instance: PlanManager
  private supabase = createServerSupabaseClient()

  private constructor() {}

  static getInstance(): PlanManager {
    if (!PlanManager.instance) {
      PlanManager.instance = new PlanManager()
    }
    return PlanManager.instance
  }

  /**
   * Get all available plans
   */
  async getAvailablePlans(): Promise<Plan[]> {
    try {
      const { data: plans, error } = await this.supabase
        .from('plans')
        .select('*')
        .eq('is_active', true)
        .order('price_monthly', { ascending: true })

      if (error) {
        console.error('Error fetching plans:', error)
        return []
      }

      return plans?.map(plan => ({
        id: plan.id,
        name: plan.name,
        description: plan.description || '',
        priceMonthly: plan.price_monthly || 0,
        priceYearly: plan.price_yearly || 0,
        currency: 'USD',
        features: plan.features as PlanFeatures,
        limits: plan.limits as UsageLimits,
        isActive: plan.is_active,
        stripeProductId: plan.stripe_product_id,
        stripePriceIdMonthly: plan.stripe_price_id_monthly,
        stripePriceIdYearly: plan.stripe_price_id_yearly,
        createdAt: new Date(plan.created_at),
        updatedAt: new Date(plan.updated_at)
      })) || []

    } catch (error) {
      console.error('Error getting available plans:', error)
      return []
    }
  }

  /**
   * Get plan by ID
   */
  async getPlanById(planId: string): Promise<Plan | null> {
    try {
      const { data: plan, error } = await this.supabase
        .from('plans')
        .select('*')
        .eq('id', planId)
        .eq('is_active', true)
        .single()

      if (error || !plan) {
        return null
      }

      return {
        id: plan.id,
        name: plan.name,
        description: plan.description || '',
        priceMonthly: plan.price_monthly || 0,
        priceYearly: plan.price_yearly || 0,
        currency: 'USD',
        features: plan.features as PlanFeatures,
        limits: plan.limits as UsageLimits,
        isActive: plan.is_active,
        stripeProductId: plan.stripe_product_id,
        stripePriceIdMonthly: plan.stripe_price_id_monthly,
        stripePriceIdYearly: plan.stripe_price_id_yearly,
        createdAt: new Date(plan.created_at),
        updatedAt: new Date(plan.updated_at)
      }

    } catch (error) {
      console.error('Error getting plan by ID:', error)
      return null
    }
  }

  /**
   * Get organization subscription
   */
  async getOrganizationSubscription(orgId: string): Promise<Subscription | null> {
    try {
      const { data: subscription, error } = await this.supabase
        .from('subscriptions')
        .select('*')
        .eq('org_id', orgId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (error || !subscription) {
        return null
      }

      return {
        id: subscription.id,
        orgId: subscription.org_id,
        planId: subscription.plan_id,
        status: subscription.status as Subscription['status'],
        currentPeriodStart: new Date(subscription.current_period_start),
        currentPeriodEnd: new Date(subscription.current_period_end),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        stripeSubscriptionId: subscription.stripe_subscription_id,
        stripeCustomerId: subscription.stripe_customer_id,
        trialEnd: subscription.trial_end ? new Date(subscription.trial_end) : undefined,
        metadata: subscription.metadata as Record<string, any>,
        createdAt: new Date(subscription.created_at),
        updatedAt: new Date(subscription.updated_at)
      }

    } catch (error) {
      console.error('Error getting organization subscription:', error)
      return null
    }
  }

  /**
   * Create new subscription
   */
  async createSubscription(
    orgId: string,
    planId: string,
    stripeSubscriptionId: string,
    stripeCustomerId: string,
    metadata: Record<string, any> = {}
  ): Promise<Subscription | null> {
    try {
      const plan = await this.getPlanById(planId)
      if (!plan) {
        throw new Error('Invalid plan ID')
      }

      const now = new Date()
      const periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) // 30 days

      const subscriptionData: Inserts<'subscriptions'> = {
        org_id: orgId,
        plan_id: planId,
        status: 'active',
        current_period_start: now.toISOString(),
        current_period_end: periodEnd.toISOString(),
        cancel_at_period_end: false,
        stripe_subscription_id: stripeSubscriptionId,
        stripe_customer_id: stripeCustomerId,
        metadata
      }

      const { data: subscription, error } = await this.supabase
        .from('subscriptions')
        .insert(subscriptionData)
        .select()
        .single()

      if (error) {
        throw new Error(`Failed to create subscription: ${error.message}`)
      }

      // Track subscription creation
      await analytics.trackUserAction({
        userId: 'system',
        sessionId: 'system',
        planId,
        action: 'subscription_created',
        target: 'billing',
        metadata: { orgId, planId, stripeSubscriptionId }
      })

      return {
        id: subscription.id,
        orgId: subscription.org_id,
        planId: subscription.plan_id,
        status: subscription.status as Subscription['status'],
        currentPeriodStart: new Date(subscription.current_period_start),
        currentPeriodEnd: new Date(subscription.current_period_end),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        stripeSubscriptionId: subscription.stripe_subscription_id,
        stripeCustomerId: subscription.stripe_customer_id,
        trialEnd: subscription.trial_end ? new Date(subscription.trial_end) : undefined,
        metadata: subscription.metadata as Record<string, any>,
        createdAt: new Date(subscription.created_at),
        updatedAt: new Date(subscription.updated_at)
      }

    } catch (error) {
      console.error('Error creating subscription:', error)
      return null
    }
  }

  /**
   * Update subscription status
   */
  async updateSubscriptionStatus(
    subscriptionId: string,
    status: Subscription['status'],
    metadata: Record<string, any> = {}
  ): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('subscriptions')
        .update({
          status,
          metadata: { ...metadata, lastStatusUpdate: new Date().toISOString() }
        })
        .eq('id', subscriptionId)

      if (error) {
        throw new Error(`Failed to update subscription: ${error.message}`)
      }

      // Track status update
      await analytics.trackUserAction({
        userId: 'system',
        sessionId: 'system',
        planId: 'unknown',
        action: 'subscription_status_updated',
        target: 'billing',
        metadata: { subscriptionId, status }
      })

      return true

    } catch (error) {
      console.error('Error updating subscription status:', error)
      return false
    }
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(subscriptionId: string, cancelAtPeriodEnd: boolean = true): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('subscriptions')
        .update({
          cancel_at_period_end: cancelAtPeriodEnd,
          status: cancelAtPeriodEnd ? 'active' : 'canceled',
          metadata: { canceledAt: new Date().toISOString() }
        })
        .eq('id', subscriptionId)

      if (error) {
        throw new Error(`Failed to cancel subscription: ${error.message}`)
      }

      // Track cancellation
      await analytics.trackUserAction({
        userId: 'system',
        sessionId: 'system',
        planId: 'unknown',
        action: 'subscription_canceled',
        target: 'billing',
        metadata: { subscriptionId, cancelAtPeriodEnd }
      })

      return true

    } catch (error) {
      console.error('Error canceling subscription:', error)
      return false
    }
  }

  /**
   * Check feature access for organization
   */
  async checkFeatureAccess(orgId: string, feature: keyof PlanFeatures): Promise<boolean> {
    try {
      const subscription = await this.getOrganizationSubscription(orgId)
      if (!subscription) {
        return false
      }

      const plan = await this.getPlanById(subscription.planId)
      if (!plan) {
        return false
      }

      return plan.features[feature] || false

    } catch (error) {
      console.error('Error checking feature access:', error)
      return false
    }
  }

  /**
   * Get usage statistics for organization
   */
  async getOrganizationUsage(orgId: string): Promise<{
    currentUsage: Partial<UsageLimits>
    limits: UsageLimits
    plan: Plan | null
  }> {
    try {
      const subscription = await this.getOrganizationSubscription(orgId)
      if (!subscription) {
        return {
          currentUsage: {},
          limits: {
            monthlyPrompts: 0,
            monthlyGptCalls: 0,
            monthlyExports: 0,
            storageGb: 0,
            teamMembers: 0
          },
          plan: null
        }
      }

      const plan = await this.getPlanById(subscription.planId)
      if (!plan) {
        return {
          currentUsage: {},
          limits: {
            monthlyPrompts: 0,
            monthlyGptCalls: 0,
            monthlyExports: 0,
            storageGb: 0,
            teamMembers: 0
          },
          plan: null
        }
      }

      // Get current month usage
      const startOfMonth = new Date()
      startOfMonth.setDate(1)
      startOfMonth.setHours(0, 0, 0, 0)

      const { data: runs } = await this.supabase
        .from('runs')
        .select('token_count')
        .eq('org_id', orgId)
        .gte('created_at', startOfMonth.toISOString())

      const { data: exports } = await this.supabase
        .from('telemetry_events')
        .select('*')
        .eq('org_id', orgId)
        .eq('event_type', 'bundle_export')
        .gte('created_at', startOfMonth.toISOString())

      const currentUsage = {
        monthlyPrompts: runs?.length || 0,
        monthlyGptCalls: runs?.length || 0,
        monthlyExports: exports?.length || 0,
        storageGb: 0, // TODO: Calculate actual storage usage
        teamMembers: 0 // TODO: Get actual team member count
      }

      return {
        currentUsage,
        limits: plan.limits,
        plan
      }

    } catch (error) {
      console.error('Error getting organization usage:', error)
      return {
        currentUsage: {},
        limits: {
          monthlyPrompts: 0,
          monthlyGptCalls: 0,
          monthlyExports: 0,
          storageGb: 0,
          teamMembers: 0
        },
        plan: null
      }
    }
  }

  /**
   * Upgrade organization plan
   */
  async upgradePlan(orgId: string, newPlanId: string): Promise<boolean> {
    try {
      const currentSubscription = await this.getOrganizationSubscription(orgId)
      if (!currentSubscription) {
        throw new Error('No active subscription found')
      }

      const newPlan = await this.getPlanById(newPlanId)
      if (!newPlan) {
        throw new Error('Invalid plan ID')
      }

      // Cancel current subscription
      await this.cancelSubscription(currentSubscription.id, true)

      // Create new subscription (in real implementation, this would be handled by Stripe webhook)
      const success = await this.updateSubscriptionStatus(currentSubscription.id, 'canceled', {
        upgradedTo: newPlanId,
        upgradeDate: new Date().toISOString()
      })

      // Track plan upgrade
      await analytics.trackUserAction({
        userId: 'system',
        sessionId: 'system',
        planId: newPlanId,
        action: 'plan_upgraded',
        target: 'billing',
        metadata: { orgId, fromPlan: currentSubscription.planId, toPlan: newPlanId }
      })

      return Boolean(success)

    } catch (error) {
      console.error('Error upgrading plan:', error)
      return false
    }
  }

  /**
   * Get billing information
   */
  async getBillingInfo(orgId: string): Promise<BillingInfo | null> {
    try {
      const subscription = await this.getOrganizationSubscription(orgId)
      if (!subscription?.stripeCustomerId) {
        return null
      }

      // In real implementation, fetch from Stripe API
      // For now, return mock data
      return {
        customerId: subscription.stripeCustomerId,
        email: 'customer@example.com',
        name: 'Customer Name',
        address: {
          line1: '123 Main St',
          city: 'City',
          state: 'State',
          postalCode: '12345',
          country: 'US'
        },
        paymentMethod: {
          id: 'pm_123',
          type: 'card',
          last4: '4242',
          brand: 'visa',
          expMonth: 12,
          expYear: 2025
        }
      }

    } catch (error) {
      console.error('Error getting billing info:', error)
      return null
    }
  }

  /**
   * Get subscription analytics
   */
  async getSubscriptionAnalytics(): Promise<{
    totalSubscriptions: number
    activeSubscriptions: number
    planDistribution: Record<string, number>
    monthlyRevenue: number
    churnRate: number
  }> {
    try {
      const { count: total } = await this.supabase
        .from('subscriptions')
        .select('*', { count: 'exact', head: true })

      const { count: active } = await this.supabase
        .from('subscriptions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active')

      const { data: subscriptions } = await this.supabase
        .from('subscriptions')
        .select('plan_id, status')
        .limit(1000)

      const planDistribution: Record<string, number> = {}
      subscriptions?.forEach(sub => {
        const count = planDistribution[sub.plan_id] || 0
        planDistribution[sub.plan_id] = count + 1
      })

      // Mock analytics data
      return {
        totalSubscriptions: total || 0,
        activeSubscriptions: active || 0,
        planDistribution,
        monthlyRevenue: 0, // TODO: Calculate from Stripe
        churnRate: 0 // TODO: Calculate churn rate
      }

    } catch (error) {
      console.error('Error getting subscription analytics:', error)
      return {
        totalSubscriptions: 0,
        activeSubscriptions: 0,
        planDistribution: {},
        monthlyRevenue: 0,
        churnRate: 0
      }
    }
  }
}

// Export singleton instance
export const planManager = PlanManager.getInstance()
