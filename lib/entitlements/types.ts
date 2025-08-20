/**
 * lib/entitlements/types.ts — Entitlements system types
 * 
 * Defines plan structure and feature flags from ruleset.yml
 * Used for gating actions at every endpoint (test/export/API)
 */

export interface PlanFeatures {
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

export interface Plan {
  id: string
  label: string
  features: PlanFeatures
  module_allowlist: string[] | 'ALL'
  exports_allowed: string[]
  retention_days: number
  notes: string
}

export interface UserEntitlements {
  userId: string
  planId: string
  plan: Plan
  expiresAt?: Date
  seats: number
  isActive: boolean
}

export interface EntitlementCheck {
  allowed: boolean
  requiredPlan?: string
  currentPlan?: string
  reason?: string
}

// Plan definitions from plans.json
export const PLANS: Record<string, Plan> = {
  pilot: {
    id: 'pilot',
    label: 'Pilot',
    features: {
      canUseAllModules: false,
      canExportMD: true,
      canExportPDF: false,
      canExportJSON: false,
      canUseGptTestReal: false,
      hasCloudHistory: false,
      hasEvaluatorAI: true,
      hasAPI: false,
      hasWhiteLabel: false,
      canExportBundleZip: false,
      hasSeatsGT1: false,
    },
    module_allowlist: ['M01', 'M02', 'M03', 'M04', 'M05', 'M06', 'M07', 'M08', 'M09', 'M10', 'M11', 'M12'],
    exports_allowed: ['txt', 'md'],
    retention_days: 7,
    notes: 'Generator + 12 module de bază + export .md/.txt cu watermark'
  },
  pro: {
    id: 'pro',
    label: 'Pro',
    features: {
      canUseAllModules: true,
      canExportMD: true,
      canExportPDF: true,
      canExportJSON: true,
      canUseGptTestReal: true,
      hasCloudHistory: true,
      hasEvaluatorAI: true,
      hasAPI: false,
      hasWhiteLabel: false,
      canExportBundleZip: false,
      hasSeatsGT1: false,
    },
    module_allowlist: 'ALL',
    exports_allowed: ['txt', 'md', 'json', 'pdf'],
    retention_days: 90,
    notes: 'Acces complet M01–M50 + export .json/.pdf fără watermark + branding tokens'
  },
  enterprise: {
    id: 'enterprise',
    label: 'Enterprise',
    features: {
      canUseAllModules: true,
      canExportMD: true,
      canExportPDF: true,
      canExportJSON: true,
      canUseGptTestReal: true,
      hasCloudHistory: true,
      hasEvaluatorAI: true,
      hasAPI: true,
      hasWhiteLabel: true,
      canExportBundleZip: true,
      hasSeatsGT1: true,
    },
    module_allowlist: 'ALL',
    exports_allowed: ['txt', 'md', 'json', 'pdf', 'bundle'],
    retention_days: -1,
    notes: 'Custom modules + API run endpoint + Bundle .zip + telemetry logging + licențe pe industrie'
  }
}

// Feature gate definitions
export interface FeatureGate {
  feature: keyof PlanFeatures
  minPlan: string
  description: string
}

export const FEATURE_GATES: FeatureGate[] = [
  { feature: 'canExportMD', minPlan: 'creator', description: 'Markdown export requires Creator plan' },
  { feature: 'canExportPDF', minPlan: 'pro', description: 'PDF export requires Pro plan' },
  { feature: 'canExportJSON', minPlan: 'pro', description: 'JSON export requires Pro plan' },
  { feature: 'canUseGptTestReal', minPlan: 'pro', description: 'Live GPT testing requires Pro plan' },
  { feature: 'canExportBundleZip', minPlan: 'enterprise', description: 'Bundle ZIP export requires Enterprise plan' },
  { feature: 'hasAPI', minPlan: 'enterprise', description: 'API access requires Enterprise plan' },
  { feature: 'hasWhiteLabel', minPlan: 'enterprise', description: 'White-label requires Enterprise plan' }
]

// Helper function to check if a plan has access to a feature
export function hasFeatureAccess(planId: string, feature: keyof PlanFeatures): boolean {
  const plan = PLANS[planId]
  if (!plan) return false
  return plan.features[feature]
}

// Helper function to get minimum plan required for a feature
export function getMinPlanForFeature(feature: keyof PlanFeatures): string {
  const gate = FEATURE_GATES.find(g => g.feature === feature)
  return gate?.minPlan || 'free'
}

// Helper function to get available export formats for a plan
export function getAvailableExportFormats(planId: string): string[] {
  const plan = PLANS[planId]
  if (!plan) return ['txt']
  return plan.exports_allowed
}

// Helper function to check if a plan can access a module
export function canAccessModule(planId: string, moduleId: string): boolean {
  const plan = PLANS[planId]
  if (!plan) return false
  
  if (plan.module_allowlist === 'ALL') return true
  return plan.module_allowlist.includes(moduleId)
}
