#!/usr/bin/env node

/**
 * Setup Environment Variables Script
 * 
 * This script helps users create a .env.local file with the necessary
 * environment variables to prevent crashes in PROMPTFORGE v3.
 * 
 * Usage: node scripts/setup-env.js
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

console.log('🚀 PROMPTFORGE v3 - Environment Setup');
console.log('=====================================\n');

// Check if .env.local already exists
const envLocalPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envLocalPath)) {
  console.log('⚠️  .env.local already exists!');
  console.log('   If you want to regenerate it, delete the existing file first.\n');
  process.exit(0);
}

// Generate secure random strings for development
const generateSecureString = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

// Template for .env.local
const envTemplate = `# PROMPTFORGE v3 — Environment Configuration
# Generated on ${new Date().toISOString()}
# This file contains the essential environment variables to prevent crashes

# ============================================================================
# SUPABASE CONFIGURATION (REQUIRED - Prevents crashes)
# ============================================================================
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# ============================================================================
# AUTHENTICATION & SECURITY (REQUIRED - Prevents JWT errors)
# ============================================================================
JWT_SECRET=${generateSecureString(64)}
SESSION_ENCRYPTION_KEY=${generateSecureString(64)}

# ============================================================================
# OPENAI API CONFIGURATION (REQUIRED - For GPT functionality)
# ============================================================================
OPENAI_API_KEY=sk-your-openai-api-key-here
OPENAI_ORGANIZATION=org-your-org-id-here
OPENAI_MODEL=gpt-4-turbo-preview
OPENAI_MAX_TOKENS=4000
OPENAI_TEMPERATURE=0.7

# ============================================================================
# STRIPE CONFIGURATION (REQUIRED - For subscription features)
# ============================================================================
STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-key-here
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-here
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret-here

# ============================================================================
# DEVELOPMENT SETTINGS
# ============================================================================
NODE_ENV=development
NEXT_PUBLIC_APP_ENV=development
NEXT_PUBLIC_DEBUG_MODE=true
NEXT_PUBLIC_APP_URL=http://localhost:3000

# ============================================================================
# NOTIFICATION SYSTEM (Optional - Prevents notification crashes)
# ============================================================================
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
TELEGRAM_CHAT_ID=your_telegram_chat_id_here
TELEGRAM_ENABLED=false
TELEGRAM_TEAM_LEAD_CHAT_ID=your_team_lead_chat_id
TELEGRAM_DEVOPS_CHAT_ID=your_devops_chat_id
TELEGRAM_SECURITY_CHAT_ID=your_security_chat_id
TELEGRAM_EMERGENCY_CHAT_ID=your_emergency_chat_id

# ============================================================================
# ADMIN ACCESS (Optional - For development features)
# ============================================================================
NEXT_PUBLIC_ADMIN_TOKEN=admin-token-for-development

# ============================================================================
# RATE LIMITING (Optional - Defaults provided)
# ============================================================================
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=900000

# ============================================================================
# LOGGING (Optional - Defaults provided)
# ============================================================================
LOG_LEVEL=info
`;

try {
  // Write .env.local file
  fs.writeFileSync(envLocalPath, envTemplate);
  
  console.log('✅ .env.local file created successfully!');
  console.log('   Location: ' + envLocalPath);
  console.log('\n📋 Next steps:');
  console.log('   1. Update the following REQUIRED variables with your actual values:');
  console.log('      - NEXT_PUBLIC_SUPABASE_URL');
  console.log('      - NEXT_PUBLIC_SUPABASE_ANON_KEY');
  console.log('      - SUPABASE_SERVICE_ROLE_KEY');
  console.log('      - OPENAI_API_KEY');
  console.log('      - STRIPE_SECRET_KEY (if using subscriptions)');
  console.log('\n   2. The JWT_SECRET and SESSION_ENCRYPTION_KEY have been');
  console.log('      automatically generated with secure random values.');
  console.log('\n   3. Restart your development server after making changes.');
  console.log('\n⚠️  IMPORTANT: Never commit .env.local to version control!');
  console.log('   It should already be in your .gitignore file.\n');
  
} catch (error) {
  console.error('❌ Error creating .env.local file:', error.message);
  process.exit(1);
}
