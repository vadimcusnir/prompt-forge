/**
 * components/entitlement-gate.tsx — Entitlement Gating Component
 * 
 * Gates content based on user entitlements
 * Shows paywall UI when users don't have required permissions
 */

import React from 'react'
import { useEntitlements } from '@/hooks/useEntitlements'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Lock, Zap, Download, Code, Database, Crown } from 'lucide-react'

interface EntitlementGateProps {
  children: React.ReactNode
  requiredEntitlement: keyof import('@/hooks/useEntitlements').EntitlementFlags
  fallback?: React.ReactNode
  showUpgradeButton?: boolean
  className?: string
}

interface PaywallContentProps {
  requiredEntitlement: keyof import('@/hooks/useEntitlements').EntitlementFlags
  currentPlan: string
  onUpgrade?: () => void
}

export function EntitlementGate({
  children,
  requiredEntitlement,
  fallback,
  showUpgradeButton = true,
  className = ''
}: EntitlementGateProps) {
  const { hasEntitlement, organization, isLoading } = useEntitlements()

  if (isLoading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    )
  }

  if (hasEntitlement(requiredEntitlement)) {
    return <>{children}</>
  }

  if (fallback) {
    return <>{fallback}</>
  }

  return (
    <PaywallContent
      requiredEntitlement={requiredEntitlement}
      currentPlan={organization?.plan_id || 'free'}
    />
  )
}

/**
 * Paywall content component
 */
