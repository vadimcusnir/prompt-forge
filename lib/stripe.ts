import Stripe from "stripe";

// Safe import pattern pentru Stripe
export function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY missing - Stripe client cannot be initialized");
  }
  
  return new Stripe(key, { 
    apiVersion: "2024-12-18.acacia" 
  });
}

// Funcție helper pentru a verifica dacă Stripe este disponibil
export function isStripeAvailable(): boolean {
  return !!process.env.STRIPE_SECRET_KEY;
}

// Funcție pentru a obține Stripe cu fallback
export function getStripeWithFallback() {
  try {
    return getStripe();
  } catch (error) {
    console.warn("Stripe not available:", error);
    return null;
  }
}

// Funcție pentru webhook secret
export function getStripeWebhookSecret(): string {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error("STRIPE_WEBHOOK_SECRET missing - Webhook verification cannot proceed");
  }
  return secret;
}
