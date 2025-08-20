/**
 * lib/security/security-middleware.ts
 * 
 * Next.js Security Middleware
 * - Integrates with all security systems
 * - Provides request/response security
 * - Handles authentication and authorization
 * - Logs security events
 */

import { NextRequest, NextResponse } from 'next/server';
import { securityManager, SecurityContext } from './security-manager';
import { auditLogger } from './audit-logger';
import { rateLimiter, RateLimitKey } from './rate-limiter';

export interface SecurityMiddlewareConfig {
  enabled: boolean;
  requireApiKey: boolean;
  requireAuthentication: boolean;
  logAllRequests: boolean;
  blockSuspiciousRequests: boolean;
  rateLimitEnabled: boolean;
}

export class SecurityMiddleware {
  private static instance: SecurityMiddleware;
  private config: SecurityMiddlewareConfig;

  private constructor() {
    this.config = {
      enabled: true,
      requireApiKey: true,
      requireAuthentication: false,
      logAllRequests: true,
      blockSuspiciousRequests: true,
      rateLimitEnabled: true
    };
  }

  public static getInstance(): SecurityMiddleware {
    if (!SecurityMiddleware.instance) {
      SecurityMiddleware.instance = new SecurityMiddleware();
    }
    return SecurityMiddleware.instance;
  }

  /**
   * Process incoming request through security middleware
   */
  async processRequest(
    request: NextRequest,
    context?: {
      userId?: string;
      orgId?: string;
      sessionId?: string;
    }
  ): Promise<NextResponse | null> {
    if (!this.config.enabled) {
      return null;
    }

    const startTime = Date.now();
    const url = new URL(request.url);
    const endpoint = url.pathname;
    const method = request.method;
    const ipAddress = this.getClientIP(request);
    const userAgent = request.headers.get('user-agent') || '';

    try {
      // 1. Extract API key from headers
      const apiKey = request.headers.get('x-api-key') || 
                    request.headers.get('authorization')?.replace('Bearer ', '') ||
                    url.searchParams.get('api_key');

      // 2. Create security context
      const securityContext: SecurityContext = {
        userId: context?.userId,
        orgId: context?.orgId,
        ipAddress,
        userAgent,
        sessionId: context?.sessionId,
        apiKey,
        endpoint,
        method,
        requestBody: await this.extractRequestBody(request),
        headers: Object.fromEntries(request.headers.entries())
      };

      // 3. Perform comprehensive security check
      const securityResult = await securityManager.performSecurityCheck(securityContext);

      if (!securityResult.allowed) {
        // Log blocked request
        await this.logBlockedRequest(securityContext, securityResult);

        // Return appropriate error response
        return this.createErrorResponse(securityResult, 403);
      }

      // 4. Apply rate limiting if enabled
      if (this.config.rateLimitEnabled) {
        const rateLimitResult = await this.applyRateLimiting(securityContext);
        if (!rateLimitResult.allowed) {
          return this.createRateLimitResponse(rateLimitResult);
        }
      }

      // 5. Log successful request
      if (this.config.logAllRequests) {
        await this.logSuccessfulRequest(securityContext, securityResult, Date.now() - startTime);
      }

      // 6. Return null to continue with normal processing
      return null;

    } catch (error) {
      console.error('Security middleware error:', error);
      
      // Log security error
      await this.logSecurityError(securityContext, error);
      
      // Return error response
      return this.createErrorResponse({
        allowed: false,
        reason: 'Security middleware error',
        auditRequired: true,
        securityScore: 0,
        warnings: [`Security error: ${error}`]
      }, 500);
    }
  }

  /**
   * Process response through security middleware
   */
  async processResponse(
    request: NextRequest,
    response: NextResponse,
    context?: {
      userId?: string;
      orgId?: string;
      sessionId?: string;
    }
  ): Promise<NextResponse> {
    if (!this.config.enabled) {
      return response;
    }

    try {
      const url = new URL(request.url);
      const endpoint = url.pathname;
      const method = request.method;
      const ipAddress = this.getClientIP(request);
      const userAgent = request.headers.get('user-agent') || '';

      // Log response for security monitoring
      await auditLogger.logApiUsage(
        endpoint,
        method,
        response.status,
        Date.now(), // Would need actual response time
        context?.userId,
        context?.orgId,
        undefined, // API key ID
        ipAddress,
        userAgent
      );

      // Add security headers
      const securedResponse = this.addSecurityHeaders(response);

      return securedResponse;

    } catch (error) {
      console.error('Error processing response:', error);
      return response;
    }
  }

  /**
   * Extract request body safely
   */
  private async extractRequestBody(request: NextRequest): Promise<any> {
    try {
      const contentType = request.headers.get('content-type') || '';
      
      if (contentType.includes('application/json')) {
        return await request.json();
      } else if (contentType.includes('text/plain')) {
        return await request.text();
      } else if (contentType.includes('application/x-www-form-urlencoded')) {
        const formData = await request.formData();
        const body: Record<string, any> = {};
        for (const [key, value] of formData.entries()) {
          body[key] = value;
        }
        return body;
      }
      
      return null;
    } catch (error) {
      console.error('Error extracting request body:', error);
      return null;
    }
  }

