#!/usr/bin/env node

/**
 * Functionality Testing Script for PROMPTFORGE™ v3.0 Coming Soon
 * Run with: node scripts/test-functionality.js
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 PROMPTFORGE™ v3.0 - Functionality Testing\n');

// Test 1: Environment Configuration
console.log('1. Environment Configuration Test...');
const envPath = '.env.local';
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const hasSupabaseUrl = envContent.includes('NEXT_PUBLIC_SUPABASE_URL=') && 
                        !envContent.includes('your-project-id.supabase.co');
  const hasSupabaseKey = envContent.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY=') && 
                        !envContent.includes('your_anon_key_here');
  const hasServiceKey = envContent.includes('SUPABASE_SERVICE_ROLE_KEY=') && 
                       !envContent.includes('your_service_role_key_here');
  
  if (hasSupabaseUrl && hasSupabaseKey && hasServiceKey) {
    console.log('   ✅ Supabase credentials configured');
  } else {
    console.log('   ❌ Supabase credentials not configured');
    console.log('      Run: node scripts/setup-environment.js');
  }
} else {
  console.log('   ❌ .env.local not found');
  console.log('      Run: node scripts/setup-environment.js');
}

// Test 2: Database Migration Status
console.log('\n2. Database Migration Status...');
const migrationPath = 'cursor/docs/supabase_migrations/0013_coming_soon_tables.sql';
if (fs.existsSync(migrationPath)) {
  console.log('   ✅ Migration file ready');
  console.log('   📋 Run: node scripts/run-migration.js');
} else {
  console.log('   ❌ Migration file not found');
}

// Test 3: Component Files
console.log('\n3. Component Files Check...');
const components = [
  'components/coming-soon.tsx',
  'components/admin-toggle.tsx',
  'hooks/use-coming-soon.ts'
];

components.forEach(component => {
  if (fs.existsSync(component)) {
    console.log(`   ✅ ${component}`);
  } else {
    console.log(`   ❌ ${component} - MISSING`);
  }
});

// Test 4: API Routes
console.log('\n4. API Routes Check...');
const apiRoutes = [
  'app/api/waitlist/route.ts',
  'app/api/toggle-coming-soon/route.ts'
];

apiRoutes.forEach(route => {
  if (fs.existsSync(route)) {
    console.log(`   ✅ ${route}`);
  } else {
    console.log(`   ❌ ${route} - MISSING`);
  }
});

// Test 5: Bundle Files
console.log('\n5. Export Bundle Check...');
const bundleFiles = [
  'cursor/docs/coming_soon_bundle/prompt.txt',
  'cursor/docs/coming_soon_bundle/prompt.md',
  'cursor/docs/coming_soon_bundle/prompt.json',
  'cursor/docs/coming_soon_bundle/manifest.json',
  'cursor/docs/coming_soon_bundle/checksum.txt',
  'cursor/docs/coming_soon_bundle/README.md'
];

bundleFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`   ✅ ${file}`);
  } else {
    console.log(`   ❌ ${file} - MISSING`);
  }
});

// Test 6: Main Page Integration
console.log('\n6. Main Page Integration...');
const mainPage = 'app/page.tsx';
if (fs.existsSync(mainPage)) {
  const content = fs.readFileSync(mainPage, 'utf8');
  if (content.includes('ComingSoon') && content.includes('AdminToggle')) {
    console.log('   ✅ Main page integration');
  } else {
    console.log('   ❌ Main page integration - INCOMPLETE');
  }
} else {
  console.log('   ❌ Main page not found');
}

console.log('\n📊 Test Summary:');
console.log('================');

// Count results
const allTests = [
  'environment_config',
  'database_migration',
  ...components,
  ...apiRoutes,
  ...bundleFiles,
  'main_page_integration'
];

const passed = allTests.filter(test => {
  if (test === 'environment_config') {
    return fs.existsSync('.env.local') && 
           fs.readFileSync('.env.local', 'utf8').includes('NEXT_PUBLIC_SUPABASE_URL=') &&
           !fs.readFileSync('.env.local', 'utf8').includes('your-project-id.supabase.co');
  }
  if (test === 'database_migration') {
    return fs.existsSync('cursor/docs/supabase_migrations/0013_coming_soon_tables.sql');
  }
  if (test === 'main_page_integration') {
    return fs.existsSync('app/page.tsx') && 
           fs.readFileSync('app/page.tsx', 'utf8').includes('ComingSoon');
  }
  return fs.existsSync(test);
}).length;

const total = allTests.length;
const percentage = Math.round((passed / total) * 100);

console.log(`   Tests Passed: ${passed}/${total} (${percentage}%)`);

if (percentage === 100) {
  console.log('\n🎉 All tests passed! Ready for production testing.');
  console.log('\n🚀 Next steps:');
  console.log('   1. Start your development server: npm run dev');
  console.log('   2. Test the coming soon page functionality');
  console.log('   3. Use Ctrl+Shift+A for admin access');
  console.log('   4. Test waitlist signup form');
  console.log('   5. Verify admin toggle functionality');
} else {
  console.log('\n⚠️  Some tests failed. Please complete the setup first.');
  console.log('\n🔧 Setup steps:');
  console.log('   1. Run: node scripts/setup-environment.js');
  console.log('   2. Configure Supabase credentials in .env.local');
  console.log('   3. Run: node scripts/run-migration.js');
  console.log('   4. Execute the SQL migration in Supabase');
  console.log('   5. Run this test script again');
}

console.log('\n🧪 Manual Testing Checklist:');
console.log('   □ Start development server');
console.log('   □ Visit homepage');
console.log('   □ Press Ctrl+Shift+A for admin panel');
console.log('   □ Toggle coming soon on/off');
console.log('   □ Test waitlist signup form');
console.log('   □ Verify database insertion');
console.log('   □ Test form validation');
console.log('   □ Check success confirmation');

console.log('\n📚 For detailed testing instructions, see:');
console.log('   cursor/docs/coming_soon_bundle/README.md');
