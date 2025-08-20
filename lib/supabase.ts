/**
 * lib/supabase.ts — Server-side Supabase Client
 * 
 * Server-only Supabase client with SERVICE_ROLE key for admin operations
 * Handles entitlements, subscriptions, prompt history, and scoring
 */

import { createClient } from '@supabase/supabase-js'
import type { Database } from './supabase/types'

// Environment variables for server-side Supabase
const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables for server-side operations')
}

// Server-side Supabase client with SERVICE_ROLE (admin privileges)
export const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// ============================================================================
// ENTITLEMENTS MANAGEMENT
// ============================================================================

export interface EntitlementFlags {
  canUseAllModules: boolean
  canExportMD: boolean
  canExportPDF: boolean
  canExportJSON: boolean
  canUseGptTestReal: boolean
  hasCloudHistory: boolean
  hasEvaluatorAI: boolean
  hasAPI: boolean
  hasWhiteLabel: boolean
  canExportBundleZip: boolean
  hasSeatsGT1: boolean
}

/**
 * Get effective entitlements for a user (try user-specific first, fallback to org-wide)
 */
export async function getEffectiveEntitlements(userId: string, orgId: string): Promise<EntitlementFlags> {
  try {
    // First try to get user-specific entitlements
    const { data: userEntitlements, error: userError } = await supabaseAdmin
      .from('entitlements')
      .select('*')
      .eq('user_id', userId)
      .eq('org_id', orgId)
      .single()

    if (userEntitlements && !userError) {
      return userEntitlements.flags as EntitlementFlags
    }

    // Fallback to org-wide entitlements
    const { data: orgEntitlements, error: orgError } = await supabaseAdmin
      .from('v_effective_entitlements')
      .select('*')
      .eq('org_id', orgId)
      .single()

    if (orgEntitlements && !orgError) {
      return orgEntitlements.features as EntitlementFlags
    }

    // Default to free plan entitlements
    return {
      canUseAllModules: false,
      canExportMD: false,
      canExportPDF: false,
      canExportJSON: false,
      canUseGptTestReal: false,
      hasCloudHistory: false,
      hasEvaluatorAI: false,
      hasAPI: false,
      hasWhiteLabel: false,
      canExportBundleZip: false,
      hasSeatsGT1: false
    }
  } catch (error) {
    console.error('Error getting effective entitlements:', error)
    throw new Error('Failed to retrieve entitlements')
  }
}

/**
 * Update user entitlements
 */
export async function updateUserEntitlements(
  userId: string, 
  orgId: string, 
  flags: Partial<EntitlementFlags>
): Promise<void> {
  try {
    const { error } = await supabaseAdmin
      .from('entitlements')
      .upsert({
        user_id: userId,
        org_id: orgId,
        flags: flags,
        updated_at: new Date().toISOString()
      })

    if (error) throw error
  } catch (error) {
    console.error('Error updating user entitlements:', error)
    throw new Error('Failed to update entitlements')
  }
}

// ============================================================================
// SUBSCRIPTIONS MANAGEMENT
// ============================================================================

export interface SubscriptionData {
  id: string
  org_id: string
  plan_id: string
  status: string
  current_period_start: string
  current_period_end: string
  cancel_at_period_end: boolean
  stripe_subscription_id: string | null
  stripe_customer_id: string | null
  metadata: any
}

/**
 * Get active subscription for an organization
 */
export async function getActiveSubscription(orgId: string): Promise<SubscriptionData | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .eq('org_id', orgId)
      .eq('status', 'active')
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
  } catch (error) {
    console.error('Error getting active subscription:', error)
    return null
  }
}

/**
 * Create or update subscription
 */
export async function upsertSubscription(subscriptionData: {
  org_id: string
  plan_id: string
  status: string
  current_period_start: string
  current_period_end: string
  stripe_subscription_id?: string
  stripe_customer_id?: string
  metadata?: any
}): Promise<void> {
  try {
    const { error } = await supabaseAdmin
      .from('subscriptions')
      .upsert({
        ...subscriptionData,
        updated_at: new Date().toISOString()
      })

    if (error) throw error
  } catch (error) {
    console.error('Error upserting subscription:', error)
    throw new Error('Failed to update subscription')
  }
}

/**
 * Update subscription status
 */
export async function updateSubscriptionStatus(
  subscriptionId: string, 
  status: string, 
  metadata?: any
): Promise<void> {
  try {
    const { error } = await supabaseAdmin
      .from('subscriptions')
      .update({
        status,
        metadata: metadata || {},
        updated_at: new Date().toISOString()
      })
      .eq('id', subscriptionId)

    if (error) throw error
  } catch (error) {
    console.error('Error updating subscription status:', error)
    throw new Error('Failed to update subscription status')
  }
}

