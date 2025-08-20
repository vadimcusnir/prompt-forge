import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { headers } from 'next/headers'
import { createServerSupabaseClient } from '@/lib/supabase/client'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = headers().get('stripe-signature')

    if (!signature) {
      console.error('Webhook: Missing stripe-signature header')
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      )
    }

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error('Webhook: Signature verification failed:', err)
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    console.log(`Webhook: Processing event ${event.type}`, { eventId: event.id })

    // Handle the event
    try {
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

        case 'customer.subscription.trial_will_end':
          const trialEnding = event.data.object as Stripe.Subscription
          await handleTrialWillEnd(trialEnding)
          break

        default:
          console.log(`Webhook: Unhandled event type: ${event.type}`)
      }

      console.log(`Webhook: Successfully processed event ${event.type}`)
      return NextResponse.json({ received: true, eventType: event.type })
    } catch (error) {
      console.error(`Webhook: Error processing event ${event.type}:`, error)
      return NextResponse.json(
        { error: 'Failed to process webhook event' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Webhook: General error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  console.log('Webhook: Checkout session completed:', session.id)
  
  if (!session.subscription || !session.customer) {
    console.error('Webhook: Session missing subscription or customer')
    return
  }

  const supabase = createServerSupabaseClient()
  
  try {
    // Get subscription details from Stripe
    const subscription = await stripe.subscriptions.retrieve(session.subscription as string)
    const customer = await stripe.customers.retrieve(session.customer as string)
    
    // Extract plan ID from metadata or subscription
    const planId = session.metadata?.planId || subscription.metadata?.planId || 'pro'
    
    // Find or create organization
    let orgId: string
    const { data: existingOrg } = await supabase
      .from('orgs')
      .select('id')
      .eq('stripe_customer_id', customer.id)
      .single()
    
    if (existingOrg) {
      orgId = existingOrg.id
    } else {
      // Create new organization
      const { data: newOrg, error: orgError } = await supabase
        .from('orgs')
        .insert({
          name: customer.name || 'New Organization',
          slug: `org-${Date.now()}`,
          plan_id: planId,
          stripe_customer_id: customer.id,
          status: 'active'
        })
        .select('id')
        .single()
      
      if (orgError) throw orgError
      orgId = newOrg.id
    }
    
    // Create or update subscription record
    const { error: subError } = await supabase
      .from('subscriptions')
      .upsert({
        org_id: orgId,
        plan_id: planId,
        status: subscription.status,
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        cancel_at_period_end: subscription.cancel_at_period_end,
        stripe_subscription_id: subscription.id,
        stripe_customer_id: customer.id,
        metadata: {
          checkout_session_id: session.id,
          mode: session.mode,
          payment_status: session.payment_status
        }
      })
    
    if (subError) throw subError
    
    console.log(`Webhook: Successfully updated subscription for org ${orgId}`)
  } catch (error) {
    console.error('Webhook: Error handling checkout session:', error)
    throw error
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  console.log('Webhook: Subscription created:', subscription.id)
  
  const supabase = createServerSupabaseClient()
  
  try {
    const customer = await stripe.customers.retrieve(subscription.customer as string)
    const planId = subscription.metadata?.planId || 'pro'
    
    // Find organization
    const { data: org, error: orgError } = await supabase
      .from('orgs')
      .select('id')
      .eq('stripe_customer_id', customer.id)
      .single()
    
    if (orgError || !org) {
      console.error('Webhook: Organization not found for subscription')
      return
    }
    
    // Update subscription status
    const { error: subError } = await supabase
      .from('subscriptions')
      .update({
        status: subscription.status,
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        cancel_at_period_end: subscription.cancel_at_period_end
      })
      .eq('stripe_subscription_id', subscription.id)
    
    if (subError) throw subError
    
    console.log(`Webhook: Successfully updated subscription ${subscription.id}`)
  } catch (error) {
    console.error('Webhook: Error handling subscription created:', error)
    throw error
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log('Webhook: Subscription updated:', subscription.id)
  
  const supabase = createServerSupabaseClient()
  
  try {
    // Update subscription in database
    const { error: subError } = await supabase
      .from('subscriptions')
      .update({
        status: subscription.status,
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        cancel_at_period_end: subscription.cancel_at_period_end,
        metadata: {
          updated_at: new Date().toISOString(),
          stripe_event: 'subscription.updated'
        }
      })
      .eq('stripe_subscription_id', subscription.id)
    
    if (subError) throw subError
    
    // If plan changed, update organization plan
    if (subscription.metadata?.planId) {
      const { error: orgError } = await supabase
        .from('orgs')
        .update({ 
          plan_id: subscription.metadata.planId,
          updated_at: new Date().toISOString()
        })
        .eq('stripe_customer_id', subscription.customer)
      
      if (orgError) throw orgError
    }
    
    console.log(`Webhook: Successfully updated subscription ${subscription.id}`)
  } catch (error) {
    console.error('Webhook: Error handling subscription updated:', error)
    throw error
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log('Webhook: Subscription deleted:', subscription.id)
  
  const supabase = createServerSupabaseClient()
  
  try {
    // Update subscription status to canceled
    const { error: subError } = await supabase
      .from('subscriptions')
      .update({
        status: 'canceled',
        updated_at: new Date().toISOString(),
        metadata: {
          canceled_at: new Date().toISOString(),
          stripe_event: 'subscription.deleted'
        }
      })
      .eq('stripe_subscription_id', subscription.id)
    
    if (subError) throw subError
    
    // Downgrade organization to free plan
    const { error: orgError } = await supabase
      .from('orgs')
      .update({ 
        plan_id: 'free',
        updated_at: new Date().toISOString()
      })
      .eq('stripe_customer_id', subscription.customer)
    
    if (orgError) throw orgError
    
    console.log(`Webhook: Successfully canceled subscription ${subscription.id}`)
  } catch (error) {
    console.error('Webhook: Error handling subscription deleted:', error)
    throw error
  }
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log('Webhook: Invoice payment succeeded:', invoice.id)
  
  if (invoice.subscription) {
    const supabase = createServerSupabaseClient()
    
    try {
      // Update subscription status if it was past_due
      const { error: subError } = await supabase
        .from('subscriptions')
        .update({
          status: 'active',
          updated_at: new Date().toISOString()
        })
        .eq('stripe_subscription_id', invoice.subscription)
        .eq('status', 'past_due')
      
      if (subError) throw subError
      
      console.log(`Webhook: Reactivated subscription ${invoice.subscription}`)
    } catch (error) {
      console.error('Webhook: Error handling invoice payment succeeded:', error)
      throw error
    }
  }
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  console.log('Webhook: Invoice payment failed:', invoice.id)
  
  if (invoice.subscription) {
    const supabase = createServerSupabaseClient()
    
    try {
      // Update subscription status to past_due
      const { error: subError } = await supabase
        .from('subscriptions')
        .update({
          status: 'past_due',
          updated_at: new Date().toISOString(),
          metadata: {
            last_payment_failed: new Date().toISOString(),
            invoice_id: invoice.id
          }
        })
        .eq('stripe_subscription_id', invoice.subscription)
      
      if (subError) throw subError
      
      console.log(`Webhook: Marked subscription ${invoice.subscription} as past_due`)
    } catch (error) {
      console.error('Webhook: Error handling invoice payment failed:', error)
      throw error
    }
  }
}

async function handleTrialWillEnd(subscription: Stripe.Subscription) {
  console.log('Webhook: Trial will end for subscription:', subscription.id)
  
  // You can implement trial ending notifications here
  // For example, send email to customer about trial ending
  console.log(`Webhook: Trial ending for subscription ${subscription.id} on ${new Date(subscription.trial_end! * 1000)}`)
}
