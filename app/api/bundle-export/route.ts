import { type NextRequest, NextResponse } from "next/server"
import { sevenDValidator, type SevenDParams } from "@/lib/validator"
import { entitlementChecker } from "@/lib/entitlements/useEntitlements"
import { telemetry, trackRun, trackGate, trackBundle } from "@/lib/telemetry"

// Bundle Export endpoint - Enterprise only for ZIP bundles
export async function POST(request: NextRequest) {
  const startTime = Date.now()
  let moduleId = 0 // Default for bundle-export
  let runId: string | undefined
  
  try {
    const { prompt, artifacts, format, sevenD, userId, sessionId, planId }: { 
      prompt: string
      artifacts: string[]
      format: 'txt' | 'md' | 'json' | 'pdf' | 'zip' | 'bundle'
      sevenD?: Partial<SevenDParams>
      userId?: string
      sessionId?: string
      planId?: string
    } = await request.json()

    // 1. VALIDARE 7D STRICTĂ
    let validatedSevenD: SevenDParams
    try {
      validatedSevenD = sevenDValidator.validate(sevenD || {})
    } catch (error) {
      await trackGate.hit({
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

    // 2. GATING ENTITLEMENTS STRICT (Enterprise pentru ZIP, Pro+ pentru alte formate)
    let requiredFeature: 'canExportZip' | 'canExportPdf' | 'canExportJson' | 'canExportMd' | 'canExportTxt'
    
    switch (format) {
      case 'zip':
        requiredFeature = 'canExportZip'
        break
      case 'pdf':
        requiredFeature = 'canExportPdf'
        break
      case 'json':
        requiredFeature = 'canExportJson'
        break
      case 'md':
        requiredFeature = 'canExportMd'
        break
      case 'txt':
        requiredFeature = 'canExportTxt'
        break
      default:
        requiredFeature = 'canExportTxt'
    }

    const entitlementCheck = entitlementChecker.checkFeature(
      planId || 'pilot', 
      requiredFeature,
      userId
    )
    
    if (!entitlementCheck.allowed) {
      await trackGate.hit({
        gateId: 'entitlements_present',
        gateType: 'entitlement',
        passed: false,
        reason: entitlementCheck.reason || `${format.toUpperCase()} export requires ${entitlementCheck.requiredPlan} plan or higher`,
        userId: userId || 'unknown',
        sessionId: sessionId || 'unknown',
        planId: planId || 'unknown',
        timestamp: new Date(),
        metadata: { feature: requiredFeature, requiredPlan: entitlementCheck.requiredPlan, format }
      })
      
      return NextResponse.json({ 
        error: "ENTITLEMENT_REQUIRED", 
        details: `${format.toUpperCase()} export requires ${entitlementCheck.requiredPlan} plan or higher`,
        requiredPlan: entitlementCheck.requiredPlan,
        currentPlan: entitlementCheck.currentPlan,
        upgradeUrl: '/pricing'
      }, { status: 403 })
    }

    // 3. TELEMETRIE RUN START
    runId = await trackRun.start({
      runId: `export-${Date.now()}-${moduleId}`,
      moduleId: moduleId.toString(),
      userId: userId || 'unknown',
      sessionId: sessionId || 'unknown',
      planId: planId || 'pilot',
      sevenD: validatedSevenD
    })

    // 4. VALIDARE INPUT (DoR gate: min input 64 bytes)
    if (!prompt || prompt.length < 64) {
      await trackGate.hit({
        gateId: 'min_input',
        gateType: 'DoR',
        passed: false,
        reason: `Input too short: ${prompt?.length || 0} bytes, required: 64+`,
        userId: userId || 'unknown',
        sessionId: sessionId || 'unknown',
        planId: planId || 'pilot',
        timestamp: new Date(),
        metadata: { inputLength: prompt?.length || 0, requiredLength: 64 }
      })
      
      return NextResponse.json({ 
        error: "INSUFFICIENT_INPUT", 
        details: "Input must be at least 64 bytes long",
        required: 64,
        provided: prompt?.length || 0
      }, { status: 400 })
    }

    // 5. GENERARE BUNDLE (mock pentru acum - înlocuiește cu real bundle generation)
    const exportId = `export-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`
    const checksum = `sha256-${Math.random().toString(36).substring(2, 16)}`
    const size = prompt.length + artifacts.reduce((sum, art) => sum + art.length, 0)
    
    const manifest = {
      version: "1.0.0",
      timestamp: new Date().toISOString(),
      format,
      artifacts,
      sevenD: validatedSevenD,
      checksum,
      size
    }

    // 6. VALIDARE CALITATE BUNDLE (DoD gate: bundle quality ≥80)
    const bundleQuality = calculateBundleQuality(artifacts, format, size)
    
    if (bundleQuality.score < 80) {
      await trackGate.hit({
        gateId: 'bundle_quality',
        gateType: 'DoD',
        passed: false,
        reason: `Bundle quality ${bundleQuality.score} below threshold 80`,
        userId: userId || 'unknown',
        sessionId: sessionId || 'unknown',
        planId: planId || 'pilot',
        timestamp: new Date(),
        metadata: { bundleQuality: bundleQuality.score, requiredThreshold: 80, issues: bundleQuality.issues }
      })
      
      return NextResponse.json({ 
        error: "BUNDLE_QUALITY_FAILED", 
        details: `Bundle quality ${bundleQuality.score} below required threshold 80`,
        bundleQuality,
        required: 80
      }, { status: 400 })
    }

    // 7. TELEMETRIE RUN FINISH
    if (runId) {
      await trackRun.finish(
        runId,
        true,
        { bundle_quality: bundleQuality.score },
        undefined,
        size
      )
    }

    // 8. TELEMETRIE BUNDLE EXPORT
    await trackBundle.export(
      exportId,
      runId || 'unknown',
      userId || 'unknown',
      planId || 'pilot',
      artifacts,
      format,
      size,
      checksum,
      manifest
    )

    // 9. SUCCESS RESPONSE
    return NextResponse.json({
      exportId,
      runId,
      format,
      artifacts,
      checksum,
      manifest,
      bundleQuality,
      sevenD: validatedSevenD,
      timestamp: new Date().toISOString(),
      planRequired: format === 'zip' ? 'enterprise' : 'pro'
    })

  } catch (error) {
    console.error("Bundle Export API Error:", error)
    
    // Track failed run
    if (runId) {
      await trackRun.finish(
        runId,
        false,
        undefined,
        error instanceof Error ? error.message : 'UNKNOWN_ERROR'
      )
    }
    
    return NextResponse.json({ 
      error: "INTERNAL_ERROR", 
      details: "Failed to process bundle export",
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

// Helper function to calculate bundle quality
function calculateBundleQuality(artifacts: string[], format: string, size: number) {
  let score = 0
  const issues: string[] = []

  // Artifact completeness (40 points)
  if (artifacts.includes('txt')) score += 10
  if (artifacts.includes('md')) score += 10
  if (artifacts.includes('json')) score += 10
  if (artifacts.includes('pdf')) score += 10

  // Format quality (30 points)
  if (format === 'bundle') score += 30
  else if (format === 'zip') score += 25
  else if (format === 'pdf') score += 20
  else if (format === 'json') score += 15
  else if (format === 'md') score += 10
  else if (format === 'txt') score += 5

  // Size optimization (20 points)
  if (size < 1000000) score += 20 // < 1MB
  else if (size < 5000000) score += 15 // < 5MB
  else if (size < 10000000) score += 10 // < 10MB
  else {
    score += 5
    issues.push('Bundle size is large - consider optimization')
  }

  // Manifest completeness (10 points)
  score += 10

  // Quality assessment
  let quality: 'excellent' | 'good' | 'acceptable' | 'poor'
  if (score >= 90) quality = 'excellent'
  else if (score >= 80) quality = 'good'
  else if (score >= 70) quality = 'acceptable'
  else quality = 'poor'

  return { score, quality, issues }
}
