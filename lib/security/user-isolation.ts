/**
 * lib/security/user-isolation.ts
 * 
 * User Isolation System
 * - Multi-tenant data isolation
 * - Role-based access control
 * - Data segregation
 * - Permission validation
 */

import { supabase } from '../supabase';

export interface UserContext {
  userId: string;
  orgId: string;
  roles: string[];
  permissions: string[];
  plan: string;
}

export interface IsolationPolicy {
  table: string;
  orgColumn: string;
  userColumn?: string;
  requiredPermissions: string[];
  allowCrossOrg: boolean;
  allowCrossUser: boolean;
}

export interface AccessResult {
  allowed: boolean;
  reason?: string;
  filteredData?: any;
  auditRequired: boolean;
}

export class UserIsolation {
  private static instance: UserIsolation;
  private isolationPolicies: Map<string, IsolationPolicy>;

  private constructor() {
    this.isolationPolicies = new Map();
    this.initializePolicies();
  }

  public static getInstance(): UserIsolation {
    if (!UserIsolation.instance) {
      UserIsolation.instance = new UserIsolation();
    }
    return UserIsolation.instance;
  }

  /**
   * Initialize isolation policies for all tables
   */
  private initializePolicies(): void {
    // Core tables with strict isolation
    this.isolationPolicies.set('orgs', {
      table: 'orgs',
      orgColumn: 'id',
      requiredPermissions: ['org:read'],
      allowCrossOrg: false,
      allowCrossUser: false
    });

    this.isolationPolicies.set('org_members', {
      table: 'org_members',
      orgColumn: 'org_id',
      userColumn: 'user_id',
      requiredPermissions: ['org:read', 'members:read'],
      allowCrossOrg: false,
      allowCrossUser: false
    });

    this.isolationPolicies.set('subscriptions', {
      table: 'subscriptions',
      orgColumn: 'org_id',
      requiredPermissions: ['billing:read'],
      allowCrossOrg: false,
      allowCrossUser: false
    });

    this.isolationPolicies.set('modules', {
      table: 'modules',
      orgColumn: 'org_id',
      requiredPermissions: ['modules:read'],
      allowCrossOrg: false,
      allowCrossUser: false
    });

    this.isolationPolicies.set('runs', {
      table: 'runs',
      orgColumn: 'org_id',
      userColumn: 'user_id',
      requiredPermissions: ['runs:read'],
      allowCrossOrg: false,
      allowCrossUser: false
    });

    this.isolationPolicies.set('bundles', {
      table: 'bundles',
      orgColumn: 'org_id',
      userColumn: 'user_id',
      requiredPermissions: ['bundles:read'],
      allowCrossOrg: false,
      allowCrossUser: false
    });

    this.isolationPolicies.set('projects', {
      table: 'projects',
      orgColumn: 'org_id',
      userColumn: 'user_id',
      requiredPermissions: ['projects:read'],
      allowCrossOrg: false,
      allowCrossUser: false
    });

    // Shared tables with controlled access
    this.isolationPolicies.set('industry_packs', {
      table: 'industry_packs',
      orgColumn: 'org_id',
      requiredPermissions: ['packs:read'],
      allowCrossOrg: true, // Industry packs can be shared
      allowCrossUser: false
    });

    // Audit and telemetry tables
    this.isolationPolicies.set('audit_logs', {
      table: 'audit_logs',
      orgColumn: 'org_id',
      userColumn: 'user_id',
      requiredPermissions: ['audit:read'],
      allowCrossOrg: false,
      allowCrossUser: false
    });

    this.isolationPolicies.set('telemetry_events', {
      table: 'telemetry_events',
      orgColumn: 'org_id',
      userColumn: 'user_id',
      requiredPermissions: ['telemetry:read'],
      allowCrossOrg: false,
      allowCrossUser: false
    });
  }

