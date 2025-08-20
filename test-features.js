#!/usr/bin/env node

/**
 * test-features.js — Feature Testing Script
 * 
 * Tests the new PromptForge v3 features without requiring the full server
 */

console.log('🧪 Testing PromptForge v3 Features')
console.log('==================================')
console.log('')

// Test 1: Check if environment variables are loaded
console.log('1️⃣ Testing Environment Configuration...')
try {
  require('dotenv').config({ path: '.env.local' })
  console.log('   ✅ .env.local loaded')
  
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'OPENAI_API_KEY'
  ]
  
  let missingVars = 0
  requiredVars.forEach(varName => {
    if (process.env[varName] && !process.env[varName].includes('your-')) {
      console.log(`   ✅ ${varName}: Configured`)
    } else {
      console.log(`   ⚠️  ${varName}: Not configured (using placeholder)`)
      missingVars++
    }
  })
  
  if (missingVars === 0) {
    console.log('   🎉 All environment variables configured!')
  } else {
    console.log(`   📝 ${missingVars} variables need configuration`)
  }
} catch (error) {
  console.log('   ❌ Error loading environment:', error.message)
}
console.log('')

// Test 2: Check if dependencies are installed
console.log('2️⃣ Testing Dependencies...')
try {
  const openai = require('openai')
  console.log('   ✅ OpenAI package installed')
} catch (error) {
  console.log('   ❌ OpenAI package not installed')
}

try {
  const supabase = require('@supabase/supabase-js')
  console.log('   ✅ Supabase package installed')
} catch (error) {
  console.log('   ❌ Supabase package not installed')
}
console.log('')

// Test 3: Check if our new files exist
console.log('3️⃣ Testing New Feature Files...')
const fs = require('fs')
const path = require('path')

const newFiles = [
  'lib/users/user-manager.ts',
  'lib/entitlements/plan-manager.ts',
  'lib/testing/test-framework.ts',
  'components/testing-dashboard.tsx',
  'app/api/testing/run-tests/route.ts'
]

newFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`   ✅ ${file} exists`)
  } else {
    console.log(`   ❌ ${file} missing`)
  }
})
console.log('')

// Test 4: Check package.json scripts
console.log('4️⃣ Testing Package Configuration...')
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))
  if (packageJson.scripts.dev) {
    console.log('   ✅ Development script available')
  } else {
    console.log('   ❌ Development script missing')
  }
} catch (error) {
  console.log('   ❌ Error reading package.json')
}
console.log('')

// Test 5: Summary and next steps
console.log('📊 Test Summary')
console.log('===============')
console.log('')

console.log('🎯 Next Steps:')
console.log('1. Configure your OpenAI API key in .env.local')
console.log('2. Set up your Supabase project and add credentials')
console.log('3. Start the server: npm run dev')
console.log('4. Test the GPT integration in the browser')
console.log('5. Run the testing framework: /api/testing/run-tests')
console.log('')

console.log('🔧 Configuration Required:')
console.log('- OpenAI API Key: https://platform.openai.com/api-keys')
console.log('- Supabase Project: https://supabase.com')
console.log('- Update .env.local with your actual values')
console.log('')

console.log('✅ Feature testing completed!')
console.log('   PromptForge v3 is ready for configuration and testing.')
