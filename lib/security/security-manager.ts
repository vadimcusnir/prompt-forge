/**
 * lib/security/security-manager.ts
 * 
 * Integrated Security Manager
 * - Coordinates all security systems
 * - Provides unified security interface
 * - Manages security policies
 * - Generates security reports
 */

import { apiKeyManager, ApiKey } from './api-key-manager';
import { inputSanitizer, SanitizationResult } from './input-sanitizer';
import { userIsolation, UserContext, AccessResult } from './user-isolation';
import { auditLogger, AuditEvent } from './audit-logger';
import { rateLimiter, RateLimitKey, RateLimitResult } from './rate-limiter';

export interface SecurityContext {
  userId?: string;
  orgId?: string;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  apiKey?: string;
  endpoint: string;
  method: string;
  requestBody?: any;
  headers?: Record<string, string>;
}

export interface SecurityResult {
  allowed: boolean;
  reason?: string;
  sanitizedData?: any;
  rateLimitInfo?: RateLimitResult;
  auditRequired: boolean;
  securityScore: number; // 0-100
  warnings: string[];
}

export interface SecurityPolicy {
  name: string;
  enabled: boolean;
  priority: number;
  conditions: Record<string, any>;
  actions: string[];
}

export class SecurityManager {
  private static instance: SecurityManager;
  private securityPolicies: Map<string, SecurityPolicy>;

  private constructor() {
    this.securityPolicies = new Map();
    this.initializeSecurityPolicies();
  }

  public static getInstance(): SecurityManager {
    if (!SecurityManager.instance) {
      SecurityManager.instance = new SecurityManager();
    }
    return SecurityManager.instance;
  }

  /**
   * Initialize security policies
   */
  private initializeSecurityPolicies(): void {
    // API Key validation policy
    this.securityPolicies.set('api_key_validation', {
      name: 'API Key Validation',
      enabled: true,
      priority: 1,
      conditions: {
        requires_api_key: true,
        endpoints: ['/api/*']
      },
      actions: ['validate_key', 'check_permissions', 'audit_access']
    });

    // Input sanitization policy
    this.securityPolicies.set('input_sanitization', {
      name: 'Input Sanitization',
      enabled: true,
      priority: 2,
      conditions: {
        applies_to: ['POST', 'PUT', 'PATCH'],
        content_types: ['application/json', 'text/plain']
      },
      actions: ['sanitize_input', 'detect_injection', 'block_malicious']
    });

    // Rate limiting policy
    this.securityPolicies.set('rate_limiting', {
      name: 'Rate Limiting',
      enabled: true,
      priority: 3,
      conditions: {
        applies_to: ['all'],
        enforcement_level: 'strict'
      },
      actions: ['check_rate_limit', 'enforce_limits', 'track_usage']
    });

    // User isolation policy
    this.securityPolicies.set('user_isolation', {
      name: 'User Isolation',
      enabled: true,
      priority: 4,
      conditions: {
        applies_to: ['all'],
        isolation_level: 'strict'
      },
      actions: ['validate_access', 'enforce_isolation', 'audit_access']
    });

    // Audit logging policy
    this.securityPolicies.set('audit_logging', {
      name: 'Audit Logging',
      enabled: true,
      priority: 5,
      conditions: {
        applies_to: ['all'],
        log_level: 'comprehensive'
      },
      actions: ['log_access', 'log_changes', 'generate_reports']
    });
  }

