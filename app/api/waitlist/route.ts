import { NextRequest, NextResponse } from 'next/server'

// TODO: Import Supabase client when configured
// import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, name } = body

    // Validare input
    if (!email || !name) {
      return NextResponse.json(
        { error: 'Email și numele sunt obligatorii' },
        { status: 400 }
      )
    }

    // Validare email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Format email invalid' },
        { status: 400 }
      )
    }

    // TODO: Implement Supabase integration
    // const supabase = createClient(
    //   process.env.NEXT_PUBLIC_SUPABASE_URL!,
    //   process.env.SUPABASE_SERVICE_ROLE_KEY!
    // )

    // // Verifică dacă email-ul există deja
    // const { data: existing } = await supabase
    //   .from('waitlist_signups')
    //   .select('id')
    //   .eq('email', email)
    //   .single()

    // if (existing) {
    //   return NextResponse.json(
    //     { error: 'Acest email este deja înscris în waitlist' },
    //     { status: 409 }
    //   )
    // }

    // // Inserează în waitlist
    // const { data, error } = await supabase
    //   .from('waitlist_signups')
    //   .insert([
    //     {
    //       email,
    //       name,
    //       org_id: null, // TODO: Set org_id when auth is implemented
    //       created_at: new Date().toISOString()
    //     }
    //   ])
    //   .select()

    // if (error) {
    //   console.error('Supabase error:', error)
    //   return NextResponse.json(
    //     { error: 'Eroare la salvarea în database' },
    //     { status: 500 }
    //   )
    // }

    // Simulate successful insertion for now
    const mockData = {
      id: 'mock-uuid-' + Date.now(),
      email,
      name,
      created_at: new Date().toISOString()
    }

    // Log pentru debugging
    console.log('Waitlist signup:', mockData)

    return NextResponse.json({
      success: true,
      message: 'Înscriere reușită în waitlist',
      data: mockData
    })

  } catch (error) {
    console.error('Waitlist API error:', error)
    return NextResponse.json(
      { error: 'Eroare internă a serverului' },
      { status: 500 }
    )
  }
}

export async function GET() {
  // TODO: Implement admin endpoint to view waitlist stats
  return NextResponse.json({
    message: 'Waitlist API endpoint',
    status: 'active',
    version: '3.0'
  })
}
