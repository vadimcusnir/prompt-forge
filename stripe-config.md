# 💳 CONFIGURAREA STRIPE PRODUCTION

## 1. Produse Stripe pentru Planurile PromptForge

### A. Creează produsele în Stripe Dashboard
```json
{
  "Free": {
    "price_id": "price_free_monthly",
    "amount": 0,
    "currency": "usd",
    "interval": "month"
  },
  "Creator": {
    "price_id": "price_creator_monthly", 
    "amount": 29,
    "currency": "usd",
    "interval": "month"
  },
  "Pro": {
    "price_id": "price_pro_monthly",
    "amount": 99,
    "currency": "usd", 
    "interval": "month"
  },
  "Enterprise": {
    "price_id": "price_enterprise_monthly",
    "amount": 299,
    "currency": "usd",
    "interval": "month"
  }
}
```

### B. Industry Packs
```json
{
  "E-Commerce Pack": {
    "price_id": "price_ecommerce_yearly",
    "amount": 1490,
    "currency": "eur",
    "interval": "year"
  },
  "Education Pack": {
    "price_id": "price_education_yearly", 
    "amount": 1490,
    "currency": "eur",
    "interval": "year"
  },
  "FinTech Pack": {
    "price_id": "price_fintech_yearly",
    "amount": 1990,
    "currency": "eur",
    "interval": "year"
  }
}
```

## 2. Webhook Endpoints

### A. Configurează webhook-urile în Stripe
```bash
# Endpoint pentru PromptForge
https://your-domain.com/api/stripe/webhook

# Events de urmărit:
- customer.subscription.created
- customer.subscription.updated  
- customer.subscription.deleted
- invoice.payment_succeeded
- invoice.payment_failed
```

### B. Implementare webhook în Next.js
```typescript
// pages/api/stripe/webhook.ts
import { buffer } from 'micro';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const buf = await buffer(req);
  const sig = req.headers['stripe-signature']!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
  } catch (err) {
    return res.status(400).json({ message: 'Webhook signature verification failed' });
  }

  // Procesează evenimentul
  switch (event.type) {
    case 'customer.subscription.created':
      await handleSubscriptionCreated(event.data.object);
      break;
    case 'customer.subscription.updated':
      await handleSubscriptionUpdated(event.data.object);
      break;
    case 'customer.subscription.deleted':
      await handleSubscriptionDeleted(event.data.object);
      break;
  }

  res.json({ received: true });
}
```

## 3. Integrare cu Supabase

### A. Tabela subscriptions
```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  stripe_subscription_id TEXT UNIQUE NOT NULL,
  stripe_customer_id TEXT,
  stripe_price_id TEXT,
  status TEXT NOT NULL,
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policy
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);
```

### B. Funcție pentru actualizare subscription
```sql
CREATE OR REPLACE FUNCTION update_subscription_status()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_subscription_status
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_subscription_status();
```

## 4. Testare Stripe

### A. Testează cu chei test
```bash
# Testează checkout
curl -X POST "https://your-domain.com/api/stripe/create-checkout-session" \
  -H "Content-Type: application/json" \
  -d '{
    "priceId": "price_creator_monthly",
    "successUrl": "https://your-domain.com/success",
    "cancelUrl": "https://your-domain.com/cancel"
  }'
```

### B. Verifică webhook-urile
```bash
# Testează webhook local cu Stripe CLI
stripe listen --forward-to localhost:3000/api/stripe/webhook
```
