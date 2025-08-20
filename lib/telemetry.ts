/**
 * lib/telemetry.ts — Enhanced Telemetry System with Auto-Save & Score Evaluation
 * 
 * Implements comprehensive tracking for runs, prompt scores, and bundles
 * Automatic saving with score evaluation (≥80 threshold) and quality gates
 */

import type { GeneratedPrompt } from '@/types/promptforge'

// Telemetry Event Types
export interface TelemetryEvent {
  id: string
  timestamp: Date
  userId: string
  sessionId: string
  planId: string
  moduleId: string
  eventType: 'run_start' | 'run_finish' | 'gate_hit' | 'score_evaluation' | 'bundle_export'
  metadata: Record<string, any>
}

// Run Tracking
export interface RunData {
  runId: string
  moduleId: string
  userId: string
  sessionId: string
  planId: string
  sevenD: any
  startTime: Date
  endTime?: Date
  duration?: number
  success: boolean
  errorCode?: string
  scores?: Record<string, number>
  tokenCount?: number
  promptHash?: string
}

// Score Evaluation
export interface ScoreEvaluation {
  runId: string
  promptId: string
  userId: string
  timestamp: Date
  scores: Record<string, number>
  overallScore: number
  threshold: number
  passed: boolean
  quality: 'excellent' | 'good' | 'acceptable' | 'poor'
  recommendations: string[]
}

// Bundle Export Tracking
export interface BundleExport {
  exportId: string
  runId: string
  userId: string
  planId: string
  timestamp: Date
  artifacts: string[]
  format: string
  size: number
  checksum: string
  manifest: any
  quality: 'excellent' | 'good' | 'acceptable' | 'poor'
}

// Quality Gate Results
export interface GateResult {
  gateId: string
  gateType: '7D_validation' | 'entitlement' | 'DoR' | 'DoD' | 'score_threshold'
  passed: boolean
  reason?: string
  userId: string
  sessionId: string
  planId: string
  timestamp: Date
  metadata?: Record<string, any>
}

// Telemetry Storage Interface
export interface TelemetryStorage {
  saveRun(data: RunData): Promise<void>
  saveScoreEvaluation(evaluation: ScoreEvaluation): Promise<void>
  saveBundleExport(export_: BundleExport): Promise<void>
  saveGateResult(result: GateResult): Promise<void>
  getRunHistory(userId: string, limit?: number): Promise<RunData[]>
  getScoreHistory(userId: string, limit?: number): Promise<ScoreEvaluation[]>
  getBundleHistory(userId: string, limit?: number): Promise<BundleExport[]>
}

// In-Memory Storage (Development) - Replace with database in production
class InMemoryTelemetryStorage implements TelemetryStorage {
  private runs: RunData[] = []
  private scoreEvaluations: ScoreEvaluation[] = []
  private bundleExports: BundleExport[] = []
  private gateResults: GateResult[] = []

  async saveRun(data: RunData): Promise<void> {
    this.runs.push(data)
    console.log('📊 Telemetry: Run saved', { runId: data.runId, moduleId: data.moduleId })
  }

  async saveScoreEvaluation(evaluation: ScoreEvaluation): Promise<void> {
    this.scoreEvaluations.push(evaluation)
    console.log('📊 Telemetry: Score evaluation saved', { 
      runId: evaluation.runId, 
      overallScore: evaluation.overallScore,
      passed: evaluation.passed 
    })
  }

  async saveBundleExport(export_: BundleExport): Promise<void> {
    this.bundleExports.push(export_)
    console.log('📊 Telemetry: Bundle export saved', { 
      exportId: export_.exportId, 
      format: export_.format,
      quality: export_.quality 
    })
  }

  async saveGateResult(result: GateResult): Promise<void> {
    this.gateResults.push(result)
    console.log('📊 Telemetry: Gate result saved', { 
      gateId: result.gateId, 
      passed: result.passed,
      reason: result.reason 
    })
  }

  async getRunHistory(userId: string, limit: number = 50): Promise<RunData[]> {
    return this.runs
      .filter(run => run.userId === userId)
      .sort((a, b) => b.startTime.getTime() - a.startTime.getTime())
      .slice(0, limit)
  }

  async getScoreHistory(userId: string, limit: number = 50): Promise<ScoreEvaluation[]> {
    return this.scoreEvaluations
      .filter(eval_ => eval_.userId === userId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit)
  }

