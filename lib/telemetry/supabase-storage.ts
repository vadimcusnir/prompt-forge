/**
 * lib/telemetry/supabase-storage.ts — Supabase Telemetry Storage
 * 
 * Implements TelemetryStorage interface using Supabase database
 * Provides persistent storage for runs, scores, bundles, and gate results
 */

import { createServerSupabaseClient } from '@/lib/supabase/client'
import type { TelemetryStorage, RunData, ScoreEvaluation, BundleExport, GateResult } from '../telemetry'
import type { Tables, Inserts, Updates } from '@/lib/supabase/types'

export class SupabaseTelemetryStorage implements TelemetryStorage {
  private supabase = createServerSupabaseClient()

  /**
   * Save run data to database
   */
  async saveRun(data: RunData): Promise<void> {
    try {
      const runData: Inserts<'runs'> = {
        org_id: 'default-org', // TODO: Get from auth context
        module_id: parseInt(data.moduleId),
        user_id: data.userId,
        run_id: data.runId,
        status: data.success ? 'completed' : 'failed',
        seven_d: data.sevenD,
        input: '', // Don't store raw input for privacy
        output: '', // Don't store raw output for privacy
        scores: data.scores || null,
        error_message: data.errorCode || null,
        execution_time_ms: data.duration || null,
        token_count: data.tokenCount || null
      }

      const { error } = await this.supabase
        .from('runs')
        .insert(runData)

      if (error) {
        console.error('Failed to save run to database:', error)
        throw new Error(`Database error: ${error.message}`)
      }

      console.log('📊 Telemetry: Run saved to database', { runId: data.runId, moduleId: data.moduleId })
    } catch (error) {
      console.error('Error saving run to database:', error)
      throw error
    }
  }

  /**
   * Save score evaluation to database
   */
  async saveScoreEvaluation(evaluation: ScoreEvaluation): Promise<void> {
    try {
      const telemetryData: Inserts<'telemetry_events'> = {
        org_id: 'default-org', // TODO: Get from auth context
        user_id: evaluation.userId,
        event_type: 'score_evaluation',
        event_data: {
          runId: evaluation.runId,
          promptId: evaluation.promptId,
          scores: evaluation.scores,
          overallScore: evaluation.overallScore,
          threshold: evaluation.threshold,
          passed: evaluation.passed,
          quality: evaluation.quality,
          recommendations: evaluation.recommendations
        },
        metadata: {
          timestamp: evaluation.timestamp.toISOString(),
          evaluationType: 'prompt_quality'
        }
      }

      const { error } = await this.supabase
        .from('telemetry_events')
        .insert(telemetryData)

      if (error) {
        console.error('Failed to save score evaluation to database:', error)
        throw new Error(`Database error: ${error.message}`)
      }

      console.log('📊 Telemetry: Score evaluation saved to database', { 
        runId: evaluation.runId, 
        overallScore: evaluation.overallScore,
        passed: evaluation.passed 
      })
    } catch (error) {
      console.error('Error saving score evaluation to database:', error)
      throw error
    }
  }

  /**
   * Save bundle export to database
   */
  async saveBundleExport(export_: BundleExport): Promise<void> {
    try {
      // Save bundle record
      const bundleData: Inserts<'bundles'> = {
        org_id: 'default-org', // TODO: Get from auth context
        run_id: export_.runId,
        name: `Bundle Export ${export_.exportId}`,
        description: `Export in ${export_.format} format with ${export_.artifacts.length} artifacts`,
        artifacts: export_.artifacts,
        checksum_sha256: export_.checksum,
        size_bytes: export_.size,
        manifest: export_.manifest,
        status: 'completed'
      }

      const { error: bundleError } = await this.supabase
        .from('bundles')
        .insert(bundleData)

      if (bundleError) {
        console.error('Failed to save bundle to database:', bundleError)
        throw new Error(`Database error: ${bundleError.message}`)
      }

      // Save telemetry event
      const telemetryData: Inserts<'telemetry_events'> = {
        org_id: 'default-org', // TODO: Get from auth context
        user_id: export_.userId,
        event_type: 'bundle_export',
        event_data: {
          exportId: export_.exportId,
          runId: export_.runId,
          format: export_.format,
          artifacts: export_.artifacts,
          size: export_.size,
          checksum: export_.checksum,
          quality: export_.quality
        },
        metadata: {
          timestamp: export_.timestamp.toISOString(),
          exportType: 'bundle',
          planId: export_.planId
        }
      }

      const { error: telemetryError } = await this.supabase
        .from('telemetry_events')
        .insert(telemetryData)

      if (telemetryError) {
        console.error('Failed to save bundle telemetry to database:', telemetryError)
        throw new Error(`Database error: ${telemetryError.message}`)
      }

      console.log('📊 Telemetry: Bundle export saved to database', { 
        exportId: export_.exportId, 
        format: export_.format,
        quality: export_.quality 
      })
    } catch (error) {
      console.error('Error saving bundle export to database:', error)
      throw error
    }
  }