// ============================================================================
// PROMPT HISTORY & SCORES
// ============================================================================

export interface PromptHistoryEntry {
  id: string
  org_id: string
  user_id: string
  module_id: number
  input: string
  output: string
  seven_d_params: any
  scores?: any
  execution_time_ms?: number
  token_count?: number
  created_at: string
}

export interface PromptScore {
  id: string
  org_id: string
  user_id: string
  module_id: number
  run_id: string
  overall_score: number
  quality_score: number
  relevance_score: number
  clarity_score: number
  feedback: string
  evaluator_version: string
  created_at: string
}

/**
 * Save prompt execution to history
 */
export async function savePromptHistory(entry: Omit<PromptHistoryEntry, 'id' | 'created_at'>): Promise<string> {
  try {
    const { data, error } = await supabaseAdmin
      .from('runs')
      .insert({
        org_id: entry.org_id,
        user_id: entry.user_id,
        module_id: entry.module_id,
        run_id: generateRunId(entry.org_id, entry.module_id),
        status: 'completed',
        seven_d: entry.seven_d_params,
        input: entry.input,
        output: entry.output,
        scores: entry.scores,
        execution_time_ms: entry.execution_time_ms,
        token_count: entry.token_count
      })
      .select('id')
      .single()

    if (error) throw error
    return data.id
  } catch (error) {
    console.error('Error saving prompt history:', error)
    throw new Error('Failed to save prompt history')
  }
}

/**
 * Save prompt scores
 */
export async function savePromptScores(score: Omit<PromptScore, 'id' | 'created_at'>): Promise<string> {
  try {
    const { data, error } = await supabaseAdmin
      .from('prompt_scores')
      .insert({
        org_id: score.org_id,
        user_id: score.user_id,
        module_id: score.module_id,
        run_id: score.run_id,
        overall_score: score.overall_score,
        quality_score: score.quality_score,
        relevance_score: score.relevance_score,
        clarity_score: score.clarity_score,
        feedback: score.feedback,
        evaluator_version: score.evaluator_version
      })
      .select('id')
      .single()

    if (error) throw error
    return data.id
  } catch (error) {
    console.error('Error saving prompt scores:', error)
    throw new Error('Failed to save prompt scores')
  }
}

/**
 * Get prompt history for a user/org
 */
export async function getPromptHistory(
  orgId: string, 
  userId?: string, 
  limit: number = 50
): Promise<PromptHistoryEntry[]> {
  try {
    let query = supabaseAdmin
      .from('runs')
      .select('*')
      .eq('org_id', orgId)
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (userId) {
      query = query.eq('user_id', userId)
    }

    const { data, error } = await query
    if (error) throw error

    return data.map(row => ({
      id: row.id,
      org_id: row.org_id,
      user_id: row.user_id,
      module_id: row.module_id,
      input: row.input,
      output: row.output,
      seven_d_params: row.seven_d,
      scores: row.scores,
      execution_time_ms: row.execution_time_ms,
      token_count: row.token_count,
      created_at: row.created_at
    }))
  } catch (error) {
    console.error('Error getting prompt history:', error)
    return []
  }
}

/**
 * Get prompt scores for a user/org
 */
export async function getPromptScores(
  orgId: string, 
  userId?: string, 
  limit: number = 50
): Promise<PromptScore[]> {
  try {
    let query = supabaseAdmin
      .from('prompt_scores')
      .select('*')
      .eq('org_id', orgId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (userId) {
      query = query.eq('user_id', userId)
    }

    const { data, error } = await query
    if (error) throw error

    return data
  } catch (error) {
    console.error('Error getting prompt scores:', error)
    return []
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Generate unique run ID
 */
function generateRunId(orgId: string, moduleId: number): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const timestamp = Date.now().toString(36)
  return `${date}-${orgId.slice(0, 8)}-${moduleId}-${timestamp}`
}

/**
 * Check if user has specific entitlement
 */
export async function hasEntitlement(
  userId: string, 
  orgId: string, 
  entitlement: keyof EntitlementFlags
): Promise<boolean> {
  try {
    const entitlements = await getEffectiveEntitlements(userId, orgId)
    return entitlements[entitlement] || false
  } catch (error) {
    console.error('Error checking entitlement:', error)
    return false
  }
}

/**
 * Get organization details
 */
export async function getOrganization(orgId: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from('orgs')
      .select('*')
      .eq('id', orgId)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error getting organization:', error)
    return null
  }
}

// Export types for use in other modules
export type { EntitlementFlags, SubscriptionData, PromptHistoryEntry, PromptScore }