function PaywallContent({ requiredEntitlement, currentPlan, onUpgrade }: PaywallContentProps) {
  const entitlementInfo = getEntitlementInfo(requiredEntitlement)
  const upgradePath = getUpgradePath(currentPlan, requiredEntitlement)

  return (
    <Card className="border-dashed border-2 border-gray-300 bg-gradient-to-br from-gray-50 to-gray-100">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mb-4">
          {entitlementInfo.icon}
        </div>
        <CardTitle className="text-xl text-gray-700">
          {entitlementInfo.title}
        </CardTitle>
        <CardDescription className="text-gray-600">
          {entitlementInfo.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2">
          <Badge variant="secondary" className="text-sm">
            Current: {currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)}
          </Badge>
          <span className="text-gray-500">→</span>
          <Badge variant="default" className="text-sm">
            Required: {upgradePath.requiredPlan}
          </Badge>
        </div>

        <div className="bg-white rounded-lg p-4 border">
          <h4 className="font-medium text-gray-800 mb-2">What you'll get:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            {upgradePath.features.map((feature, index) => (
              <li key={index} className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {showUpgradeButton && (
          <div className="space-y-2">
            <Button 
              onClick={onUpgrade} 
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Crown className="w-4 h-4 mr-2" />
              Upgrade to {upgradePath.requiredPlan}
            </Button>
            <p className="text-xs text-gray-500">
              {upgradePath.pricing}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get information about a specific entitlement
 */
function getEntitlementInfo(entitlement: string) {
  const info: Record<string, { title: string; description: string; icon: React.ReactNode }> = {
    canUseAllModules: {
      title: 'Full Module Access',
      description: 'Access to all 50+ prompt engineering modules',
      icon: <Code className="w-6 h-6 text-gray-600" />
    },
    canExportMD: {
      title: 'Markdown Export',
      description: 'Export your prompts in Markdown format',
      icon: <Download className="w-6 h-6 text-gray-600" />
    },
    canExportPDF: {
      title: 'PDF Export',
      description: 'Generate professional PDF reports',
      icon: <Download className="w-6 h-6 text-gray-600" />
    },
    canExportJSON: {
      title: 'JSON Export',
      description: 'Export structured data in JSON format',
      icon: <Code className="w-6 h-6 text-gray-600" />
    },
    canUseGptTestReal: {
      title: 'Live GPT Testing',
      description: 'Test your prompts with real GPT models',
      icon: <Zap className="w-6 h-6 text-gray-600" />
    },
    hasCloudHistory: {
      title: 'Cloud History',
      description: 'Store and access your prompt history in the cloud',
      icon: <Database className="w-6 h-6 text-gray-600" />
    },
    hasEvaluatorAI: {
      title: 'AI Evaluation',
      description: 'Get AI-powered feedback on your prompts',
      icon: <Zap className="w-6 h-6 text-gray-600" />
    },
    hasAPI: {
      title: 'API Access',
      description: 'Access PROMPTFORGE via REST API',
      icon: <Code className="w-6 h-6 text-gray-600" />
    },
    hasWhiteLabel: {
      title: 'White Label',
      description: 'Custom branding and self-hosting options',
      icon: <Crown className="w-6 h-6 text-gray-600" />
    },
    canExportBundleZip: {
      title: 'Bundle Exports',
      description: 'Export complete prompt bundles in ZIP format',
      icon: <Download className="w-6 h-6 text-gray-600" />
    },
    hasSeatsGT1: {
      title: 'Multi-Seat License',
      description: 'Share with your team members',
      icon: <Crown className="w-6 h-6 text-gray-600" />
    }
  }

  return info[entitlement] || {
    title: 'Feature Locked',
    description: 'This feature requires a higher plan',
    icon: <Lock className="w-6 h-6 text-gray-600" />
  }
}

/**
 * Get upgrade path information
 */
function getUpgradePath(currentPlan: string, requiredEntitlement: string) {
  const upgradePaths: Record<string, Record<string, any>> = {
    canUseAllModules: {
      free: { requiredPlan: 'Creator', features: ['All modules', 'Markdown export'], pricing: 'From $9/month' },
      creator: { requiredPlan: 'Creator', features: ['All modules', 'Markdown export'], pricing: 'Already included' }
    },
    canExportMD: {
      free: { requiredPlan: 'Creator', features: ['Markdown export', 'All modules'], pricing: 'From $9/month' }
    },
    canExportPDF: {
      free: { requiredPlan: 'Pro', features: ['PDF export', 'All modules', 'Live testing'], pricing: 'From $29/month' },
      creator: { requiredPlan: 'Pro', features: ['PDF export', 'Live testing', 'Cloud history'], pricing: 'From $29/month' }
    },
    canExportJSON: {
      free: { requiredPlan: 'Pro', features: ['JSON export', 'All modules', 'Live testing'], pricing: 'From $29/month' },
      creator: { requiredPlan: 'Pro', features: ['JSON export', 'Live testing', 'Cloud history'], pricing: 'From $29/month' }
    },
    canUseGptTestReal: {
      free: { requiredPlan: 'Pro', features: ['Live GPT testing', 'All modules', 'Cloud history'], pricing: 'From $29/month' },
      creator: { requiredPlan: 'Pro', features: ['Live GPT testing', 'Cloud history', 'AI evaluation'], pricing: 'From $29/month' }
    },
    hasCloudHistory: {
      free: { requiredPlan: 'Pro', features: ['Cloud history', 'All modules', 'Live testing'], pricing: 'From $29/month' },
      creator: { requiredPlan: 'Pro', features: ['Cloud history', 'Live testing', 'AI evaluation'], pricing: 'From $29/month' }
    },
    hasEvaluatorAI: {
      free: { requiredPlan: 'Pro', features: ['AI evaluation', 'All modules', 'Cloud history'], pricing: 'From $29/month' },
      creator: { requiredPlan: 'Pro', features: ['AI evaluation', 'Cloud history', 'Live testing'], pricing: 'From $29/month' }
    },
    hasAPI: {
      free: { requiredPlan: 'Enterprise', features: ['API access', 'All features', 'White label'], pricing: 'From $99/month' },
      creator: { requiredPlan: 'Enterprise', features: ['API access', 'All features', 'White label'], pricing: 'From $99/month' },
      pro: { requiredPlan: 'Enterprise', features: ['API access', 'White label', 'Bundle exports'], pricing: 'From $99/month' }
    },
    hasWhiteLabel: {
      free: { requiredPlan: 'Enterprise', features: ['White label', 'API access', 'Bundle exports'], pricing: 'From $99/month' },
      creator: { requiredPlan: 'Enterprise', features: ['White label', 'API access', 'Bundle exports'], pricing: 'From $99/month' },
      pro: { requiredPlan: 'Enterprise', features: ['White label', 'API access', 'Bundle exports'], pricing: 'From $99/month' }
    },
    canExportBundleZip: {
      free: { requiredPlan: 'Enterprise', features: ['Bundle exports', 'API access', 'White label'], pricing: 'From $99/month' },
      creator: { requiredPlan: 'Enterprise', features: ['Bundle exports', 'API access', 'White label'], pricing: 'From $99/month' },
      pro: { requiredPlan: 'Enterprise', features: ['Bundle exports', 'API access', 'White label'], pricing: 'From $99/month' }
    },
    hasSeatsGT1: {
      free: { requiredPlan: 'Enterprise', features: ['Multi-seat license', 'All features', 'Priority support'], pricing: 'From $99/month' },
      creator: { requiredPlan: 'Enterprise', features: ['Multi-seat license', 'All features', 'Priority support'], pricing: 'From $99/month' },
      pro: { requiredPlan: 'Enterprise', features: ['Multi-seat license', 'All features', 'Priority support'], pricing: 'From $99/month' }
    }
  }

  const path = upgradePaths[requiredEntitlement]?.[currentPlan]
  
  if (!path) {
    return {
      requiredPlan: 'Pro',
      features: ['Feature access', 'Enhanced capabilities'],
      pricing: 'Contact sales'
    }
  }

  return path
}

// ============================================================================
// EXPORT COMPONENTS
// ============================================================================

export { EntitlementGate as default }
export { PaywallContent }
