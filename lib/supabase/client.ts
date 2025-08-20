/**
 * lib/supabase/client.ts — Supabase Client Configuration
 * 
 * Provides authenticated Supabase client for database operations
 * Includes RLS policies and real-time subscriptions
 */

import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

// Environment variables for Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Create Supabase client
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

// Server-side Supabase client (for API routes)
export const createServerSupabaseClient = (accessToken?: string) => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase service role key')
  }

  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

// Client-side Supabase client with auth context
export const createClientSupabaseClient = (accessToken?: string) => {
  if (accessToken) {
    return createClient<Database>(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    })
  }
  
  return supabase
}

// Export types
export type { Database } from './types'
export type { SupabaseClient } from '@supabase/supabase-js'
