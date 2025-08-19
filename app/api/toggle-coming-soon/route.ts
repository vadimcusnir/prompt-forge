import { NextRequest, NextResponse } from 'next/server'

// TODO: Import Supabase client when configured
// import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    // TODO: Implement admin authentication
    // const authHeader = request.headers.get('authorization')
    // if (!authHeader || !authHeader.startsWith('Bearer ')) {
    //   return NextResponse.json(
    //     { error: 'Unauthorized - Admin access required' },
    //     { status: 401 }
    //   )
    // }

    const body = await request.json()
    const { enabled, org_id } = body

    if (typeof enabled !== 'boolean') {
      return NextResponse.json(
        { error: 'Parametrul "enabled" trebuie să fie boolean' },
        { status: 400 }
      )
    }

    // TODO: Implement Supabase integration
    // const supabase = createClient(
    //   process.env.NEXT_PUBLIC_SUPABASE_URL!,
    //   process.env.SUPABASE_SERVICE_ROLE_KEY!
    // )

    // // Actualizează sau creează setarea în site_settings
    // const { data, error } = await supabase
    //   .from('site_settings')
    //   .upsert([
    //     {
    //       org_id: org_id || null,
    //       key: 'coming_soon_enabled',
    //       value: enabled,
    //       updated_at: new Date().toISOString()
    //     }
    //   ])
    //   .select()

    // if (error) {
    //   console.error('Supabase error:', error)
    //   return NextResponse.json(
    //     { error: 'Eroare la actualizarea setărilor' },
    //     { status: 500 }
    //   )
    // }

    // Simulate successful update for now
    const mockData = {
      org_id: org_id || null,
      key: 'coming_soon_enabled',
      value: enabled,
      updated_at: new Date().toISOString()
    }

    // Log pentru debugging
    console.log('Coming soon toggle:', mockData)

    return NextResponse.json({
      success: true,
      message: `Coming soon ${enabled ? 'activat' : 'dezactivat'}`,
      data: mockData
    })

  } catch (error) {
    console.error('Toggle coming soon API error:', error)
    return NextResponse.json(
      { error: 'Eroare internă a serverului' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    // TODO: Implement Supabase integration to get current status
    // const supabase = createClient(
    //   process.env.NEXT_PUBLIC_SUPABASE_URL!,
    //   process.env.SUPABASE_SERVICE_ROLE_KEY!
    // )

    // const { data, error } = await supabase
    //   .from('site_settings')
    //   .select('value')
    //   .eq('key', 'coming_soon_enabled')
    //   .single()

    // if (error) {
    //   console.error('Supabase error:', error)
    //   return NextResponse.json(
    //     { error: 'Eroare la citirea setărilor' },
    //     { status: 500 }
    //   )
    // }

    // Simulate current status for now
    const mockStatus = {
      coming_soon_enabled: process.env.COMING_SOON === 'true',
      message: 'Status coming soon',
      version: '3.0'
    }

    return NextResponse.json(mockStatus)

  } catch (error) {
    console.error('Get coming soon status error:', error)
    return NextResponse.json(
      { error: 'Eroare internă a serverului' },
      { status: 500 }
    )
  }
}
