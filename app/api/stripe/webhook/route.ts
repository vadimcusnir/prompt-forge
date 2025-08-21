/**
 * app/api/stripe/webhook/route.ts — Stripe Webhook Handler
 * 
 * Handles Stripe webhook events for subscription lifecycle
 * Updates subscriptions and entitlements tables
 */

import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { 
  upsertSubscription, 
  updateSubscriptionStatus,
  updateUserEntitlements 
} from '@/lib/supabase'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe signature' },
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

    console.log('Processing Stripe webhook event:', event.type)

    // Handle different event types
    switch (event.type) {
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.trial_will_end':
        await handleTrialWillEnd(event.data.object as Stripe.Subscription)
        break

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice)
        break

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

// ============================================================================
// WEBHOOK EVENT HANDLERS
// ============================================================================

/**
 * Handle subscription creation
 */
async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  try {
    const customerId = subscription.customer as string
    const subscriptionId = subscription.id
    const planId = getPlanIdFromPriceId(subscription.items.data[0].price.id)
    const status = subscription.status
    const currentPeriodStart = new Date(subscription.current_period_start * 1000)
    const currentPeriodEnd = new Date(subscription.current_period_end * 1000)

    // Get organization ID from customer metadata
    const customer = await stripe.customers.retrieve(customerId)
    const orgId = customer.metadata.org_id

    if (!orgId) {
      console.error('No org_id found in customer metadata:', customerId)
      return
    }

    // Create subscription record
    await upsertSubscription({
      org_id: orgId,
      plan_id: planId,
      status: mapStripeStatus(status),
      current_period_start: currentPeriodStart.toISOString(),
      current_period_end: currentPeriodEnd.toISOString(),
      stripe_subscription_id: subscriptionId,
      stripe_customer_id: customerId,
      metadata: {
        stripe_subscription: subscription,
        trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null
      }
    })

    console.log(`Subscription created for org ${orgId}: ${planId}`)

  } catch (error) {
    console.error('Error handling subscription created:', error)
  }
}

/**
 * Handle subscription updates
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  try {
    const subscriptionId = subscription.id
    const status = subscription.status
    const currentPeriodStart = new Date(subscription.current_period_start * 1000)
    const currentPeriodEnd = new Date(subscription.current_period_end * 1000)

    // Update subscription status
    await updateSubscriptionStatus(
      subscriptionId,
      mapStripeStatus(status),
      {
        stripe_subscription: subscription,
        trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
        updated_at: new Date().toISOString()
      }
    )

    console.log(`Subscription ${subscriptionId} updated: ${status}`)

  } catch (error) {
    console.error('Error handling subscription updated:', error)
  }
}

/**
 * Handle subscription deletion
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  try {
    const subscriptionId = subscription.id

    // Update subscription status to canceled
    await updateSubscriptionStatus(
      subscriptionId,
      'canceled',
      {
        stripe_subscription: subscription,
        canceled_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    )

    console.log(`Subscription ${subscriptionId} canceled`)

  } catch (error) {
    console.error('Error handling subscription deleted:', error)
  }
}

/**
 * Handle trial ending
 */
async function handleTrialWillEnd(subscription: Stripe.Subscription) {
  try {
    const subscriptionId = subscription.id
    const customerId = subscription.customer as string

    // Send notification to customer about trial ending
    console.log(`Trial ending for subscription ${subscriptionId}`)

    // You could send an email notification here
    // await sendTrialEndingEmail(customerId)

  } catch (error) {
    console.error('Error handling trial will end:', error)
  }
}

/**
 * Handle successful payment
 */
async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  try {
    const subscriptionId = invoice.subscription as string
    const amount = invoice.amount_paid
    const currency = invoice.currency

    console.log(`Payment succeeded for subscription ${subscriptionId}: ${amount} ${currency}`)

    // Update subscription status if needed
    if (invoice.subscription) {
      await updateSubscriptionStatus(
        subscriptionId,
        'active',
        {
          last_payment: {
            amount,
            currency,
            invoice_id: invoice.id,
            paid_at: new Date().toISOString()
          }
        }
      )
    }

  } catch (error) {
    console.error('Error handling payment succeeded:', error)
  }
}

/**
 * Handle failed payment
 */
async function handlePaymentFailed(invoice: Stripe.Invoice) {
  try {
    const subscriptionId = invoice.subscription as string
    const attemptCount = invoice.attempt_count

    console.log(`Payment failed for subscription ${subscriptionId}, attempt ${attemptCount}`)

    // Update subscription status if needed
    if (invoice.subscription) {
      await updateSubscriptionStatus(
        subscriptionId,
        'past_due',
        {
          payment_failure: {
            attempt_count: attemptCount,
            last_attempt: new Date().toISOString(),
            invoice_id: invoice.id
          }
        }
      )
    }

  } catch (error) {
    console.error('Error handling payment failed:', error)
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Map Stripe subscription status to internal status
 */
function mapStripeStatus(stripeStatus: string): string {
  const statusMap: Record<string, string> = {
    'active': 'active',
    'canceled': 'canceled',
    'incomplete': 'pending',
    'incomplete_expired': 'expired',
    'past_due': 'past_due',
    'trialing': 'trial',
    'unpaid': 'unpaid'
  }

  return statusMap[stripeStatus] || 'unknown'
}

/**
 * Get plan ID from Stripe price ID
 */
function getPlanIdFromPriceId(priceId: string): string {
  // Map Stripe price IDs to plan IDs
  // This should match your Stripe product configuration
  const priceToPlanMap: Record<string, string> = {
    'price_free': 'free',
    'price_creator_monthly': 'creator',
    'price_creator_yearly': 'creator',
    'price_pro_monthly': 'pro',
    'price_pro_yearly': 'pro',
    'price_enterprise_monthly': 'enterprise',
    'price_enterprise_yearly': 'enterprise'
  }

  return priceToPlanMap[priceId] || 'free'
}
