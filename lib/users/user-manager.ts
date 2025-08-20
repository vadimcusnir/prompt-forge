/**
 * lib/users/user-manager.ts — User Management System
 * 
 * Provides comprehensive user data management, profiles, and history
 * Integrates with Supabase for persistent storage
 */

import { createServerSupabaseClient } from '@/lib/supabase/client'
import { sessionManager } from '@/lib/auth/session-manager'
import { analytics } from '@/lib/telemetry/analytics'
import type { Tables, Inserts, Updates } from '@/lib/supabase/types'

export interface UserProfile {
  id: string
  email: string
  firstName?: string
  lastName?: string
  avatar?: string
  bio?: string
  preferences: UserPreferences
  createdAt: Date
  updatedAt: Date
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system'
  language: string
  notifications: NotificationSettings
  privacy: PrivacySettings
}

export interface NotificationSettings {
  email: boolean
  push: boolean
  marketing: boolean
  updates: boolean
}

export interface PrivacySettings {
  profileVisible: boolean
  activityVisible: boolean
  analyticsSharing: boolean
}

export interface UserStats {
  totalRuns: number
  successfulRuns: number
  averageScore: number
  totalTokens: number
  favoriteModules: string[]
  lastActive: Date
}

export interface UserHistory {
  runs: Array<{
    id: string
    moduleId: string
    timestamp: Date
    success: boolean
    score?: number
  }>
  exports: Array<{
    id: string
    format: string
    timestamp: Date
    size: number
  }>
  sessions: Array<{
    id: string
    startTime: Date
    endTime?: Date
    duration?: number
  }>
}

export class UserManager {
  private static instance: UserManager
  private supabase = createServerSupabaseClient()

  private constructor() {}

  static getInstance(): UserManager {
    if (!UserManager.instance) {
      UserManager.instance = new UserManager()
    }
    return UserManager.instance
  }

