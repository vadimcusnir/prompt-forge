/**
 * lib/entitlements/useEntitlements.ts — Comprehensive Entitlements Checker
 * 
 * Implements strict gating: Pro+ for real GPT testing, Enterprise for bundle.zip/API
 * Provides real-time feature access validation with usage tracking
 */

import { PLANS, type PlanId, type FeatureAccess, type EntitlementCheck, type UserEntitlements } from './types'

export class EntitlementChecker {
  /**
   * Check if user has access to a specific feature
   * Implements strict gating based on plan requirements
   */
  static checkFeature(
    planId: PlanId,
    feature: keyof FeatureAccess,
    userId?: string,
    usage?: any
  ): EntitlementCheck {
    const plan = PLANS[planId]
    if (!plan) {
      return {
        allowed: false,
        reason: `Invalid plan: ${planId}`,
        requiredPlan: 'pilot',
        currentPlan: planId,
        upgradeUrl: '/pricing'
      }
    }

    const hasAccess = plan.features[feature]
    
    if (!hasAccess) {
      // Determine required plan for this feature
      const requiredPlan = this.getRequiredPlanForFeature(feature)
      
      return {
        allowed: false,
        reason: `${feature} requires ${requiredPlan} plan or higher`,
        requiredPlan,
        currentPlan: planId,
        upgradeUrl: '/pricing',
        feature
      }
    }

    // Check usage limits if applicable
    if (usage && plan.limits) {
      const usageCheck = this.checkUsageLimits(planId, feature, usage)
      if (!usageCheck.allowed) {
        return usageCheck
      }
    }

    return {
      allowed: true,
      currentPlan: planId
    }
  }

  /**
   * Get minimum plan required for a specific feature
   */
  private static getRequiredPlanForFeature(feature: keyof FeatureAccess): PlanId {
    switch (feature) {
      // Pro+ features
      case 'canUseGptTestReal':
      case 'canExportPdf':
        return 'pro'
      
      // Enterprise features
      case 'canExportZip':
      case 'canUseApi':
      case 'canUseCustomModels':
      case 'canUseFineTuning':
      case 'canUseTeamFeatures':
        return 'enterprise'
      
      // Available in all plans
      default:
        return 'pilot'
    }
  }

  /**
   * Check usage limits for a specific feature
   */
  private static checkUsageLimits(
    planId: PlanId,
    feature: keyof FeatureAccess,
    usage: any
  ): EntitlementCheck {
    const plan = PLANS[planId]
    if (!plan || !plan.limits) {
      return { allowed: true }
    }

    const limits = plan.limits

    // Check monthly prompt limit
    if (feature === 'canGeneratePrompts' && usage.promptsThisMonth >= limits.monthlyPrompts) {
      return {
        allowed: false,
        reason: `Monthly prompt limit reached (${usage.promptsThisMonth}/${limits.monthlyPrompts})`,
        requiredPlan: this.getUpgradePlan(planId),
        currentPlan: planId,
        upgradeUrl: '/pricing'
      }
    }

    // Check monthly GPT calls limit
    if (feature === 'canUseGptTestReal' && usage.gptCallsThisMonth >= limits.monthlyGptCalls) {
      return {
        allowed: false,
        reason: `Monthly GPT calls limit reached (${usage.gptCallsThisMonth}/${limits.monthlyGptCalls})`,
        requiredPlan: this.getUpgradePlan(planId),
        currentPlan: planId,
        upgradeUrl: '/pricing'
      }
    }

    // Check monthly exports limit
    if (feature.includes('Export') && usage.exportsThisMonth >= limits.monthlyExports) {
      return {
        allowed: false,
        reason: `Monthly exports limit reached (${usage.exportsThisMonth}/${limits.monthlyExports})`,
        requiredPlan: this.getUpgradePlan(planId),
        currentPlan: planId,
        upgradeUrl: '/pricing'
      }
    }

    // Check storage limit
    if (usage.storageUsedGb >= limits.storageGb) {
      return {
        allowed: false,
        reason: `Storage limit reached (${usage.storageUsedGb}GB/${limits.storageGb}GB)`,
        requiredPlan: this.getUpgradePlan(planId),
        currentPlan: planId,
        upgradeUrl: '/pricing'
      }
    }

    return { allowed: true }
  }

  /**
   * Get the next upgrade plan for current plan
   */
  private static getUpgradePlan(currentPlan: PlanId): PlanId {
    switch (currentPlan) {
      case 'pilot':
        return 'pro'
      case 'pro':
        return 'enterprise'
      case 'enterprise':
        return 'custom'
      default:
        return 'enterprise'
    }
  }

  /**
   * Check if user can access a specific module
   */
  static canAccessModule(planId: PlanId, moduleId: string): boolean {
    const plan = PLANS[planId]
    if (!plan) return false
    return plan.features.canUseAllModules
  }

  /**
   * Get available export formats for a plan
   */
  static getAvailableExportFormats(planId: PlanId): string[] {
    const plan = PLANS[planId]
    if (!plan) return ['txt']

    const formats: string[] = []
    if (plan.features.canExportTxt) formats.push('txt')
    if (plan.features.canExportMd) formats.push('md')
    if (plan.features.canExportJson) formats.push('json')
    if (plan.features.canExportPdf) formats.push('pdf')
    if (plan.features.canExportZip) formats.push('zip')
    if (plan.features.canExportBundle) formats.push('bundle')

    return formats
  }

  /**
   * Check if user can use API (Enterprise only)
   */
  static canUseApi(planId: PlanId): boolean {
    return this.checkFeature(planId, 'canUseApi').allowed
  }

  /**
   * Check if user can export ZIP bundles (Enterprise only)
   */
  static canExportZip(planId: PlanId): boolean {
    return this.checkFeature(planId, 'canExportZip').allowed
  }

  /**
   * Check if user can use real GPT testing (Pro+)
   */
  static canUseGptTestReal(planId: PlanId): boolean {
    return this.checkFeature(planId, 'canUseGptTestReal').allowed
  }

  /**
   * Get plan details
   */
  static getPlan(planId: PlanId) {
    return PLANS[planId]
  }

  /**
   * Get all available plans
   */
  static getAllPlans() {
    return Object.values(PLANS)
  }

  /**
   * Validate if a plan upgrade is beneficial
   */
  static getUpgradeBenefits(currentPlan: PlanId): string[] {
    const current = PLANS[currentPlan]
    const next = PLANS[this.getUpgradePlan(currentPlan)]
    
    if (!current || !next) return []

    const benefits: string[] = []
    
    // Compare features
    Object.entries(next.features).forEach(([feature, hasAccess]) => {
      if (hasAccess && !current.features[feature as keyof FeatureAccess]) {
        benefits.push(`Access to ${feature}`)
      }
    })

    // Compare limits
    if (next.limits.monthlyPrompts > current.limits.monthlyPrompts) {
      benefits.push(`${next.limits.monthlyPrompts}x more prompts per month`)
    }
    if (next.limits.monthlyGptCalls > current.limits.monthlyGptCalls) {
      benefits.push(`${next.limits.monthlyGptCalls}x more GPT calls per month`)
    }
    if (next.limits.storageGb > current.limits.storageGb) {
      benefits.push(`${next.limits.storageGb}x more storage`)
    }

    return benefits
  }
}

// Export singleton instance
export const entitlementChecker = EntitlementChecker
