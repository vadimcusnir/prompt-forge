# Stripe Webhook Configuration Guide

## Overview
This guide explains how to configure Stripe webhooks for PromptForge to handle subscription events and automatically update the database.

## Production Configuration
Your production environment is already configured with these keys:

```bash
# Stripe Production Keys
STRIPE_SECRET_KEY=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
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_51RnpkGGcCmkUZPV6SHA1YkmOhd30qN2kAxm5n6iE4ZHNjzU84ZFWifiZQ22cKntXM38KfRkIriTeOHqiBrdPHWWG00dw7WcY9p
STRIPE_WEBHOOK_SECRET=whsec_LABaaLypGKgyw6qnPt0ugpOT6ozDQvrq

# Supabase Production Keys
NEXT_PUBLIC_SUPABASE_URL=https://siebamncgfgbzorkiwvo.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpZWJhbW5jZmdmZ2J6b3JraXdvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTYwNjU2NywiZXhwIjoyMDcxMTgyNTY3fQ.7h_NRXxvMdKV9Lcme0EDTEzW3nClvgxd9jcDPubyumE
```

## Webhook Endpoint
Your production webhook endpoint should be:
```
https://promptforge.ai/api/stripe/webhook
```

## Required Environment Variables
Ensure these are set in your production environment:
```bash
STRIPE_SECRET_KEY=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
STRIPE_WEBHOOK_SECRET=whsec_LABaaLypGKgyw6qnPt0ugpOT6ozDQvrq
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpZWJhbW5jZmdmZ2J6b3JraXdvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTYwNjU2NywiZXhwIjoyMDcxMTgyNTY3fQ.7h_NRXxvMdKV9Lcme0EDTEzW3nClvgxd9jcDPubyumE
```

## Stripe Dashboard Configuration

### 1. Create Webhook Endpoint
1. Go to [Stripe Dashboard > Developers > Webhooks](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. Enter your webhook URL: `https://promptforge.ai/api/stripe/webhook`
4. Select the following events:

#### Required Events:
- `checkout.session.completed` - When a customer completes checkout
- `customer.subscription.created` - When a subscription is created
- `customer.subscription.updated` - When a subscription is updated
- `customer.subscription.deleted` - When a subscription is canceled
- `invoice.payment_succeeded` - When a recurring payment succeeds
- `invoice.payment_failed` - When a recurring payment fails
- `customer.subscription.trial_will_end` - When a trial is about to end

### 2. Verify Webhook Secret
Your webhook secret is: `whsec_LABaaLypGKgyw6qnPt0ugpOT6ozDQvrq`

This should match the `STRIPE_WEBHOOK_SECRET` in your environment variables.

## Webhook Event Handling

### checkout.session.completed
- Creates or updates organization record
- Links Stripe customer to organization
- Creates subscription record
- Updates plan entitlements

### customer.subscription.created
- Updates subscription status
- Links subscription to organization

### customer.subscription.updated
- Updates subscription details
- Handles plan changes
- Updates organization plan

### customer.subscription.deleted
- Marks subscription as canceled
- Downgrades organization to free plan
- Revokes premium features

### invoice.payment_succeeded
- Reactivates past_due subscriptions
- Updates payment status

### invoice.payment_failed
- Marks subscription as past_due
- Triggers dunning process

## Database Updates

The webhook automatically updates these tables:

### orgs
- `plan_id` - Current subscription plan
- `stripe_customer_id` - Stripe customer identifier
- `status` - Organization status

### subscriptions
- `status` - Subscription status (active, canceled, past_due)
- `current_period_start/end` - Billing period dates
- `stripe_subscription_id` - Stripe subscription identifier
- `metadata` - Additional event information

## Testing Webhooks

### 1. Stripe CLI (Recommended)
```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login to your Stripe account
stripe login

# Forward webhooks to local development
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

### 2. Test Events
Use Stripe Dashboard to send test events:
1. Go to your webhook endpoint
2. Click "Send test webhook"
3. Select event type (e.g., `checkout.session.completed`)
4. Click "Send test webhook"

### 3. Monitor Logs
Check your application logs for webhook processing:
```bash
# Development
npm run dev

# Production
# Check your hosting platform logs
```

## Security Features

### Signature Verification
- All webhooks are verified using `STRIPE_WEBHOOK_SECRET`
- Invalid signatures are rejected with 400 status
- Prevents webhook spoofing attacks

### Error Handling
- Comprehensive error logging
- Graceful failure handling
- Database transaction safety

### Rate Limiting
- Stripe automatically handles webhook delivery
- Retry logic for failed deliveries
- Exponential backoff for persistent failures

## Troubleshooting

### Common Issues

#### 1. Webhook Not Receiving Events
- Verify webhook URL is accessible
- Check Stripe webhook endpoint status
- Ensure correct events are selected

#### 2. Signature Verification Fails
- Verify `STRIPE_WEBHOOK_SECRET` is correct
- Check webhook secret hasn't been rotated
- Ensure webhook endpoint matches exactly

#### 3. Database Update Failures
- Check Supabase connection
- Verify database schema matches expectations
- Check RLS policies allow webhook operations

#### 4. Missing Events
- Verify all required events are selected in Stripe
- Check webhook endpoint is active
- Monitor Stripe webhook delivery logs

### Debug Mode
Enable detailed logging by setting:
```bash
LOG_LEVEL=debug
NEXT_PUBLIC_DEBUG_MODE=true
```

## Production Deployment

### 1. Update Webhook URL
Change webhook endpoint to production domain:
```
https://promptforge.ai/api/stripe/webhook
```

### 2. Environment Variables
Ensure production environment has:
- `STRIPE_SECRET_KEY` (live key) ✅ CONFIGURED
- `STRIPE_WEBHOOK_SECRET` (production webhook secret) ✅ CONFIGURED
- `SUPABASE_SERVICE_ROLE_KEY` (for database access) ✅ CONFIGURED

### 3. Monitoring
- Set up webhook delivery monitoring
- Configure error alerting
- Monitor database update success rates

## Support

For webhook-related issues:
1. Check Stripe webhook delivery logs
2. Review application error logs
3. Verify database schema and permissions
4. Test with Stripe CLI locally

## Additional Resources

- [Stripe Webhooks Documentation](https://stripe.com/docs/webhooks)
- [Stripe CLI Documentation](https://stripe.com/docs/stripe-cli)
- [Supabase Database Documentation](https://supabase.com/docs/guides/database)
