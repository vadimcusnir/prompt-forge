import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia'
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      console.error('Missing stripe-signature header')
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
        { error: 'Webhook signature verification failed' },
        { status: 400 }
      )
    }

    console.log('Processing Stripe webhook:', event.type, event.id)

    // Log webhook to database
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Insert webhook log
    const { error: logError } = await supabase
      .from('stripe_webhooks')
      .insert([{
        stripe_event_id: event.id,
        event_type: event.type,
        event_data: event.data.object,
        processed: false
      }])

    if (logError) {
      console.error('Error logging webhook:', logError)
    }

    // Process different event types
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        await handleSubscriptionEvent(event.data.object as Stripe.Subscription)
        break

      case 'invoice.payment_succeeded':
      case 'invoice.payment_failed':
        await handleInvoiceEvent(event.data.object as Stripe.Invoice)
        break

      case 'payment_intent.succeeded':
      case 'payment_intent.payment_failed':
        await handlePaymentIntentEvent(event.data.object as Stripe.PaymentIntent)
        break

      case 'customer.created':
      case 'customer.updated':
        await handleCustomerEvent(event.data.object as Stripe.Customer)
        break

      default:
        console.log('Unhandled event type:', event.type)
    }

    // Mark webhook as processed
    await supabase
      .from('stripe_webhooks')
      .update({ 
        processed: true, 
        processed_at: new Date().toISOString() 
      })
      .eq('stripe_event_id', event.id)

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Error processing webhook:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function handleSubscriptionEvent(subscription: Stripe.Subscription) {
  try {
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Get customer details
    const { data: customerData } = await supabase
      .from('stripe_customers')
      .select('user_id')
      .eq('stripe_customer_id', subscription.customer as string)
      .single()

    if (!customerData) {
      console.error('Customer not found for subscription:', subscription.id)
      return
    }

    const subscriptionData = {
      user_id: customerData.user_id,
      stripe_customer_id: subscription.customer as string,
      stripe_subscription_id: subscription.id,
      stripe_price_id: subscription.items.data[0]?.price.id || '',
      product_id: null, // Will be set based on price lookup
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
      canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toISOString() : null,
      trial_start: subscription.trial_start ? new Date(subscription.trial_start * 1000).toISOString() : null,
      trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
      metadata: subscription.metadata
    }

    // Upsert subscription
    const { error } = await supabase
      .from('stripe_subscriptions')
      .upsert([subscriptionData], {
        onConflict: 'stripe_subscription_id'
      })

    if (error) {
      console.error('Error upserting subscription:', error)
    } else {
      console.log('Subscription processed successfully:', subscription.id)
    }

  } catch (error) {
    console.error('Error handling subscription event:', error)
  }
}

async function handleInvoiceEvent(invoice: Stripe.Invoice) {
  try {
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const invoiceData = {
      stripe_invoice_id: invoice.id,
      stripe_customer_id: invoice.customer as string,
      stripe_subscription_id: invoice.subscription as string,
      amount_paid: invoice.amount_paid,
      currency: invoice.currency,
      status: invoice.status,
      invoice_pdf: invoice.invoice_pdf,
      hosted_invoice_url: invoice.hosted_invoice_url,
      metadata: invoice.metadata
    }

    // Upsert invoice
    const { error } = await supabase
      .from('stripe_invoices')
      .upsert([invoiceData], {
        onConflict: 'stripe_invoice_id'
      })

    if (error) {
      console.error('Error upserting invoice:', error)
    } else {
      console.log('Invoice processed successfully:', invoice.id)
    }

  } catch (error) {
    console.error('Error handling invoice event:', error)
  }
}

async function handlePaymentIntentEvent(paymentIntent: Stripe.PaymentIntent) {
  try {
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const paymentIntentData = {
      stripe_payment_intent_id: paymentIntent.id,
      stripe_customer_id: paymentIntent.customer as string,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      status: paymentIntent.status,
      payment_method_types: paymentIntent.payment_method_types,
      metadata: paymentIntent.metadata
    }

    // Upsert payment intent
    const { error } = await supabase
      .from('stripe_payment_intents')
      .upsert([paymentIntentData], {
        onConflict: 'stripe_payment_intent_id'
      })

    if (error) {
      console.error('Error upserting payment intent:', error)
    } else {
      console.log('Payment intent processed successfully:', paymentIntent.id)
    }

  } catch (error) {
    console.error('Error handling payment intent event:', error)
  }
}

async function handleCustomerEvent(customer: Stripe.Customer) {
  try {
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const customerData = {
      stripe_customer_id: customer.id,
      email: customer.email || '',
      name: customer.name || '',
      metadata: customer.metadata
    }

    // Upsert customer
    const { error } = await supabase
      .from('stripe_customers')
      .upsert([customerData], {
        onConflict: 'stripe_customer_id'
      })

    if (error) {
      console.error('Error upserting customer:', error)
    } else {
      console.log('Customer processed successfully:', customer.id)
    }

  } catch (error) {
    console.error('Error handling customer event:', error)
  }
}
