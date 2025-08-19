import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Get all active products with their prices
    const { data: products, error: productsError } = await supabase
      .from('stripe_products')
      .select(`
        id,
        stripe_product_id,
        name,
        description,
        active,
        stripe_prices (
          id,
          stripe_price_id,
          unit_amount,
          currency,
          recurring,
          active
        )
      `)
      .eq('active', true)
      .order('stripe_product_id')

    if (productsError) {
      console.error('Error fetching products:', productsError)
      return NextResponse.json(
        { error: 'Failed to fetch products' },
        { status: 500 }
      )
    }

    // Format products for frontend
    const formattedProducts = products.map(product => ({
      id: product.id,
      productId: product.stripe_product_id,
      name: product.name,
      description: product.description,
      prices: product.stripe_prices
        .filter(price => price.active)
        .map(price => ({
          id: price.id,
          priceId: price.stripe_price_id,
          amount: price.unit_amount,
          currency: price.currency,
          recurring: price.recurring,
          formattedPrice: formatPrice(price.unit_amount, price.currency, price.recurring)
        }))
    }))

    return NextResponse.json({
      products: formattedProducts
    })

  } catch (error) {
    console.error('Error in products API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function formatPrice(amount: number, currency: string, recurring: any): string {
  const formattedAmount = (amount / 100).toFixed(2)
  const symbol = currency === 'eur' ? '€' : '$'
  
  if (recurring) {
    const interval = recurring.interval
    const intervalCount = recurring.interval_count
    
    if (intervalCount === 1) {
      return `${symbol}${formattedAmount}/${interval}`
    } else {
      return `${symbol}${formattedAmount} every ${intervalCount} ${interval}s`
    }
  } else {
    return `${symbol}${formattedAmount}`
  }
}
