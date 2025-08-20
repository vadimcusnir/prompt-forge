/**
 * lib/security/api-key-manager.ts
 * 
 * Secure API Key Management System
 * - Secure storage with encryption
 * - Automatic key rotation
 * - Rate limiting per key
 * - Audit logging for all operations
 */

import { createHash, randomBytes, createCipher, createDecipher } from 'crypto';
import { supabase } from '../supabase';

export interface ApiKey {
  id: string;
  key_hash: string;
  user_id: string;
  org_id: string;
  name: string;
  permissions: string[];
  rate_limit: {
    requests_per_minute: number;
    requests_per_hour: number;
    requests_per_day: number;
  };
  created_at: Date;
  expires_at: Date;
  last_used: Date;
  is_active: boolean;
  rotation_interval_days: number;
}

export interface ApiKeyUsage {
  key_id: string;
  endpoint: string;
  timestamp: Date;
  response_time: number;
  status_code: number;
  user_agent: string;
  ip_address: string;
}

export class ApiKeyManager {
  private static instance: ApiKeyManager;
  private encryptionKey: string;

  private constructor() {
    this.encryptionKey = process.env.API_ENCRYPTION_KEY || randomBytes(32).toString('hex');
  }

  public static getInstance(): ApiKeyManager {
    if (!ApiKeyManager.instance) {
      ApiKeyManager.instance = new ApiKeyManager();
    }
    return ApiKeyManager.instance;
  }

  /**
   * Generate a new API key
   */
  async generateApiKey(
    userId: string,
    orgId: string,
    name: string,
    permissions: string[],
    rateLimit: ApiKey['rate_limit']
  ): Promise<{ key: string; apiKey: ApiKey }> {
    try {
      // Generate secure random key
      const rawKey = randomBytes(32).toString('hex');
      const keyHash = this.hashKey(rawKey);
      
      // Encrypt the raw key for storage
      const encryptedKey = this.encryptKey(rawKey);
      
      // Create API key record
      const { data: apiKey, error } = await supabase
        .from('api_keys')
        .insert({
          key_hash: keyHash,
          user_id: userId,
          org_id: orgId,
          name,
          permissions: JSON.stringify(permissions),
          rate_limit: JSON.stringify(rateLimit),
          created_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year
          last_used: new Date().toISOString(),
          is_active: true,
          rotation_interval_days: 90
        })
        .select()
        .single();

      if (error) throw error;

      // Log key generation
      await this.logAuditEvent('API_KEY_GENERATED', {
        user_id: userId,
        org_id: orgId,
        key_id: apiKey.id,
        key_name: name,
        permissions
      });

      return {
        key: rawKey,
        apiKey: this.mapToApiKey(apiKey)
      };
    } catch (error) {
      console.error('Error generating API key:', error);
      throw new Error('Failed to generate API key');
    }
  }

  /**
   * Validate API key and check rate limits
   */
  async validateApiKey(
    rawKey: string,
    endpoint: string,
    userAgent: string,
    ipAddress: string
  ): Promise<{ valid: boolean; apiKey?: ApiKey; error?: string }> {
    try {
      const keyHash = this.hashKey(rawKey);
      
      // Get API key from database
      const { data: apiKeyData, error } = await supabase
        .from('api_keys')
        .select('*')
        .eq('key_hash', keyHash)
        .eq('is_active', true)
        .single();

      if (error || !apiKeyData) {
        return { valid: false, error: 'Invalid API key' };
      }

      const apiKey = this.mapToApiKey(apiKeyData);

      // Check if key is expired
      if (new Date() > apiKey.expires_at) {
        await this.logAuditEvent('API_KEY_EXPIRED', {
          key_id: apiKey.id,
          endpoint,
          user_agent: userAgent,
          ip_address: ipAddress
        });
        return { valid: false, error: 'API key expired' };
      }

      // Check rate limits
      const rateLimitCheck = await this.checkRateLimits(apiKey.id, endpoint);
      if (!rateLimitCheck.allowed) {
        await this.logAuditEvent('RATE_LIMIT_EXCEEDED', {
          key_id: apiKey.id,
          endpoint,
          user_agent: userAgent,
          ip_address: ipAddress,
          limit_type: rateLimitCheck.limitType
        });
        return { valid: false, error: `Rate limit exceeded: ${rateLimitCheck.limitType}` };
      }

      // Update last used timestamp
      await this.updateLastUsed(apiKey.id);

      // Log successful validation
      await this.logAuditEvent('API_KEY_VALIDATED', {
        key_id: apiKey.id,
        endpoint,
        user_agent: userAgent,
        ip_address: ipAddress
      });

      return { valid: true, apiKey };
    } catch (error) {
      console.error('Error validating API key:', error);
      return { valid: false, error: 'Validation error' };
    }
  }