  /**
   * Perform comprehensive security check
   */
  async performSecurityCheck(
    context: SecurityContext
  ): Promise<SecurityResult> {
    const startTime = Date.now();
    const warnings: string[] = [];
    let securityScore = 100;
    let auditRequired = false;

    try {
      // 1. API Key Validation
      let apiKeyData: ApiKey | undefined;
      if (context.apiKey) {
        const apiKeyResult = await this.validateApiKey(context);
        if (!apiKeyResult.allowed) {
          return {
            allowed: false,
            reason: `API key validation failed: ${apiKeyResult.reason}`,
            auditRequired: true,
            securityScore: 0,
            warnings: [apiKeyResult.reason!]
          };
        }
        apiKeyData = apiKeyResult.apiKey;
        securityScore -= 10; // API key reduces security score slightly
      } else {
        securityScore -= 20; // No API key
        warnings.push('No API key provided');
      }

      // 2. Input Sanitization
      let sanitizedData: any = context.requestBody;
      if (context.requestBody && ['POST', 'PUT', 'PATCH'].includes(context.method)) {
        const sanitizationResult = await this.sanitizeInput(context);
        if (sanitizationResult.blocked) {
          return {
            allowed: false,
            reason: `Input blocked: ${sanitizationResult.reason}`,
            auditRequired: true,
            securityScore: 0,
            warnings: [sanitizationResult.reason!]
          };
        }
        sanitizedData = sanitizationResult.sanitized;
        if (sanitizationResult.warnings.length > 0) {
          warnings.push(...sanitizationResult.warnings);
          securityScore -= 5 * sanitizationResult.warnings.length;
        }
      }

      // 3. Rate Limiting
      const rateLimitResult = await this.checkRateLimits(context, apiKeyData);
      if (!rateLimitResult.allowed) {
        return {
          allowed: false,
          reason: `Rate limit exceeded: ${rateLimitResult.limit_type}`,
          auditRequired: true,
          securityScore: 0,
          warnings: [`Rate limit exceeded: ${rateLimitResult.limit_type}`]
        };
      }

      // 4. User Isolation (if user context available)
      if (context.userId && context.orgId) {
        const isolationResult = await this.validateUserAccess(context);
        if (!isolationResult.allowed) {
          return {
            allowed: false,
            reason: `Access denied: ${isolationResult.reason}`,
            auditRequired: true,
            securityScore: 0,
            warnings: [isolationResult.reason!]
          };
        }
        auditRequired = isolationResult.auditRequired;
      }

      // 5. Log security event
      await this.logSecurityEvent(context, {
        allowed: true,
        securityScore,
        warnings,
        responseTime: Date.now() - startTime
      });

      return {
        allowed: true,
        sanitizedData,
        rateLimitInfo: rateLimitResult,
        auditRequired,
        securityScore: Math.max(0, securityScore),
        warnings
      };

    } catch (error) {
      console.error('Security check error:', error);
      
      // Log security failure
      await this.logSecurityEvent(context, {
        allowed: false,
        securityScore: 0,
        warnings: [`Security check error: ${error}`],
        responseTime: Date.now() - startTime
      });

      return {
        allowed: false,
        reason: `Security check error: ${error}`,
        auditRequired: true,
        securityScore: 0,
        warnings: [`Security check error: ${error}`]
      };
    }
  }

  /**
   * Validate API key
   */
  private async validateApiKey(context: SecurityContext): Promise<{
    allowed: boolean;
    apiKey?: ApiKey;
    reason?: string;
  }> {
    if (!context.apiKey) {
      return { allowed: false, reason: 'No API key provided' };
    }

    const result = await apiKeyManager.validateApiKey(
      context.apiKey,
      context.endpoint,
      context.userAgent || '',
      context.ipAddress || ''
    );

    if (result.valid && result.apiKey) {
      // Log API key usage
      await apiKeyManager.logUsage({
        key_id: result.apiKey.id,
        endpoint: context.endpoint,
        response_time: 0,
        status_code: 200,
        user_agent: context.userAgent || '',
        ip_address: context.ipAddress || ''
      });
    }

    return {
      allowed: result.valid,
      apiKey: result.apiKey,
      reason: result.error
    };
  }

  /**
   * Sanitize input
   */
  private async sanitizeInput(context: SecurityContext): Promise<SanitizationResult> {
    if (!context.requestBody) {
      return { sanitized: '', warnings: [], blocked: false };
    }

    // Check for prompt injection specifically
    const injectionCheck = inputSanitizer.detectPromptInjection(
      typeof context.requestBody === 'string' ? context.requestBody : JSON.stringify(context.requestBody)
    );

    if (injectionCheck.detected) {
      return {
        sanitized: '',
        warnings: [`Prompt injection detected with confidence: ${injectionCheck.confidence}`],
        blocked: true,
        reason: 'Prompt injection detected'
      };
    }

    // Sanitize based on content type
    if (typeof context.requestBody === 'string') {
      return inputSanitizer.sanitizePrompt(context.requestBody);
    } else if (typeof context.requestBody === 'object') {
      return inputSanitizer.sanitize7DParams(context.requestBody);
    }

    return { sanitized: context.requestBody, warnings: [], blocked: false };
  }

