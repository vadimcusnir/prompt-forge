/**
 * lib/supabase/types.ts — Database Type Definitions
 * 
 * TypeScript types for Supabase database schema
 * Generated from db/schema.sql
 */

export interface Database {
  public: {
    Tables: {
      orgs: {
        Row: {
          id: string
          name: string
          slug: string
          domain: string | null
          logo_url: string | null
          plan_id: string
          status: string
          settings: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          domain?: string | null
          logo_url?: string | null
          plan_id?: string
          status?: string
          settings?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          domain?: string | null
          logo_url?: string | null
          plan_id?: string
          status?: string
          settings?: Json
          created_at?: string
          updated_at?: string
        }
      }
      org_members: {
        Row: {
          id: string
          org_id: string
          user_id: string
          role: string
          permissions: Json
          status: string
          invited_at: string
          joined_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          org_id: string
          user_id: string
          role?: string
          permissions?: Json
          status?: string
          invited_at?: string
          joined_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          user_id?: string
          role?: string
          permissions?: Json
          status?: string
          invited_at?: string
          joined_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      plans: {
        Row: {
          id: string
          name: string
          description: string | null
          price_monthly: number | null
          price_yearly: number | null
          features: Json
          limits: Json
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          description?: string | null
          price_monthly?: number | null
          price_yearly?: number | null
          features: Json
          limits: Json
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          price_monthly?: number | null
          price_yearly?: number | null
          features?: Json
          limits?: Json
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          org_id: string
          plan_id: string
          status: string
          current_period_start: string
          current_period_end: string
          cancel_at_period_end: boolean
          stripe_subscription_id: string | null
          stripe_customer_id: string | null
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          org_id: string
          plan_id: string
          status?: string
          current_period_start: string
          current_period_end: string
          cancel_at_period_end?: boolean
          stripe_subscription_id?: string | null
          stripe_customer_id?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          plan_id?: string
          status?: string
          current_period_start?: string
          current_period_end?: string
          cancel_at_period_end?: boolean
          stripe_subscription_id?: string | null
          stripe_customer_id?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
      }
      modules: {
        Row: {
          id: number
          name: string
          description: string
          requirements: string
          spec: string
          output_schema: string
          kpi: string
          guardrails: string
          vectors: number[]
          category: string | null
          tags: string[] | null
          is_active: boolean
          version: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: number
          name: string
          description: string
          requirements: string
          spec: string
          output_schema: string
          kpi: string
          guardrails: string
          vectors: number[]
          category?: string | null
          tags?: string[] | null
          is_active?: boolean
          version?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          name?: string
          description?: string
          requirements?: string
          spec?: string
          output_schema?: string
          kpi?: string
          guardrails?: string
          vectors?: number[]
          category?: string | null
          tags?: string[] | null
          is_active?: boolean
          version?: string
          created_at?: string
          updated_at?: string
        }
      }
      parameter_sets: {
        Row: {
          id: string
          org_id: string
          name: string
          description: string | null
          domain: string
          scale: string
          urgency: string
          complexity: string
          resources: string
          application: string
          output: string
          is_default: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          org_id: string
          name: string
          description?: string | null
          domain: string
          scale: string
          urgency: string
          complexity: string
          resources: string
          application: string
          output: string
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          name?: string
          description?: string | null
          domain?: string
          scale?: string
          urgency?: string
          complexity?: string
          resources?: string
          application?: string
          output?: string
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      runs: {
        Row: {
          id: string
          org_id: string
          module_id: number
          user_id: string
          run_id: string
          status: string
          seven_d: Json
          input: string
          output: string | null
          scores: Json | null
          error_message: string | null
          execution_time_ms: number | null
          token_count: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          org_id: string
          module_id: number
          user_id: string
          run_id: string
          status?: string
          seven_d: Json
          input: string
          output?: string | null
          scores?: Json | null
          error_message?: string | null
          execution_time_ms?: number | null
          token_count?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          module_id?: number
          user_id?: string
          run_id?: string
          status?: string
          seven_d?: Json
          input?: string
          output?: string | null
          scores?: Json | null
          error_message?: string | null
          execution_time_ms?: number | null
          token_count?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      bundles: {
        Row: {
          id: string
          org_id: string
          run_id: string
          name: string
          description: string | null
          artifacts: Json
          checksum_sha256: string
          size_bytes: number
          manifest: Json
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          org_id: string
          run_id: string
          name: string
          description?: string | null
          artifacts: Json
          checksum_sha256: string
          size_bytes: number
          manifest: Json
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          run_id?: string
          name?: string
          description?: string | null
          artifacts: Json
          checksum_sha256?: string
          size_bytes?: number
          manifest?: Json
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      telemetry_events: {
        Row: {
          id: string
          org_id: string
          user_id: string
          event_type: string
          event_data: Json
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          org_id: string
          user_id: string
          event_type: string
          event_data: Json
          metadata: Json
          created_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          user_id?: string
          event_type?: string
          event_data?: Json
          metadata?: Json
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Type aliases for common JSON structures
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

// Run status types
export type RunStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'

// Bundle status types
export type BundleStatus = 'pending' | 'generating' | 'completed' | 'failed'

// Telemetry event types
export type TelemetryEventType = 
  | 'run_start'
  | 'run_finish'
  | 'gate_hit'
  | 'score_evaluation'
  | 'bundle_export'
  | 'user_action'
  | 'error'

// Export the main database type
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Inserts<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type Updates<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']
