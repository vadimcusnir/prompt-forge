/**
 * lib/security/audit-logger.ts
 * 
 * Comprehensive Audit Logging System
 * - Track all system access and changes
 * - Log security events
 * - Monitor user activities
 * - Generate audit reports
 */

import { supabase } from '../supabase';

export interface AuditEvent {
  event_type: string;
  source: string;
  user_id?: string;
  org_id?: string;
  details: Record<string, any>;
  severity: 'low' | 'medium' | 'high' | 'critical';
  ip_address?: string;
  user_agent?: string;
  session_id?: string;
  resource_type?: string;
  resource_id?: string;
  operation?: string;
  outcome: 'success' | 'failure' | 'warning';
  timestamp: Date;
}

export interface AuditFilter {
  event_type?: string;
  source?: string;
  user_id?: string;
  org_id?: string;
  severity?: string;
  resource_type?: string;
  operation?: string;
  outcome?: string;
  start_date?: Date;
  end_date?: Date;
}

export interface AuditStats {
  total_events: number;
  events_by_type: Record<string, number>;
  events_by_severity: Record<string, number>;
  events_by_outcome: Record<string, number>;
  events_by_source: Record<string, number>;
  top_users: Array<{ user_id: string; count: number }>;
  top_resources: Array<{ resource_type: string; count: number }>;
}

export class AuditLogger {
  private static instance: AuditLogger;
  private batchSize: number = 100;
  private batchTimeout: number = 5000; // 5 seconds
  private eventBuffer: AuditEvent[] = [];
  private batchTimer: NodeJS.Timeout | null = null;

  private constructor() {
    this.startBatchTimer();
  }

  public static getInstance(): AuditLogger {
    if (!AuditLogger.instance) {
      AuditLogger.instance = new AuditLogger();
    }
    return AuditLogger.instance;
  }

  /**
   * Log an audit event
   */
  async logEvent(event: Omit<AuditEvent, 'timestamp'>): Promise<void> {
    const auditEvent: AuditEvent = {
      ...event,
      timestamp: new Date()
    };

    // Add to buffer for batch processing
    this.eventBuffer.push(auditEvent);

    // Flush buffer if it reaches batch size
    if (this.eventBuffer.length >= this.batchSize) {
      await this.flushBuffer();
    }
  }

  /**
   * Log security event
   */
  async logSecurityEvent(
    eventType: string,
    source: string,
    details: Record<string, any>,
    severity: AuditEvent['severity'],
    userId?: string,
    orgId?: string
  ): Promise<void> {
    await this.logEvent({
      event_type: eventType,
      source,
      user_id: userId,
      org_id: orgId,
      details,
      severity,
      outcome: 'success'
    });
  }

  /**
   * Log access attempt
   */
  async logAccessAttempt(
    source: string,
    resourceType: string,
    resourceId: string,
    operation: string,
    outcome: 'success' | 'failure',
    userId?: string,
    orgId?: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    const severity: AuditEvent['severity'] = outcome === 'failure' ? 'high' : 'low';
    
    await this.logEvent({
      event_type: 'ACCESS_ATTEMPT',
      source,
      user_id: userId,
      org_id: orgId,
      details: {
        resource_type: resourceType,
        resource_id: resourceId,
        operation,
        outcome
      },
      severity,
      ip_address: ipAddress,
      user_agent: userAgent,
      resource_type: resourceType,
      resource_id: resourceId,
      operation,
      outcome
    });
  }

  /**
   * Log data modification
   */
  async logDataModification(
    source: string,
    resourceType: string,
    resourceId: string,
    operation: 'create' | 'update' | 'delete',
    changes: Record<string, any>,
    userId?: string,
    orgId?: string
  ): Promise<void> {
    const severity: AuditEvent['severity'] = operation === 'delete' ? 'high' : 'medium';
    
    await this.logEvent({
      event_type: 'DATA_MODIFICATION',
      source,
      user_id: userId,
      org_id: orgId,
      details: {
        resource_type: resourceType,
        resource_id: resourceId,
        operation,
        changes,
        timestamp: new Date().toISOString()
      },
      severity,
      resource_type: resourceType,
      resource_id: resourceId,
      operation,
      outcome: 'success'
    });
  }

