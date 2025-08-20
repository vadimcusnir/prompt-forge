#!/usr/bin/env node

/**
 * Environment Setup Script for PROMPTFORGE™ v3.0 Coming Soon
 * Run with: node scripts/setup-environment.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 PROMPTFORGE™ v3.0 - Environment Setup\n');

// Check if .env.local already exists
const envPath = '.env.local';
if (fs.existsSync(envPath)) {
  console.log('⚠️  .env.local already exists. Backing up to .env.local.backup');
  fs.copyFileSync(envPath, '.env.local.backup');
}

// Create environment file content
const envContent = `# Supabase Configuration - REQUIRED
# Get these values from your Supabase project dashboard
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Coming Soon Configuration - OPTIONAL
NEXT_PUBLIC_COMING_SOON=false
NEXT_PUBLIC_ADMIN_TOKEN=your_secure_admin_token_here

# Optional: Override coming soon message
NEXT_PUBLIC_COMING_SOON_MESSAGE="PROMPTFORGE™ v3.0 - Coming Soon!"

# Development Configuration
NODE_ENV=development
NEXT_PUBLIC_DEBUG=true
`;

// Write the environment file
fs.writeFileSync(envPath, envContent);

console.log('✅ .env.local created successfully!');
console.log('\n📋 Next steps:');
console.log('1. Go to your Supabase project dashboard');
console.log('2. Navigate to Settings > API');
console.log('3. Copy the following values:');
console.log('   - Project URL');
console.log('   - anon/public key');
console.log('   - service_role key (keep this secret!)');
console.log('\n4. Update .env.local with your actual values');
console.log('5. Generate a secure admin token for NEXT_PUBLIC_ADMIN_TOKEN');

console.log('\n🔐 To generate a secure admin token:');
console.log('   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"');

console.log('\n⚠️  IMPORTANT: Never commit .env.local to version control!');
console.log('   It should already be in .gitignore');

console.log('\n📚 For detailed setup instructions, see:');
console.log('   cursor/docs/coming_soon_bundle/README.md');
