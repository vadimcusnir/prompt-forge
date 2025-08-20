/**
 * lib/telemetry/analytics.ts — Enhanced Analytics System
 * 
 * Provides comprehensive analytics tracking for user behavior, system performance,
 * and business metrics. Integrates with Supabase for persistent storage.
 */

import { createServerSupabaseClient } from '@/lib/supabase/client'
import { SupabaseTelemetryStorage } from './supabase-storage'

export interface AnalyticsEvent {
  id: string
  userId: string
  sessionId: string
  planId: string
  eventType: string
  eventData: Record<string, any>
  metadata: Record<string, any>
  timestamp: Date
}

export interface GPTCallEvent {
  userId: string
  sessionId: string
  planId: string
  model: string
  tokens: number
  processingTime: number
  success: boolean
  error?: string
}

export interface UserActionEvent {
  userId: string
  sessionId: string
  planId: string
  action: string
  target: string
  duration?: number
  metadata?: Record<string, any>
}

export interface PerformanceEvent {
  userId: string
  sessionId: string
  planId: string
  metric: string
  value: number
  unit: string
  context?: Record<string, any>
}

export interface BusinessMetrics {
  totalUsers: number
  activeUsers: number
  totalRuns: number
  successRate: number
  averageScore: number
  popularModules: Array<{ moduleId: string; count: number }>
  planDistribution: Record<string, number>
  monthlyGrowth: number
}

export class Analytics {
  private static instance: Analytics
  private storage: SupabaseTelemetryStorage
  private supabase = createServerSupabaseClient()

  private constructor() {
    this.storage = new SupabaseTelemetryStorage()
  }

  static getInstance(): Analytics {
    if (!Analytics.instance) {
      Analytics.instance = new Analytics()
    }
    return Analytics.instance
  }

  /**
   * Track GPT API call
   */
  async trackGPTCall(event: GPTCallEvent): Promise<void> {
    try {
      const analyticsEvent: AnalyticsEvent = {
        id: `gpt-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
        userId: event.userId,
        sessionId: event.sessionId,
        planId: event.planId,
        eventType: 'gpt_call',
        eventData: {
          model: event.model,
          tokens: event.tokens,
          processingTime: event.processingTime,
          success: event.success,
          error: event.error
        },
        metadata: {
          timestamp: new Date().toISOString(),
          endpoint: 'openai-api',
          version: '1.0.0'
        },
        timestamp: new Date()
      }

      await this.saveAnalyticsEvent(analyticsEvent)

      // Track performance metrics
      if (event.success) {
        await this.trackPerformance({
          userId: event.userId,
          sessionId: event.sessionId,
          planId: event.planId,
          metric: 'gpt_response_time',
          value: event.processingTime,
          unit: 'ms'
        })

        await this.trackPerformance({
          userId: event.userId,
          sessionId: event.sessionId,
          planId: event.planId,
          metric: 'gpt_tokens_used',
          value: event.tokens,
          unit: 'tokens'
        })
      }

    } catch (error) {
      console.error('Error tracking GPT call:', error)
    }
  }

  /**
   * Track user action
   */
  async trackUserAction(event: UserActionEvent): Promise<void> {
    try {
      const analyticsEvent: AnalyticsEvent = {
        id: `action-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
        userId: event.userId,
        sessionId: event.sessionId,
        planId: event.planId,
        eventType: 'user_action',
        eventData: {
          action: event.action,
          target: event.target,
          duration: event.duration
        },
        metadata: {
          timestamp: new Date().toISOString(),
          ...event.metadata
        },
        timestamp: new Date()
      }

      await this.saveAnalyticsEvent(analyticsEvent)

    } catch (error) {
      console.error('Error tracking user action:', error)
    }
  }

  /**
   * Track performance metrics
   */
  async trackPerformance(event: PerformanceEvent): Promise<void> {
    try {
      const analyticsEvent: AnalyticsEvent = {
        id: `perf-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
        userId: event.userId,
        sessionId: event.sessionId,
        planId: event.planId,
        eventType: 'performance',
        eventData: {
          metric: event.metric,
          value: event.value,
          unit: event.unit
        },
        metadata: {
          timestamp: new Date().toISOString(),
          context: event.context
        },
        timestamp: new Date()
      }

      await this.saveAnalyticsEvent(analyticsEvent)

    } catch (error) {
      console.error('Error tracking performance:', error)
    }
  }

  /**
   * Track module usage
   */
  async trackModuleUsage(userId: string, sessionId: string, planId: string, moduleId: string, success: boolean): Promise<void> {
    try {
      const analyticsEvent: AnalyticsEvent = {
        id: `module-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
        userId,
        sessionId,
        planId,
        eventType: 'module_usage',
        eventData: {
          moduleId,
          success,
          timestamp: new Date().toISOString()
        },
        metadata: {
          version: '1.0.0'
        },
        timestamp: new Date()
      }

      await this.saveAnalyticsEvent(analyticsEvent)

    } catch (error) {
      console.error('Error tracking module usage:', error)
    }
  }

