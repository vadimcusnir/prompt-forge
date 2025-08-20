import { type NextRequest, NextResponse } from "next/server"
import { createClient } from '@supabase/supabase-js'
import { EntitlementChecker } from "@/lib/entitlements/useEntitlements"

// Canonical gating flags
const CANONICAL_FLAGS = [
  'canUseGptTestReal',
  'canExportPDF', 
  'canExportJSON',
  'canExportBundleZip',
  'hasAPI'
] as const

type CanonicalFlag = typeof CANONICAL_FLAGS[number]

interface EntitlementUpdate {
  orgId?: string
  userId?: string
  flag: CanonicalFlag
  enabled: boolean
  source: 'effective_user' | 'effective_org'
}

// Create Supabase client with service role key (server-side only)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Entitlements endpoint - provides plan information and entitlement checking
export async function GET(request: NextRequest) {
  try {
    console.log("Entitlements API called")
    const { searchParams } = new URL(request.url)
    const planId = searchParams.get('planId') || 'free'
    const feature = searchParams.get('feature')
    const moduleId = searchParams.get('moduleId')
    const userId = searchParams.get('userId')
    const orgId = searchParams.get('orgId')
    const sessionId = searchParams.get('sessionId')

    console.log("Plan ID:", planId, "Feature:", feature, "Module ID:", moduleId, "User ID:", userId, "Org ID:", orgId)

    // If specific feature check requested
    if (feature) {
      console.log("Checking feature:", feature)
      const entitlementCheck = EntitlementChecker.checkFeature(planId, feature as any)
      console.log("Entitlement check result:", entitlementCheck)
      
      return NextResponse.json({
        feature,
        check: entitlementCheck,
        timestamp: new Date().toISOString()
      })
    }

    // If module access check requested
    if (moduleId) {
      console.log("Checking module access:", moduleId)
      const canAccess = EntitlementChecker.canAccessModule(planId, moduleId)
      console.log("Module access result:", canAccess)
      
      return NextResponse.json({
        moduleId,
        canAccess,
        planId,
        timestamp: new Date().toISOString()
      })
    }

    // If orgId or userId provided, get canonical flags
    if (orgId || userId) {
      console.log("Getting canonical flags for:", { orgId, userId })
      
      try {
        // Get entitlements from database
        let query = supabase.from('entitlements').select('*')
        
        if (orgId) {
          query = query.eq('org_id', orgId)
        }
        if (userId) {
          query = query.eq('user_id', userId)
        }
        
        const { data: entitlements, error } = await query
        
        if (error) {
          console.error("Database error:", error)
          throw error
        }
        
        // Build canonical flags response
        const canonicalFlags = CANONICAL_FLAGS.map(flag => {
          const entitlement = entitlements?.find(e => e.flag === flag)
          const isEnabled = entitlement?.enabled || false
          const source = entitlement?.source || 'effective_org'
          
          return {
            flag,
            enabled: isEnabled,
            source,
            lastUpdated: entitlement?.updated_at || null,
            metadata: entitlement?.metadata || {}
          }
        })
        
        return NextResponse.json({
          orgId,
          userId,
          canonicalFlags,
          timestamp: new Date().toISOString()
        })
        
      } catch (dbError) {
        console.error("Database error:", dbError)
        // Fallback to plan-based entitlements
        const fallbackFlags = CANONICAL_FLAGS.map(flag => ({
          flag,
          enabled: EntitlementChecker.checkFeature(planId, flag).allowed,
          source: 'effective_org' as const,
          lastUpdated: null,
          metadata: {}
        }))
        
        return NextResponse.json({
          orgId,
          userId,
          canonicalFlags: fallbackFlags,
          fallback: true,
          timestamp: new Date().toISOString()
        })
      }
    }

    // Return general plan information
    console.log("Validating plan:", planId)
    const plan = EntitlementChecker.validatePlan(planId)
    console.log("Plan validation result:", plan)
    
    if (!plan) {
      return NextResponse.json({ 
        error: "INVALID_PLAN", 
        details: `Plan ${planId} does not exist`,
        availablePlans: ['free', 'creator', 'pro', 'enterprise']
      }, { status: 400 })
    }

    // Get all available plans
    const availablePlans = [
      {
        id: 'free',
        name: 'Free',
        description: 'Get started with basic prompt optimization - limited modules',
        price_monthly: 0.00,
        price_yearly: 0.00,
        features: {
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
          hasSeatsGT1: false,
          allowedModules: ['M01', 'M10', 'M18']
        },
        limits: {
          runs_per_month: 10,
          modules_per_run: 1,
          export_formats: ['txt'],
          max_prompt_length: 1000,
          retention_days: 30
        }
      },
      {
        id: 'creator',
        name: 'Creator',
        description: 'Content creator focused with markdown export',
        price_monthly: 9.00,
        price_yearly: 90.00,
        features: {
          canUseAllModules: false,
          canExportMD: true,
          canExportPDF: false,
          canExportJSON: false,
          canUseGptTestReal: false,
          hasCloudHistory: false,
          hasEvaluatorAI: false,
          hasAPI: false,
          hasWhiteLabel: false,
          canExportBundleZip: false,
          hasSeatsGT1: false,
          allowedModules: ['ALL']
        },
        limits: {
          runs_per_month: 50,
          modules_per_run: 3,
          export_formats: ['txt', 'md'],
          max_prompt_length: 3000,
          retention_days: 90
        }
      },
      {
        id: 'pro',
        name: 'Pro',
        description: 'Professional prompt engineering with advanced features and live testing',
        price_monthly: 29.00,
        price_yearly: 290.00,
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
          allowedModules: ['ALL']
        },
        limits: {
          runs_per_month: 100,
          modules_per_run: 5,
          export_formats: ['txt', 'md', 'pdf', 'json'],
          max_prompt_length: 5000,
          retention_days: 365
        }
      },
      {
        id: 'enterprise',
        name: 'Enterprise',
        description: 'Enterprise-grade prompt engineering with full API access and bundle exports',
        price_monthly: 99.00,
        price_yearly: 990.00,
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
          allowedModules: ['ALL']
        },
        limits: {
          runs_per_month: 1000,
          modules_per_run: 10,
          export_formats: ['txt', 'md', 'pdf', 'json', 'zip'],
          max_prompt_length: 10000,
          retention_days: 2555
        }
      }
    ]

    // Get current plan details
    const currentPlan = availablePlans.find(p => p.id === planId)
    
    // Get feature gates information
    const featureGates = [
      { feature: 'canExportMD', minPlan: 'creator', description: 'Markdown export requires Creator plan' },
      { feature: 'canExportPDF', minPlan: 'pro', description: 'PDF export requires Pro plan' },
      { feature: 'canExportJSON', minPlan: 'pro', description: 'JSON export requires Pro plan' },
      { feature: 'canUseGptTestReal', minPlan: 'pro', description: 'Live GPT testing requires Pro plan' },
      { feature: 'canExportBundleZip', minPlan: 'enterprise', description: 'Bundle ZIP export requires Enterprise plan' },
      { feature: 'hasAPI', minPlan: 'enterprise', description: 'API access requires Enterprise plan' },
      { feature: 'hasWhiteLabel', minPlan: 'enterprise', description: 'White-label requires Enterprise plan' }
    ]

    return NextResponse.json({
      currentPlan: currentPlan,
      availablePlans: availablePlans,
      featureGates: featureGates,
      upgradePaths: {
        free: ['creator', 'pro', 'enterprise'],
        creator: ['pro', 'enterprise'],
        pro: ['enterprise'],
        enterprise: []
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error("Entitlements API Error:", error)
    
    return NextResponse.json({ 
      error: "INTERNAL_ERROR", 
      details: "Failed to get entitlements information",
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

// POST endpoint for entitlement updates and validation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Handle entitlement updates
    if (body.flag && typeof body.enabled === 'boolean') {
      const { orgId, userId, flag, enabled, source }: EntitlementUpdate = body
      
      if (!orgId && !userId) {
        return NextResponse.json({ 
          error: "MISSING_FIELDS", 
          details: "Either orgId or userId is required"
        }, { status: 400 })
      }
      
      if (!CANONICAL_FLAGS.includes(flag)) {
        return NextResponse.json({ 
          error: "INVALID_FLAG", 
          details: `Flag ${flag} is not a valid canonical flag`
        }, { status: 400 })
      }
      
      try {
        // Simulate upsert in entitlements table
        const entitlementData: any = {
          flag,
          enabled,
          source,
          updated_at: new Date().toISOString(),
          metadata: {
            updated_by: 'admin',
            reason: body.reason || 'Admin override',
            timestamp: new Date().toISOString()
          }
        }
        
        if (orgId) {
          entitlementData.org_id = orgId
        }
        if (userId) {
          entitlementData.user_id = userId
        }
        
        // In a real implementation, this would upsert to the entitlements table
        console.log("Entitlement update:", entitlementData)
        
        // Log the gating event
        logGateHit({
          flag,
          enabled,
          source,
          orgId,
          userId,
          action: 'admin_override'
        })
        
        return NextResponse.json({
          success: true,
          entitlement: entitlementData,
          message: `Flag ${flag} ${enabled ? 'enabled' : 'disabled'} successfully`,
          timestamp: new Date().toISOString()
        })
        
      } catch (dbError) {
        console.error("Database error:", dbError)
        return NextResponse.json({ 
          error: "DATABASE_ERROR", 
          details: "Failed to update entitlement"
        }, { status: 500 })
      }
    }
    
    // Handle entitlement validation (existing logic)
    const { planId, feature, userId, sessionId }: { 
      planId: string
      feature: string
      userId?: string
      sessionId?: string
    } = body

    // Validate required fields
    if (!planId || !feature) {
      return NextResponse.json({ 
        error: "MISSING_FIELDS", 
        details: "planId and feature are required"
      }, { status: 400 })
    }

    // Simple entitlement check logic
    const checkFeature = (planId: string, feature: string) => {
      const featureRequirements: Record<string, string> = {
        'canUseAllModules': 'pro',
        'canExportMD': 'free',
        'canExportPDF': 'pro',
        'canExportJSON': 'pro',
        'canExportBundleZip': 'enterprise',
        'canUseGptTestReal': 'pro',
        'hasCloudHistory': 'pro',
        'hasEvaluatorAI': 'pro',
        'hasAPI': 'enterprise',
        'hasWhiteLabel': 'enterprise',
        'hasSeatsGT1': 'enterprise'
      };

      const requiredPlan = featureRequirements[feature] || 'free';
      const planHierarchy = ['free', 'pro', 'enterprise'];
      
      const currentPlanIndex = planHierarchy.indexOf(planId);
      const requiredPlanIndex = planHierarchy.indexOf(requiredPlan);
      
      const allowed = currentPlanIndex >= requiredPlanIndex;

      return {
        allowed,
        requiredPlan,
        currentPlan: planId,
        feature
      };
    };

    // Check entitlements
    const entitlementCheck = checkFeature(planId, feature)
    
    return NextResponse.json({
      feature,
      check: entitlementCheck,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error("Entitlements Validation Error:", error)
    
    return NextResponse.json({ 
      error: "INTERNAL_ERROR", 
      details: "Failed to validate entitlements",
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

// Log gating events for analytics and audit
function logGateHit(data: {
  flag: string
  enabled: boolean
  source: string
  orgId?: string
  userId?: string
  action: string
}) {
  console.log("Gate hit logged:", {
    ...data,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  })
  
  // In production, this would send to analytics service
  // For now, just log to console
}
