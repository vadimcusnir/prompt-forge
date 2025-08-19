# 🔧 CONFIGURAREA ENVIRONMENT VARIABLES

## Fișier .env.local

Creează un fișier `.env.local` în rădăcina proiectului cu următoarele variabile:

```bash
# PROMPTFORGE™ v3.0 - Environment Variables

# Coming Soon Toggle
COMING_SOON=false

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your-publishable-key
STRIPE_SECRET_KEY=sk_test_your-secret-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-here
NEXTAUTH_URL=http://localhost:3000

# Feature Flags
NEXT_PUBLIC_ENABLE_STRIPE=true
NEXT_PUBLIC_ENABLE_SUPABASE=true
NEXT_PUBLIC_ENABLE_ANALYTICS=false
```

## Variabile Cheie

### COMING_SOON
- `true` - Activează pagina coming soon pentru toate rutele
- `false` - Aplicația funcționează normal

### Supabase
- `NEXT_PUBLIC_SUPABASE_URL` - URL-ul proiectului Supabase
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Cheia publică anonimă
- `SUPABASE_SERVICE_ROLE_KEY` - Cheia de serviciu (privată)

### Stripe
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Cheia publică Stripe
- `STRIPE_SECRET_KEY` - Cheia secretă Stripe (privată)
- `STRIPE_WEBHOOK_SECRET` - Secretul pentru webhook-uri

## Testare

1. Creează `.env.local` cu valorile corecte
2. Repornește serverul: `pnpm dev`
3. Testează coming soon: setează `COMING_SOON=true`
4. Verifică redirecționarea automată
