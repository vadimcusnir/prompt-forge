import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { headers } from 'next/headers'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = headers().get('stripe-signature')

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      )
    }

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session
        await handleCheckoutSessionCompleted(session)
        break

      case 'customer.subscription.created':
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionCreated(subscription)
        break

      case 'customer.subscription.updated':
        const updatedSubscription = event.data.object as Stripe.Subscription
        await handleSubscriptionUpdated(updatedSubscription)
        break

      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object as Stripe.Subscription
        await handleSubscriptionDeleted(deletedSubscription)
        break

      case 'invoice.payment_succeeded':
        const invoice = event.data.object as Stripe.Invoice
        await handleInvoicePaymentSucceeded(invoice)
        break

      case 'invoice.payment_failed':
        const failedInvoice = event.data.object as Stripe.Invoice
        await handleInvoicePaymentFailed(failedInvoice)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  console.log('Checkout session completed:', session.id)
  
  // Here you would typically:
  // 1. Update user's subscription status in your database
  // 2. Send welcome email
  // 3. Update entitlements
  // 4. Log the event
  
  if (session.metadata?.planId) {
    console.log(`User upgraded to plan: ${session.metadata.planId}`)
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  console.log('Subscription created:', subscription.id)
  
  // Update user's subscription status
  // Grant access to plan features
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log('Subscription updated:', subscription.id)
  
  // Handle plan changes, upgrades, downgrades
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log('Subscription deleted:', subscription.id)
  
  // Revoke access to plan features
  // Update user status
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log('Invoice payment succeeded:', invoice.id)
  
  // Handle successful recurring payments
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  console.log('Invoice payment failed:', invoice.id)
  
  // Handle failed payments
  // Send dunning emails
  // Update subscription status
}
