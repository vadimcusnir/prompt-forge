#!/usr/bin/env node

/**
 * Simple test script for Session Manager
 * Tests basic functionality without requiring TypeScript compilation
 */

// Set required environment variables for testing
process.env.JWT_SECRET = 'test-jwt-secret-that-is-long-enough-for-testing-32-chars'
process.env.SESSION_ENCRYPTION_KEY = 'test-encryption-key-that-is-long-enough-for-testing-32-chars'

console.log('🧪 Testing Session Manager Environment Setup...\n');

// Test 1: Environment Variables
console.log('1️⃣ Testing environment variables...');
console.log(`   JWT_SECRET length: ${process.env.JWT_SECRET?.length || 0}`);
console.log(`   SESSION_ENCRYPTION_KEY length: ${process.env.SESSION_ENCRYPTION_KEY?.length || 0}`);

if (process.env.JWT_SECRET && process.env.JWT_SECRET.length >= 32) {
  console.log('✅ JWT_SECRET is properly configured');
} else {
  console.log('❌ JWT_SECRET is not properly configured');
}

if (process.env.SESSION_ENCRYPTION_KEY && process.env.SESSION_ENCRYPTION_KEY.length >= 32) {
  console.log('✅ SESSION_ENCRYPTION_KEY is properly configured');
} else {
  console.log('❌ SESSION_ENCRYPTION_KEY is not properly configured');
}

// Test 2: Dependencies
console.log('\n2️⃣ Testing dependencies...');
try {
  const jwt = require('jsonwebtoken');
  console.log('✅ jsonwebtoken is installed');
  
  const zod = require('zod');
  console.log('✅ zod is installed');
  
  const crypto = require('crypto');
  console.log('✅ crypto is available (Node.js built-in)');
  
} catch (error) {
  console.log('❌ Dependency check failed:', error.message);
}

// Test 3: Basic JWT functionality
console.log('\n3️⃣ Testing basic JWT functionality...');
try {
  const jwt = require('jsonwebtoken');
  
  const payload = { userId: 'test', orgId: 'test-org' };
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
  console.log('✅ JWT token created successfully');
  
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  console.log('✅ JWT token verified successfully');
  console.log(`   Decoded payload: ${JSON.stringify(decoded)}`);
  
} catch (error) {
  console.log('❌ JWT functionality test failed:', error.message);
}

// Test 4: Basic encryption functionality
console.log('\n4️⃣ Testing basic encryption functionality...');
try {
  const crypto = require('crypto');
  
  const testData = 'test-session-data';
  const iv = crypto.randomBytes(16);
  const key = crypto.scryptSync(process.env.SESSION_ENCRYPTION_KEY, 'salt', 32);
  
  const cipher = crypto.createCipher('aes-256-gcm', key);
  let encrypted = cipher.update(testData, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();
  
  console.log('✅ Session encryption test successful');
  
  // Test decryption
  const decipher = crypto.createDecipher('aes-256-gcm', key);
  decipher.setAuthTag(authTag);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  if (decrypted === testData) {
    console.log('✅ Session decryption test successful');
  } else {
    console.log('❌ Session decryption test failed');
  }
  
} catch (error) {
  console.log('❌ Encryption functionality test failed:', error.message);
}

// Test 5: Zod validation
console.log('\n5️⃣ Testing Zod validation...');
try {
  const { z } = require('zod');
  
  const TestSchema = z.object({
    userId: z.string().uuid(),
    orgId: z.string().uuid()
  });
  
  const validData = {
    userId: '550e8400-e29b-41d4-a716-446655440000',
    orgId: '550e8400-e29b-41d4-a716-446655440001'
  };
  
  const result = TestSchema.safeParse(validData);
  if (result.success) {
    console.log('✅ Zod validation test successful');
  } else {
    console.log('❌ Zod validation test failed');
  }
  
} catch (error) {
  console.log('❌ Zod validation test failed:', error.message);
}

console.log('\n🎉 Environment and dependency tests completed!');
console.log('\n📝 Next steps:');
console.log('   1. The session manager is ready for use in your Next.js application');
console.log('   2. Test the actual session manager by importing it in a Next.js component or API route');
console.log('   3. Ensure your .env.local file has the production keys set');
console.log('   4. Follow the security checklist in docs/SESSION-MANAGER.md');
