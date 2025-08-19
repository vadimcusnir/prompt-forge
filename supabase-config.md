# 🚀 CONFIGURAREA SUPABASE PRODUCTION

## 1. Variabile de Mediu (.env.local)

```bash
# Supabase Production
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Stripe Production
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your-publishable-key
STRIPE_SECRET_KEY=sk_live_your-secret-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret

# App Configuration
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXTAUTH_SECRET=your-nextauth-secret-here
NEXTAUTH_URL=https://your-domain.com
```

## 2. Pași de Configurare Supabase

### A. Creează proiectul production
1. Mergi la [supabase.com](https://supabase.com)
2. Creează un proiect nou
3. Notează URL-ul și cheile

### B. Rulează migrațiile
```bash
# Instalează Supabase CLI
npm install -g supabase

# Login
supabase login

# Link la proiectul production
supabase link --project-ref your-project-ref

# Rulează migrațiile
supabase db push
```

### C. Verifică tabelele
```sql
-- Verifică că toate tabelele sunt create
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('modules', 'users', 'licenses', 'industry_packs');
```

## 3. Configurare RLS (Row Level Security)

```sql
-- Activează RLS pentru toate tabelele
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE licenses ENABLE ROW LEVEL SECURITY;

-- Verifică că RLS este activ
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

## 4. Testare Conectare

```bash
# Testează conectarea
curl -X GET "https://your-project-ref.supabase.co/rest/v1/modules" \
  -H "apikey: your-anon-key-here"
```
