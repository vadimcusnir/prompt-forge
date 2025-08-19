import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // Verifică dacă Supabase este configurat
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Supabase not configured')
      return NextResponse.json(
        { success: false, message: 'Supabase nu este configurat' },
        { status: 500 }
      )
    }

    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    const body = await request.json()
    const { email, name } = body

    if (!email || !name) {
      return NextResponse.json(
        { success: false, message: 'Email și numele sunt obligatorii' },
        { status: 400 }
      )
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: 'Format email invalid' },
        { status: 400 }
      )
    }

    // Verifică dacă email-ul există deja
    const { data: existingUser, error: checkError } = await supabase
      .from('waitlist_signups')
      .select('id')
      .eq('email', email)
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking existing user:', checkError)
      return NextResponse.json(
        { success: false, message: 'Eroare la verificarea utilizatorului' },
        { status: 500 }
      )
    }

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'Acest email este deja înscris în waitlist' },
        { status: 409 }
      )
    }

    // Inserează utilizatorul nou
    const { data: newUser, error: insertError } = await supabase
      .from('waitlist_signups')
      .insert([{ email, name }])
      .select()
      .single()

    if (insertError) {
      console.error('Error inserting user:', insertError)
      return NextResponse.json(
        { success: false, message: 'Eroare la înscrierea în waitlist' },
        { status: 500 }
      )
    }

    console.log('Waitlist signup successful:', newUser)
    return NextResponse.json({
      success: true,
      message: 'Înscriere reușită în waitlist!',
      data: newUser
    })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { success: false, message: 'Eroare internă a serverului' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    // Verifică dacă Supabase este configurat
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Supabase not configured')
      return NextResponse.json(
        { success: false, message: 'Supabase nu este configurat' },
        { status: 500 }
      )
    }

    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    const { data: signups, error } = await supabase
      .from('waitlist_signups')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching signups:', error)
      return NextResponse.json(
        { success: false, message: 'Eroare la obținerea înscrierilor' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: signups,
      count: signups.length
    })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { success: false, message: 'Eroare internă a serverului' },
      { status: 500 }
    )
  }
}
