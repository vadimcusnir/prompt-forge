#!/usr/bin/env node

/**
 * Stripe Setup Script for PROMPTFORGE™ v3.0
 * 
 * This script creates all necessary products and prices in Stripe Dashboard
 * Run this after setting up your Stripe account and getting your API keys
 */

import Stripe from 'stripe'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia'
})

// Product definitions
const products = [
  {
    id: 'promptforge_free',
    name: 'PROMPTFORGE™ Free',
    description: 'Free plan with basic features - 5 modules/month, basic export, community support',
    prices: [
      {
        id: 'price_free',
        amount: 0,
        currency: 'usd',
        recurring: { interval: 'month', interval_count: 1 }
      }
    ]
  },
  {
    id: 'promptforge_creator',
    name: 'PROMPTFORGE™ Creator',
    description: 'Creator plan for content creators - 25 modules/month, advanced export, priority support, industry packs',
    prices: [
      {
        id: 'price_creator',
        amount: 1900, // $19.00
        currency: 'usd',
        recurring: { interval: 'month', interval_count: 1 }
      }
    ]
  },
  {
    id: 'promptforge_pro',
    name: 'PROMPTFORGE™ Pro',
    description: 'Professional plan for businesses - Unlimited modules, premium export, API access, white-label, dedicated support',
    prices: [
      {
        id: 'price_pro',
        amount: 4900, // $49.00
        currency: 'usd',
        recurring: { interval: 'month', interval_count: 1 }
      }
    ]
  },
  {
    id: 'promptforge_enterprise',
    name: 'PROMPTFORGE™ Enterprise',
    description: 'Enterprise plan with custom features - Everything + custom integrations, SLA, dedicated account manager',
    prices: [
      {
        id: 'price_enterprise',
        amount: 19900, // $199.00
        currency: 'usd',
        recurring: { interval: 'month', interval_count: 1 }
      }
    ]
  },
  {
    id: 'industry_ecommerce',
    name: 'E-commerce Industry Pack',
    description: 'Specialized modules for e-commerce - 15 e-commerce specific modules, KPI templates, conversion optimization',
    prices: [
      {
        id: 'price_ecommerce',
        amount: 9900, // $99.00
        currency: 'usd',
        recurring: null // One-time purchase
      }
    ]
  },
  {
    id: 'industry_education',
    name: 'Education Industry Pack',
    description: 'Specialized modules for education - 12 education modules, curriculum templates, assessment tools',
    prices: [
      {
        id: 'price_education',
        amount: 7900, // $79.00
        currency: 'usd',
        recurring: null // One-time purchase
      }
    ]
  },
  {
    id: 'industry_fintech',
    name: 'FinTech Industry Pack',
    description: 'Specialized modules for fintech - 18 fintech modules, compliance templates, risk management',
    prices: [
      {
        id: 'price_fintech',
        amount: 12900, // $129.00
        currency: 'usd',
        recurring: null // One-time purchase
      }
    ]
  }
]

async function createProducts() {
  console.log('🚀 Creating products in Stripe Dashboard...\n')

  for (const product of products) {
    try {
      console.log(`📦 Creating product: ${product.name}`)
      
      // Create product
      const stripeProduct = await stripe.products.create({
        id: product.id,
        name: product.name,
        description: product.description,
        metadata: {
          source: 'promptforge',
          version: '3.0'
        }
      })

      console.log(`✅ Product created: ${stripeProduct.id}`)

      // Create prices for the product
      for (const price of product.prices) {
        console.log(`💰 Creating price: ${price.id} - $${(price.amount / 100).toFixed(2)}`)
        
        const priceData = {
          product: stripeProduct.id,
          unit_amount: price.amount,
          currency: price.currency,
          metadata: {
            source: 'promptforge',
            price_id: price.id
          }
        }

        if (price.recurring) {
          priceData.recurring = price.recurring
        }

        const stripePrice = await stripe.prices.create(priceData)
        console.log(`✅ Price created: ${stripePrice.id}`)
      }

      console.log(`✅ Product ${product.name} completed successfully!\n`)

    } catch (error) {
      if (error.code === 'resource_already_exists') {
        console.log(`⚠️  Product ${product.name} already exists, skipping...\n`)
      } else {
        console.error(`❌ Error creating product ${product.name}:`, error.message)
      }
    }
  }
}

async function listProducts() {
  console.log('📋 Listing all products in Stripe Dashboard...\n')

  try {
    const products = await stripe.products.list({ limit: 100 })
    
    for (const product of products.data) {
      console.log(`📦 Product: ${product.name} (${product.id})`)
      console.log(`   Description: ${product.description}`)
      console.log(`   Active: ${product.active}`)
      
      // Get prices for this product
      const prices = await stripe.prices.list({ product: product.id })
      for (const price of prices.data) {
        const amount = price.unit_amount ? (price.unit_amount / 100).toFixed(2) : '0.00'
        const recurring = price.recurring ? `/${price.recurring.interval}` : ' (one-time)'
        console.log(`   💰 Price: $${amount}${recurring} (${price.id})`)
      }
      console.log('')
    }

  } catch (error) {
    console.error('❌ Error listing products:', error.message)
  }
}

async function createWebhook() {
  console.log('🔗 Creating webhook endpoint...\n')

  try {
    // You'll need to replace this with your actual domain
    const webhookUrl = 'https://your-domain.com/api/webhooks/stripe'
    
    const webhook = await stripe.webhookEndpoints.create({
      url: webhookUrl,
      enabled_events: [
        'customer.subscription.created',
        'customer.subscription.updated',
        'customer.subscription.deleted',
        'customer.subscription.trial_will_end',
        'invoice.payment_succeeded',
        'invoice.payment_failed',
        'payment_intent.succeeded',
        'payment_intent.payment_failed',
        'customer.created',
        'customer.updated'
      ],
      metadata: {
        source: 'promptforge'
      }
    })

    console.log(`✅ Webhook created: ${webhook.id}`)
    console.log(`🔑 Webhook secret: ${webhook.secret}`)
    console.log(`📝 Add this to your .env.local: STRIPE_WEBHOOK_SECRET=${webhook.secret}`)

  } catch (error) {
    console.error('❌ Error creating webhook:', error.message)
  }
}

async function main() {
  console.log('💳 PROMPTFORGE™ v3.0 - Stripe Setup Script\n')
  console.log('This script will:')
  console.log('1. Create all products and prices in Stripe Dashboard')
  console.log('2. List existing products')
  console.log('3. Create webhook endpoint\n')

  if (!process.env.STRIPE_SECRET_KEY) {
    console.error('❌ STRIPE_SECRET_KEY not found in .env.local')
    console.log('Please add your Stripe secret key to .env.local')
    process.exit(1)
  }

  try {
    // Test Stripe connection
    const account = await stripe.accounts.retrieve()
    console.log(`✅ Connected to Stripe account: ${account.display_name || account.id}\n`)

    // Create products
    await createProducts()
    
    // List products
    await listProducts()
    
    // Create webhook
    await createWebhook()

    console.log('🎉 Stripe setup completed successfully!')
    console.log('\nNext steps:')
    console.log('1. Copy the webhook secret to your .env.local')
    console.log('2. Test the webhook with Stripe CLI: stripe listen --forward-to localhost:3000/api/webhooks/stripe')
    console.log('3. Update your database with the new Stripe product IDs')

  } catch (error) {
    console.error('❌ Setup failed:', error.message)
    process.exit(1)
  }
}

// Run the script
main().catch(console.error)