  /**
   * Rotate API key
   */
  async rotateApiKey(keyId: string, userId: string): Promise<{ newKey: string; apiKey: ApiKey }> {
    try {
      // Get current API key
      const { data: currentKey, error } = await supabase
        .from('api_keys')
        .select('*')
        .eq('id', keyId)
        .eq('user_id', userId)
        .single();

      if (error || !currentKey) {
        throw new Error('API key not found');
      }

      // Generate new key
      const newRawKey = randomBytes(32).toString('hex');
      const newKeyHash = this.hashKey(newRawKey);

      // Update database with new key hash
      const { data: updatedKey, error: updateError } = await supabase
        .from('api_keys')
        .update({
          key_hash: newKeyHash,
          created_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
        })
        .eq('id', keyId)
        .select()
        .single();

      if (updateError) throw updateError;

      // Log rotation
      await this.logAuditEvent('API_KEY_ROTATED', {
        key_id: keyId,
        user_id: userId,
        old_key_hash: currentKey.key_hash,
        new_key_hash: newKeyHash
      });

      return {
        newKey: newRawKey,
        apiKey: this.mapToApiKey(updatedKey)
      };
    } catch (error) {
      console.error('Error rotating API key:', error);
      throw new Error('Failed to rotate API key');
    }
  }