  /**
   * Get client IP address
   */
  private getClientIP(request: NextRequest): string {
    return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
           request.headers.get('x-real-ip') ||
           request.ip ||
           'unknown';
  }

  /**
   * Apply rate limiting
   */
  private async applyRateLimiting(context: SecurityContext): Promise<any> {
    try {
      let rateLimitKey: RateLimitKey;

      if (context.apiKey) {
        rateLimitKey = {
          key: context.apiKey,
          type: 'api_key',
          identifier: context.apiKey
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

      return await rateLimiter.checkRateLimit(rateLimitKey);
    } catch (error) {
      console.error('Rate limiting error:', error);
      // Fail open - allow request to continue
      return { allowed: true, remaining: 999, reset_time: new Date(), limit_type: 'error' };
    }
  }

  /**
   * Add security headers to response
   */
  private addSecurityHeaders(response: NextResponse): NextResponse {
    const securedResponse = NextResponse.next();
    
    // Copy headers from original response
    response.headers.forEach((value, key) => {
      securedResponse.headers.set(key, value);
    });

    // Add security headers
    securedResponse.headers.set('X-Content-Type-Options', 'nosniff');
    securedResponse.headers.set('X-Frame-Options', 'DENY');
    securedResponse.headers.set('X-XSS-Protection', '1; mode=block');
    securedResponse.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    securedResponse.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    
    // Content Security Policy
    securedResponse.headers.set('Content-Security-Policy', 
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:; frame-ancestors 'none';"
    );

    return securedResponse;
  }

  /**
   * Create error response
   */
  private createErrorResponse(
    securityResult: any,
    statusCode: number
  ): NextResponse {
    const errorResponse = {
      error: true,
      message: securityResult.reason || 'Access denied',
      code: statusCode,
      timestamp: new Date().toISOString(),
      request_id: this.generateRequestId(),
      security_score: securityResult.securityScore,
      warnings: securityResult.warnings
    };

    return NextResponse.json(errorResponse, { status: statusCode });
  }

  /**
   * Create rate limit response
   */
  private createRateLimitResponse(rateLimitResult: any): NextResponse {
    const response = NextResponse.json({
      error: true,
      message: 'Rate limit exceeded',
      code: 429,
      timestamp: new Date().toISOString(),
      request_id: this.generateRequestId(),
      retry_after: rateLimitResult.retry_after,
      limit_type: rateLimitResult.limit_type
    }, { status: 429 });

    // Add rate limit headers
    if (rateLimitResult.retry_after) {
      response.headers.set('Retry-After', rateLimitResult.retry_after.toString());
    }
    response.headers.set('X-RateLimit-Limit', '1000');
    response.headers.set('X-RateLimit-Remaining', '0');
    response.headers.set('X-RateLimit-Reset', rateLimitResult.reset_time.toISOString());

    return response;
  }

  /**
   * Log blocked request
   */
  private async logBlockedRequest(
    context: SecurityContext,
    result: any
  ): Promise<void> {
    try {
      await auditLogger.logAccessAttempt(
        'security_middleware',
        'request',
        context.endpoint,
        'blocked',
        context.userId,
        context.orgId,
        context.ipAddress,
        context.userAgent
      );
    } catch (error) {
      console.error('Error logging blocked request:', error);
    }
  }

  /**
   * Log successful request
   */
  private async logSuccessfulRequest(
    context: SecurityContext,
    result: any,
    responseTime: number
  ): Promise<void> {
    try {
      await auditLogger.logAccessAttempt(
        'security_middleware',
        'request',
        context.endpoint,
        'success',
        context.userId,
        context.orgId,
        context.ipAddress,
        context.userAgent
      );
    } catch (error) {
      console.error('Error logging successful request:', error);
    }
  }

  /**
   * Log security error
   */
  private async logSecurityError(
    context: SecurityContext,
    error: any
  ): Promise<void> {
    try {
      await auditLogger.logSecurityEvent(
        'SECURITY_MIDDLEWARE_ERROR',
        'security_middleware',
        {
          error: error.message,
          stack: error.stack,
          context: {
            endpoint: context.endpoint,
            method: context.method,
            ip_address: context.ipAddress,
            user_agent: context.userAgent
          }
        },
        'high',
        context.userId,
        context.orgId
      );
    } catch (logError) {
      console.error('Error logging security error:', logError);
    }
  }

  /**
   * Generate unique request ID
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Update middleware configuration
   */
  updateConfig(updates: Partial<SecurityMiddlewareConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  /**
   * Get current configuration
   */
  getConfig(): SecurityMiddlewareConfig {
    return { ...this.config };
  }

  /**
   * Enable/disable middleware
   */
  setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
  }

  /**
   * Check if middleware is enabled
   */
  isEnabled(): boolean {
    return this.config.enabled;
  }
}

export const securityMiddleware = SecurityMiddleware.getInstance();

/**
 * Next.js middleware function
 */
export function middleware(request: NextRequest) {
  return securityMiddleware.processRequest(request);
}

/**
 * Configure middleware for specific paths
 */
export const config = {
  matcher: [
    '/api/:path*',
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
