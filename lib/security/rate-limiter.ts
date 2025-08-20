/**
 * lib/security/rate-limiter.ts
 * 
 * Rate Limiting System
 * - Prevent API abuse
 * - Ensure fair usage
 * - Multiple rate limit strategies
 * - Configurable limits per user/plan
 */

import { supabase } from '../supabase';

export interface RateLimitConfig {
  requests_per_minute: number;
  requests_per_hour: number;
  requests_per_day: number;
  burst_limit: number;
  window_size_ms: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  reset_time: Date;
  limit_type: string;
  retry_after?: number;
}

export interface RateLimitKey {
  key: string;
  type: 'user' | 'ip' | 'api_key' | 'endpoint';
  identifier: string;
}

export class RateLimiter {
  private static instance: RateLimiter;
  private defaultConfigs: Map<string, RateLimitConfig>;

  private constructor() {
    this.defaultConfigs = new Map();
    this.initializeDefaultConfigs();
  }

  public static getInstance(): RateLimiter {
    if (!RateLimiter.instance) {
      RateLimiter.instance = new RateLimiter();
    }
    return RateLimiter.instance;
  }

  /**
   * Initialize default rate limit configurations
   */
  private initializeDefaultConfigs(): void {
    // Free plan limits
    this.defaultConfigs.set('free', {
      requests_per_minute: 10,
      requests_per_hour: 100,
      requests_per_day: 1000,
      burst_limit: 5,
      window_size_ms: 60000
    });

    // Pro plan limits
    this.defaultConfigs.set('pro', {
      requests_per_minute: 100,
      requests_per_hour: 1000,
      requests_per_day: 10000,
      burst_limit: 50,
      window_size_ms: 60000
    });

    // Enterprise plan limits
    this.defaultConfigs.set('enterprise', {
      requests_per_minute: 1000,
      requests_per_hour: 10000,
      requests_per_day: 100000,
      burst_limit: 500,
      window_size_ms: 60000
    });

    // API key limits
    this.defaultConfigs.set('api_key', {
      requests_per_minute: 200,
      requests_per_hour: 2000,
      requests_per_day: 20000,
      burst_limit: 100,
      window_size_ms: 60000
    });

    // IP-based limits
    this.defaultConfigs.set('ip', {
      requests_per_minute: 50,
      requests_per_hour: 500,
      requests_per_day: 5000,
      burst_limit: 25,
      window_size_ms: 60000
    });
  }

  /**
   * Check rate limit for a specific key
   */
  async checkRateLimit(
    rateLimitKey: RateLimitKey,
    config?: RateLimitConfig
  ): Promise<RateLimitResult> {
    try {
      const limitConfig = config || this.getDefaultConfig(rateLimitKey.type);
      
      // Check all time windows
      const minuteCheck = await this.checkWindow(rateLimitKey, 'minute', limitConfig.requests_per_minute);
      if (!minuteCheck.allowed) {
        return {
          allowed: false,
          remaining: 0,
          reset_time: minuteCheck.reset_time,
          limit_type: 'per_minute',
          retry_after: minuteCheck.retry_after
        };
      }

      const hourCheck = await this.checkWindow(rateLimitKey, 'hour', limitConfig.requests_per_hour);
      if (!hourCheck.allowed) {
        return {
          allowed: false,
          remaining: 0,
          reset_time: hourCheck.reset_time,
          limit_type: 'per_hour',
          retry_after: hourCheck.retry_after
        };
      }

      const dayCheck = await this.checkWindow(rateLimitKey, 'day', limitConfig.requests_per_day);
      if (!dayCheck.allowed) {
        return {
          allowed: false,
          remaining: 0,
          reset_time: dayCheck.reset_time,
          limit_type: 'per_day',
          retry_after: dayCheck.retry_after
        };
      }

      // All checks passed
      return {
        allowed: true,
        remaining: Math.min(minuteCheck.remaining, hourCheck.remaining, dayCheck.remaining),
        reset_time: minuteCheck.reset_time,
        limit_type: 'all'
      };
    } catch (error) {
      console.error('Error checking rate limit:', error);
      // Fail open in case of error
      return {
        allowed: true,
        remaining: 999,
        reset_time: new Date(),
        limit_type: 'error'
      };
    }
  }