  /**
   * Log authentication event
   */
  async logAuthenticationEvent(
    eventType: 'LOGIN' | 'LOGOUT' | 'LOGIN_FAILED' | 'PASSWORD_CHANGE' | 'MFA_ENABLED' | 'MFA_DISABLED',
    source: string,
    userId?: string,
    orgId?: string,
    ipAddress?: string,
    userAgent?: string,
    details?: Record<string, any>
  ): Promise<void> {
    const severity: AuditEvent['severity'] = 
      eventType === 'LOGIN_FAILED' ? 'high' : 'low';
    
    await this.logEvent({
      event_type: eventType,
      source,
      user_id: userId,
      org_id: orgId,
      details: {
        ...details,
        ip_address: ipAddress,
        user_agent: userAgent
      },
      severity,
      ip_address: ipAddress,
      user_agent: userAgent,
      outcome: eventType === 'LOGIN_FAILED' ? 'failure' : 'success'
    });
  }

  /**
   * Log API usage
   */
  async logApiUsage(
    endpoint: string,
    method: string,
    statusCode: number,
    responseTime: number,
    userId?: string,
    orgId?: string,
    apiKeyId?: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    const severity: AuditEvent['severity'] = 
      statusCode >= 400 ? 'medium' : 'low';
    
    await this.logEvent({
      event_type: 'API_USAGE',
      source: 'api',
      user_id: userId,
      org_id: orgId,
      details: {
        endpoint,
        method,
        status_code: statusCode,
        response_time: responseTime,
        api_key_id: apiKeyId
      },
      severity,
      ip_address: ipAddress,
      user_agent: userAgent,
      outcome: statusCode < 400 ? 'success' : 'failure'
    });
  }

  /**
   * Log system event
   */
  async logSystemEvent(
    eventType: string,
    source: string,
    details: Record<string, any>,
    severity: AuditEvent['severity'] = 'medium'
  ): Promise<void> {
    await this.logEvent({
      event_type: eventType,
      source,
      details,
      severity,
      outcome: 'success'
    });
  }

  /**
   * Query audit logs with filters
   */
  async queryAuditLogs(
    filter: AuditFilter,
    limit: number = 100,
    offset: number = 0
  ): Promise<{ logs: any[]; total: number }> {
    try {
      let query = supabase
        .from('audit_logs')
        .select('*', { count: 'exact' });

      // Apply filters
      if (filter.event_type) {
        query = query.eq('event_type', filter.event_type);
      }
      if (filter.source) {
        query = query.eq('source', filter.source);
      }
      if (filter.user_id) {
        query = query.eq('user_id', filter.user_id);
      }
      if (filter.org_id) {
        query = query.eq('org_id', filter.org_id);
      }
      if (filter.severity) {
        query = query.eq('severity', filter.severity);
      }
      if (filter.resource_type) {
        query = query.eq('resource_type', filter.resource_type);
      }
      if (filter.operation) {
        query = query.eq('operation', filter.operation);
      }
      if (filter.outcome) {
        query = query.eq('outcome', filter.outcome);
      }
      if (filter.start_date) {
        query = query.gte('timestamp', filter.start_date.toISOString());
      }
      if (filter.end_date) {
        query = query.lte('timestamp', filter.end_date.toISOString());
      }

      // Apply pagination
      query = query.range(offset, offset + limit - 1);
      query = query.order('timestamp', { ascending: false });

      const { data: logs, error, count } = await query;

      if (error) throw error;

      return {
        logs: logs || [],
        total: count || 0
      };
    } catch (error) {
      console.error('Error querying audit logs:', error);
      return { logs: [], total: 0 };
    }
  }

