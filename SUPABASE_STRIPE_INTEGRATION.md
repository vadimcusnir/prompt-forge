# PROMPTFORGE v3 - Supabase + Stripe Integration

Complete integration for gating and subscriptions with real-time entitlement checking, subscription management, and paywall UI.

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Layer      │    │   Database      │
│                 │    │                  │    │                 │
│ • Entitlement   │◄──►│ • /api/entitlements │◄──►│ • Supabase     │
│   Gates         │    │ • /api/run/[id]  │    │ • PostgreSQL    │
│ • Paywall UI    │    │ • Stripe webhooks│    │ • RLS Policies  │
│ • Plan Upgrades │    │                  │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌──────────────────┐
                       │     Stripe       │
                       │                  │
                       │ • Subscriptions  │
                       │ • Webhooks       │
                       │ • Checkout       │
                       └──────────────────┘
```

## 🔑 Core Components

### 1. Server-Side Supabase Client (`lib/supabase.ts`)

**Purpose**: Server-only Supabase client with SERVICE_ROLE privileges for admin operations.

**Key Functions**:
- `getEffectiveEntitlements()` - Gets user entitlements (user-specific → org-wide fallback)
- `upsertSubscription()` - Creates/updates subscription records
- `savePromptHistory()` - Stores prompt execution history
- `savePromptScores()` - Saves AI evaluation scores
- `hasEntitlement()` - Checks specific entitlement flags

**Environment Variables**:
```bash
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 2. Entitlements API (`/api/entitlements`)

**GET `/api/entitlements`**
- Returns effective entitlement flags for authenticated user
- Tries user-specific entitlements first, falls back to org-wide
- Includes organization context and plan information

**POST `/api/entitlements`**
- Updates user entitlements (admin/owner only)
- Allows granular entitlement management

**Authentication**: Bearer token in Authorization header

### 3. Module Execution API (`/api/run/[moduleId]`)

**POST `/api/run/{moduleId}`**
- Executes modules with 7D parameters
- Returns prompts and artifacts based on entitlements
- Uses `simulateGptResponse()` for Free/Creator, `liveGptTest()` for Pro/Enterprise
- Saves to cloud history if user has `hasCloudHistory` entitlement
- Saves scores if user has `hasEvaluatorAI` entitlement

**Entitlement Checks**:
- `canUseAllModules` - Module access restriction
- `canUseGptTestReal` - Live vs simulated testing
- `hasCloudHistory` - Cloud storage
- `hasEvaluatorAI` - Score saving

### 4. Stripe Integration

#### Checkout Session Creation (`/api/stripe/create-checkout-session`)
- Creates checkout sessions for Creator, Pro, Enterprise plans
- Handles trial periods (7 days for Pro)
- Maps plans to Stripe price IDs
- Customer creation with org metadata

#### Webhook Handler (`/api/stripe/webhook`)
- Processes subscription lifecycle events
- Updates database tables automatically
- Handles trials, payments, cancellations

**Supported Events**:
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `customer.subscription.trial_will_end`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

## 📊 Entitlement Flags

| Flag | Free | Creator | Pro | Enterprise |
|------|------|---------|-----|------------|
| `canUseAllModules` | ❌ | ✅ | ✅ | ✅ |
| `canExportMD` | ❌ | ✅ | ✅ | ✅ |
| `canExportPDF` | ❌ | ❌ | ✅ | ✅ |
| `canExportJSON` | ❌ | ❌ | ✅ | ✅ |
| `canUseGptTestReal` | ❌ | ❌ | ✅ | ✅ |
| `hasCloudHistory` | ❌ | ❌ | ✅ | ✅ |
| `hasEvaluatorAI` | ❌ | ❌ | ✅ | ✅ |
| `hasAPI` | ❌ | ❌ | ❌ | ✅ |
| `hasWhiteLabel` | ❌ | ❌ | ❌ | ✅ |
| `canExportBundleZip` | ❌ | ❌ | ❌ | ✅ |
| `hasSeatsGT1` | ❌ | ❌ | ❌ | ✅ |

## 💰 Pricing Plans

### Free Plan
- **Price**: $0/month
- **Features**: Basic modules (M01-M10), text export only
- **Limits**: 10 runs/month, 30-day retention

### Creator Plan
- **Price**: $9/month or $90/year
- **Features**: All modules, markdown export
- **Limits**: 50 runs/month, 90-day retention

