import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client with proper error handling
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder_key'

// Check if Supabase is properly configured
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('Supabase environment variables not configured. Using mock data for development.')
}

const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null

export async function POST(request: NextRequest) {
  try {
    // Check if Supabase is configured
    if (!supabase) {
      return NextResponse.json(
        { message: 'Service temporarily unavailable - configuration pending' },
        { status: 503 }
      )
    }

    // Check if user is authenticated (basic auth check)
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: 'Unauthorized - Bearer token required' },
        { status: 401 }
      )
    }

    const { enabled } = await request.json()

    if (typeof enabled !== 'boolean') {
      return NextResponse.json(
        { message: 'Enabled field must be a boolean' },
        { status: 400 }
      )
    }

    // Update or insert the coming_soon setting
    const { data, error } = await supabase
      .from('site_settings')
      .upsert(
        {
          key: 'coming_soon',
          value: {
            enabled,
            message: enabled 
              ? 'PROMPTFORGE™ v3.0 - Coming Soon!' 
              : 'PROMPTFORGE™ v3.0 - Now Live!',
            updated_at: new Date().toISOString()
          }
        },
        {
          onConflict: 'key'
        }
      )
      .select()

    if (error) {
      console.error('Error updating site settings:', error)
      return NextResponse.json(
        { message: 'Failed to update site settings' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { 
        message: `Coming soon ${enabled ? 'enabled' : 'disabled'} successfully`,
        data: data[0]
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Toggle coming soon API error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    // Check if Supabase is configured
    if (!supabase) {
      // Return mock data for development
      return NextResponse.json({
        data: {
          key: 'coming_soon',
          value: {
            enabled: false,
            message: 'PROMPTFORGE™ v3.0 - Now Live!',
            updated_at: new Date().toISOString()
          }
        }
      })
    }

    // Get current coming soon status
    const { data, error } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'coming_soon')
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching site settings:', error)
      return NextResponse.json(
        { message: 'Failed to fetch site settings' },
        { status: 500 }
      )
    }

    const comingSoonStatus = data?.value || { enabled: false, message: 'PROMPTFORGE™ v3.0' }

    return NextResponse.json(
      { 
        message: 'Coming soon status retrieved successfully',
        data: comingSoonStatus
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Toggle coming soon API error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
