#!/usr/bin/env node

/**
 * Stripe Price Update Script for PROMPTFORGE™ v3.0
 * 
 * This script updates existing Stripe prices to match /cursor specifications
 */

import Stripe from 'stripe'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia'
})

// Price updates - conform /cursor
const priceUpdates = [
  // Creator plan - update existing monthly price
  {
    priceId: 'price_1RxrIFGcCmkUZPV6n9lQDpCT', // existing price ID
    newAmount: 2900, // €29.00
    newCurrency: 'eur',
    newRecurring: { interval: 'month', interval_count: 1 }
  },
  // Pro plan - update existing monthly price
  {
    priceId: 'price_1RxrIGGcCmkUZPV6xmibdsg7', // existing price ID
    newAmount: 7900, // €79.00
    newCurrency: 'eur',
    newRecurring: { interval: 'month', interval_count: 1 }
  },
  // Enterprise plan - update existing monthly price
  {
    priceId: 'price_1RxrIGGcCmkUZPV6AQ0IZfjt', // existing price ID
    newAmount: 0, // €0 - custom pricing
    newCurrency: 'eur',
    newRecurring: null
  },
  // E-commerce - update existing price
  {
    priceId: 'price_1RxrIHGcCmkUZPV6xJWut3gc', // existing price ID
    newAmount: 149000, // €1490.00
    newCurrency: 'eur',
    newRecurring: { interval: 'year', interval_count: 1 }
  },
  // Education - update existing price
  {
    priceId: 'price_1RxrIIGcCmkUZPV6JSRE8Mug', // existing price ID
    newAmount: 149000, // €1490.00
    newCurrency: 'eur',
    newRecurring: { interval: 'year', interval_count: 1 }
  },
  // FinTech - update existing price
  {
    priceId: 'price_1RxrIJGcCmkUZPV6XKdiyKld', // existing price ID
    newAmount: 199000, // €1990.00
    newCurrency: 'eur',
    newRecurring: { interval: 'year', interval_count: 1 }
  }
]

async function updatePrices() {
  console.log('💰 Updating Stripe prices to match /cursor specifications...\n')

  for (const update of priceUpdates) {
    try {
      console.log(`🔄 Updating price ${update.priceId}...`)
      
      // Deactivate old price
      await stripe.prices.update(update.priceId, { active: false })
      console.log(`   ✅ Deactivated old price`)
      
      // Create new price with correct values
      const newPrice = await stripe.prices.create({
        unit_amount: update.newAmount,
        currency: update.newCurrency,
        recurring: update.newRecurring,
        product: await getProductIdFromPrice(update.priceId)
      })
      
      console.log(`   ✅ Created new price: ${newPrice.id}`)
      console.log(`   💰 Amount: ${(update.newAmount / 100).toFixed(2)} ${update.newCurrency.toUpperCase()}`)
      if (update.newRecurring) {
        console.log(`   📅 Recurring: ${update.newRecurring.interval}`)
      } else {
        console.log(`   📅 One-time`)
      }
      console.log('')
      
    } catch (error) {
      console.error(`   ❌ Error updating price ${update.priceId}:`, error.message)
    }
  }
}

async function getProductIdFromPrice(priceId) {
  try {
    const price = await stripe.prices.retrieve(priceId)
    return price.product
  } catch (error) {
    console.error(`Error getting product ID for price ${priceId}:`, error.message)
    return null
  }
}

async function addYearlyPrices() {
  console.log('📅 Adding yearly prices for subscription plans...\n')
  
  const yearlyPrices = [
    {
      productId: 'promptforge_creator',
      amount: 29000, // €290.00
      currency: 'eur'
    },
    {
      productId: 'promptforge_pro',
      amount: 79000, // €790.00
      currency: 'eur'
    }
  ]
  
  for (const yearly of yearlyPrices) {
    try {
      console.log(`🔄 Adding yearly price for ${yearly.productId}...`)
      
      const newPrice = await stripe.prices.create({
        unit_amount: yearly.amount,
        currency: yearly.currency,
        recurring: { interval: 'year', interval_count: 1 },
        product: yearly.productId
      })
      
      console.log(`   ✅ Created yearly price: ${newPrice.id}`)
      console.log(`   💰 Amount: ${(yearly.amount / 100).toFixed(2)} ${yearly.currency.toUpperCase()}/year`)
      console.log('')
      
    } catch (error) {
      console.error(`   ❌ Error creating yearly price for ${yearly.productId}:`, error.message)
    }
  }
}

async function main() {
  console.log('💳 PROMPTFORGE™ v3.0 - Stripe Price Update Script\n')
  
  if (!process.env.STRIPE_SECRET_KEY) {
    console.error('❌ STRIPE_SECRET_KEY not found in .env.local')
    process.exit(1)
  }

  try {
    // Test Stripe connection
    const account = await stripe.accounts.retrieve()
    console.log(`✅ Connected to Stripe account: ${account.display_name || account.id}\n`)

    // Update existing prices
    await updatePrices()
    
    // Add yearly prices
    await addYearlyPrices()

    console.log('🎉 Price updates completed!')
    console.log('\nNext steps:')
    console.log('1. Verify prices in Stripe Dashboard')
    console.log('2. Test checkout with new prices')
    console.log('3. Update database if needed')

  } catch (error) {
    console.error('❌ Update failed:', error.message)
    process.exit(1)
  }
}

// Run the script
main().catch(console.error)
