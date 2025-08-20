import { type NextRequest, NextResponse } from "next/server"
import { sevenDValidator, type SevenDParams } from "@/lib/validator"
import { trackGate } from "@/lib/telemetry"

// Export endpoint - handles bundle exports with entitlements gating
export async function POST(request: NextRequest) {
  try {
    const { 
      runId, 
      format, 
      sevenD, 
      userId, 
      sessionId, 
      planId 
    }: { 
      runId: string
      format: 'txt' | 'md' | 'json' | 'pdf' | 'zip'
      sevenD?: Partial<SevenDParams>
      userId?: string
      sessionId?: string
      planId: string
    } = await request.json()

    // 1. VALIDARE 7D STRICTĂ (enum_only: true, raise_on_invalid: true)
    let validatedSevenD: SevenDParams
    try {
      validatedSevenD = sevenDValidator.validate(sevenD || {})
    } catch (error) {
      trackGate.hit({
        gateId: 'seven_d_valid',
        gateType: '7D_validation',
        passed: false,
        reason: error instanceof Error ? error.message : 'Unknown 7D validation error',
        userId: userId || 'unknown',
        sessionId: sessionId || 'unknown',
        planId: planId || 'unknown',
        timestamp: new Date()
      })
      
      return NextResponse.json({ 
        error: "7D_VALIDATION_ERROR", 
        details: error instanceof Error ? error.message : 'Invalid 7D parameters',
        required: 'Valid domain, scale, urgency, complexity, resources, application, output'
      }, { status: 400 })
    }

    // 2. GATING ENTITLEMENTS pentru export format
    let requiredFeature: string
    switch (format) {
      case 'txt':
      case 'md':
        requiredFeature = 'canExportMD'
        break
      case 'pdf':
        requiredFeature = 'canExportPDF'
        break
      case 'json':
        requiredFeature = 'canExportJSON'
        break
      case 'zip':
        requiredFeature = 'canExportBundleZip'
        break
      default:
        return NextResponse.json({ 
          error: "INVALID_FORMAT", 
          details: `Export format ${format} is not supported`,
          supported: ['txt', 'md', 'json', 'pdf', 'zip']
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

    const entitlementCheck = checkFeature(planId, requiredFeature)
    
    if (!entitlementCheck.allowed) {
      trackGate.hit({
        gateId: 'export_entitlement',
        gateType: 'entitlement',
        passed: false,
        reason: `${format.toUpperCase()} export requires ${entitlementCheck.requiredPlan} plan`,
        userId: userId || 'unknown',
        sessionId: sessionId || 'unknown',
        planId: planId || 'unknown',
        timestamp: new Date()
      })
      
      return NextResponse.json({ 
        error: "EXPORT_ENTITLEMENT_REQUIRED", 
        details: `${format.toUpperCase()} export requires ${entitlementCheck.requiredPlan} plan or higher`,
        requiredPlan: entitlementCheck.requiredPlan,
        currentPlan: entitlementCheck.currentPlan,
        upgradeUrl: '/pricing'
      }, { status: 403 })
    }

    // 3. VALIDARE RUN ID
    if (!runId) {
      return NextResponse.json({ 
        error: "MISSING_RUN_ID", 
        details: "runId is required for export"
      }, { status: 400 })
    }

    // 4. GENERARE EXPORT BUNDLE (mock pentru acum)
    const exportBundle = {
      runId,
      format,
      sevenD: validatedSevenD,
      artifacts: [
        'prompt.txt',
        'prompt.md',
        'prompt.json',
        'prompt.pdf',
        'manifest.json'
      ].filter(artifact => {
        // Filter artifacts based on format
        switch (format) {
          case 'txt':
            return artifact === 'prompt.txt'
          case 'md':
            return artifact === 'prompt.md'
          case 'json':
            return artifact === 'prompt.json'
          case 'pdf':
            return artifact === 'prompt.pdf'
          case 'zip':
            return true // All artifacts for ZIP
          default:
            return false
        }
      }),
      checksum: 'sha256_hash_placeholder',
      watermark: format === 'pdf' || format === 'json' ? 'PromptForge Pro' : null,
      bundlePath: `/exports/${runId}/${format}`,
      createdAt: new Date().toISOString()
    }

    // 5. TELEMETRIE EXPORT SUCCESS
    // The original code had telemetry.track here, but telemetry is no longer imported.
    // Assuming the intent was to remove this line or replace it with trackGate.hit
    // For now, removing the line as telemetry is no longer available.

    // 6. SUCCESS RESPONSE
    return NextResponse.json({
      success: true,
      export: exportBundle,
      entitlements: {
        planId,
        feature: requiredFeature,
        allowed: true
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error("Export API Error:", error)
    
    return NextResponse.json({ 
      error: "INTERNAL_ERROR", 
      details: "Failed to process export request",
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

// GET endpoint for export configuration
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const planId = searchParams.get('planId') || 'free'
    const format = searchParams.get('format')
    const userId = searchParams.get('userId')
    const sessionId = searchParams.get('sessionId')

    // Get export configuration for plan
    const exportConfig = {
      free: {
        formats: ['txt', 'md'],
        maxSize: '1MB',
        watermark: false,
        retention: '30 days'
      },
      pro: {
        formats: ['txt', 'md', 'pdf', 'json'],
        maxSize: '10MB',
        watermark: true,
        retention: '1 year'
      },
      enterprise: {
        formats: ['txt', 'md', 'pdf', 'json', 'zip'],
        maxSize: '100MB',
        watermark: false,
        retention: '7 years'
      }
    }

    const config = exportConfig[planId as keyof typeof exportConfig] || exportConfig.free

    // If specific format requested, check entitlements
    if (format) {
      let requiredFeature: string
      switch (format) {
        case 'txt':
        case 'md':
          requiredFeature = 'canExportMD'
          break
        case 'pdf':
          requiredFeature = 'canExportPDF'
          break
        case 'json':
          requiredFeature = 'canExportJSON'
          break
        case 'zip':
          requiredFeature = 'canExportBundleZip'
          break
        default:
          return NextResponse.json({ 
            error: "INVALID_FORMAT", 
            details: `Export format ${format} is not supported`
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

      const entitlementCheck = checkFeature(planId, requiredFeature)
      
      return NextResponse.json({
        format,
        config: {
          ...config,
          allowed: entitlementCheck.allowed,
          requiredPlan: entitlementCheck.requiredPlan,
          currentPlan: entitlementCheck.currentPlan
        },
        timestamp: new Date().toISOString()
      })
    }

    // Return general export configuration
    return NextResponse.json({
      planId,
      config,
      availableFormats: config.formats,
      upgradePaths: {
        free: ['pro', 'enterprise'],
        pro: ['enterprise'],
        enterprise: []
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error("Export Config Error:", error)
    
    return NextResponse.json({ 
      error: "INTERNAL_ERROR", 
      details: "Failed to get export configuration",
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
