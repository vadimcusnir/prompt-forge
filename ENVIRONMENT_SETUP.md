# Environment Variables Setup Guide

## 🚨 Critical Issue: Environment Variables Missing

Without proper environment variables, PROMPTFORGE v3 will crash with the following errors:
- **JWT_SECRET errors** - Authentication and session management will fail
- **Supabase URL errors** - Database operations will crash
- **Component hydration failures** - Next.js will stop working properly
- **Module crashes** - Entitlements, notifications, and other features will fail

## 🚀 Quick Fix

### Option 1: Automated Setup (Recommended)
```bash
# Run the setup script to automatically create .env.local
node scripts/setup-env.js
```

### Option 2: Manual Setup
1. Copy `env.local.example` to `.env.local`
2. Update the required variables with your actual values
3. Restart your development server

## 📋 Required Environment Variables

### 🔐 Authentication & Security (CRITICAL)
```bash
JWT_SECRET=your_jwt_secret_at_least_32_characters_long
SESSION_ENCRYPTION_KEY=your_session_encryption_key_at_least_32_chars_long
```

### 🗄️ Supabase Configuration (CRITICAL)
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
```

### 🤖 OpenAI API (CRITICAL for GPT features)
```bash
OPENAI_API_KEY=sk-your-openai-api-key-here
OPENAI_ORGANIZATION=org-your-org-id-here
OPENAI_MODEL=gpt-4-turbo-preview
```

### 💳 Stripe (Required for subscriptions)
```bash
STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-key-here
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-here
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret-here
```

## 🔧 How to Get Your Values

### Supabase
1. Go to [supabase.com](https://supabase.com)
2. Create a new project or select existing
3. Go to Settings → API
4. Copy the URL and keys

### OpenAI
1. Go to [platform.openai.com](https://platform.openai.com)
2. Navigate to API Keys
3. Create a new secret key
4. Copy the key (starts with `sk-`)

### Stripe
1. Go to [stripe.com](https://stripe.com)
2. Navigate to Developers → API Keys
3. Copy the publishable and secret keys

## 🧪 Testing Your Configuration

After setting up your environment variables, test them:

```bash
# Test session manager functionality
node scripts/test-session-manager-production.js

# Test basic functionality
node scripts/test-functionality.js
```

## 🚫 Common Mistakes

1. **Missing .env.local file** - The file must exist in your project root
2. **Wrong variable names** - Use exact names from the examples
3. **Missing quotes** - String values should be quoted
4. **Trailing spaces** - Remove any trailing whitespace
5. **Wrong file location** - Must be in project root, not in subdirectories

## 🔄 After Making Changes

1. **Save the .env.local file**
2. **Restart your development server**:
   ```bash
   # Stop the current server (Ctrl+C)
   # Then restart
   npm run dev
   # or
   pnpm dev
   # or
   yarn dev
   ```

## 🛡️ Security Notes

- **Never commit .env.local to version control**
- **Use different keys for development and production**
- **Rotate keys regularly in production**
- **The .env.local file is already in .gitignore**

## 🆘 Still Having Issues?

If you're still experiencing crashes after setting up environment variables:

1. **Check the console** for specific error messages
2. **Verify file permissions** - .env.local should be readable
3. **Check for typos** in variable names
4. **Ensure no spaces** around the equals sign
5. **Restart your terminal** and development server

## 📚 Additional Resources

- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Supabase Documentation](https://supabase.com/docs)
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Stripe Documentation](https://stripe.com/docs)

---

**Remember**: Environment variables are the foundation of your application. Without them properly configured, the app will crash and components won't hydrate properly.
