import { type NextRequest, NextResponse } from "next/server"
import { EntitlementChecker } from "@/lib/entitlements/useEntitlements"

// Entitlements endpoint - provides plan information and entitlement checking
export async function GET(request: NextRequest) {
  try {
    console.log("Entitlements API called")
    const { searchParams } = new URL(request.url)
    const planId = searchParams.get('planId') || 'free'
    const feature = searchParams.get('feature')
    const moduleId = searchParams.get('moduleId')
    const userId = searchParams.get('userId')
    const sessionId = searchParams.get('sessionId')

    console.log("Plan ID:", planId, "Feature:", feature, "Module ID:", moduleId)

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

// POST endpoint for entitlement validation
export async function POST(request: NextRequest) {
  try {
    const { planId, feature, userId, sessionId }: { 
      planId: string
      feature: string
      userId?: string
      sessionId?: string
    } = await request.json()

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
