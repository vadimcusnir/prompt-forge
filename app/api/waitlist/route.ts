import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client with proper error handling
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Check if Supabase is properly configured
if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('Supabase environment variables not configured. API routes will return 503.')
}

const supabase = supabaseUrl && supabaseServiceKey 
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

    const { email, name } = await request.json()

    // Validation
    if (!email || !name) {
      return NextResponse.json(
        { message: 'Email and name are required' },
        { status: 400 }
      )
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Check for duplicate email
    const { data: existingUser, error: checkError } = await supabase
      .from('waitlist_signups')
      .select('id')
      .eq('email', email.toLowerCase())
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      return NextResponse.json(
        { message: 'Database error while checking email' },
        { status: 500 }
      )
    }

    if (existingUser) {
      return NextResponse.json(
        { message: 'Email already registered' },
        { status: 409 }
      )
    }

    // Insert new signup
    const { data, error } = await supabase
      .from('waitlist_signups')
      .insert([
        {
          email: email.toLowerCase().trim(),
          name: name.trim(),
        }
      ])
      .select()

    if (error) {
      console.error('Error inserting waitlist signup:', error)
      return NextResponse.json(
        { message: 'Failed to add to waitlist' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { 
        message: 'Successfully added to waitlist',
        data: data[0]
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Waitlist API error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
