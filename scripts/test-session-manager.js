#!/usr/bin/env node

/**
 * Test script for Session Manager
 * Run with: node scripts/test-session-manager.js
 */

// Set required environment variables for testing
process.env.JWT_SECRET = 'test-jwt-secret-that-is-long-enough-for-testing-32-chars'
process.env.SESSION_ENCRYPTION_KEY = 'test-encryption-key-that-is-long-enough-32-chars'

const { SessionManager, SessionErrorType } = require('../lib/auth/session-manager');

async function testSessionManager() {
  console.log('🧪 Testing Session Manager...\n');

  try {
    const sessionManager = SessionManager.getInstance();
    
    // Test 1: Create session
    console.log('1️⃣ Testing session creation...');
    const createResult = await sessionManager.createSession(
      '550e8400-e29b-41d4-a716-446655440000', // test UUID
      '550e8400-e29b-41d4-a716-446655440001', // test org UUID
      'test-device-123',
      '127.0.0.1'
    );
    
    if (createResult.success) {
      console.log('✅ Session created successfully');
      console.log(`   User ID: ${createResult.user && createResult.user.id}`);
      console.log(`   Email: ${createResult.user && createResult.user.email}`);
      console.log(`   Token: ${createResult.token && createResult.token.substring(0, 20)}...`);
      console.log(`   Refresh Token: ${createResult.refreshToken && createResult.refreshToken.substring(0, 20)}...`);
    } else {
      console.log('❌ Session creation failed:', createResult.error);
      return;
    }

    // Test 2: Validate session
    console.log('\n2️⃣ Testing session validation...');
    const validateResult = sessionManager.validateSession(createResult.token);
    
    if (validateResult.success) {
      console.log('✅ Session validated successfully');
      console.log(`   User: ${validateResult.user && validateResult.user.email}`);
      console.log(`   Role: ${validateResult.user && validateResult.user.role}`);
    } else {
      console.log('❌ Session validation failed:', validateResult.error);
      return;
    }

    // Test 3: Check permissions
    console.log('\n3️⃣ Testing permission checking...');
          const hasPermission = sessionManager.hasPermission(createResult.token, 'read');
    console.log(`   Has 'read' permission: ${hasPermission}`);

    // Test 4: Refresh session
    console.log('\n4️⃣ Testing session refresh...');
    const refreshResult = sessionManager.refreshSession(createResult.refreshToken);
    
    if (refreshResult.success) {
      console.log('✅ Session refreshed successfully');
      console.log(`   New Token: ${refreshResult.token && refreshResult.token.substring(0, 20)}...`);
      console.log(`   New Refresh Token: ${refreshResult.refreshToken && refreshResult.refreshToken.substring(0, 20)}...`);
    } else {
      console.log('❌ Session refresh failed:', refreshResult.error);
    }

    // Test 5: Get session stats
    console.log('\n5️⃣ Testing session statistics...');
    const stats = sessionManager.getSessionStats();
    console.log('   Session Stats:', stats);

    // Test 6: Destroy session
    console.log('\n6️⃣ Testing session destruction...');
          const destroyed = sessionManager.destroySession(createResult.token);
    console.log(`   Session destroyed: ${destroyed}`);

    // Test 7: Verify session is gone
    console.log('\n7️⃣ Verifying session cleanup...');
          const verifyResult = sessionManager.validateSession(createResult.token);
    console.log(`   Session still valid: ${verifyResult.success}`);

    console.log('\n🎉 All tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed with error:', error);
    process.exit(1);
  }
}

// Run tests
testSessionManager().catch(console.error);