  /**
   * Validate user access to a specific resource
   */
  async validateAccess(
    userContext: UserContext,
    table: string,
    operation: 'read' | 'write' | 'delete',
    resourceId?: string,
    resourceData?: any
  ): Promise<AccessResult> {
    try {
      const policy = this.isolationPolicies.get(table);
      if (!policy) {
        return {
          allowed: false,
          reason: `No isolation policy found for table: ${table}`,
          auditRequired: true
        };
      }

      // Check permissions
      const hasPermission = this.checkPermissions(userContext.permissions, policy.requiredPermissions);
      if (!hasPermission) {
        return {
          allowed: false,
          reason: `Insufficient permissions for ${operation} on ${table}`,
          auditRequired: true
        };
      }

      // Check organization isolation
      if (!policy.allowCrossOrg) {
        if (resourceData && resourceData[policy.orgColumn] !== userContext.orgId) {
          return {
            allowed: false,
            reason: `Cross-organization access not allowed for ${table}`,
            auditRequired: true
          };
        }
      }

      // Check user isolation
      if (!policy.allowCrossUser && policy.userColumn) {
        if (resourceData && resourceData[policy.userColumn] !== userContext.userId) {
          return {
            allowed: false,
            reason: `Cross-user access not allowed for ${table}`,
            auditRequired: true
          };
        }
      }

      // Log successful access
      await this.logAccess(userContext, table, operation, resourceId, true);

      return {
        allowed: true,
        auditRequired: false
      };
    } catch (error) {
      console.error('Error validating access:', error);
      return {
        allowed: false,
        reason: `Access validation error: ${error}`,
        auditRequired: true
      };
    }
  }

  /**
   * Apply isolation filters to database queries
   */
  async applyIsolationFilters(
    userContext: UserContext,
    table: string,
    query: any
  ): Promise<{ query: any; auditRequired: boolean }> {
    try {
      const policy = this.isolationPolicies.get(table);
      if (!policy) {
        return { query, auditRequired: true };
      }

      let modifiedQuery = query;

      // Apply organization filter
      if (!policy.allowCrossOrg) {
        modifiedQuery = modifiedQuery.eq(policy.orgColumn, userContext.orgId);
      }

      // Apply user filter if specified
      if (!policy.allowCrossUser && policy.userColumn) {
        modifiedQuery = modifiedQuery.eq(policy.userColumn, userContext.userId);
      }

      return { query: modifiedQuery, auditRequired: false };
    } catch (error) {
      console.error('Error applying isolation filters:', error);
      return { query, auditRequired: true };
    }
  }

  /**
   * Check if user can access cross-organization data
   */
  canAccessCrossOrg(userContext: UserContext, table: string): boolean {
    const policy = this.isolationPolicies.get(table);
    if (!policy) return false;

    return policy.allowCrossOrg && 
           this.checkPermissions(userContext.permissions, policy.requiredPermissions);
  }

  /**
   * Check if user can access cross-user data
   */
  canAccessCrossUser(userContext: UserContext, table: string): boolean {
    const policy = this.isolationPolicies.get(table);
    if (!policy) return false;

    return policy.allowCrossUser && 
           this.checkPermissions(userContext.permissions, policy.requiredPermissions);
  }

  /**
   * Validate data ownership before operations
   */
  async validateDataOwnership(
    userContext: UserContext,
    table: string,
    resourceId: string
  ): Promise<AccessResult> {
    try {
      const policy = this.isolationPolicies.get(table);
      if (!policy) {
        return {
          allowed: false,
          reason: `No isolation policy found for table: ${table}`,
          auditRequired: true
        };
      }

      // Get resource data
      const { data: resource, error } = await supabase
        .from(table)
        .select('*')
        .eq('id', resourceId)
        .single();

      if (error || !resource) {
        return {
          allowed: false,
          reason: `Resource not found: ${resourceId}`,
          auditRequired: true
        };
      }

      // Check organization ownership
      if (!policy.allowCrossOrg && resource[policy.orgColumn] !== userContext.orgId) {
        return {
          allowed: false,
          reason: `Resource belongs to different organization`,
          auditRequired: true
        };
      }

      // Check user ownership
      if (!policy.allowCrossUser && policy.userColumn && resource[policy.userColumn] !== userContext.userId) {
        return {
          allowed: false,
          reason: `Resource belongs to different user`,
          auditRequired: true
        };
      }

      return {
        allowed: true,
        auditRequired: false
      };
    } catch (error) {
      console.error('Error validating data ownership:', error);
      return {
        allowed: false,
        reason: `Ownership validation error: ${error}`,
        auditRequired: true
      };
    }
  }