  /**
   * Check rate limit for a specific time window
   */
  private async checkWindow(
    rateLimitKey: RateLimitKey,
    window: 'minute' | 'hour' | 'day',
    limit: number
  ): Promise<{ allowed: boolean; remaining: number; reset_time: Date; retry_after?: number }> {
    try {
      const now = new Date();
      let windowStart: Date;
      let windowEnd: Date;

      switch (window) {
        case 'minute':
          windowStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes(), 0, 0);
          windowEnd = new Date(windowStart.getTime() + 60000);
          break;
        case 'hour':
          windowStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), 0, 0, 0);
          windowEnd = new Date(windowStart.getTime() + 3600000);
          break;
        case 'day':
          windowStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
          windowEnd = new Date(windowStart.getTime() + 86400000);
          break;
        default:
          throw new Error(`Invalid window type: ${window}`);
      }

      // Get current usage count
      const { count: currentUsage, error } = await supabase
        .from('rate_limit_usage')
        .select('*', { count: 'exact', head: true })
        .eq('rate_limit_key', this.generateKeyString(rateLimitKey))
        .eq('window_type', window)
        .gte('window_start', windowStart.toISOString())
        .lt('window_start', windowEnd.toISOString());

      if (error) throw error;

      const usage = currentUsage || 0;
      const remaining = Math.max(0, limit - usage);
      const allowed = usage < limit;

      if (!allowed) {
        const retryAfter = Math.ceil((windowEnd.getTime() - now.getTime()) / 1000);
        return {
          allowed: false,
          remaining: 0,
          reset_time: windowEnd,
          retry_after: retryAfter
        };
      }

      return {
        allowed: true,
        remaining,
        reset_time: windowEnd
      };
    } catch (error) {
      console.error(`Error checking ${window} window:`, error);
      throw error;
    }
  }

  /**
   * Record usage for rate limiting
   */
  async recordUsage(
    rateLimitKey: RateLimitKey,
    endpoint: string,
    responseTime: number,
    statusCode: number
  ): Promise<void> {
    try {
      const now = new Date();
      
      // Record usage for all time windows
      await Promise.all([
        this.recordWindowUsage(rateLimitKey, 'minute', now),
        this.recordWindowUsage(rateLimitKey, 'hour', now),
        this.recordWindowUsage(rateLimitKey, 'day', now)
      ]);

      // Log detailed usage
      await supabase
        .from('rate_limit_usage_log')
        .insert({
          rate_limit_key: this.generateKeyString(rateLimitKey),
          endpoint,
          response_time: responseTime,
          status_code: statusCode,
          timestamp: now.toISOString(),
          key_type: rateLimitKey.type,
          identifier: rateLimitKey.identifier
        });

    } catch (error) {
      console.error('Error recording rate limit usage:', error);
    }
  }

  /**
   * Record usage for a specific time window
   */
  private async recordWindowUsage(
    rateLimitKey: RateLimitKey,
    window: 'minute' | 'hour' | 'day',
    timestamp: Date
  ): Promise<void> {
    try {
      let windowStart: Date;

      switch (window) {
        case 'minute':
          windowStart = new Date(timestamp.getFullYear(), timestamp.getMonth(), timestamp.getDate(), timestamp.getHours(), timestamp.getMinutes(), 0, 0);
          break;
        case 'hour':
          windowStart = new Date(timestamp.getFullYear(), timestamp.getMonth(), timestamp.getDate(), timestamp.getHours(), 0, 0, 0);
          break;
        case 'day':
          windowStart = new Date(timestamp.getFullYear(), timestamp.getMonth(), timestamp.getDate(), 0, 0, 0, 0);
          break;
        default:
          throw new Error(`Invalid window type: ${window}`);
      }

      // Upsert usage record
      const { error } = await supabase
        .from('rate_limit_usage')
        .upsert({
          rate_limit_key: this.generateKeyString(rateLimitKey),
          window_type: window,
          window_start: windowStart.toISOString(),
          usage_count: 1,
          last_used: timestamp.toISOString()
        }, {
          onConflict: 'rate_limit_key,window_type,window_start'
        });

      if (error) throw error;

    } catch (error) {
      console.error(`Error recording ${window} window usage:`, error);
    }
  }

  /**
   * Get rate limit configuration for a user/plan
   */
  async getRateLimitConfig(
    userId?: string,
    orgId?: string,
    plan?: string
  ): Promise<RateLimitConfig> {
    try {
      if (userId && orgId) {
        // Get user's plan from database
        const { data: subscription, error } = await supabase
          .from('subscriptions')
          .select('plan_id')
          .eq('org_id', orgId)
          .eq('status', 'active')
          .single();

        if (!error && subscription) {
          const { data: planData } = await supabase
            .from('plans')
            .select('rate_limits')
            .eq('id', subscription.plan_id)
            .single();

          if (planData?.rate_limits) {
            return JSON.parse(planData.rate_limits);
          }
        }
      }

      // Fall back to plan-based defaults
      if (plan && this.defaultConfigs.has(plan)) {
        return this.defaultConfigs.get(plan)!;
      }

      // Default to free plan limits
      return this.defaultConfigs.get('free')!;
    } catch (error) {
      console.error('Error getting rate limit config:', error);
      return this.defaultConfigs.get('free')!;
    }
  }

  /**
   * Get default configuration for a key type
   */
  private getDefaultConfig(keyType: string): RateLimitConfig {
    if (this.defaultConfigs.has(keyType)) {
      return this.defaultConfigs.get(keyType)!;
    }
    return this.defaultConfigs.get('free')!;
  }

  /**
   * Generate unique key string for rate limiting
   */
  private generateKeyString(rateLimitKey: RateLimitKey): string {
    return `${rateLimitKey.type}:${rateLimitKey.identifier}`;
  }

  /**
   * Get rate limit statistics
   */
  async getRateLimitStats(
    orgId?: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<{
    total_requests: number;
    blocked_requests: number;
    average_response_time: number;
    top_endpoints: Array<{ endpoint: string; count: number }>;
    top_users: Array<{ user_id: string; count: number }>;
    top_ips: Array<{ ip: string; count: number }>;
  }> {
    try {
      let query = supabase
        .from('rate_limit_usage_log')
        .select('*');

      if (orgId) {
        // This would need to be joined with user/org data
        // For now, return global stats
      }
      if (startDate) {
        query = query.gte('timestamp', startDate.toISOString());
      }
      if (endDate) {
        query = query.lte('timestamp', endDate.toISOString());
      }

      const { data: logs, error } = await query;
      if (error) throw error;

      const events = logs || [];

      // Calculate statistics
      const totalRequests = events.length;
      const blockedRequests = events.filter(e => e.status_code === 429).length;
      const averageResponseTime = events.reduce((sum, e) => sum + e.response_time, 0) / totalRequests || 0;

      // Top endpoints
      const endpointCounts: Record<string, number> = {};
      events.forEach(e => {
        endpointCounts[e.endpoint] = (endpointCounts[e.endpoint] || 0) + 1;
      });
      const topEndpoints = Object.entries(endpointCounts)
        .map(([endpoint, count]) => ({ endpoint, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Top users
      const userCounts: Record<string, number> = {};
      events.forEach(e => {
        if (e.identifier && e.key_type === 'user') {
          userCounts[e.identifier] = (userCounts[e.identifier] || 0) + 1;
        }
      });
      const topUsers = Object.entries(userCounts)
        .map(([user_id, count]) => ({ user_id, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Top IPs
      const ipCounts: Record<string, number> = {};
      events.forEach(e => {
        if (e.identifier && e.key_type === 'ip') {
          ipCounts[e.identifier] = (ipCounts[e.identifier] || 0) + 1;
        }
      });
      const topIPs = Object.entries(ipCounts)
        .map(([ip, count]) => ({ ip, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      return {
        total_requests: totalRequests,
        blocked_requests: blockedRequests,
        average_response_time: averageResponseTime,
        top_endpoints: topEndpoints,
        top_users: topUsers,
        top_ips: topIPs
      };
    } catch (error) {
      console.error('Error getting rate limit stats:', error);
      return {
        total_requests: 0,
        blocked_requests: 0,
        average_response_time: 0,
        top_endpoints: [],
        top_users: [],
        top_ips: []
      };
    }
  }

  /**
   * Clean up old rate limit data
   */
  async cleanupOldData(retentionDays: number = 30): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

      // Clean up old usage records
      const { data: usageData, error: usageError } = await supabase
        .from('rate_limit_usage')
        .delete()
        .lt('last_used', cutoffDate.toISOString())
        .select('id');

      if (usageError) throw usageError;

      // Clean up old usage logs
      const { data: logData, error: logError } = await supabase
        .from('rate_limit_usage_log')
        .delete()
        .lt('timestamp', cutoffDate.toISOString())
        .select('id');

      if (logError) throw logError;

      return (usageData?.length || 0) + (logData?.length || 0);
    } catch (error) {
      console.error('Error cleaning up old rate limit data:', error);
      return 0;
    }
  }

  /**
   * Reset rate limits for a specific key
   */
  async resetRateLimits(rateLimitKey: RateLimitKey): Promise<void> {
    try {
      const keyString = this.generateKeyString(rateLimitKey);

      // Delete all usage records for this key
      await supabase
        .from('rate_limit_usage')
        .delete()
        .eq('rate_limit_key', keyString);

      // Delete all usage logs for this key
      await supabase
        .from('rate_limit_usage_log')
        .delete()
        .eq('rate_limit_key', keyString);

    } catch (error) {
      console.error('Error resetting rate limits:', error);
    }
  }
}

export const rateLimiter = RateLimiter.getInstance();