  /**
   * Get audit statistics
   */
  async getAuditStats(
    orgId?: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<AuditStats> {
    try {
      let query = supabase
        .from('audit_logs')
        .select('*');

      if (orgId) {
        query = query.eq('org_id', orgId);
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
      const eventsByType: Record<string, number> = {};
      const eventsBySeverity: Record<string, number> = {};
      const eventsByOutcome: Record<string, number> = {};
      const eventsBySource: Record<string, number> = {};
      const userCounts: Record<string, number> = {};
      const resourceCounts: Record<string, number> = {};

      events.forEach(event => {
        // Event types
        eventsByType[event.event_type] = (eventsByType[event.event_type] || 0) + 1;
        
        // Severity
        eventsBySeverity[event.severity] = (eventsBySeverity[event.severity] || 0) + 1;
        
        // Outcome
        eventsByOutcome[event.outcome] = (eventsByOutcome[event.outcome] || 0) + 1;
        
        // Source
        eventsBySource[event.source] = (eventsBySource[event.source] || 0) + 1;
        
        // User counts
        if (event.user_id) {
          userCounts[event.user_id] = (userCounts[event.user_id] || 0) + 1;
        }
        
        // Resource counts
        if (event.resource_type) {
          resourceCounts[event.resource_type] = (resourceCounts[event.resource_type] || 0) + 1;
        }
      });

      // Top users
      const topUsers = Object.entries(userCounts)
        .map(([user_id, count]) => ({ user_id, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Top resources
      const topResources = Object.entries(resourceCounts)
        .map(([resource_type, count]) => ({ resource_type, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      return {
        total_events: events.length,
        events_by_type: eventsByType,
        events_by_severity: eventsBySeverity,
        events_by_outcome: eventsByOutcome,
        events_by_source: eventsBySource,
        top_users: topUsers,
        top_resources: topResources
      };
    } catch (error) {
      console.error('Error getting audit stats:', error);
      return {
        total_events: 0,
        events_by_type: {},
        events_by_severity: {},
        events_by_outcome: {},
        events_by_source: {},
        top_users: [],
        top_resources: []
      };
    }
  }

  /**
   * Export audit logs
   */
  async exportAuditLogs(
    filter: AuditFilter,
    format: 'json' | 'csv' = 'json'
  ): Promise<string> {
    try {
      const { logs } = await this.queryAuditLogs(filter, 10000, 0);

      if (format === 'csv') {
        return this.convertToCSV(logs);
      } else {
        return JSON.stringify(logs, null, 2);
      }
    } catch (error) {
      console.error('Error exporting audit logs:', error);
      return '';
    }
  }

  /**
   * Convert logs to CSV format
   */
  private convertToCSV(logs: any[]): string {
    if (logs.length === 0) return '';

    const headers = Object.keys(logs[0]);
    const csvRows = [headers.join(',')];

    logs.forEach(log => {
      const values = headers.map(header => {
        const value = log[header];
        if (typeof value === 'object') {
          return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
        }
        return `"${String(value).replace(/"/g, '""')}"`;
      });
      csvRows.push(values.join(','));
    });

    return csvRows.join('\n');
  }

  /**
   * Start batch timer
   */
  private startBatchTimer(): void {
    this.batchTimer = setInterval(async () => {
      if (this.eventBuffer.length > 0) {
        await this.flushBuffer();
      }
    }, this.batchTimeout);
  }

  /**
   * Flush event buffer to database
   */
  private async flushBuffer(): Promise<void> {
    if (this.eventBuffer.length === 0) return;

    try {
      const eventsToLog = this.eventBuffer.splice(0);
      
      const { error } = await supabase
        .from('audit_logs')
        .insert(eventsToLog.map(event => ({
          event_type: event.event_type,
          source: event.source,
          user_id: event.user_id,
          org_id: event.org_id,
          details: JSON.stringify(event.details),
          severity: event.severity,
          ip_address: event.ip_address,
          user_agent: event.user_agent,
          session_id: event.session_id,
          resource_type: event.resource_type,
          resource_id: event.resource_id,
          operation: event.operation,
          outcome: event.outcome,
          timestamp: event.timestamp.toISOString()
        })));

      if (error) {
        console.error('Error flushing audit buffer:', error);
        // Re-add events to buffer for retry
        this.eventBuffer.unshift(...eventsToLog);
      }
    } catch (error) {
      console.error('Error flushing audit buffer:', error);
      // Re-add events to buffer for retry
      this.eventBuffer.unshift(...this.eventBuffer);
    }
  }

  /**
   * Clean up old audit logs
   */
  async cleanupOldLogs(retentionDays: number = 365): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

      const { data, error } = await supabase
        .from('audit_logs')
        .delete()
        .lt('timestamp', cutoffDate.toISOString())
        .select('id');

      if (error) throw error;

      return data?.length || 0;
    } catch (error) {
      console.error('Error cleaning up old audit logs:', error);
      return 0;
    }
  }

  /**
   * Get audit log retention policy
   */
  getRetentionPolicy(): {
    default_retention_days: number;
    critical_events_retention_days: number;
    security_events_retention_days: number;
    regular_events_retention_days: number;
  } {
    return {
      default_retention_days: 365,
      critical_events_retention_days: 2555, // 7 years
      security_events_retention_days: 1825, // 5 years
      regular_events_retention_days: 365    // 1 year
    };
  }
}

export const auditLogger = AuditLogger.getInstance();