  /**
   * Track feature usage
   */
  async trackFeatureUsage(userId: string, sessionId: string, planId: string, feature: string, success: boolean): Promise<void> {
    try {
      const analyticsEvent: AnalyticsEvent = {
        id: `feature-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
        userId,
        sessionId,
        planId,
        eventType: 'feature_usage',
        eventData: {
          feature,
          success,
          timestamp: new Date().toISOString()
        },
        metadata: {
          version: '1.0.0'
        },
        timestamp: new Date()
      }

      await this.saveAnalyticsEvent(analyticsEvent)

    } catch (error) {
      console.error('Error tracking feature usage:', error)
    }
  }

  /**
   * Get user analytics
   */
  async getUserAnalytics(userId: string): Promise<any> {
    try {
      return await this.storage.getUserAnalytics(userId)
    } catch (error) {
      console.error('Error getting user analytics:', error)
      return null
    }
  }

  /**
   * Get business metrics
   */
  async getBusinessMetrics(): Promise<BusinessMetrics> {
    try {
      // Get total users
      const { count: totalUsers } = await this.supabase
        .from('telemetry_events')
        .select('*', { count: 'exact', head: true })

      // Get active users (last 30 days)
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      const { data: activeUsersData } = await this.supabase
        .from('telemetry_events')
        .select('user_id')
        .gte('created_at', thirtyDaysAgo.toISOString())
        .distinct()

      const activeUsers = activeUsersData?.length || 0

      // Get total runs
      const { count: totalRuns } = await this.supabase
        .from('runs')
        .select('*', { count: 'exact', head: true })

      // Get success rate
      const { data: runsData } = await this.supabase
        .from('runs')
        .select('status')
        .limit(1000)

      const successfulRuns = runsData?.filter(r => r.status === 'completed').length || 0
      const successRate = runsData && runsData.length > 0 ? (successfulRuns / runsData.length) * 100 : 0

      // Get average score
      const { data: scoresData } = await this.supabase
        .from('telemetry_events')
        .select('event_data')
        .eq('event_type', 'score_evaluation')
        .limit(1000)

      const scores = scoresData?.map(r => (r.event_data as any)?.overallScore).filter(Boolean) || []
      const averageScore = scores.length > 0 ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 0

      // Get popular modules
      const { data: moduleUsage } = await this.supabase
        .from('runs')
        .select('module_id')
        .limit(1000)

      const moduleCounts = new Map<string, number>()
      moduleUsage?.forEach(run => {
        const count = moduleCounts.get(run.module_id.toString()) || 0
        moduleCounts.set(run.module_id.toString(), count + 1)
      })

      const popularModules = Array.from(moduleCounts.entries())
        .map(([moduleId, count]) => ({ moduleId, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)

      // Get plan distribution
      const { data: planData } = await this.supabase
        .from('orgs')
        .select('plan_id')
        .limit(1000)

      const planDistribution: Record<string, number> = {}
      planData?.forEach(org => {
        const count = planDistribution[org.plan_id] || 0
        planDistribution[org.plan_id] = count + 1
      })

      // Calculate monthly growth (simplified)
      const monthlyGrowth = 0 // TODO: Implement actual growth calculation

      return {
        totalUsers: totalUsers || 0,
        activeUsers,
        totalRuns: totalRuns || 0,
        successRate: Math.round(successRate * 100) / 100,
        averageScore: Math.round(averageScore * 100) / 100,
        popularModules,
        planDistribution,
        monthlyGrowth
      }

    } catch (error) {
      console.error('Error getting business metrics:', error)
      return {
        totalUsers: 0,
        activeUsers: 0,
        totalRuns: 0,
        successRate: 0,
        averageScore: 0,
        popularModules: [],
        planDistribution: {},
        monthlyGrowth: 0
      }
    }
  }

  /**
   * Get real-time analytics
   */
  async getRealTimeAnalytics(): Promise<any> {
    try {
      const now = new Date()
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

      // Get recent activity
      const { data: recentEvents } = await this.supabase
        .from('telemetry_events')
        .select('*')
        .gte('created_at', oneHourAgo.toISOString())
        .order('created_at', { ascending: false })
        .limit(100)

      // Get hourly stats
      const { data: hourlyStats } = await this.supabase
        .from('telemetry_events')
        .select('created_at, event_type')
        .gte('created_at', oneDayAgo.toISOString())

      // Process hourly data
      const hourlyData = new Array(24).fill(0)
      hourlyStats?.forEach(event => {
        const hour = new Date(event.created_at).getHours()
        hourlyData[hour]++
      })

      return {
        recentEvents: recentEvents || [],
        hourlyActivity: hourlyData,
        currentHour: now.getHours(),
        lastUpdated: now.toISOString()
      }

    } catch (error) {
      console.error('Error getting real-time analytics:', error)
      return null
    }
  }

  /**
   * Save analytics event to database
   */
  private async saveAnalyticsEvent(event: AnalyticsEvent): Promise<void> {
    try {
      const telemetryData = {
        org_id: 'default-org', // TODO: Get from auth context
        user_id: event.userId,
        event_type: event.eventType,
        event_data: event.eventData,
        metadata: event.metadata
      }

      const { error } = await this.supabase
        .from('telemetry_events')
        .insert(telemetryData)

      if (error) {
        console.error('Error saving analytics event:', error)
      }

    } catch (error) {
      console.error('Error saving analytics event:', error)
    }
  }

  /**
   * Export analytics data
   */
  async exportAnalytics(userId: string, format: 'json' | 'csv'): Promise<string> {
    try {
      const analytics = await this.getUserAnalytics(userId)
      
      if (format === 'json') {
        return JSON.stringify(analytics, null, 2)
      } else {
        // Simple CSV export
        const csvRows = ['Metric,Value']
        Object.entries(analytics).forEach(([key, value]) => {
          if (typeof value === 'object') {
            csvRows.push(`${key},${JSON.stringify(value)}`)
          } else {
            csvRows.push(`${key},${value}`)
          }
        })
        return csvRows.join('\n')
      }

    } catch (error) {
      console.error('Error exporting analytics:', error)
      throw error
    }
  }
}

// Export singleton instance
export const analytics = Analytics.getInstance()