  /**
   * Check rate limits
   */
  private async checkRateLimits(
    context: SecurityContext,
    apiKeyData?: ApiKey
  ): Promise<RateLimitResult> {
    let rateLimitKey: RateLimitKey;

    if (apiKeyData) {
      rateLimitKey = {
        key: apiKeyData.id,
        type: 'api_key',
        identifier: apiKeyData.id
      };
    } else if (context.userId) {
      rateLimitKey = {
        key: context.userId,
        type: 'user',
        identifier: context.userId
      };
    } else {
      rateLimitKey = {
        key: context.ipAddress || 'unknown',
        type: 'ip',
        identifier: context.ipAddress || 'unknown'
      };
    }

    const config = await rateLimiter.getRateLimitConfig(
      context.userId,
      context.orgId,
      apiKeyData ? 'api_key' : undefined
    );

    return await rateLimiter.checkRateLimit(rateLimitKey, config);
  }

  /**
   * Validate user access
   */
  private async validateUserAccess(context: SecurityContext): Promise<AccessResult> {
    if (!context.userId || !context.orgId) {
      return { allowed: false, reason: 'Missing user context', auditRequired: true };
    }

    // Extract table from endpoint
    const tableMatch = context.endpoint.match(/\/api\/([^\/]+)/);
    const table = tableMatch ? tableMatch[1] : 'unknown';

    const userContext: UserContext = {
      userId: context.userId,
      orgId: context.orgId,
      roles: [], // Would be populated from user data
      permissions: [], // Would be populated from user data
      plan: 'free' // Would be populated from subscription data
    };

    return await userIsolation.validateAccess(
      userContext,
      table,
      this.getOperationFromMethod(context.method),
      undefined,
      context.requestBody
    );
  }

  /**
   * Get operation from HTTP method
   */
  private getOperationFromMethod(method: string): 'read' | 'write' | 'delete' {
    switch (method.toUpperCase()) {
      case 'GET':
        return 'read';
      case 'POST':
      case 'PUT':
      case 'PATCH':
        return 'write';
      case 'DELETE':
        return 'delete';
      default:
        return 'read';
    }
  }

  /**
   * Log security event
   */
  private async logSecurityEvent(
    context: SecurityContext,
    result: {
      allowed: boolean;
      securityScore: number;
      warnings: string[];
      responseTime: number;
    }
  ): Promise<void> {
    const severity: AuditEvent['severity'] = 
      result.allowed ? 'low' : 'high';

    await auditLogger.logEvent({
      event_type: 'SECURITY_CHECK',
      source: 'security_manager',
      user_id: context.userId,
      org_id: context.orgId,
      details: {
        endpoint: context.endpoint,
        method: context.method,
        ip_address: context.ipAddress,
        user_agent: context.userAgent,
        session_id: context.sessionId,
        api_key_provided: !!context.apiKey,
        allowed: result.allowed,
        security_score: result.securityScore,
        warnings: result.warnings,
        response_time: result.responseTime
      },
      severity,
      ip_address: context.ipAddress,
      user_agent: context.userAgent,
      session_id: context.sessionId,
      outcome: result.allowed ? 'success' : 'failure'
    });
  }

