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

    // TODO: Implement admin authentication
    // const { user } = await supabase.auth.getUser()
    // if (!user || !user.user_metadata.is_admin) {
    //   return NextResponse.json(
    //     { success: false, message: 'Acces neautorizat' },
    //     { status: 401 }
    //   )
    // }

    const body = await request.json()
    const { enabled, org_id } = body

    if (typeof enabled !== 'boolean') {
      return NextResponse.json(
        { success: false, message: 'Parametrul "enabled" trebuie să fie boolean' },
        { status: 400 }
      )
    }

    // Mai întâi verifică dacă setarea există
    const { data: existingSetting, error: checkError } = await supabase
      .from('site_settings')
      .select('id')
      .eq('key', 'coming_soon')
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking existing setting:', checkError)
      return NextResponse.json(
        { success: false, message: 'Eroare la verificarea setării existente' },
        { status: 500 }
      )
    }

    let updatedSetting
    let updateError

    if (existingSetting) {
      // Update setarea existentă
      const { data, error } = await supabase
        .from('site_settings')
        .update({
          value: { enabled, message: `PROMPTFORGE™ v3.0 - ${enabled ? 'Coming Soon' : 'Live'}` },
          updated_at: new Date().toISOString()
        })
        .eq('id', existingSetting.id)
        .select()
        .single()

      updatedSetting = data
      updateError = error
    } else {
      // Creează setarea nouă
      const { data, error } = await supabase
        .from('site_settings')
        .insert([{
          key: 'coming_soon',
          value: { enabled, message: `PROMPTFORGE™ v3.0 - ${enabled ? 'Coming Soon' : 'Live'}` }
        }])
        .select()
        .single()

      updatedSetting = data
      updateError = error
    }

    if (updateError) {
      console.error('Error updating site setting:', updateError)
      return NextResponse.json(
        { success: false, message: 'Eroare la actualizarea setării' },
        { status: 500 }
      )
    }

    console.log('Coming soon toggle successful:', updatedSetting)
    return NextResponse.json({
      success: true,
      message: `Coming soon ${enabled ? 'activat' : 'dezactivat'} cu succes`,
      data: updatedSetting
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
      // Fallback la environment variable
      return NextResponse.json({
        success: true,
        data: {
          enabled: process.env.COMING_SOON === 'true',
          message: 'PROMPTFORGE™ v3.0 - Coming Soon'
        }
      })
    }

    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    const { data: setting, error } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'coming_soon')
      .single()

    if (error) {
      console.error('Error fetching site setting:', error)
      // Fallback la environment variable
      return NextResponse.json({
        success: true,
        data: {
          enabled: process.env.COMING_SOON === 'true',
          message: 'PROMPTFORGE™ v3.0 - Coming Soon'
        }
      })
    }

    return NextResponse.json({
      success: true,
      data: setting.value
    })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { success: false, message: 'Eroare internă a serverului' },
      { status: 500 }
    )
  }
}
