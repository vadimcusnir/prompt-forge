#!/usr/bin/env node

/**
 * Test Entitlements and Gating System
 * 
 * Tests:
 * 1. Plan validation
 * 2. Feature access control
 * 3. Module access restrictions
 * 4. Export format permissions
 * 5. Live testing access
 * 
 * Run with: node scripts/test-entitlements.js
 */

const BASE_URL = 'http://localhost:3001';

async function testEntitlements() {
  console.log('🧪 Testing PROMPTFORGE Entitlements System\n');

  const testPlans = ['free', 'creator', 'pro', 'enterprise'];
  const testFeatures = [
    'canExportMD',
    'canExportPDF', 
    'canExportJSON',
    'canExportBundleZip',
    'canUseGptTestReal',
    'hasAPI',
    'hasWhiteLabel'
  ];
  const testModules = ['M01', 'M10', 'M18', 'M02', 'M05', 'M20'];

  console.log('📋 Test Plans:', testPlans.join(', '));
  console.log('🔧 Test Features:', testFeatures.join(', '));
  console.log('📦 Test Modules:', testModules.join(', '));
  console.log('');

  // Test 1: Plan Information
  console.log('1️⃣ Testing Plan Information...');
  for (const planId of testPlans) {
    try {
      const response = await fetch(`${BASE_URL}/api/entitlements?planId=${planId}`);
      const data = await response.json();
      
      if (data.currentPlan) {
        console.log(`   ✅ ${planId.toUpperCase()}: ${data.currentPlan.name} - $${data.currentPlan.price_monthly}/month`);
        console.log(`      Export formats: ${data.currentPlan.limits.export_formats.join(', ')}`);
        console.log(`      Modules: ${data.currentPlan.features.allowedModules.join(', ')}`);
      } else {
        console.log(`   ❌ ${planId.toUpperCase()}: Invalid plan`);
      }
    } catch (error) {
      console.log(`   ❌ ${planId.toUpperCase()}: Error - ${error.message}`);
    }
  }
  console.log('');

  // Test 2: Feature Access Control
  console.log('2️⃣ Testing Feature Access Control...');
  for (const planId of testPlans) {
    console.log(`   📊 ${planId.toUpperCase()} Plan:`);
    for (const feature of testFeatures) {
      try {
        const response = await fetch(`${BASE_URL}/api/entitlements?planId=${planId}&feature=${feature}`);
        const data = await response.json();
        
        if (data.check) {
          const status = data.check.allowed ? '✅' : '❌';
          const required = data.check.requiredPlan;
          console.log(`      ${status} ${feature}: ${data.check.allowed ? 'Allowed' : `Requires ${required}`}`);
        }
      } catch (error) {
        console.log(`      ❌ ${feature}: Error - ${error.message}`);
      }
    }
    console.log('');
  }

  // Test 3: Module Access Restrictions
  console.log('3️⃣ Testing Module Access Restrictions...');
  for (const planId of testPlans) {
    console.log(`   📦 ${planId.toUpperCase()} Plan:`);
    for (const moduleId of testModules) {
      try {
        const response = await fetch(`${BASE_URL}/api/entitlements?planId=${planId}&moduleId=${moduleId}`);
        const data = await response.json();
        
        if (data.canAccess !== undefined) {
          const status = data.canAccess ? '✅' : '❌';
          console.log(`      ${status} ${moduleId}: ${data.canAccess ? 'Accessible' : 'Restricted'}`);
        }
      } catch (error) {
        console.log(`      ❌ ${moduleId}: Error - ${error.message}`);
      }
    }
    console.log('');
  }

  // Test 4: Export Format Permissions
  console.log('4️⃣ Testing Export Format Permissions...');
  const exportTests = [
    { plan: 'free', format: 'txt', expected: true },
    { plan: 'free', format: 'md', expected: false },
    { plan: 'free', format: 'pdf', expected: false },
    { plan: 'free', format: 'json', expected: false },
    { plan: 'free', format: 'zip', expected: false },
    { plan: 'creator', format: 'txt', expected: true },
    { plan: 'creator', format: 'md', expected: true },
    { plan: 'creator', format: 'pdf', expected: false },
    { plan: 'creator', format: 'json', expected: false },
    { plan: 'pro', format: 'txt', expected: true },
    { plan: 'pro', format: 'md', expected: true },
    { plan: 'pro', format: 'pdf', expected: true },
    { plan: 'pro', format: 'json', expected: true },
    { plan: 'pro', format: 'zip', expected: false },
    { plan: 'enterprise', format: 'txt', expected: true },
    { plan: 'enterprise', format: 'md', expected: true },
    { plan: 'enterprise', format: 'pdf', expected: true },
    { plan: 'enterprise', format: 'json', expected: true },
    { plan: 'enterprise', format: 'zip', expected: true }
  ];

  for (const test of exportTests) {
    try {
      const response = await fetch(`${BASE_URL}/api/entitlements?planId=${test.plan}&feature=canExport${test.format.toUpperCase()}`);
      const data = await response.json();
      
      if (data.check) {
        const actual = data.check.allowed;
        const status = actual === test.expected ? '✅' : '❌';
        console.log(`   ${status} ${test.plan.toUpperCase()} ${test.format.toUpperCase()}: Expected ${test.expected}, Got ${actual}`);
      }
    } catch (error) {
      console.log(`   ❌ ${test.plan.toUpperCase()} ${test.format.toUpperCase()}: Error - ${error.message}`);
    }
  }
  console.log('');

  // Test 5: Live Testing Access
  console.log('5️⃣ Testing Live Testing Access...');
  const liveTestPlans = ['free', 'creator', 'pro', 'enterprise'];
  for (const planId of liveTestPlans) {
    try {
      const response = await fetch(`${BASE_URL}/api/entitlements?planId=${planId}&feature=canUseGptTestReal`);
      const data = await response.json();
      
      if (data.check) {
        const status = data.check.allowed ? '✅' : '❌';
        const required = data.check.requiredPlan;
        console.log(`   ${status} ${planId.toUpperCase()}: ${data.check.allowed ? 'Live testing allowed' : `Requires ${required} plan`}`);
      }
    } catch (error) {
      console.log(`   ❌ ${planId.toUpperCase()}: Error - ${error.message}`);
    }
  }
  console.log('');

  // Test 6: API Access
  console.log('6️⃣ Testing API Access...');
  const apiTestPlans = ['free', 'creator', 'pro', 'enterprise'];
  for (const planId of apiTestPlans) {
    try {
      const response = await fetch(`${BASE_URL}/api/entitlements?planId=${planId}&feature=hasAPI`);
      const data = await response.json();
      
      if (data.check) {
        const status = data.check.allowed ? '✅' : '❌';
        const required = data.check.requiredPlan;
        console.log(`   ${status} ${planId.toUpperCase()}: ${data.check.allowed ? 'API access allowed' : `Requires ${required} plan`}`);
      }
    } catch (error) {
      console.log(`   ❌ ${planId.toUpperCase()}: Error - ${error.message}`);
    }
  }
  console.log('');

  console.log('🎯 Entitlements Test Summary:');
  console.log('   • Free: M01/M10/M18 only, .txt export only');
  console.log('   • Creator: All modules, .txt/.md export');
  console.log('   • Pro: All modules, .txt/.md/.pdf/.json, live testing');
  console.log('   • Enterprise: All modules, all exports, API access, bundle.zip');
  console.log('');
  console.log('✅ Entitlements testing completed!');
}

// Run tests
testEntitlements().catch(console.error);