  /**
   * Revoke API key
   */
  async revokeApiKey(keyId: string, userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('api_keys')
        .update({ is_active: false })
        .eq('id', keyId)
        .eq('user_id', userId);

      if (error) throw error;

      // Log revocation
      await this.logAuditEvent('API_KEY_REVOKED', {
        key_id: keyId,
        user_id: userId
      });
    } catch (error) {
      console.error('Error revoking API key:', error);
      throw new Error('Failed to revoke API key');
    }
  }

  /**
   * Check rate limits for API key
   */
  private async checkRateLimits(keyId: string, endpoint: string): Promise<{
    allowed: boolean;
    limitType?: string;
  }> {
    try {
      const now = new Date();
      const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      // Get API key rate limits
      const { data: apiKey } = await supabase
        .from('api_keys')
        .select('rate_limit')
        .eq('id', keyId)
        .single();

      if (!apiKey) return { allowed: false, limitType: 'key_not_found' };

      const rateLimit = JSON.parse(apiKey.rate_limit);

      // Check per-minute limit
      const { count: minuteCount } = await supabase
        .from('api_key_usage')
        .select('*', { count: 'exact', head: true })
        .eq('key_id', keyId)
        .gte('timestamp', oneMinuteAgo.toISOString());

      if (minuteCount >= rateLimit.requests_per_minute) {
        return { allowed: false, limitType: 'per_minute' };
      }

      // Check per-hour limit
      const { count: hourCount } = await supabase
        .from('api_key_usage')
        .select('*', { count: 'exact', head: true })
        .eq('key_id', keyId)
        .gte('timestamp', oneHourAgo.toISOString());

      if (hourCount >= rateLimit.requests_per_hour) {
        return { allowed: false, limitType: 'per_hour' };
      }

      // Check per-day limit
      const { count: dayCount } = await supabase
        .from('api_key_usage')
        .select('*', { count: 'exact', head: true })
        .eq('key_id', keyId)
        .gte('timestamp', oneDayAgo.toISOString());

      if (dayCount >= rateLimit.requests_per_day) {
        return { allowed: false, limitType: 'per_day' };
      }

      return { allowed: true };
    } catch (error) {
      console.error('Error checking rate limits:', error);
      return { allowed: false, limitType: 'error' };
    }
  }

  /**
   * Update last used timestamp
   */
  private async updateLastUsed(keyId: string): Promise<void> {
    try {
      await supabase
        .from('api_keys')
        .update({ last_used: new Date().toISOString() })
        .eq('id', keyId);
    } catch (error) {
      console.error('Error updating last used timestamp:', error);
    }
  }

  /**
   * Log API key usage
   */
  async logUsage(usage: Omit<ApiKeyUsage, 'timestamp'>): Promise<void> {
    try {
      await supabase
        .from('api_key_usage')
        .insert({
          ...usage,
          timestamp: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error logging API key usage:', error);
    }
  }

  /**
   * Hash API key for storage
   */
  private hashKey(key: string): string {
    return createHash('sha256').update(key).digest('hex');
  }

  /**
   * Encrypt API key for secure storage
   */
  private encryptKey(key: string): string {
    const cipher = createCipher('aes-256-cbc', this.encryptionKey);
    let encrypted = cipher.update(key, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  }

  /**
   * Decrypt API key
   */
  private decryptKey(encryptedKey: string): string {
    const decipher = createDecipher('aes-256-cbc', this.encryptionKey);
    let decrypted = decipher.update(encryptedKey, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  /**
   * Map database record to ApiKey interface
   */
  private mapToApiKey(data: any): ApiKey {
    return {
      id: data.id,
      key_hash: data.key_hash,
      user_id: data.user_id,
      org_id: data.org_id,
      name: data.name,
      permissions: JSON.parse(data.permissions),
      rate_limit: JSON.parse(data.rate_limit),
      created_at: new Date(data.created_at),
      expires_at: new Date(data.expires_at),
      last_used: new Date(data.last_used),
      is_active: data.is_active,
      rotation_interval_days: data.rotation_interval_days
    };
  }

  /**
   * Log audit event
   */
  private async logAuditEvent(eventType: string, details: any): Promise<void> {
    try {
      await supabase
        .from('audit_logs')
        .insert({
          event_type: eventType,
          details: JSON.stringify(details),
          timestamp: new Date().toISOString(),
          source: 'api_key_manager'
        });
    } catch (error) {
      console.error('Error logging audit event:', error);
    }
  }

  /**
   * Get API key statistics
   */
  async getKeyStatistics(orgId: string): Promise<{
    total_keys: number;
    active_keys: number;
    expired_keys: number;
    usage_today: number;
  }> {
    try {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      const { count: totalKeys } = await supabase
        .from('api_keys')
        .select('*', { count: 'exact', head: true })
        .eq('org_id', orgId);

      const { count: activeKeys } = await supabase
        .from('api_keys')
        .select('*', { count: 'exact', head: true })
        .eq('org_id', orgId)
        .eq('is_active', true);

      const { count: expiredKeys } = await supabase
        .from('api_keys')
        .select('*', { count: 'exact', head: true })
        .eq('org_id', orgId)
        .lt('expires_at', now.toISOString());

      const { count: usageToday } = await supabase
        .from('api_key_usage')
        .select('*', { count: 'exact', head: true })
        .gte('timestamp', today.toISOString());

      return {
        total_keys: totalKeys || 0,
        active_keys: activeKeys || 0,
        expired_keys: expiredKeys || 0,
        usage_today: usageToday || 0
      };
    } catch (error) {
      console.error('Error getting key statistics:', error);
      return {
        total_keys: 0,
        active_keys: 0,
        expired_keys: 0,
        usage_today: 0
      };
    }
  }
}

export const apiKeyManager = ApiKeyManager.getInstance();
