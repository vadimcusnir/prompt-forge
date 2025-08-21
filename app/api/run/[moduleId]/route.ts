/**
 * app/api/run/[moduleId]/route.ts — Module Execution API
 * 
 * POST /api/run/{moduleId} - Executes a module with 7D parameters
 * Returns prompt and artifacts based on user entitlements
 */

import { NextRequest, NextResponse } from 'next/server'
import { 
  getEffectiveEntitlements, 
  savePromptHistory, 
  savePromptScores,
  hasEntitlement 
} from '@/lib/supabase'
import { sessionManager } from '@/lib/auth/session-manager'
import { simulateGptResponse, liveGptTest } from '@/lib/test-engine'

export async function POST(
  request: NextRequest,
  { params }: { params: { moduleId: string } }
) {
  try {
    // Get authenticated user session
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized - Bearer token required' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const authResult = await sessionManager.validateSession(token)
    
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    const userId = authResult.user.id
    const orgId = authResult.user.orgId
    const moduleId = parseInt(params.moduleId)

    if (!orgId) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 400 }
      )
    }

    if (isNaN(moduleId) || moduleId < 1 || moduleId > 50) {
      return NextResponse.json(
        { error: 'Invalid module ID. Must be between 1 and 50.' },
        { status: 400 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { sevenD, input } = body

    if (!sevenD || !input) {
      return NextResponse.json(
        { error: 'Missing required fields: sevenD and input' },
        { status: 400 }
      )
    }

    // Validate 7D parameters
    const validParams = validate7DParams(sevenD)
    if (!validParams) {
      return NextResponse.json(
        { error: 'Invalid 7D parameters' },
        { status: 400 }
      )
    }

    // Check entitlements
    const entitlements = await getEffectiveEntitlements(userId, orgId)
    
    // Check if user can access this module
    if (!entitlements.canUseAllModules && moduleId > 10) {
      return NextResponse.json(
        { 
          error: 'Module access restricted',
          requiredPlan: 'Pro or higher',
          currentPlan: authResult.user.planId
        },
        { status: 403 }
      )
    }

    // Execute module based on entitlements
    let output: string
    let scores: any = null
    let executionTime = Date.now()

    if (entitlements.canUseGptTestReal) {
      // Use live GPT testing for Pro/Enterprise users
      const result = await liveGptTest(moduleId, sevenD, input)
      output = result.output
      scores = result.scores
    } else {
      // Use simulated response for Free/Creator users
      const result = await simulateGptResponse(moduleId, sevenD, input)
      output = result.output
      scores = result.scores
    }

    executionTime = Date.now() - executionTime

    // Save to prompt history if user has cloud history
    let runId: string | null = null
    if (entitlements.hasCloudHistory) {
      runId = await savePromptHistory({
        org_id: orgId,
        user_id: userId,
        module_id: moduleId,
        input,
        output,
        seven_d_params: sevenD,
        scores,
        execution_time_ms: executionTime,
        token_count: estimateTokenCount(input + output)
      })
    }

    // Save scores if user has evaluator AI
    if (entitlements.hasEvaluatorAI && scores) {
      await savePromptScores({
        org_id: orgId,
        user_id: userId,
        module_id: moduleId,
        run_id: runId || 'local',
        overall_score: scores.overall || 0,
        quality_score: scores.quality || 0,
        relevance_score: scores.relevance || 0,
        clarity_score: scores.clarity || 0,
        feedback: scores.feedback || 'No feedback available',
        evaluator_version: '1.0.0'
      })
    }

    // Prepare response with artifacts based on entitlements
    const artifacts: any = {
      txt: output,
      md: entitlements.canExportMD ? output : null,
      json: entitlements.canExportJSON ? {
        module_id: moduleId,
        seven_d: sevenD,
        input,
        output,
        scores,
        execution_time_ms: executionTime,
        run_id: runId,
        timestamp: new Date().toISOString()
      } : null,
      pdf: null // Will be handled separately if user has PDF export
    }

    // Add watermark for trial users
    const isTrial = await checkIfTrialUser(orgId)
    if (isTrial && (artifacts.json || artifacts.md)) {
      artifacts.watermark = 'TRIAL VERSION - Upgrade to Pro for full features'
    }

    return NextResponse.json({
      success: true,
      data: {
        module_id: moduleId,
        output,
        artifacts,
        scores,
        execution_time_ms: executionTime,
        run_id: runId,
        entitlements: {
          canExportMD: entitlements.canExportMD,
          canExportPDF: entitlements.canExportPDF,
          canExportJSON: entitlements.canExportJSON,
          hasCloudHistory: entitlements.hasCloudHistory,
          hasEvaluatorAI: entitlements.hasEvaluatorAI
        }
      }
    })

  } catch (error) {
    console.error('Error in module execution API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Validate 7D parameters
 */
function validate7DParams(sevenD: any): boolean {
  const validDomains = ['generic', 'ecommerce', 'education', 'fintech', 'healthcare', 'legal', 'marketing', 'sales', 'support', 'technical']
  const validScales = ['individual', 'team', 'department', 'organization', 'enterprise']
  const validUrgencies = ['low', 'normal', 'high', 'critical']
  const validComplexities = ['simple', 'medium', 'complex', 'expert']
  const validResources = ['minimal', 'standard', 'enhanced', 'premium']
  const validApplications = ['content_ops', 'customer_support', 'sales_enablement', 'training', 'documentation', 'analysis']
  const validOutputs = ['single', 'bundle', 'collection']

  return (
    sevenD.domain && validDomains.includes(sevenD.domain) &&
    sevenD.scale && validScales.includes(sevenD.scale) &&
    sevenD.urgency && validUrgencies.includes(sevenD.urgency) &&
    sevenD.complexity && validComplexities.includes(sevenD.complexity) &&
    sevenD.resources && validResources.includes(sevenD.resources) &&
    sevenD.application && validApplications.includes(sevenD.application) &&
    sevenD.output && validOutputs.includes(sevenD.output)
  )
}

/**
 * Estimate token count (rough approximation)
 */
function estimateTokenCount(text: string): number {
  // Rough approximation: 1 token ≈ 4 characters for English text
  return Math.ceil(text.length / 4)
}

/**
 * Check if user is in trial period
 */
async function checkIfTrialUser(orgId: string): Promise<boolean> {
  // This would check the subscription status
  // For now, return false (not in trial)
  return false
}
