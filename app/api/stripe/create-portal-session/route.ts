import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import type Stripe from 'stripe'

export async function POST(request: NextRequest) {
  try {
    // Safe import Stripe - evaluat doar când ruta rulează
    const stripe = getStripe()
    
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const body = await request.json()
    const { customerEmail, returnUrl } = body

    if (!customerEmail || !returnUrl) {
      return NextResponse.json(
        { error: 'Missing required fields: customerEmail, returnUrl' },
        { status: 400 }
      )
    }

    // Get customer from our database
    const { data: customerData, error: customerError } = await supabase
      .from('stripe_customers')
      .select('stripe_customer_id')
      .eq('email', customerEmail)
      .single()

    if (customerError || !customerData) {
      console.error('Customer not found:', customerEmail)
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      )
    }

    // Create billing portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: customerData.stripe_customer_id,
      return_url: returnUrl,
    })

    console.log('Billing portal session created for customer:', customerEmail)

    return NextResponse.json({
      url: session.url
    })

  } catch (error) {
    console.error('Error creating billing portal session:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
