# 💳 **STRIPE PRODUCTION SETUP - PROMPTFORGE™ v3.0**

## 🎯 **OVERVIEW:**
Acest ghid te va ajuta să configurezi Stripe pentru monetizarea PromptForge™ v3.0, inclusiv produsele, prețurile, webhook-urile și integrarea cu Supabase.

---

## **📋 PREREQUISITE-URI:**

### **1. Cont Stripe Production:**
- ✅ Cont Stripe activat
- ✅ API keys production (live keys)
- ✅ Webhook endpoint configurat
- ✅ Domain verificat

### **2. Environment Variables:**
```bash
# .env.local
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

---

## **🚀 PASUL 1: CONFIGURAREA PRODUSELOR ÎN STRIPE DASHBOARD**

### **Opțiunea A: Script Automat (Recomandat)**
```bash
# 1. Adaugă STRIPE_SECRET_KEY în .env.local
# 2. Rulează script-ul de setup
node scripts/stripe-setup.js
```

### **Opțiunea B: Manual în Stripe Dashboard**

#### **📦 PLANURI DE SUBSCRIPTIE:**

**🆓 FREE PLAN**
- **Product ID:** `promptforge_free`
- **Name:** PROMPTFORGE™ Free
- **Description:** Free plan with basic features - 5 modules/month, basic export, community support
- **Price:** $0/month (recurring)

**🚀 CREATOR PLAN**
- **Product ID:** `promptforge_creator`
- **Name:** PROMPTFORGE™ Creator
- **Description:** Creator plan for content creators - 25 modules/month, advanced export, priority support, industry packs
- **Price:** $19/month (recurring)

**⚡ PRO PLAN**
- **Product ID:** `promptforge_pro`
- **Name:** PROMPTFORGE™ Pro
- **Description:** Professional plan for businesses - Unlimited modules, premium export, API access, white-label, dedicated support
- **Price:** $49/month (recurring)

**🏢 ENTERPRISE PLAN**
- **Product ID:** `promptforge_enterprise`
- **Name:** PROMPTFORGE™ Enterprise
- **Description:** Enterprise plan with custom features - Everything + custom integrations, SLA, dedicated account manager
- **Price:** $199/month (recurring)

#### **🎁 INDUSTRY PACKS (ONE-TIME):**

**🛒 E-COMMERCE PACK**
- **Product ID:** `industry_ecommerce`
- **Name:** E-commerce Industry Pack
- **Description:** Specialized modules for e-commerce - 15 e-commerce specific modules, KPI templates, conversion optimization
- **Price:** $99 (one-time)

**🎓 EDUCATION PACK**
- **Product ID:** `industry_education`
- **Name:** Education Industry Pack
- **Description:** Specialized modules for education - 12 education modules, curriculum templates, assessment tools
- **Price:** $79 (one-time)

**💼 FINTECH PACK**
- **Product ID:** `industry_fintech`
- **Name:** FinTech Industry Pack
- **Description:** Specialized modules for fintech - 18 fintech modules, compliance templates, risk management
- **Price:** $129 (one-time)

---

## **🔗 PASUL 2: CONFIGURAREA WEBHOOK-URILOR**

### **1. În Stripe Dashboard:**
- Navighează la **Developers > Webhooks**
- Click **Add endpoint**
- **Endpoint URL:** `https://your-domain.com/api/webhooks/stripe`
- **Events to send:**
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `customer.subscription.trial_will_end`
  - `invoice.payment_succeeded`
  - `invoice.payment_failed`
  - `payment_intent.succeeded`
  - `payment_intent.payment_failed`
  - `customer.created`
  - `customer.updated`

### **2. Copiază Webhook Secret:**
- După crearea webhook-ului, copiază **Signing secret**
- Adaugă în `.env.local`: `STRIPE_WEBHOOK_SECRET=whsec_...`

---

## **🗄️ PASUL 3: VERIFICAREA DATABASE SCHEMA**

### **1. Aplică migrarea Stripe:**
```bash
# Verifică dacă tabelele au fost create
psql "postgres://postgres.siebamncfgfgbzorkiwo:K6jJte6CUmznURoT@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require" -c "\dt stripe_*"
```

### **2. Verifică produsele și prețurile:**
```bash
psql "postgres://postgres.siebamncfgfgbzorkiwo:K6jJte6CUmznURoT@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require" -c "SELECT stripe_product_id, name, active FROM stripe_products;"
```

---

## **🧪 PASUL 4: TESTAREA INTEGRĂRII**

