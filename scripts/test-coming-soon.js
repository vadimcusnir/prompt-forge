#!/usr/bin/env node

/**
 * Test script for Coming Soon functionality
 * Run with: node scripts/test-coming-soon.js
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Testing PROMPTFORGE™ v3.0 - Coming Soon Implementation\n');

// Test 1: Check if components exist
console.log('1. Checking component files...');
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

// Test 2: Check if API routes exist
console.log('\n2. Checking API routes...');
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

// Test 3: Check if bundle files exist
console.log('\n3. Checking export bundle...');
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

// Test 4: Check if main page is modified
console.log('\n4. Checking main page integration...');
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

// Test 5: Check environment example
console.log('\n5. Checking environment configuration...');
const envExample = 'env.example';
if (fs.existsSync(envExample)) {
  console.log('   ✅ Environment example file');
} else {
  console.log('   ❌ Environment example file - MISSING');
}

// Test 6: Check database migration
console.log('\n6. Checking database migration...');
const migration = 'cursor/docs/supabase_migrations/0013_coming_soon_tables.sql';
if (fs.existsSync(migration)) {
  console.log('   ✅ Database migration file');
} else {
  console.log('   ❌ Database migration file - MISSING');
}

console.log('\n📊 Test Summary:');
console.log('================');

// Count results
const allTests = [
  ...components,
  ...apiRoutes,
  ...bundleFiles,
  'main_page_integration',
  'environment_config',
  'database_migration'
];

const passed = allTests.filter(test => {
  if (test === 'main_page_integration') {
    return fs.existsSync('app/page.tsx') && 
           fs.readFileSync('app/page.tsx', 'utf8').includes('ComingSoon');
  }
  if (test === 'environment_config') {
    return fs.existsSync('env.example');
  }
  if (test === 'database_migration') {
    return fs.existsSync('cursor/docs/supabase_migrations/0013_coming_soon_tables.sql');
  }
  return fs.existsSync(test);
}).length;

const total = allTests.length;
const percentage = Math.round((passed / total) * 100);

console.log(`   Tests Passed: ${passed}/${total} (${percentage}%)`);

if (percentage === 100) {
  console.log('\n🎉 All tests passed! Coming Soon implementation is complete.');
  console.log('\n🚀 Next steps:');
  console.log('   1. Set up environment variables');
  console.log('   2. Run database migration');
  console.log('   3. Test the functionality');
  console.log('   4. Use Ctrl+Shift+A for admin access');
} else {
  console.log('\n⚠️  Some tests failed. Please check the missing files.');
  console.log('\n🔧 To complete the implementation:');
  console.log('   1. Review the missing files above');
  console.log('   2. Ensure all components are created');
  console.log('   3. Verify API routes are in place');
  console.log('   4. Check bundle files are generated');
}

console.log('\n📚 For detailed information, see: cursor/docs/coming_soon_bundle/README.md');
