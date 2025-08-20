import { type NextRequest, NextResponse } from "next/server"
import { sevenDValidator, type SevenDParams } from "@/lib/validator"
import { EntitlementChecker } from "@/lib/entitlements/useEntitlements"
import { telemetry, trackRun, trackGate } from "@/lib/telemetry"
import { MODULES } from "@/lib/modules"

// Module execution endpoint - requires Pro+ plan
export async function POST(
  request: NextRequest,
  { params }: { params: { moduleId: string } }
) {
  const startTime = Date.now()
  const moduleId = parseInt(params.moduleId)
  
  try {
    const { prompt, sevenD, userId, sessionId, planId }: { 
      prompt: string
      sevenD?: Partial<SevenDParams>
      userId?: string
      sessionId?: string
      planId?: string
    } = await request.json()

    // 1. VALIDARE MODUL EXISTENT
    if (!MODULES[moduleId]) {
      return NextResponse.json({ 
        error: "MODULE_NOT_FOUND", 
        details: `Module ${moduleId} does not exist`,
        availableModules: Object.keys(MODULES)
      }, { status: 404 })
    }

    const moduleData = MODULES[moduleId]

    // 2. VALIDARE 7D STRICTĂ (enum_only: true, raise_on_invalid: true)
    let validatedSevenD: SevenDParams
    try {
      validatedSevenD = sevenDValidator.validate(sevenD || {})
    } catch (error) {
      trackGate.hit({
        gateId: 'seven_d_valid',
        gateType: '7D_validation',
        passed: false,
        reason: error instanceof Error ? error.message : 'Unknown 7D validation error',
        userId,
        sessionId,
        planId: planId || 'unknown'
      })
      
      return NextResponse.json({ 
        error: "7D_VALIDATION_ERROR", 
        details: error instanceof Error ? error.message : 'Invalid 7D parameters',
        required: 'Valid domain, scale, urgency, complexity, resources, application, output',
        module: moduleData.name
      }, { status: 400 })
    }

    // 3. GATING ENTITLEMENTS STRICT (Pro+ only pentru module execution)
    const entitlementCheck = EntitlementChecker.checkFeature(
      planId || 'pilot', 
      'canUseAllModules'
    )
    
    if (!entitlementCheck.allowed) {
      trackGate.hit({
        gateId: 'entitlements_present',
        gateType: 'entitlement',
        passed: false,
        reason: entitlementCheck.reason,
        userId,
        sessionId,
        planId: planId || 'unknown'
      })
      
      return NextResponse.json({ 
        error: "ENTITLEMENT_REQUIRED", 
        details: "Module execution requires Pro plan or higher",
        requiredPlan: 'pro',
        currentPlan: entitlementCheck.currentPlan,
        upgradeUrl: '/pricing',
        module: moduleData.name
      }, { status: 403 })
    }

    // 4. TELEMETRIE RUN START
    trackRun.start({
      moduleId,
      sevenD: validatedSevenD,
      userId,
      sessionId,
      planId: planId || 'pro'
    })

    // 5. VALIDARE INPUT (DoR gate: min input 64 bytes)
    if (!prompt || prompt.length < 64) {
      trackGate.hit({
        gateId: 'min_input',
        gateType: 'DoR',
        passed: false,
        reason: `Input too short: ${prompt?.length || 0} bytes, required: 64+`,
        userId,
        sessionId,
        planId: planId || 'pro'
      })
      
      return NextResponse.json({ 
        error: "INSUFFICIENT_INPUT", 
        details: "Input must be at least 64 bytes long",
        required: 64,
        provided: prompt?.length || 0,
        module: module.name
      }, { status: 400 })
    }

    // 6. VALIDARE REQUIREMENTS (DoR gate: module requirements met)
    const requiredFields = module.requirements.match(/\[([^\]]+)\]/g) || []
    const missingFields = requiredFields.filter(field => {
      const fieldName = field.replace(/[\[\]]/g, '')
      return !prompt.toLowerCase().includes(fieldName.toLowerCase())
    })

    if (missingFields.length > 0) {
      trackGate.hit({
        gateId: 'requirements_met',
        gateType: 'DoR',
        passed: false,
        reason: `Missing required fields: ${missingFields.join(', ')}`,
        userId,
        sessionId,
        planId: planId || 'pro'
      })
      
      return NextResponse.json({ 
        error: "REQUIREMENTS_NOT_MET", 
        details: "Module requirements not satisfied",
        missing: missingFields,
        required: module.requirements,
        module: module.name
      }, { status: 400 })
    }

    // 7. EXECUȚIE MODUL (mock pentru acum)
    // In real implementation, this would execute the specific module logic
    const executionResult = {
      moduleId,
      moduleName: module.name,
      prompt: prompt,
      sevenD: validatedSevenD,
      output: `# ${module.name} OUTPUT\n\n## Generated Content\n\nBased on your input and 7D context:\n- Domain: ${validatedSevenD.domain}\n- Scale: ${validatedSevenD.scale}\n- Urgency: ${validatedSevenD.urgency}\n- Complexity: ${validatedSevenD.complexity}\n- Resources: ${validatedSevenD.resources}\n- Application: ${validatedSevenD.application}\n- Output: ${validatedSevenD.output}\n\n## Result\n\n${module.output.replace(/\{([^}]+)\}/g, 'Generated $1')}`,
      scores: {
        clarity: 87,
        execution: 92,
        ambiguity: 89,
        business_fit: 85
      },
      processingTime: Date.now() - startTime,
      vector: module.vectors,
      kpi: module.kpi,
      guardrails: module.guardrails
    }

    // 8. VALIDARE SCOR (DoD gate: score ≥80)
    const overallScore = Object.values(executionResult.scores).reduce((sum, score) => sum + score, 0) / Object.keys(executionResult.scores).length
    
    if (overallScore < 80) {
      trackGate.hit({
        gateId: 'score_threshold',
        gateType: 'DoD',
        passed: false,
        reason: `Overall score ${overallScore} below threshold 80`,
        userId,
        sessionId,
        planId: planId || 'pro'
      })
      
      return NextResponse.json({ 
        error: "SCORE_THRESHOLD_FAILED", 
        details: `Overall score ${overallScore} below required threshold 80`,
        scores: executionResult.scores,
        required: 80,
        module: module.name
      }, { status: 400 })
    }

    // 9. TELEMETRIE RUN FINISH (fără conținut brut)
    trackRun.finish({
      moduleId,
      scores: executionResult.scores,
      tokenCount: executionResult.output.length, // Mock token count
      success: true,
      userId,
      sessionId,
      planId: planId || 'pro'
    })

    // 10. SUCCESS RESPONSE
    return NextResponse.json({
      ...executionResult,
      overallScore,
      runId: `run-${Date.now()}-${moduleId}`,
      timestamp: new Date().toISOString(),
      planRequired: 'pro',
      module: {
        id: module.id,
        name: module.name,
        description: module.description,
        vectors: module.vectors
      }
    })

  } catch (error) {
    console.error(`Module ${moduleId} Execution Error:`, error)
    
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
      details: "Failed to execute module",
      moduleId,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

// GET endpoint for module information
export async function GET(
  request: NextRequest,
  { params }: { params: { moduleId: string } }
) {
  try {
    const moduleId = parseInt(params.moduleId)
    const { searchParams } = new URL(request.url)
    const planId = searchParams.get('planId') || 'pilot'
    
    // Check if module exists
    if (!MODULES[moduleId]) {
      return NextResponse.json({ 
        error: "MODULE_NOT_FOUND", 
        details: `Module ${moduleId} does not exist`
      }, { status: 404 })
    }

    const module = MODULES[moduleId]
    
    // Check entitlements for module access
    const entitlementCheck = EntitlementChecker.checkFeature(
      planId, 
      'canUseAllModules'
    )
    
    if (!entitlementCheck.allowed) {
      return NextResponse.json({ 
        error: "ENTITLEMENT_REQUIRED", 
        details: "Module access requires Pro plan or higher",
        requiredPlan: 'pro',
        currentPlan: entitlementCheck.currentPlan,
        module: {
          id: module.id,
          name: module.name,
          description: module.description,
          vectors: module.vectors
        }
      }, { status: 403 })
    }

    // Return full module information
    return NextResponse.json({
      module: {
        id: module.id,
        name: module.name,
        description: module.description,
        requirements: module.requirements,
        spec: module.spec,
        output: module.output,
        kpi: module.kpi,
        guardrails: module.guardrails,
        vectors: module.vectors
      },
      planRequired: 'pro',
      sevenDDefaults: {
        domain: 'generic',
        scale: 'team',
        urgency: 'normal',
        complexity: 'medium',
        resources: 'standard',
        application: 'content_ops',
        output: 'bundle'
      }
    })

  } catch (error) {
    console.error(`Module ${params.moduleId} Info Error:`, error)
    return NextResponse.json({ 
      error: "INTERNAL_ERROR", 
      details: "Failed to get module information"
    }, { status: 500 })
  }
}