### Pro Plan
- **Price**: $29/month or $290/year
- **Features**: All modules, PDF/JSON export, live GPT testing, cloud history
- **Limits**: 100 runs/month, 365-day retention
- **Trial**: 7 days free

### Enterprise Plan
- **Price**: $99/month or $990/year
- **Features**: Everything + API access, white-label, bundle exports
- **Limits**: 1000 runs/month, unlimited retention
- **Support**: Priority support, custom integrations

## 🔒 Frontend Integration

### Entitlement Gates

```tsx
import { EntitlementGate } from '@/components/entitlement-gate'

// Gate content based on entitlements
<EntitlementGate requiredEntitlement="canExportPDF">
  <PDFExportComponent />
</EntitlementGate>
```

### Entitlements Hook

```tsx
import { useEntitlements } from '@/hooks/useEntitlements'

function MyComponent() {
  const { hasEntitlement, organization, isLoading } = useEntitlements()
  
  if (hasEntitlement('canUseGptTestReal')) {
    return <LiveTestingComponent />
  }
  
  return <SimulatedTestingComponent />
}
```

### Plan Management

```tsx
import { usePlanEntitlements } from '@/hooks/useEntitlements'

function PlanUpgrade() {
  const { currentPlan, canUpgrade, planFeatures } = usePlanEntitlements()
  
  return (
    <div>
      <h2>Current Plan: {currentPlan}</h2>
      {canUpgrade && <UpgradeButton />}
    </div>
  )
}
```

## 🚀 Setup Instructions

### 1. Environment Variables

```bash
# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. Stripe Product Setup

Create products in Stripe with these price IDs:
- `price_creator_monthly` - $9.00/month
- `price_creator_yearly` - $90.00/year
- `price_pro_monthly` - $29.00/month
- `price_pro_yearly` - $290.00/year
- `price_enterprise_monthly` - $99.00/month
- `price_enterprise_yearly` - $990.00/year

### 3. Webhook Configuration

Set up Stripe webhook endpoint:
```
URL: https://yourdomain.com/api/stripe/webhook
Events: customer.subscription.*, invoice.payment_*
```

### 4. Database Migration

Run the provided SQL migrations to create:
- `entitlements` table
- `subscriptions` table
- `v_effective_entitlements` view
- RLS policies

## 🔍 Testing

### Test Entitlements API

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/entitlements
```

### Test Module Execution

```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"sevenD": {"domain": "generic", "scale": "team"}, "input": "test"}' \
  http://localhost:3000/api/run/1
```

### Test Stripe Webhook

Use Stripe CLI to test webhooks locally:
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

## 🛡️ Security Features

- **RLS Policies**: Row-level security on all tables
- **Service Role**: Server-only operations with elevated privileges
- **Token Validation**: JWT-based session management
- **Entitlement Checking**: Server-side validation before any operation
- **Audit Logging**: All entitlement changes are logged

## 📈 Monitoring & Analytics

### Entitlement Usage Tracking
- Gate hits logged to `telemetry_events`
- User behavior patterns
- Upgrade conversion rates

### Subscription Metrics
- Plan distribution
- Trial conversion rates
- Churn analysis

### Performance Monitoring
- API response times
- Database query performance
- Stripe webhook processing

## 🔄 Future Enhancements

1. **Usage-Based Billing**: Track API calls, storage usage
2. **Team Management**: Multi-user organizations with role-based access
3. **Custom Plans**: Tailored pricing for enterprise customers
4. **Analytics Dashboard**: Real-time entitlement and usage metrics
5. **Automated Upgrades**: Smart plan recommendations based on usage

## 🐛 Troubleshooting

### Common Issues

1. **Entitlements not loading**
   - Check `SUPABASE_SERVICE_ROLE_KEY` environment variable
   - Verify RLS policies are properly configured

2. **Stripe webhooks failing**
   - Verify `STRIPE_WEBHOOK_SECRET` matches Stripe dashboard
   - Check webhook endpoint URL is accessible

3. **Module execution errors**
   - Ensure user has required entitlements
   - Check 7D parameter validation

### Debug Mode

Enable debug logging by setting:
```bash
DEBUG=promptforge:*
```

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Stripe API Reference](https://stripe.com/docs/api)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- [PROMPTFORGE v3 Architecture](docs/ARCHITECTURE.md)

---

**Note**: This integration provides a production-ready foundation for SaaS applications with complex entitlement management. All security best practices are implemented, and the system is designed to scale with your business needs.
