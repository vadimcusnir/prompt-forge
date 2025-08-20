import { type NextRequest, NextResponse } from "next/server"
import { sevenDValidator, type SevenDParams } from "@/lib/validator"
import { trackRun, trackGate } from "@/lib/telemetry"

// GPT Test endpoint - requires Pro+ plan (live GPT testing)
export async function POST(request: NextRequest) {
  const startTime = Date.now()
  let moduleId = 0 // Default for gpt-test
  
  try {
    const { prompt, testType, sevenD, userId, sessionId, planId }: { 
      prompt: string
      testType: 'clarity' | 'execution' | 'ambiguity' | 'business_fit'
      sevenD?: Partial<SevenDParams>
      userId?: string
      sessionId?: string
      planId?: string
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

    // 2. GATING ENTITLEMENTS STRICT (Pro+ only pentru live GPT testing)
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
        feature,
        reason: allowed ? 'Feature allowed' : `Feature requires ${requiredPlan} plan`
      };
    };

    const entitlementCheck = checkFeature(planId || 'free', 'canUseGptTestReal')
    
    if (!entitlementCheck.allowed) {
      trackGate.hit({
        gateId: 'entitlements_present',
        gateType: 'entitlement',
        passed: false,
        reason: entitlementCheck.reason,
        userId: userId || 'unknown',
        sessionId: sessionId || 'unknown',
        planId: planId || 'unknown',
        timestamp: new Date()
      })
      
      return NextResponse.json({ 
        error: "ENTITLEMENT_REQUIRED", 
        details: "Live GPT testing requires Pro plan or higher",
        requiredPlan: 'pro',
        currentPlan: entitlementCheck.currentPlan,
        upgradeUrl: '/pricing'
      }, { status: 403 })
    }

    // 3. TELEMETRIE RUN START
    trackRun.start({
      moduleId,
      sevenD: validatedSevenD,
      userId: userId || 'unknown',
      sessionId: sessionId || 'unknown',
      planId: planId || 'pro'
    })

    // 4. VALIDARE INPUT (DoR gate: min input 64 bytes)
    if (!prompt || prompt.length < 64) {
      trackGate.hit({
        gateId: 'min_input',
        gateType: 'DoR',
        passed: false,
        reason: `Input too short: ${prompt?.length || 0} bytes, required: 64+`,
        userId: userId || 'unknown',
        sessionId: sessionId || 'unknown',
        planId: planId || 'pro',
        timestamp: new Date()
      })
      
      return NextResponse.json({ 
        error: "INSUFFICIENT_INPUT", 
        details: "Input must be at least 64 bytes long",
        required: 64,
        provided: prompt?.length || 0
      }, { status: 400 })
    }

    // 5. EXECUȚIE GPT TEST (mock pentru acum)
    // In real implementation, this would call OpenAI API for live testing
    const testResults = {
      testType,
      prompt: prompt,
      score: 0,
      feedback: '',
      suggestions: [] as string[],
      processingTime: Date.now() - startTime
    }

    // Mock scoring based on test type
    switch (testType) {
      case 'clarity':
        testResults.score = 85
        testResults.feedback = "Prompt is generally clear but could benefit from more specific examples"
        testResults.suggestions = [
          "Add concrete examples",
          "Use bullet points for complex instructions",
          "Define technical terms"
        ]
        break
      case 'execution':
        testResults.score = 78
        testResults.feedback = "Execution steps are present but could be more structured"
        testResults.suggestions = [
          "Number the steps sequentially",
          "Add expected outputs for each step",
          "Include error handling scenarios"
        ]
        break
      case 'ambiguity':
        testResults.score = 92
        testResults.feedback = "Prompt is well-defined with minimal ambiguity"
        testResults.suggestions = [
          "Consider edge cases",
          "Add context boundaries"
        ]
        break
      case 'business_fit':
        testResults.score = 88
        testResults.feedback = "Good alignment with business objectives"
        testResults.suggestions = [
          "Include success metrics",
          "Add stakeholder context",
          "Consider ROI implications"
        ]
        break
    }

    // 6. VALIDARE SCOR (DoD gate: score ≥80)
    if (testResults.score < 80) {
      trackGate.hit({
        gateId: 'score_threshold',
        gateType: 'DoD',
        passed: false,
        reason: `Test score ${testResults.score} below threshold 80`,
        userId: userId || 'unknown',
        sessionId: sessionId || 'unknown',
        planId: planId || 'pro',
        timestamp: new Date()
      })
      
      return NextResponse.json({ 
        error: "SCORE_THRESHOLD_FAILED", 
        details: `Test score ${testResults.score} below required threshold 80`,
        testResults,
        required: 80
      }, { status: 400 })
    }

    // 7. TELEMETRIE RUN FINISH (fără conținut brut)
    trackRun.finish({
      moduleId,
      scores: { [testType]: testResults.score },
      tokenCount: prompt.length, // Mock token count
      success: true,
      userId: userId || 'unknown',
      sessionId: sessionId || 'unknown',
      planId: planId || 'pro'
    })

    // 8. SUCCESS RESPONSE
    return NextResponse.json({
      ...testResults,
      sevenD: validatedSevenD,
      runId: `test-${Date.now()}-${moduleId}`,
      timestamp: new Date().toISOString(),
      planRequired: 'pro'
    })

  } catch (error) {
    console.error("GPT Test API Error:", error)
    
    // Track failed run
    trackRun.finish({
      moduleId,
      success: false,
      errorCode: error instanceof Error ? error.message : 'UNKNOWN_ERROR',
      userId: 'unknown',
      sessionId: 'unknown',
      planId: 'unknown'
    })
    
    return NextResponse.json({ 
      error: "INTERNAL_ERROR", 
      details: "Failed to process test request",
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

// GET endpoint for test configuration
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const planId = searchParams.get('planId') || 'pilot'
    
    // Check entitlements for test access
    const entitlementCheck = checkFeature(planId, 'canUseGptTestReal')
    
    if (!entitlementCheck.allowed) {
      return NextResponse.json({ 
        error: "ENTITLEMENT_REQUIRED", 
        details: "Live GPT testing requires Pro plan or higher",
        requiredPlan: 'pro',
        currentPlan: entitlementCheck.currentPlan
      }, { status: 403 })
    }

    // Return available test types
    return NextResponse.json({
      availableTests: ['clarity', 'execution', 'ambiguity', 'business_fit'],
      scoringRubric: {
        clarity: "Measures how clear and understandable the prompt is",
        execution: "Measures how actionable and executable the prompt is",
        ambiguity: "Measures how unambiguous and specific the prompt is",
        business_fit: "Measures how well the prompt aligns with business goals"
      },
      threshold: 80,
      planRequired: 'pro'
    })

  } catch (error) {
    console.error("GPT Test Config Error:", error)
    return NextResponse.json({ 
      error: "INTERNAL_ERROR", 
      details: "Failed to get test configuration"
    }, { status: 500 })
  }
}