  async getBundleHistory(userId: string, limit: number = 50): Promise<BundleExport[]> {
    return this.bundleExports
      .filter(export_ => export_.userId === userId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit)
  }
}

// Score Evaluation Engine
export class ScoreEvaluator {
  private static readonly THRESHOLD = 80
  private static readonly WEIGHTS = {
    clarity: 0.25,
    execution: 0.25,
    ambiguity: 0.25,
    business_fit: 0.25
  }

  /**
   * Evaluate scores against threshold with automatic quality assessment
   */
  static evaluateScores(
    scores: Record<string, number>,
    runId: string,
    promptId: string,
    userId: string
  ): ScoreEvaluation {
    const overallScore = this.calculateOverallScore(scores)
    const passed = overallScore >= this.THRESHOLD
    const quality = this.assessQuality(overallScore)
    const recommendations = this.generateRecommendations(scores, overallScore)

    return {
      runId,
      promptId,
      userId,
      timestamp: new Date(),
      scores,
      overallScore,
      threshold: this.THRESHOLD,
      passed,
      quality,
      recommendations
    }
  }

  /**
   * Calculate weighted overall score
   */
  private static calculateOverallScore(scores: Record<string, number>): number {
    let totalScore = 0
    let totalWeight = 0

    Object.entries(this.WEIGHTS).forEach(([metric, weight]) => {
      if (scores[metric] !== undefined) {
        totalScore += scores[metric] * weight
        totalWeight += weight
      }
    })

    return totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0
  }

  /**
   * Assess quality based on overall score
   */
  private static assessQuality(overallScore: number): 'excellent' | 'good' | 'acceptable' | 'poor' {
    if (overallScore >= 95) return 'excellent'
    if (overallScore >= 85) return 'good'
    if (overallScore >= 75) return 'acceptable'
    return 'poor'
  }

  /**
   * Generate improvement recommendations
   */
  private static generateRecommendations(
    scores: Record<string, number>,
    overallScore: number
  ): string[] {
    const recommendations: string[] = []

    // Score-specific recommendations
    if (scores.clarity < 80) {
      recommendations.push('Improve prompt clarity with more specific instructions')
    }
    if (scores.execution < 80) {
      recommendations.push('Add step-by-step execution guidelines')
    }
    if (scores.ambiguity < 80) {
      recommendations.push('Reduce ambiguity by defining key terms')
    }
    if (scores.business_fit < 80) {
      recommendations.push('Better align with business objectives and KPIs')
    }

    // Overall score recommendations
    if (overallScore < 80) {
      recommendations.push('Overall quality below threshold - consider prompt restructuring')
    }
    if (overallScore >= 90) {
      recommendations.push('Excellent prompt quality - ready for production use')
    }

    return recommendations
  }
}

// Main Telemetry Controller
export class TelemetryController {
  private storage: TelemetryStorage
  private scoreEvaluator: ScoreEvaluator

  constructor(storage?: TelemetryStorage) {
    this.storage = storage || new InMemoryTelemetryStorage()
    this.scoreEvaluator = ScoreEvaluator
  }

  /**
   * Track run start
   */
  async trackRunStart(data: Omit<RunData, 'startTime' | 'success'>): Promise<string> {
    const runData: RunData = {
      ...data,
      startTime: new Date(),
      success: false
    }

    await this.storage.saveRun(runData)
    return runData.runId
  }

  /**
   * Track run completion with automatic score evaluation
   */
  async trackRunFinish(
    runId: string,
    success: boolean,
    scores?: Record<string, number>,
    errorCode?: string,
    tokenCount?: number
  ): Promise<void> {
    // Find and update run
    const runs = await this.storage.getRunHistory('any', 1000)
    const run = runs.find(r => r.runId === runId)
    
    if (run) {
      run.endTime = new Date()
      run.duration = run.endTime.getTime() - run.startTime.getTime()
      run.success = success
      run.errorCode = errorCode
      run.tokenCount = tokenCount
      run.scores = scores

      await this.storage.saveRun(run)

      // Automatic score evaluation if scores provided
      if (scores && run.promptId) {
        const evaluation = this.scoreEvaluator.evaluateScores(
          scores,
          runId,
          run.promptId,
          run.userId
        )
        await this.storage.saveScoreEvaluation(evaluation)

        // Track gate result for score threshold
        await this.trackGateResult({
          gateId: 'score_threshold',
          gateType: 'DoD',
          passed: evaluation.passed,
          reason: evaluation.passed ? 'Score above threshold' : `Score ${evaluation.overallScore} below threshold ${evaluation.threshold}`,
          userId: run.userId,
          sessionId: run.sessionId,
          planId: run.planId,
          timestamp: new Date(),
          metadata: { scores, overallScore: evaluation.overallScore, threshold: evaluation.threshold }
        })
      }
    }
  }

