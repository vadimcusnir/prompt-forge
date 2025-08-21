/**
 * hooks/useEntitlements.ts — Entitlements Management Hook
 * 
 * Provides frontend access to user entitlements with caching
 * Handles entitlement checking and plan upgrades
 */

import { useState, useEffect, useCallback } from 'react'
import { useSession } from '@/hooks/use-coming-soon' // Adjust import path as needed

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

export interface EntitlementsData {
  entitlements: EntitlementFlags
  organization: {
    id: string
    name: string
    plan_id: string
    status: string
  }
  user_id: string
  org_id: string
}

interface UseEntitlementsReturn {
  entitlements: EntitlementFlags | null
  organization: any
  isLoading: boolean
  error: string | null
  refresh: () => Promise<void>
  hasEntitlement: (entitlement: keyof EntitlementFlags) => boolean
  checkEntitlement: (entitlement: keyof EntitlementFlags) => Promise<boolean>
}

export function useEntitlements(): UseEntitlementsReturn {
  const [entitlements, setEntitlements] = useState<EntitlementFlags | null>(null)
  const [organization, setOrganization] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastFetch, setLastFetch] = useState<number>(0)
  
  // Cache duration: 5 minutes
  const CACHE_DURATION = 5 * 60 * 1000

  // Get session token (adjust based on your auth system)
  const { data: session } = useSession()

  const fetchEntitlements = useCallback(async () => {
    if (!session?.accessToken) {
      setError('No access token available')
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/entitlements', {
        headers: {
          'Authorization': `Bearer ${session.accessToken}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.success) {
        setEntitlements(data.data.entitlements)
        setOrganization(data.data.organization)
        setLastFetch(Date.now())
      } else {
        throw new Error(data.error || 'Failed to fetch entitlements')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      console.error('Error fetching entitlements:', err)
    } finally {
      setIsLoading(false)
    }
  }, [session?.accessToken])

  const refresh = useCallback(async () => {
    await fetchEntitlements()
  }, [fetchEntitlements])

  // Check if entitlements are cached and valid
  const isCacheValid = useCallback(() => {
    return lastFetch > 0 && (Date.now() - lastFetch) < CACHE_DURATION
  }, [lastFetch])

  // Initial fetch
  useEffect(() => {
    if (session?.accessToken && (!entitlements || !isCacheValid())) {
      fetchEntitlements()
    }
  }, [session?.accessToken, entitlements, isCacheValid, fetchEntitlements])

  // Check if user has a specific entitlement
  const hasEntitlement = useCallback((entitlement: keyof EntitlementFlags): boolean => {
    if (!entitlements) return false
    return entitlements[entitlement] || false
  }, [entitlements])

  // Check entitlement with server validation
  const checkEntitlement = useCallback(async (entitlement: keyof EntitlementFlags): Promise<boolean> => {
    // First check local cache
    if (entitlements && hasEntitlement(entitlement)) {
      return true
    }

    // If not in cache or cache expired, refresh from server
    if (!isCacheValid()) {
      await refresh()
    }

    return hasEntitlement(entitlement)
  }, [entitlements, hasEntitlement, isCacheValid, refresh])

  return {
    entitlements,
    organization,
    isLoading,
    error,
    refresh,
    hasEntitlement,
    checkEntitlement
  }
}

// ============================================================================
// UTILITY HOOKS
// ============================================================================

/**
 * Hook for checking specific entitlements
 */
export function useEntitlement(entitlement: keyof EntitlementFlags) {
  const { hasEntitlement, checkEntitlement, isLoading } = useEntitlements()
  
  return {
    hasEntitlement: hasEntitlement(entitlement),
    checkEntitlement: () => checkEntitlement(entitlement),
    isLoading
  }
}

/**
 * Hook for checking multiple entitlements
 */
export function useEntitlementsList(entitlements: (keyof EntitlementFlags)[]) {
  const { hasEntitlement, checkEntitlement, isLoading } = useEntitlements()
  
  const results = entitlements.map(entitlement => ({
    entitlement,
    hasEntitlement: hasEntitlement(entitlement),
    checkEntitlement: () => checkEntitlement(entitlement)
  }))

  const allEntitlements = results.every(r => r.hasEntitlement)
  const anyEntitlement = results.some(r => r.hasEntitlement)

  return {
    results,
    allEntitlements,
    anyEntitlement,
    isLoading
  }
}

/**
 * Hook for plan-based entitlement checking
 */
export function usePlanEntitlements() {
  const { organization, hasEntitlement } = useEntitlements()
  
  const isFree = organization?.plan_id === 'free'
  const isCreator = organization?.plan_id === 'creator'
  const isPro = organization?.plan_id === 'pro'
  const isEnterprise = organization?.plan_id === 'enterprise'
  
  const canUpgrade = !isEnterprise
  const canDowngrade = !isFree
  
  const planFeatures = {
    free: {
      modules: 'Basic modules only',
      exports: 'Text only',
      testing: 'Simulated responses',
      history: 'Local only',
      api: false
    },
    creator: {
      modules: 'All modules',
      exports: 'Text + Markdown',
      testing: 'Simulated responses',
      history: 'Local only',
      api: false
    },
    pro: {
      modules: 'All modules',
      exports: 'Text + Markdown + PDF + JSON',
      testing: 'Live GPT testing',
      history: 'Cloud storage',
      api: false
    },
    enterprise: {
      modules: 'All modules',
      exports: 'All formats + Bundle',
      testing: 'Live GPT testing',
      history: 'Cloud storage',
      api: true
    }
  }

  return {
    currentPlan: organization?.plan_id || 'free',
    isFree,
    isCreator,
    isPro,
    isEnterprise,
    canUpgrade,
    canDowngrade,
    planFeatures,
    hasEntitlement
  }
}
