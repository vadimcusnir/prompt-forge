# 🚀 PromptForge v3 Production Deployment Checklist

## ✅ Pre-Deployment Verification

### Code Quality
- [x] All components have proper exports (default vs named)
- [x] Build passes successfully (`npm run build`)
- [x] No TypeScript errors
- [x] All dependencies installed and up to date

### Environment Configuration
- [x] Production Stripe keys configured
- [x] Production Supabase keys configured
- [x] Webhook secret configured
- [x] Production environment variables set

## 🔑 Production Keys Status

### Stripe (✅ CONFIGURED)
```bash
STRIPE_SECRET_KEY=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
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_51RnpkGGcCmkUZPV6SHA1YkmOhd30qN2kAxm5n6iE4ZHNjzU84ZFWifiZQ22cKntXM38KfRkIriTeOHqiBrdPHWWG00dw7WcY9p
STRIPE_WEBHOOK_SECRET=whsec_LABaaLypGKgyw6qnPt0ugpOT6ozDQvrq
```

### Supabase (✅ CONFIGURED)
```bash
NEXT_PUBLIC_SUPABASE_URL=https://siebamncgfgbzorkiwvo.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpZWJhbW5jZmdmZ2J6b3JraXdvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTYwNjU2NywiZXhwIjoyMDcxMTgyNTY3fQ.7h_NRXxvMdKV9Lcme0EDTEzW3nClvgxd9jcDPubyumE
```

## 🌐 Domain & Hosting Setup

### Domain Configuration
- [ ] Configure `promptforge.ai` DNS records
- [ ] Set up SSL certificate (Let's Encrypt or hosting provider)
- [ ] Configure CDN if using one

### Hosting Platform
Choose one of these options:

#### Option 1: Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

#### Option 2: Netlify
```bash
# Build and deploy
npm run build
# Upload .next folder to Netlify
```

#### Option 3: Self-Hosted
```bash
# Build for production
npm run build

# Start production server
npm start
```

## 🔗 Stripe Webhook Configuration

### 1. Create Webhook Endpoint
1. Go to [Stripe Dashboard > Webhooks](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. URL: `https://promptforge.ai/api/stripe/webhook`
4. Select events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `customer.subscription.trial_will_end`

### 2. Verify Webhook Secret
- Secret: `whsec_LABaaLypGKgyw6qnPt0ugpOT6ozDQvrq`
- This should match your `STRIPE_WEBHOOK_SECRET`

### 3. Test Webhook
- Use Stripe Dashboard to send test events
- Verify database updates in Supabase
- Check application logs for webhook processing

## 🗄️ Database Setup

### Supabase Configuration
- [x] Production project created: `siebamncgfgbzorkiwvo`
- [x] Service role key configured
- [ ] Run database migrations
- [ ] Seed initial data

### Database Migrations
```bash
# If using Supabase CLI
supabase db push --db-url "postgresql://postgres:[password]@db.siebamncgfgbzorkiwvo.supabase.co:5432/postgres"

# Or run manually in Supabase Dashboard
```

### Initial Data
```bash
# Run seed script
npm run db:seed
```

## 🔒 Security Configuration

### Environment Variables
Ensure these are set in your hosting platform:
```bash
NODE_ENV=production
NEXT_PUBLIC_APP_ENV=production
NEXT_PUBLIC_DEBUG_MODE=false
NEXT_PUBLIC_APP_URL=https://promptforge.ai

# JWT and Session keys (generate secure ones)
JWT_SECRET=your_secure_jwt_secret_here
SESSION_ENCRYPTION_KEY=your_secure_session_key_here

# OpenAI API (if using)
OPENAI_API_KEY=sk-your-openai-key
OPENAI_ORGANIZATION=org-your-org-id
```

### Security Headers
- [ ] Configure CSP (Content Security Policy)
- [ ] Set up HSTS
- [ ] Configure CORS if needed
- [ ] Set up rate limiting

## 📊 Monitoring & Analytics

### Application Monitoring
- [ ] Set up error tracking (Sentry, LogRocket)
- [ ] Configure performance monitoring
- [ ] Set up uptime monitoring

### Stripe Monitoring
- [ ] Monitor webhook delivery success rates
- [ ] Set up webhook failure alerts
- [ ] Monitor subscription metrics

### Database Monitoring
- [ ] Set up Supabase monitoring
- [ ] Configure database performance alerts
- [ ] Monitor webhook database updates

## 🧪 Testing

### Pre-Launch Tests
- [ ] Test webhook endpoint with Stripe test events
- [ ] Verify subscription creation flow
- [ ] Test plan upgrades/downgrades
- [ ] Verify export functionality
- [ ] Test 7D engine with various parameters

### Load Testing
```bash
# Run load tests
npm run test:load

# Or use k6 directly
k6 run tests/k6-load-test.js
```

## 🚀 Launch Sequence

### 1. Final Verification
- [ ] All tests passing
- [ ] Webhook endpoint accessible
- [ ] Database migrations complete
- [ ] Environment variables configured

### 2. Deploy Application
- [ ] Deploy to production hosting
- [ ] Verify application is accessible
- [ ] Test all major functionality

### 3. Activate Stripe
- [ ] Switch from test to live mode
- [ ] Verify webhook endpoint is live
- [ ] Test with real subscription

### 4. Monitor Launch
- [ ] Watch error logs
- [ ] Monitor webhook delivery
- [ ] Check database updates
- [ ] Monitor user signups

## 📋 Post-Launch Checklist

### Day 1
- [ ] Monitor webhook delivery rates
- [ ] Check for any errors in logs
- [ ] Verify first real subscription
- [ ] Monitor database performance

### Week 1
- [ ] Review webhook success rates
- [ ] Analyze user behavior
- [ ] Check subscription metrics
- [ ] Review error patterns

### Month 1
- [ ] Performance optimization
- [ ] Feature usage analysis
- [ ] Customer feedback review
- [ ] Plan for next iteration

## 🆘 Emergency Procedures

### Webhook Failures
1. Check Stripe webhook delivery logs
2. Verify webhook endpoint accessibility
3. Check application logs for errors
4. Verify environment variables

### Database Issues
1. Check Supabase status page
2. Verify service role key permissions
3. Check RLS policies
4. Review database logs

### Application Crashes
1. Check hosting platform status
2. Review application logs
3. Verify environment configuration
4. Check for dependency issues

## 📞 Support Contacts

- **Stripe Support**: [support.stripe.com](https://support.stripe.com)
- **Supabase Support**: [supabase.com/support](https://supabase.com/support)
- **Hosting Platform**: Check your hosting provider's support

## 🔗 Useful Links

- [Production Environment Template](env.production.example)
- [Webhook Setup Guide](STRIPE_WEBHOOK_SETUP.md)
- [Implementation Summary](IMPLEMENTATION_SUMMARY.md)
- [Quality Gates Documentation](docs/QUALITY-GATES.md)

---

**Status**: 🟡 Ready for Production Deployment
**Last Updated**: $(date)
**Next Review**: After deployment
