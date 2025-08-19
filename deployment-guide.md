# 🌐 DEPLOYMENT PROMPTFORGE™ v3.0

## 1. DEPLOYMENT PE VERCEL (RECOMANDAT)

### A. Pregătire proiect
```bash
# Verifică că toate dependențele sunt în package.json
pnpm install

# Build local pentru testare
pnpm build

# Verifică că build-ul funcționează
pnpm start
```

### B. Configurare Vercel
```bash
# Instalează Vercel CLI
npm i -g vercel

# Login în Vercel
vercel login

# Deploy primul
vercel

# Pentru production
vercel --prod
```

### C. Configurare automată
```bash
# Creează vercel.json
{
  "buildCommand": "pnpm build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "installCommand": "pnpm install",
  "env": {
    "NEXT_PUBLIC_SUPABASE_URL": "@supabase_url",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@supabase_anon_key",
    "SUPABASE_SERVICE_ROLE_KEY": "@supabase_service_role_key",
    "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY": "@stripe_publishable_key",
    "STRIPE_SECRET_KEY": "@stripe_secret_key",
    "STRIPE_WEBHOOK_SECRET": "@stripe_webhook_secret",
    "NEXTAUTH_SECRET": "@nextauth_secret",
    "NEXTAUTH_URL": "@nextauth_url"
  }
}
```

### D. Environment Variables în Vercel Dashboard
```bash
# Setează variabilele în Vercel Dashboard
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=https://your-domain.vercel.app
```

## 2. DEPLOYMENT PE NETLIFY (ALTERNATIVĂ)

### A. Configurare netlify.toml
```toml
[build]
  command = "pnpm build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[functions]
  directory = "netlify/functions"
```

### B. Build și deploy
```bash
# Build local
pnpm build

# Deploy cu Netlify CLI
npm install -g netlify-cli
netlify login
netlify deploy --prod --dir=.next
```

## 3. CONFIGURARE DOMAIN ȘI SSL

### A. Domain personal
```bash
# În Vercel Dashboard:
# 1. Settings → Domains
# 2. Add Domain: promptforge.com
# 3. Configurează DNS-ul:
#    A: 76.76.19.36
#    CNAME: www → promptforge.com
```

### B. SSL automat
```bash
# Vercel generează automat SSL-ul
# Pentru Netlify, SSL-ul este activat automat
# Verifică că https:// promptforge.com funcționează
```

## 4. MONITORING ȘI ANALYTICS

### A. Vercel Analytics
```bash
# În package.json
{
  "dependencies": {
    "@vercel/analytics": "^1.0.0"
  }
}

# În _app.tsx
import { Analytics } from '@vercel/analytics/react';

export default function App({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      <Analytics />
    </>
  );
}
```

### B. Error Monitoring
```bash
# Sentry pentru error tracking
npm install @sentry/nextjs

# Configurare sentry.config.js
const { withSentryConfig } = require('@sentry/nextjs');

module.exports = withSentryConfig(
  {
    // config Next.js
  },
  {
    // config Sentry
    silent: true,
    org: "your-org",
    project: "promptforge",
  }
);
```

## 5. CI/CD AUTOMAT

### A. GitHub Actions pentru Vercel
```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

### B. Auto-deploy pe push
```bash
# În Vercel Dashboard:
# 1. Settings → Git
# 2. Connect Repository
# 3. Enable Auto Deploy
# 4. Set Production Branch: main
```

## 6. TESTARE POST-DEPLOYMENT

### A. Health Check
```bash
# Testează endpoint-ul principal
curl https://promptforge.com/api/health

# Verifică Supabase
curl https://promptforge.com/api/supabase/status

# Testează Stripe
curl https://promptforge.com/api/stripe/status
```

### B. Performance Testing
```bash
# Lighthouse CI
npm install -g @lhci/cli
lhci autorun

# Core Web Vitals
# Verifică în Vercel Analytics
```

## 7. ROLLBACK STRATEGY

### A. Vercel Rollback
```bash
# În Vercel Dashboard:
# 1. Deployments
# 2. Găsește deployment-ul stabil
# 3. Click "Promote to Production"
```

### B. Database Rollback
```sql
-- Dacă e nevoie de rollback la migrații
-- În Supabase Dashboard:
-- 1. SQL Editor
-- 2. Rulează migrația inversă
-- 3. Verifică integritatea datelor
```

## 🎯 CHECKLIST FINAL DEPLOYMENT

- [ ] Build local funcționează
- [ ] Environment variables configurate
- [ ] Supabase production conectat
- [ ] Stripe production configurat
- [ ] Domain configurat
- [ ] SSL activat
- [ ] Monitoring configurat
- [ ] CI/CD activat
- [ ] Health checks trec
- [ ] Performance optimizat
- [ ] Rollback strategy pregătită

## 🚀 PROMPTFORGE™ v3.0 ESTE GATA DE PRODUCȚIE!
