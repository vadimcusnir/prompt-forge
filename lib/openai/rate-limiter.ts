/**
 * lib/openai/rate-limiter.ts — Rate Limiting System
 * 
 * Implements per-user and per-plan rate limiting for OpenAI API calls
 * Prevents abuse and ensures fair usage across different subscription tiers
 */

import { createServerSupabaseClient } from '@/lib/supabase/client'
import { entitlementChecker } from '@/lib/entitlements/useEntitlements'

export interface RateLimitResult {
  allowed: boolean
  message?: string
  remaining: number
  resetTime: Date
  limit: number
}

export interface UsageRecord {
  userId: string
  planId: string
  timestamp: Date
  tokens: number
  endpoint: string
}

export class RateLimiter {
  private static instance: RateLimiter
  private usageCache = new Map<string, UsageRecord[]>()
  private readonly CACHE_TTL = 5 * 60 * 1000 // 5 minutes

  private constructor() {
    // Clean up cache every 5 minutes
    setInterval(() => this.cleanupCache(), this.CACHE_TTL)
  }

  static getInstance(): RateLimiter {
    if (!RateLimiter.instance) {
      RateLimiter.instance = new RateLimiter()
    }
    return RateLimiter.instance
  }

  /**
   * Check if user is within rate limits
   */
  async checkLimit(userId: string, planId: string): Promise<RateLimitResult> {
    try {
      // Get plan limits
      const plan = entitlementChecker.getPlan(planId)
      if (!plan) {
        return {
          allowed: false,
          message: 'Invalid plan',
          remaining: 0,
          resetTime: new Date(),
          limit: 0
        }
      }

      const monthlyLimit = plan.limits.monthlyGptCalls
      const currentUsage = await this.getCurrentUsage(userId, planId)
      const resetTime = this.getNextResetTime()

      // Check if monthly limit exceeded
      if (currentUsage >= monthlyLimit) {
        return {
          allowed: false,
          message: `Monthly limit of ${monthlyLimit} GPT calls exceeded`,
          remaining: 0,
          resetTime,
          limit: monthlyLimit
        }
      }

      // Check hourly rate limit (more restrictive for lower plans)
      const hourlyLimit = this.getHourlyLimit(planId)
      const hourlyUsage = this.getHourlyUsage(userId, planId)
      
      if (hourlyUsage >= hourlyLimit) {
        const nextHour = new Date(Date.now() + 60 * 60 * 1000)
        return {
          allowed: false,
          message: `Hourly limit of ${hourlyLimit} calls exceeded. Try again in ${Math.ceil((nextHour.getTime() - Date.now()) / (60 * 1000))} minutes`,
          remaining: 0,
          resetTime: nextHour,
          limit: hourlyLimit
        }
      }

      return {
        allowed: true,
        remaining: monthlyLimit - currentUsage,
        resetTime,
        limit: monthlyLimit
      }

    } catch (error) {
      console.error('Rate limit check error:', error)
      // Fail open in case of errors
      return {
        allowed: true,
        remaining: 1000,
        resetTime: new Date(),
        limit: 1000
      }
    }
  }

  /**
   * Record usage for rate limiting
   */
  async recordUsage(userId: string, planId: string, tokens: number): Promise<void> {
    try {
      const usage: UsageRecord = {
        userId,
        planId,
        timestamp: new Date(),
        tokens,
        endpoint: 'gpt-api'
      }

      // Add to cache
      const cacheKey = `${userId}:${planId}`
      const userUsage = this.usageCache.get(cacheKey) || []
      userUsage.push(usage)
      this.usageCache.set(cacheKey, userUsage)

      // Save to database
      await this.saveUsageToDatabase(usage)

    } catch (error) {
      console.error('Error recording usage:', error)
    }
  }

  /**
   * Get current monthly usage for a user
   */
  private async getCurrentUsage(userId: string, planId: string): Promise<number> {
    try {
      const supabase = createServerSupabaseClient()
      
      const startOfMonth = new Date()
      startOfMonth.setDate(1)
      startOfMonth.setHours(0, 0, 0, 0)

      const { data, error } = await supabase
        .from('telemetry_events')
        .select('event_data')
        .eq('user_id', userId)
        .eq('event_type', 'gpt_call')
        .gte('created_at', startOfMonth.toISOString())

      if (error) {
        console.error('Error fetching usage from database:', error)
        return 0
      }

      // Count total calls
      return data?.length || 0

    } catch (error) {
      console.error('Error getting current usage:', error)
      return 0
    }
  }

  /**
   * Get hourly usage from cache
   */
  private getHourlyUsage(userId: string, planId: string): number {
    const cacheKey = `${userId}:${planId}`
    const userUsage = this.usageCache.get(cacheKey) || []
    
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
    return userUsage.filter(usage => usage.timestamp > oneHourAgo).length
  }

  /**
   * Get hourly limit based on plan
   */
  private getHourlyLimit(planId: string): number {
    switch (planId) {
      case 'enterprise':
        return 100
      case 'pro':
        return 50
      case 'pilot':
        return 10
      default:
        return 5
    }
  }

  /**
   * Get next reset time (first day of next month)
   */
  private getNextResetTime(): Date {
    const now = new Date()
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
    return nextMonth
  }

  /**
   * Save usage to database
   */
  private async saveUsageToDatabase(usage: UsageRecord): Promise<void> {
    try {
      const supabase = createServerSupabaseClient()
      
      const telemetryData = {
        org_id: 'default-org', // TODO: Get from auth context
        user_id: usage.userId,
        event_type: 'gpt_call',
        event_data: {
          tokens: usage.tokens,
          endpoint: usage.endpoint,
          planId: usage.planId
        },
        metadata: {
          timestamp: usage.timestamp.toISOString(),
          usageType: 'api_call'
        }
      }

      const { error } = await supabase
        .from('telemetry_events')
        .insert(telemetryData)

      if (error) {
        console.error('Error saving usage to database:', error)
      }

    } catch (error) {
      console.error('Error saving usage to database:', error)
    }
  }

  /**
   * Clean up old cache entries
   */
  private cleanupCache(): void {
    const cutoff = new Date(Date.now() - this.CACHE_TTL)
    
    for (const [key, usage] of this.usageCache.entries()) {
      const filteredUsage = usage.filter(record => record.timestamp > cutoff)
      if (filteredUsage.length === 0) {
        this.usageCache.delete(key)
      } else {
        this.usageCache.set(key, filteredUsage)
      }
    }
  }

  /**
   * Get rate limit statistics
   */
  getRateLimitStats() {
    const stats = {
      totalUsers: this.usageCache.size,
      totalUsage: 0,
      cacheSize: 0
    }

    for (const usage of this.usageCache.values()) {
      stats.totalUsage += usage.length
      stats.cacheSize += usage.length
    }

    return stats
  }

  /**
   * Reset rate limits for testing
   */
  resetLimits(userId: string, planId: string): void {
    const cacheKey = `${userId}:${planId}`
    this.usageCache.delete(cacheKey)
  }
}

// Export singleton instance
export const rateLimiter = RateLimiter.getInstance()
