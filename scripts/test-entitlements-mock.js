#!/usr/bin/env node

/**
 * Mock Test Entitlements Logic
 * Tests the EntitlementChecker class directly without API calls
 */

// Mock the EntitlementChecker class
class EntitlementChecker {
  static checkFeature(planId, feature) {
    const featureRequirements = {
      'canExportMD': 'creator',
      'canExportPDF': 'pro',
      'canExportJSON': 'pro',
      'canExportBundleZip': 'enterprise',
      'canUseGptTestReal': 'pro',
      'hasAPI': 'enterprise',
      'hasWhiteLabel': 'enterprise'
    };

    const requiredPlan = featureRequirements[feature] || 'free';
    const planHierarchy = ['free', 'creator', 'pro', 'enterprise'];
    
    const currentPlanIndex = planHierarchy.indexOf(planId);
    const requiredPlanIndex = planHierarchy.indexOf(requiredPlan);
    
    const allowed = currentPlanIndex >= requiredPlanIndex;

    return {
      allowed,
      requiredPlan,
      currentPlan: planId,
      feature
    };
  }

  static validatePlan(planId) {
    const validPlans = ['free', 'creator', 'pro', 'enterprise'];
    return validPlans.includes(planId) ? planId : null;
  }

  static canAccessModule(planId, moduleId) {
    const plan = EntitlementChecker.validatePlan(planId);
    if (!plan) return false;

    // Free plan can only access M01, M10, M18
    if (plan === 'free') {
      const allowedModules = ['M01', 'M10', 'M18'];
      return allowedModules.includes(moduleId);
    }

    // All other plans can access all modules
    return true;
  }
}

async function testEntitlementsMock() {
  console.log('🧪 Testing PROMPTFORGE Entitlements Logic (Mock)\n');

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

  // Test 1: Plan Validation
  console.log('1️⃣ Testing Plan Validation...');
  for (const planId of testPlans) {
    const isValid = EntitlementChecker.validatePlan(planId);
    const status = isValid ? '✅' : '❌';
    console.log(`   ${status} ${planId.toUpperCase()}: ${isValid ? 'Valid' : 'Invalid'}`);
  }
  console.log('');

  // Test 2: Feature Access Control
  console.log('2️⃣ Testing Feature Access Control...');
  for (const planId of testPlans) {
    console.log(`   📊 ${planId.toUpperCase()} Plan:`);
    for (const feature of testFeatures) {
      const check = EntitlementChecker.checkFeature(planId, feature);
      const status = check.allowed ? '✅' : '❌';
      const required = check.requiredPlan;
      console.log(`      ${status} ${feature}: ${check.allowed ? 'Allowed' : `Requires ${required}`}`);
    }
    console.log('');
  }

  // Test 3: Module Access Restrictions
  console.log('3️⃣ Testing Module Access Restrictions...');
  for (const planId of testPlans) {
    console.log(`   📦 ${planId.toUpperCase()} Plan:`);
    for (const moduleId of testModules) {
      const canAccess = EntitlementChecker.canAccessModule(planId, moduleId);
      const status = canAccess ? '✅' : '❌';
      console.log(`      ${status} ${moduleId}: ${canAccess ? 'Accessible' : 'Restricted'}`);
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
    { plan: 'creator', format: 'zip', expected: false },
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
    let feature;
    if (test.format === 'zip') {
      feature = 'canExportBundleZip';
    } else {
      feature = `canExport${test.format.toUpperCase()}`;
    }
    const check = EntitlementChecker.checkFeature(test.plan, feature);
    const actual = check.allowed;
    const status = actual === test.expected ? '✅' : '❌';
    console.log(`   ${status} ${test.plan.toUpperCase()} ${test.format.toUpperCase()}: Expected ${test.expected}, Got ${actual}`);
  }
  console.log('');

  // Test 5: Live Testing Access
  console.log('5️⃣ Testing Live Testing Access...');
  for (const planId of testPlans) {
    const check = EntitlementChecker.checkFeature(planId, 'canUseGptTestReal');
    const status = check.allowed ? '✅' : '❌';
    const required = check.requiredPlan;
    console.log(`   ${status} ${planId.toUpperCase()}: ${check.allowed ? 'Live testing allowed' : `Requires ${required} plan`}`);
  }
  console.log('');

  // Test 6: API Access
  console.log('6️⃣ Testing API Access...');
  for (const planId of testPlans) {
    const check = EntitlementChecker.checkFeature(planId, 'hasAPI');
    const status = check.allowed ? '✅' : '❌';
    const required = check.requiredPlan;
    console.log(`   ${status} ${planId.toUpperCase()}: ${check.allowed ? 'API access allowed' : `Requires ${required} plan`}`);
  }
  console.log('');

  // Test 7: Module Access Summary
  console.log('7️⃣ Module Access Summary...');
  for (const planId of testPlans) {
    console.log(`   📦 ${planId.toUpperCase()}:`);
    const allowedModules = [];
    const restrictedModules = [];
    
    for (const moduleId of testModules) {
      if (EntitlementChecker.canAccessModule(planId, moduleId)) {
        allowedModules.push(moduleId);
      } else {
        restrictedModules.push(moduleId);
      }
    }
    
    console.log(`      ✅ Allowed: ${allowedModules.join(', ')}`);
    if (restrictedModules.length > 0) {
      console.log(`      ❌ Restricted: ${restrictedModules.join(', ')}`);
    }
    console.log('');
  }

  console.log('🎯 Entitlements Test Summary:');
  console.log('   • Free: M01/M10/M18 only, .txt export only');
  console.log('   • Creator: All modules, .txt/.md export');
  console.log('   • Pro: All modules, .txt/.md/.pdf/.json, live testing');
  console.log('   • Enterprise: All modules, all exports, API access, bundle.zip');
  console.log('');
  console.log('✅ Mock entitlements testing completed!');
  console.log('');
  console.log('🔧 Next Steps:');
  console.log('   1. Set up Supabase database with plans table');
  console.log('   2. Run database migrations');
  console.log('   3. Test live API endpoints');
  console.log('   4. Verify webhook updates for plan changes');
}

// Run tests
testEntitlementsMock().catch(console.error);
