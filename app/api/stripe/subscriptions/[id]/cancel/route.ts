import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const { reason } = body

    // Cancel the subscription at period end
    const subscription = await stripe.subscriptions.update(id, {
      cancel_at_period_end: true,
      metadata: {
        cancellation_reason: reason || 'User requested cancellation',
        cancelled_at: new Date().toISOString(),
      },
    })

    return NextResponse.json({ 
      success: true, 
      subscription: {
        id: subscription.id,
        status: subscription.status,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        canceledAt: subscription.canceled_at,
      }
    })
  } catch (error) {
    console.error('Error canceling subscription:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
