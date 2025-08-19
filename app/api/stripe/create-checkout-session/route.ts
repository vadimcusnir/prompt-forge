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
    const { priceId, customerEmail, customerName, successUrl, cancelUrl, mode = 'subscription' } = body

    if (!priceId || !customerEmail || !successUrl || !cancelUrl) {
      return NextResponse.json(
        { error: 'Missing required fields: priceId, customerEmail, successUrl, cancelUrl' },
        { status: 400 }
      )
    }

    // Get price details from database
    const { data: priceData, error: priceError } = await supabase
      .from('stripe_prices')
      .select(`
        stripe_price_id,
        unit_amount,
        currency,
        recurring,
        stripe_products!inner(
          stripe_product_id,
          name,
          description
        )
      `)
      .eq('stripe_price_id', priceId)
      .single()

    if (priceError || !priceData) {
      console.error('Price not found:', priceId)
      return NextResponse.json(
        { error: 'Price not found' },
        { status: 404 }
      )
    }

    // Create or get Stripe customer
    let customer: Stripe.Customer

    // Check if customer already exists in our database
    const { data: existingCustomer } = await supabase
      .from('stripe_customers')
      .select('stripe_customer_id')
      .eq('email', customerEmail)
      .single()

    if (existingCustomer) {
      // Get existing Stripe customer
      customer = await stripe.customers.retrieve(existingCustomer.stripe_customer_id) as Stripe.Customer
    } else {
      // Create new Stripe customer
      customer = await stripe.customers.create({
        email: customerEmail,
        name: customerName,
        metadata: {
          source: 'promptforge'
        }
      })

      // Save customer to our database
      const { error: customerError } = await supabase
        .from('stripe_customers')
        .insert([{
          stripe_customer_id: customer.id,
          email: customerEmail,
          name: customerName,
          metadata: { source: 'promptforge' }
        }])

      if (customerError) {
        console.error('Error saving customer:', customerError)
      }
    }

    // Create checkout session
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      customer: customer.id,
      payment_method_types: ['card'],
      line_items: [{
        price: priceId,
        quantity: 1,
      }],
      mode: mode as 'subscription' | 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        product_id: priceData.stripe_products.stripe_product_id,
        price_id: priceId,
        customer_email: customerEmail
      },
      billing_address_collection: 'required',
      allow_promotion_codes: true
    }

    // Add subscription-specific settings
    if (mode === 'subscription') {
      sessionParams.subscription_data = {
        metadata: {
          product_id: priceData.stripe_products.stripe_product_id,
          price_id: priceId,
          customer_email: customerEmail
        }
      }
    }

    const session = await stripe.checkout.sessions.create(sessionParams)

    console.log('Checkout session created:', session.id, 'for customer:', customerEmail)

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
      customerId: customer.id
    })

  } catch (error) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