  /**
   * Create new user profile
   */
  async createUserProfile(userId: string, email: string, profile?: Partial<UserProfile>): Promise<UserProfile> {
    try {
      const defaultPreferences: UserPreferences = {
        theme: 'system',
        language: 'en',
        notifications: {
          email: true,
          push: false,
          marketing: false,
          updates: true
        },
        privacy: {
          profileVisible: true,
          activityVisible: false,
          analyticsSharing: true
        }
      }

      const userProfile: Inserts<'org_members'> = {
        user_id: userId,
        org_id: 'default-org', // TODO: Get from auth context
        role: 'member',
        permissions: {},
        status: 'active'
      }

      const { error: memberError } = await this.supabase
        .from('org_members')
        .insert(userProfile)

      if (memberError) {
        throw new Error(`Failed to create user member: ${memberError.message}`)
      }

      // Create user profile in a separate table (extend schema if needed)
      const profileData = {
        id: userId,
        email,
        firstName: profile?.firstName || '',
        lastName: profile?.lastName || '',
        avatar: profile?.avatar || '',
        bio: profile?.bio || '',
        preferences: defaultPreferences,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      // For now, store in telemetry_events (extend schema for user_profiles table)
      const { error: profileError } = await this.supabase
        .from('telemetry_events')
        .insert({
          org_id: 'default-org',
          user_id: userId,
          event_type: 'user_profile_created',
          event_data: profileData,
          metadata: {
            timestamp: new Date().toISOString(),
            version: '1.0.0'
          }
        })

      if (profileError) {
        console.error('Failed to create user profile:', profileError)
      }

      // Track user creation
      await analytics.trackUserAction({
        userId,
        sessionId: 'system',
        planId: 'pilot',
        action: 'user_created',
        target: 'profile'
      })

      return profileData

    } catch (error) {
      console.error('Error creating user profile:', error)
      throw error
    }
  }

  /**
   * Get user profile by ID
   */
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      // Get user member info
      const { data: member, error: memberError } = await this.supabase
        .from('org_members')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .single()

      if (memberError || !member) {
        return null
      }

      // Get profile data from telemetry events (extend schema for user_profiles table)
      const { data: profileEvents } = await this.supabase
        .from('telemetry_events')
        .select('event_data')
        .eq('user_id', userId)
        .eq('event_type', 'user_profile_created')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (!profileEvents) {
        // Return basic profile if no detailed data
        return {
          id: userId,
          email: '', // TODO: Get from auth.users table
          preferences: {
            theme: 'system',
            language: 'en',
            notifications: {
              email: true,
              push: false,
              marketing: false,
              updates: true
            },
            privacy: {
              profileVisible: true,
              activityVisible: false,
              analyticsSharing: true
            }
          },
          createdAt: new Date(member.created_at),
          updatedAt: new Date(member.updated_at)
        }
      }

      return profileEvents.event_data as UserProfile

    } catch (error) {
      console.error('Error getting user profile:', error)
      return null
    }
  }

  /**
   * Update user profile
   */
  async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
    try {
      const currentProfile = await this.getUserProfile(userId)
      if (!currentProfile) {
        throw new Error('User profile not found')
      }

      const updatedProfile: UserProfile = {
        ...currentProfile,
        ...updates,
        updatedAt: new Date()
      }

      // Store updated profile (extend schema for user_profiles table)
      const { error } = await this.supabase
        .from('telemetry_events')
        .insert({
          org_id: 'default-org',
          user_id: userId,
          event_type: 'user_profile_updated',
          event_data: updatedProfile,
          metadata: {
            timestamp: new Date().toISOString(),
            version: '1.0.0',
            changes: Object.keys(updates)
          }
        })

      if (error) {
        console.error('Failed to update user profile:', error)
        throw error
      }

      // Track profile update
      await analytics.trackUserAction({
        userId,
        sessionId: 'system',
        planId: 'pilot',
        action: 'profile_updated',
        target: 'profile',
        metadata: { changes: Object.keys(updates) }
      })

      return updatedProfile

    } catch (error) {
      console.error('Error updating user profile:', error)
      throw error
    }
  }

  /**
   * Get user statistics
   */
  async getUserStats(userId: string): Promise<UserStats | null> {
    try {
      // Get run statistics
      const { data: runs, error: runsError } = await this.supabase
        .from('runs')
        .select('status, scores, token_count, created_at')
        .eq('user_id', userId)

      if (runsError) {
        console.error('Error fetching user runs:', runsError)
        return null
      }

      const totalRuns = runs?.length || 0
      const successfulRuns = runs?.filter(r => r.status === 'completed').length || 0
      
      // Calculate average score
      const scores = runs?.map(r => r.scores).filter(Boolean) || []
      const averageScore = scores.length > 0 
        ? scores.reduce((sum, score) => sum + (score as any)?.overall || 0, 0) / scores.length
        : 0

      // Calculate total tokens
      const totalTokens = runs?.reduce((sum, r) => sum + (r.token_count || 0), 0) || 0

      // Get favorite modules
      const moduleCounts = new Map<string, number>()
      runs?.forEach(run => {
        const count = moduleCounts.get(run.module_id?.toString() || '') || 0
        moduleCounts.set(run.module_id?.toString() || '', count + 1)
      })

      const favoriteModules = Array.from(moduleCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([moduleId]) => moduleId)

      // Get last active time
      const lastActive = runs && runs.length > 0 
        ? new Date(Math.max(...runs.map(r => new Date(r.created_at).getTime())))
        : new Date()

      return {
        totalRuns,
        successfulRuns,
        averageScore: Math.round(averageScore * 100) / 100,
        totalTokens,
        favoriteModules,
        lastActive
      }

    } catch (error) {
      console.error('Error getting user stats:', error)
      return null
    }
  }

  /**
   * Get user history
   */
  async getUserHistory(userId: string, limit: number = 50): Promise<UserHistory | null> {
    try {
      // Get recent runs
      const { data: runs, error: runsError } = await this.supabase
        .from('runs')
        .select('id, module_id, status, scores, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (runsError) {
        console.error('Error fetching user runs:', runsError)
        return null
      }

      // Get recent exports
      const { data: exports, error: exportsError } = await this.supabase
        .from('telemetry_events')
        .select('id, event_data, created_at')
        .eq('user_id', userId)
        .eq('event_type', 'bundle_export')
        .order('created_at', { ascending: false })
        .limit(limit)

      if (exportsError) {
        console.error('Error fetching user exports:', exportsError)
      }

      // Get recent sessions
      const { data: sessions, error: sessionsError } = await this.supabase
        .from('telemetry_events')
        .select('id, event_data, created_at')
        .eq('user_id', userId)
        .eq('event_type', 'session_start')
        .order('created_at', { ascending: false })
        .limit(limit)

      if (sessionsError) {
        console.error('Error fetching user sessions:', sessionsError)
      }

      return {
        runs: runs?.map(run => ({
          id: run.id,
          moduleId: run.module_id?.toString() || '',
          timestamp: new Date(run.created_at),
          success: run.status === 'completed',
          score: (run.scores as any)?.overall
        })) || [],
        exports: exports?.map(exp => ({
          id: exp.id,
          format: (exp.event_data as any)?.format || 'unknown',
          timestamp: new Date(exp.created_at),
          size: (exp.event_data as any)?.size || 0
        })) || [],
        sessions: sessions?.map(session => ({
          id: session.id,
          startTime: new Date(session.created_at),
          endTime: undefined, // TODO: Track session end
          duration: undefined
        })) || []
      }

    } catch (error) {
      console.error('Error getting user history:', error)
      return null
    }
  }

  /**
   * Delete user account
   */
  async deleteUserAccount(userId: string): Promise<boolean> {
    try {
      // Mark user as inactive
      const { error: memberError } = await this.supabase
        .from('org_members')
        .update({ status: 'inactive' })
        .eq('user_id', userId)

      if (memberError) {
        console.error('Error deactivating user:', memberError)
        return false
      }

      // Track account deletion
      await analytics.trackUserAction({
        userId,
        sessionId: 'system',
        planId: 'pilot',
        action: 'account_deleted',
        target: 'account'
      })

      return true

    } catch (error) {
      console.error('Error deleting user account:', error)
      return false
    }
  }

  /**
   * Search users (admin only)
   */
  async searchUsers(query: string, limit: number = 20): Promise<UserProfile[]> {
    try {
      // Search in org_members table
      const { data: members, error } = await this.supabase
        .from('org_members')
        .select('user_id, role, created_at')
        .ilike('user_id', `%${query}%`)
        .eq('status', 'active')
        .limit(limit)

      if (error) {
        console.error('Error searching users:', error)
        return []
      }

      // Get profiles for found users
      const profiles: UserProfile[] = []
      for (const member of members || []) {
        const profile = await this.getUserProfile(member.user_id)
        if (profile) {
          profiles.push(profile)
        }
      }

      return profiles

    } catch (error) {
      console.error('Error searching users:', error)
      return []
    }
  }

  /**
   * Get user count statistics
   */
  async getUserCountStats(): Promise<{ total: number; active: number; inactive: number }> {
    try {
      const { count: total } = await this.supabase
        .from('org_members')
        .select('*', { count: 'exact', head: true })

      const { count: active } = await this.supabase
        .from('org_members')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active')

      const { count: inactive } = await this.supabase
        .from('org_members')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'inactive')

      return {
        total: total || 0,
        active: active || 0,
        inactive: inactive || 0
      }

    } catch (error) {
      console.error('Error getting user count stats:', error)
      return { total: 0, active: 0, inactive: 0 }
    }
  }
}

// Export singleton instance
export const userManager = UserManager.getInstance()