### **1. Testează webhook-urile local:**
```bash
# Instalează Stripe CLI
brew install stripe/stripe-cli/stripe

# Login în contul tău Stripe
stripe login

# Testează webhook-urile
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

### **2. Testează API endpoints:**
```bash
# Testează produsele
curl http://localhost:3000/api/stripe/products

# Testează crearea checkout session
curl -X POST http://localhost:3000/api/stripe/create-checkout-session \
  -H "Content-Type: application/json" \
  -d '{
    "priceId": "price_creator",
    "customerEmail": "test@example.com",
    "customerName": "Test User",
    "successUrl": "http://localhost:3000/success",
    "cancelUrl": "http://localhost:3000/cancel"
  }'
```

---

## **🔐 PASUL 5: SECURITATE ȘI BEST PRACTICES**

### **1. Environment Variables:**
- ✅ **NU** comite niciodată `STRIPE_SECRET_KEY` în Git
- ✅ Folosește `STRIPE_PUBLISHABLE_KEY` doar în frontend
- ✅ `STRIPE_SECRET_KEY` și `STRIPE_WEBHOOK_SECRET` doar în backend

### **2. Webhook Security:**
- ✅ Verifică întotdeauna semnătura webhook-ului
- ✅ Loghează toate evenimentele pentru debugging
- ✅ Implementează retry logic pentru webhook-uri eșuate

### **3. Error Handling:**
- ✅ Tratează toate erorile Stripe API
- ✅ Implementează fallback pentru cazurile de eroare
- ✅ Monitorizează webhook-urile eșuate

---

## **📊 PASUL 6: MONITORIZAREA ȘI ANALYTICS**

### **1. Stripe Dashboard:**
- **Payments:** Monitorizează plățile și refund-urile
- **Subscriptions:** Urmărește abonamentele active
- **Customers:** Analizează comportamentul clienților
- **Webhooks:** Verifică statusul webhook-urilor

### **2. Supabase Analytics:**
- **Usage Tracking:** Monitorizează utilizarea modulelor
- **Feature Gating:** Verifică accesul la funcționalități
- **Billing History:** Urmărește istoricul facturilor

---

## **🚀 PASUL 7: DEPLOY PRODUCTION**

### **1. Vercel Environment Variables:**
```bash
# În Vercel Dashboard
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### **2. Update Webhook URL:**
- În Stripe Dashboard, actualizează webhook URL-ul la domain-ul tău production
- Testează webhook-ul cu `stripe listen --forward-to https://your-domain.com/api/webhooks/stripe`

### **3. Testează Payment Flow:**
- Creează un test customer
- Testează checkout-ul cu test card-uri
- Verifică webhook-urile în production

---

## **🎯 CHECKLIST FINAL:**

- [ ] **Stripe Products:** Toate produsele create cu prețurile corecte
- [ ] **Webhook Endpoint:** Configurat cu toate evenimentele necesare
- [ ] **Database Schema:** Tabelele Stripe create cu RLS policies
- [ ] **API Endpoints:** Toate endpoint-urile funcționale
- [ ] **Environment Variables:** Configurate corect
- [ ] **Webhook Testing:** Testat local și în production
- [ ] **Payment Flow:** Testat cu test card-uri
- [ ] **Error Handling:** Implementat pentru toate cazurile
- [ ] **Monitoring:** Configurat pentru webhook-uri și plăți

---

## **🔧 TROUBLESHOOTING:**

### **Webhook Errors:**
```bash
# Verifică webhook logs în Supabase
SELECT * FROM stripe_webhooks ORDER BY created_at DESC LIMIT 10;

# Testează webhook local
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

### **Payment Errors:**
```bash
# Verifică Stripe logs
stripe logs tail

# Verifică customer în database
SELECT * FROM stripe_customers WHERE email = 'customer@example.com';
```

---

## **🎉 CONCLUZIA:**

După urmarea acestui ghid, PromptForge™ v3.0 va avea:
- ✅ **Sistem complet de billing** cu Stripe
- ✅ **4 planuri de subscription** (Free, Creator, Pro, Enterprise)
- ✅ **3 industry packs** pentru vânzare one-time
- ✅ **Webhook integration** cu Supabase
- ✅ **API endpoints** pentru checkout și billing portal
- ✅ **Security** și error handling implementat

**PromptForge™ v3.0 este gata pentru monetizare!** 🚀

---

## **📞 SUPPORT:**

Dacă întâmpini probleme:
1. Verifică log-urile Stripe Dashboard
2. Verifică webhook-urile în Supabase
3. Testează cu Stripe CLI local
4. Verifică environment variables

**Happy monetizing! 💰✨**
