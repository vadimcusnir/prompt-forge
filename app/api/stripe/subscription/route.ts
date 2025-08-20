import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

export async function GET(request: NextRequest) {
  try {
    // In a real app, you'd get the customer ID from the authenticated user
    // For now, we'll return a mock subscription or handle it differently
    
    const searchParams = request.nextUrl.searchParams
    const customerId = searchParams.get('customerId')
    
    if (!customerId) {
      return NextResponse.json(
        { error: 'Customer ID required' },
        { status: 400 }
      )
    }

    // Get customer's subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'all',
      expand: ['data.default_payment_method'],
    })

    if (subscriptions.data.length === 0) {
      return NextResponse.json({ subscription: null })
    }

    // Get the most recent active subscription
    const subscription = subscriptions.data[0]
    
    const subscriptionData = {
      id: subscription.id,
      status: subscription.status,
      planId: subscription.metadata?.planId || 'unknown',
      planName: subscription.metadata?.planName || 'Unknown Plan',
      currentPeriodStart: subscription.current_period_start,
      currentPeriodEnd: subscription.current_period_end,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      customerId: subscription.customer as string,
    }

    return NextResponse.json({ subscription: subscriptionData })
  } catch (error) {
    console.error('Error fetching subscription:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { customerId, priceId, planId, planName } = body

    if (!customerId || !priceId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      metadata: {
        planId,
        planName,
      },
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
    })

    return NextResponse.json({ subscription })
  } catch (error) {
    console.error('Error creating subscription:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
