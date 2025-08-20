#!/usr/bin/env node

/**
 * Database Migration Script for PROMPTFORGE™ v3.0 Coming Soon
 * Run with: node scripts/run-migration.js
 */

const fs = require('fs');
const path = require('path');

console.log('🗄️  PROMPTFORGE™ v3.0 - Database Migration\n');

// Check if migration file exists
const migrationPath = 'cursor/docs/supabase_migrations/0013_coming_soon_tables.sql';
if (!fs.existsSync(migrationPath)) {
  console.log('❌ Migration file not found:', migrationPath);
  process.exit(1);
}

// Read migration content
const migrationContent = fs.readFileSync(migrationPath, 'utf8');

console.log('✅ Migration file found and ready');
console.log('\n📋 Migration Instructions:');
console.log('1. Go to your Supabase project dashboard');
console.log('2. Navigate to SQL Editor');
console.log('3. Create a new query');
console.log('4. Copy and paste the migration SQL below:');
console.log('\n' + '='.repeat(60));
console.log(migrationContent);
console.log('='.repeat(60));

console.log('\n🚀 To execute the migration:');
console.log('1. Click "Run" in the SQL Editor');
console.log('2. Verify the tables were created successfully');
console.log('3. Check that RLS policies are enabled');

console.log('\n🔍 Verification Queries:');
console.log('-- Check if tables exist:');
console.log('SELECT table_name FROM information_schema.tables WHERE table_schema = \'public\' AND table_name IN (\'waitlist_signups\', \'site_settings\');');

console.log('\n-- Check if RLS is enabled:');
console.log('SELECT schemaname, tablename, rowsecurity FROM pg_tables WHERE tablename IN (\'waitlist_signups\', \'site_settings\');');

console.log('\n-- Check if policies exist:');
console.log('SELECT policyname, tablename, permissive, roles, cmd, qual FROM pg_policies WHERE tablename IN (\'waitlist_signups\', \'site_settings\');');

console.log('\n⚠️  IMPORTANT:');
console.log('- Ensure you have admin access to your Supabase project');
console.log('- Backup your database before running migrations in production');
console.log('- Test the migration in a development environment first');

console.log('\n📚 For detailed migration instructions, see:');
console.log('   cursor/docs/coming_soon_bundle/README.md');