  /**
   * Track quality gate results
   */
  async trackGateResult(result: GateResult): Promise<void> {
    await this.storage.saveGateResult(result)
  }

  /**
   * Track bundle export with quality assessment
   */
  async trackBundleExport(
    exportId: string,
    runId: string,
    userId: string,
    planId: string,
    artifacts: string[],
    format: string,
    size: number,
    checksum: string,
    manifest: any
  ): Promise<void> {
    // Assess bundle quality based on artifacts and format
    const quality = this.assessBundleQuality(artifacts, format, size)

    const bundleExport: BundleExport = {
      exportId,
      runId,
      userId,
      planId,
      timestamp: new Date(),
      artifacts,
      format,
      size,
      checksum,
      manifest,
      quality
    }

    await this.storage.saveBundleExport(bundleExport)
  }

  /**
   * Assess bundle quality
   */
  private assessBundleQuality(
    artifacts: string[],
    format: string,
    size: number
  ): 'excellent' | 'good' | 'acceptable' | 'poor' {
    let score = 0

    // Artifact completeness
    if (artifacts.includes('txt')) score += 20
    if (artifacts.includes('md')) score += 20
    if (artifacts.includes('json')) score += 20
    if (artifacts.includes('pdf')) score += 20
    if (artifacts.includes('manifest')) score += 20

    // Format quality
    if (format === 'bundle') score += 10
    if (format === 'zip') score += 15

    // Size optimization
    if (size < 1000000) score += 10 // < 1MB
    else if (size < 5000000) score += 5 // < 5MB

    if (score >= 90) return 'excellent'
    if (score >= 80) return 'good'
    if (score >= 70) return 'acceptable'
    return 'poor'
  }

  /**
   * Get telemetry analytics
   */
  async getAnalytics(userId: string) {
    const [runs, scores, bundles] = await Promise.all([
      this.storage.getRunHistory(userId, 100),
      this.storage.getScoreHistory(userId, 100),
      this.storage.getBundleHistory(userId, 100)
    ])

    const totalRuns = runs.length
    const successfulRuns = runs.filter(r => r.success).length
    const successRate = totalRuns > 0 ? (successfulRuns / totalRuns) * 100 : 0

    const averageScore = scores.length > 0 
      ? scores.reduce((sum, s) => sum + s.overallScore, 0) / scores.length 
      : 0

    const qualityDistribution = {
      excellent: scores.filter(s => s.quality === 'excellent').length,
      good: scores.filter(s => s.quality === 'good').length,
      acceptable: scores.filter(s => s.quality === 'acceptable').length,
      poor: scores.filter(s => s.quality === 'poor').length
    }

    return {
      totalRuns,
      successRate: Math.round(successRate * 100) / 100,
      averageScore: Math.round(averageScore * 100) / 100,
      qualityDistribution,
      recentActivity: {
        runs: runs.slice(0, 5),
        scores: scores.slice(0, 5),
        bundles: bundles.slice(0, 5)
      }
    }
  }
}

// Export singleton instances
export const telemetry = new TelemetryController()
export const trackRun = {
  start: (data: Omit<RunData, 'startTime' | 'success'>) => telemetry.trackRunStart(data),
  finish: (runId: string, success: boolean, scores?: Record<string, number>, errorCode?: string, tokenCount?: number) => 
    telemetry.trackRunFinish(runId, success, scores, errorCode, tokenCount)
}
export const trackGate = {
  hit: (result: GateResult) => telemetry.trackGateResult(result)
}
export const trackBundle = {
  export: (exportId: string, runId: string, userId: string, planId: string, artifacts: string[], format: string, size: number, checksum: string, manifest: any) =>
    telemetry.trackBundleExport(exportId, runId, userId, planId, artifacts, format, size, checksum, manifest)
}
