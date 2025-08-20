import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      planId,
      planName,
      priceId,
      successUrl,
      cancelUrl,
      customerEmail,
      metadata = {}
    } = body

    // Validate required fields
    if (!planId || !planName || !priceId || !successUrl || !cancelUrl) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: customerEmail,
      metadata: {
        planId,
        planName,
        ...metadata,
      },
      subscription_data: {
        metadata: {
          planId,
          planName,
        },
      },
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      customer_creation: 'always',
    })

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    })
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