  /**
   * Get security statistics
   */
  async getSecurityStats(
    orgId?: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<{
    total_requests: number;
    blocked_requests: number;
    security_score_average: number;
    top_threats: Array<{ threat_type: string; count: number }>;
    top_endpoints: Array<{ endpoint: string; blocked_count: number }>;
    api_key_usage: number;
    rate_limit_violations: number;
  }> {
    try {
      // Get audit logs for security events
      const { logs } = await auditLogger.queryAuditLogs({
        event_type: 'SECURITY_CHECK',
        org_id: orgId,
        start_date: startDate,
        end_date: endDate
      }, 10000, 0);

      const events = logs || [];

      // Calculate statistics
      const totalRequests = events.length;
      const blockedRequests = events.filter(e => !e.allowed).length;
      const securityScoreSum = events.reduce((sum, e) => sum + (e.security_score || 0), 0);
      const securityScoreAverage = totalRequests > 0 ? securityScoreSum / totalRequests : 0;

      // Top threats
      const threatCounts: Record<string, number> = {};
      events.forEach(e => {
        if (e.warnings && Array.isArray(e.warnings)) {
          e.warnings.forEach(warning => {
            const threatType = this.categorizeThreat(warning);
            threatCounts[threatType] = (threatCounts[threatType] || 0) + 1;
          });
        }
      });

      const topThreats = Object.entries(threatCounts)
        .map(([threat_type, count]) => ({ threat_type, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Top endpoints by blocked requests
      const endpointBlockedCounts: Record<string, number> = {};
      events.forEach(e => {
        if (!e.allowed) {
          endpointBlockedCounts[e.endpoint] = (endpointBlockedCounts[e.endpoint] || 0) + 1;
        }
      });

      const topEndpoints = Object.entries(endpointBlockedCounts)
        .map(([endpoint, blocked_count]) => ({ endpoint, blocked_count }))
        .sort((a, b) => b.blocked_count - a.blocked_count)
        .slice(0, 10);

      // API key usage
      const apiKeyUsage = events.filter(e => e.api_key_provided).length;

      // Rate limit violations
      const rateLimitViolations = events.filter(e => 
        e.warnings && e.warnings.some(w => w.includes('rate limit'))
      ).length;

      return {
        total_requests: totalRequests,
        blocked_requests: blockedRequests,
        security_score_average: securityScoreAverage,
        top_threats: topThreats,
        top_endpoints: topEndpoints,
        api_key_usage: apiKeyUsage,
        rate_limit_violations: rateLimitViolations
      };
    } catch (error) {
      console.error('Error getting security stats:', error);
      return {
        total_requests: 0,
        blocked_requests: 0,
        security_score_average: 0,
        top_threats: [],
        top_endpoints: [],
        api_key_usage: 0,
        rate_limit_violations: 0
      };
    }
  }

  /**
   * Categorize threat from warning message
   */
  private categorizeThreat(warning: string): string {
    const lowerWarning = warning.toLowerCase();
    
    if (lowerWarning.includes('injection')) return 'Prompt Injection';
    if (lowerWarning.includes('rate limit')) return 'Rate Limiting';
    if (lowerWarning.includes('api key')) return 'API Key Issues';
    if (lowerWarning.includes('access')) return 'Access Control';
    if (lowerWarning.includes('sanitization')) return 'Input Sanitization';
    if (lowerWarning.includes('isolation')) return 'User Isolation';
    
    return 'Other';
  }

  /**
   * Update security policy
   */
  updateSecurityPolicy(
    policyName: string,
    updates: Partial<SecurityPolicy>
  ): boolean {
    const policy = this.securityPolicies.get(policyName);
    if (!policy) return false;

    this.securityPolicies.set(policyName, { ...policy, ...updates });
    return true;
  }

  /**
   * Get all security policies
   */
  getSecurityPolicies(): SecurityPolicy[] {
    return Array.from(this.securityPolicies.values());
  }

  /**
   * Export security report
   */
  async exportSecurityReport(
    orgId?: string,
    startDate?: Date,
    endDate?: Date,
    format: 'json' | 'csv' = 'json'
  ): Promise<string> {
    try {
      const stats = await this.getSecurityStats(orgId, startDate, endDate);
      const policies = this.getSecurityPolicies();

      const report = {
        generated_at: new Date().toISOString(),
        organization_id: orgId,
        date_range: {
          start: startDate?.toISOString(),
          end: endDate?.toISOString()
        },
        statistics: stats,
        policies: policies,
        summary: {
          total_requests: stats.total_requests,
          blocked_requests: stats.blocked_requests,
          security_score: stats.security_score_average,
          threat_level: this.calculateThreatLevel(stats)
        }
      };

      if (format === 'csv') {
        return this.convertSecurityReportToCSV(report);
      } else {
        return JSON.stringify(report, null, 2);
      }
    } catch (error) {
      console.error('Error exporting security report:', error);
      return '';
    }
  }

  /**
   * Calculate threat level
   */
  private calculateThreatLevel(stats: any): 'low' | 'medium' | 'high' | 'critical' {
    const blockedPercentage = stats.total_requests > 0 ? 
      (stats.blocked_requests / stats.total_requests) * 100 : 0;
    
    if (blockedPercentage > 20) return 'critical';
    if (blockedPercentage > 10) return 'high';
    if (blockedPercentage > 5) return 'medium';
    return 'low';
  }

  /**
   * Convert security report to CSV
   */
  private convertSecurityReportToCSV(report: any): string {
    const csvRows = [
      'Security Report',
      `Generated: ${report.generated_at}`,
      `Organization: ${report.organization_id || 'All'}`,
      `Date Range: ${report.date_range.start || 'N/A'} to ${report.date_range.end || 'N/A'}`,
      '',
      'Statistics',
      `Total Requests,${report.statistics.total_requests}`,
      `Blocked Requests,${report.statistics.blocked_requests}`,
      `Security Score,${report.statistics.security_score_average}`,
      `API Key Usage,${report.statistics.api_key_usage}`,
      `Rate Limit Violations,${report.statistics.rate_limit_violations}`,
      '',
      'Threat Level',
      report.summary.threat_level
    ];

    return csvRows.join('\n');
  }
}

export const securityManager = SecurityManager.getInstance();