  /**
   * Save gate result to database
   */
  async saveGateResult(result: GateResult): Promise<void> {
    try {
      const telemetryData: Inserts<'telemetry_events'> = {
        org_id: 'default-org', // TODO: Get from auth context
        user_id: result.userId,
        event_type: 'gate_hit',
        event_data: {
          gateId: result.gateId,
          gateType: result.gateType,
          passed: result.passed,
          reason: result.reason,
          metadata: result.metadata
        },
        metadata: {
          timestamp: result.timestamp.toISOString(),
          sessionId: result.sessionId,
          planId: result.planId
        }
      }

      const { error } = await this.supabase
        .from('telemetry_events')
        .insert(telemetryData)

      if (error) {
        console.error('Failed to save gate result to database:', error)
        throw new Error(`Database error: ${error.message}`)
      }

      console.log('📊 Telemetry: Gate result saved to database', { 
        gateId: result.gateId, 
        passed: result.passed,
        reason: result.reason 
      })
    } catch (error) {
      console.error('Error saving gate result to database:', error)
      throw error
    }
  }

  /**
   * Get run history from database
   */
  async getRunHistory(userId: string, limit: number = 50): Promise<RunData[]> {
    try {
      const { data, error } = await this.supabase
        .from('runs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) {
        console.error('Failed to fetch run history from database:', error)
        throw new Error(`Database error: ${error.message}`)
      }

      // Transform database records to RunData format
      return data.map(record => ({
        runId: record.run_id,
        moduleId: record.module_id.toString(),
        userId: record.user_id,
        sessionId: 'unknown', // Not stored in current schema
        planId: 'unknown', // Not stored in current schema
        sevenD: record.seven_d,
        startTime: new Date(record.created_at),
        endTime: new Date(record.updated_at),
        duration: record.execution_time_ms || 0,
        success: record.status === 'completed',
        errorCode: record.error_message || undefined,
        scores: record.scores || undefined,
        tokenCount: record.token_count || undefined,
        output: record.output || undefined
      }))
    } catch (error) {
      console.error('Error fetching run history from database:', error)
      throw error
    }
  }

  /**
   * Get score history from database
   */
  async getScoreHistory(userId: string, limit: number = 50): Promise<ScoreEvaluation[]> {
    try {
      const { data, error } = await this.supabase
        .from('telemetry_events')
        .select('*')
        .eq('user_id', userId)
        .eq('event_type', 'score_evaluation')
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) {
        console.error('Failed to fetch score history from database:', error)
        throw new Error(`Database error: ${error.message}`)
      }

      // Transform database records to ScoreEvaluation format
      return data.map(record => {
        const eventData = record.event_data as any
        return {
          runId: eventData.runId,
          promptId: eventData.promptId,
          userId: record.user_id,
          timestamp: new Date(record.created_at),
          scores: eventData.scores,
          overallScore: eventData.overallScore,
          threshold: eventData.threshold,
          passed: eventData.passed,
          quality: eventData.quality,
          recommendations: eventData.recommendations || []
        }
      })
    } catch (error) {
      console.error('Error fetching score history from database:', error)
      throw error
    }
  }

  /**
   * Get bundle history from database
   */
  async getBundleHistory(userId: string, limit: number = 50): Promise<BundleExport[]> {
    try {
      const { data, error } = await this.supabase
        .from('telemetry_events')
        .select('*')
        .eq('user_id', userId)
        .eq('event_type', 'bundle_export')
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) {
        console.error('Failed to fetch bundle history from database:', error)
        throw new Error(`Database error: ${error.message}`)
      }

      // Transform database records to BundleExport format
      return data.map(record => {
        const eventData = record.event_data as any
        return {
          exportId: eventData.exportId,
          runId: eventData.runId,
          userId: record.user_id,
          planId: (record.metadata as any)?.planId || 'unknown',
          timestamp: new Date(record.created_at),
          artifacts: eventData.artifacts,
          format: eventData.format,
          size: eventData.size,
          checksum: eventData.checksum,
          manifest: {},
          quality: eventData.quality
        }
      })
    } catch (error) {
      console.error('Error fetching bundle history from database:', error)
      throw error
    }
  }

  /**
   * Get analytics data for a user
   */
  async getUserAnalytics(userId: string) {
    try {
      const [runs, scores, bundles] = await Promise.all([
        this.getRunHistory(userId, 100),
        this.getScoreHistory(userId, 100),
        this.getBundleHistory(userId, 100)
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
    } catch (error) {
      console.error('Error fetching user analytics from database:', error)
      throw error
    }
  }
}