  /**
   * Check user permissions
   */
  private checkPermissions(userPermissions: string[], requiredPermissions: string[]): boolean {
    return requiredPermissions.every(permission => userPermissions.includes(permission));
  }

  /**
   * Log access attempt
   */
  private async logAccess(
    userContext: UserContext,
    table: string,
    operation: string,
    resourceId?: string,
    success: boolean
  ): Promise<void> {
    try {
      await supabase
        .from('audit_logs')
        .insert({
          event_type: 'ACCESS_ATTEMPT',
          details: JSON.stringify({
            user_id: userContext.userId,
            org_id: userContext.orgId,
            table,
            operation,
            resource_id: resourceId,
            success,
            timestamp: new Date().toISOString()
          }),
          timestamp: new Date().toISOString(),
          source: 'user_isolation',
          org_id: userContext.orgId,
          user_id: userContext.userId
        });
    } catch (error) {
      console.error('Error logging access:', error);
    }
  }

  /**
   * Get user's accessible organizations
   */
  async getUserOrganizations(userId: string): Promise<string[]> {
    try {
      const { data: memberships, error } = await supabase
        .from('org_members')
        .select('org_id')
        .eq('user_id', userId)
        .eq('is_active', true);

      if (error) throw error;

      return memberships.map(m => m.org_id);
    } catch (error) {
      console.error('Error getting user organizations:', error);
      return [];
    }
  }

  /**
   * Check if user is member of organization
   */
  async isOrgMember(userId: string, orgId: string): Promise<boolean> {
    try {
      const { data: membership, error } = await supabase
        .from('org_members')
        .select('id')
        .eq('user_id', userId)
        .eq('org_id', orgId)
        .eq('is_active', true)
        .single();

      if (error) return false;
      return !!membership;
    } catch (error) {
      console.error('Error checking org membership:', error);
      return false;
    }
  }

  /**
   * Get user's role in organization
   */
  async getUserOrgRole(userId: string, orgId: string): Promise<string | null> {
    try {
      const { data: membership, error } = await supabase
        .from('org_members')
        .select('role')
        .eq('user_id', userId)
        .eq('org_id', orgId)
        .eq('is_active', true)
        .single();

      if (error) return null;
      return membership.role;
    } catch (error) {
      console.error('Error getting user org role:', error);
      return null;
    }
  }

  /**
   * Get isolation statistics
   */
  async getIsolationStats(orgId: string): Promise<{
    total_access_attempts: number;
    blocked_attempts: number;
    cross_org_attempts: number;
    cross_user_attempts: number;
  }> {
    try {
      const now = new Date();
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      // Get access attempts in last 24 hours
      const { data: accessLogs, error } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('org_id', orgId)
        .eq('source', 'user_isolation')
        .gte('timestamp', oneDayAgo.toISOString());

      if (error) throw error;

      const totalAttempts = accessLogs.length;
      const blockedAttempts = accessLogs.filter(log => {
        const details = JSON.parse(log.details);
        return !details.success;
      }).length;

      const crossOrgAttempts = accessLogs.filter(log => {
        const details = JSON.parse(log.details);
        return details.reason && details.reason.includes('organization');
      }).length;

      const crossUserAttempts = accessLogs.filter(log => {
        const details = JSON.parse(log.details);
        return details.reason && details.reason.includes('user');
      }).length;

      return {
        total_access_attempts: totalAttempts,
        blocked_attempts: blockedAttempts,
        cross_org_attempts: crossOrgAttempts,
        cross_user_attempts: crossUserAttempts
      };
    } catch (error) {
      console.error('Error getting isolation stats:', error);
      return {
        total_access_attempts: 0,
        blocked_attempts: 0,
        cross_org_attempts: 0,
        cross_user_attempts: 0
      };
    }
  }
}

export const userIsolation = UserIsolation.getInstance();
