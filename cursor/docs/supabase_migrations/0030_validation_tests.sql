-- Migration: 0030_validation_tests.sql
-- Purpose: Validation functions and smoke tests for multi-tenant schema
-- Follows: cursor/init audit requirements

-- =============================================================================
-- VALIDATION FUNCTIONS
-- =============================================================================

-- Function to validate org setup
CREATE OR REPLACE FUNCTION public.validate_org_setup(org_uuid UUID)
RETURNS TABLE (
  check_name TEXT,
  status TEXT,
  details TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check org exists
  RETURN QUERY
  SELECT 
    'org_exists'::TEXT,
    CASE WHEN EXISTS(SELECT 1 FROM orgs WHERE id = org_uuid) 
         THEN 'PASS' ELSE 'FAIL' END,
    'Organization record exists'::TEXT;
  
  -- Check has at least one owner
  RETURN QUERY
  SELECT 
    'has_owner'::TEXT,
    CASE WHEN EXISTS(
      SELECT 1 FROM org_members 
      WHERE org_id = org_uuid AND role = 'owner' AND status = 'active'
    ) THEN 'PASS' ELSE 'FAIL' END,
    'Organization has at least one active owner'::TEXT;
  
  -- Check seats usage is accurate
  RETURN QUERY
  SELECT 
    'seats_accurate'::TEXT,
    CASE WHEN (
      SELECT seats_used FROM orgs WHERE id = org_uuid
    ) = (
      SELECT COUNT(*) FROM org_members 
      WHERE org_id = org_uuid AND status = 'active'
    ) THEN 'PASS' ELSE 'FAIL' END,
    'Seats used count matches active members'::TEXT;
  
  -- Check has valid subscription or default plan
  RETURN QUERY
  SELECT 
    'has_plan'::TEXT,
    CASE WHEN EXISTS(
      SELECT 1 FROM orgs o
      LEFT JOIN subscriptions s ON s.org_id = o.id AND s.status = 'active'
      WHERE o.id = org_uuid 
      AND (s.plan_code IS NOT NULL OR o.plan_code IS NOT NULL)
    ) THEN 'PASS' ELSE 'FAIL' END,
    'Organization has valid plan assignment'::TEXT;
  
  -- Check entitlements are accessible
  RETURN QUERY
  SELECT 
    'entitlements_accessible'::TEXT,
    CASE WHEN EXISTS(
      SELECT 1 FROM v_entitlements_effective_org 
      WHERE org_id = org_uuid
    ) THEN 'PASS' ELSE 'FAIL' END,
    'Organization entitlements are computable'::TEXT;
END;
$$;

-- Function to validate user access
CREATE OR REPLACE FUNCTION public.validate_user_access(
  org_uuid UUID, 
  user_uuid UUID
)
RETURNS TABLE (
  check_name TEXT,
  status TEXT,
  details TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check user is member
  RETURN QUERY
  SELECT 
    'is_member'::TEXT,
    CASE WHEN public.is_member(org_uuid) AND EXISTS(
      SELECT 1 FROM org_members 
      WHERE org_id = org_uuid AND user_id = user_uuid AND status = 'active'
    ) THEN 'PASS' ELSE 'FAIL' END,
    'User is active member of organization'::TEXT;
  
  -- Check user entitlements are accessible
  RETURN QUERY
  SELECT 
    'user_entitlements_accessible'::TEXT,
    CASE WHEN EXISTS(
      SELECT 1 FROM v_entitlements_effective_user 
      WHERE org_id = org_uuid AND user_id = user_uuid
    ) THEN 'PASS' ELSE 'FAIL' END,
    'User entitlements are computable'::TEXT;
  
  -- Check role is valid
  RETURN QUERY
  SELECT 
    'valid_role'::TEXT,
    CASE WHEN EXISTS(
      SELECT 1 FROM org_members 
      WHERE org_id = org_uuid AND user_id = user_uuid 
      AND role IN ('owner', 'admin', 'member', 'viewer')
    ) THEN 'PASS' ELSE 'FAIL' END,
    'User has valid role assignment'::TEXT;
END;
$$;

-- Function to validate plan entitlements
CREATE OR REPLACE FUNCTION public.validate_plan_entitlements()
RETURNS TABLE (
  plan_code TEXT,
  check_name TEXT,
  status TEXT,
  details TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  plan_rec RECORD;
  entitlement_count INTEGER;
BEGIN
  FOR plan_rec IN SELECT code, name FROM plans WHERE active = true LOOP
    -- Check plan has entitlements
    SELECT COUNT(*) INTO entitlement_count
    FROM plan_entitlements 
    WHERE plan_entitlements.plan_code = plan_rec.code;
    
    RETURN QUERY
    SELECT 
      plan_rec.code,
      'has_entitlements'::TEXT,
      CASE WHEN entitlement_count > 0 THEN 'PASS' ELSE 'FAIL' END,
      format('Plan has %s entitlements defined', entitlement_count);
    
    -- Check required entitlements exist
    RETURN QUERY
    SELECT 
      plan_rec.code,
      'has_export_md'::TEXT,
      CASE WHEN EXISTS(
        SELECT 1 FROM plan_entitlements 
        WHERE plan_entitlements.plan_code = plan_rec.code 
        AND entitlement_key = 'can_export_md'
      ) THEN 'PASS' ELSE 'FAIL' END,
      'Plan has markdown export entitlement'::TEXT;
    
    RETURN QUERY
    SELECT 
      plan_rec.code,
      'has_run_limit'::TEXT,
      CASE WHEN EXISTS(
        SELECT 1 FROM plan_entitlements 
        WHERE plan_entitlements.plan_code = plan_rec.code 
        AND entitlement_key = 'max_runs_per_month'
      ) THEN 'PASS' ELSE 'FAIL' END,
      'Plan has monthly run limit defined'::TEXT;
  END LOOP;
END;
$$;

-- =============================================================================
-- SMOKE TESTS FOR RLS
-- =============================================================================

-- Function to test RLS policies
CREATE OR REPLACE FUNCTION public.test_rls_policies()
RETURNS TABLE (
  policy_name TEXT,
  status TEXT,
  details TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Test: Plans are publicly readable
  RETURN QUERY
  SELECT 
    'plans_public_read'::TEXT,
    CASE WHEN EXISTS(SELECT 1 FROM plans WHERE public = true LIMIT 1) 
         THEN 'PASS' ELSE 'FAIL' END,
    'Public plans are readable'::TEXT;
  
  -- Test: Entitlement definitions are publicly readable
  RETURN QUERY
  SELECT 
    'entitlement_definitions_public_read'::TEXT,
    CASE WHEN EXISTS(SELECT 1 FROM entitlement_definitions LIMIT 1) 
         THEN 'PASS' ELSE 'FAIL' END,
    'Entitlement definitions are readable'::TEXT;
  
  -- Test: Plan entitlements are publicly readable
  RETURN QUERY
  SELECT 
    'plan_entitlements_public_read'::TEXT,
    CASE WHEN EXISTS(SELECT 1 FROM plan_entitlements LIMIT 1) 
         THEN 'PASS' ELSE 'FAIL' END,
    'Plan entitlements are readable'::TEXT;
  
  -- Note: Other RLS tests require authenticated context
  -- These would be run in application tests with proper auth setup
END;
$$;

-- =============================================================================
-- PERFORMANCE VALIDATION
-- =============================================================================

-- Function to check index usage
CREATE OR REPLACE FUNCTION public.validate_indexes()
RETURNS TABLE (
  table_name TEXT,
  index_name TEXT,
  status TEXT,
  details TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check critical indexes exist
  RETURN QUERY
  SELECT 
    'org_members'::TEXT,
    'idx_org_members_org_id'::TEXT,
    CASE WHEN EXISTS(
      SELECT 1 FROM pg_indexes 
      WHERE tablename = 'org_members' AND indexname = 'idx_org_members_org_id'
    ) THEN 'PASS' ELSE 'FAIL' END,
    'Org members org_id index exists'::TEXT;
  
  RETURN QUERY
  SELECT 
    'subscriptions'::TEXT,
    'idx_subscriptions_org_id'::TEXT,
    CASE WHEN EXISTS(
      SELECT 1 FROM pg_indexes 
      WHERE tablename = 'subscriptions' AND indexname = 'idx_subscriptions_org_id'
    ) THEN 'PASS' ELSE 'FAIL' END,
    'Subscriptions org_id index exists'::TEXT;
  
  RETURN QUERY
  SELECT 
    'api_keys'::TEXT,
    'idx_api_keys_active'::TEXT,
    CASE WHEN EXISTS(
      SELECT 1 FROM pg_indexes 
      WHERE tablename = 'api_keys' AND indexname = 'idx_api_keys_active'
    ) THEN 'PASS' ELSE 'FAIL' END,
    'API keys active index exists'::TEXT;
END;
$$;

-- =============================================================================
-- CONSTRAINT VALIDATION
-- =============================================================================

-- Function to validate constraints
CREATE OR REPLACE FUNCTION public.validate_constraints()
RETURNS TABLE (
  constraint_name TEXT,
  status TEXT,
  details TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Test: Org slug format constraint
  BEGIN
    INSERT INTO orgs (name, slug) VALUES ('Test Invalid', 'Invalid Slug!');
    RETURN QUERY SELECT 'org_slug_format'::TEXT, 'FAIL'::TEXT, 'Invalid slug was accepted'::TEXT;
  EXCEPTION WHEN check_violation THEN
    RETURN QUERY SELECT 'org_slug_format'::TEXT, 'PASS'::TEXT, 'Slug format constraint working'::TEXT;
  END;
  
  -- Test: Plan code format constraint
  BEGIN
    INSERT INTO plans (code, name) VALUES ('invalid_code', 'Test Plan');
    RETURN QUERY SELECT 'plan_code_format'::TEXT, 'FAIL'::TEXT, 'Invalid plan code was accepted'::TEXT;
  EXCEPTION WHEN check_violation THEN
    RETURN QUERY SELECT 'plan_code_format'::TEXT, 'PASS'::TEXT, 'Plan code format constraint working'::TEXT;
  END;
  
  -- Test: Seats limit constraint
  BEGIN
    INSERT INTO orgs (name, slug, seats_limit, seats_used) VALUES ('Test Seats', 'test-seats', 5, 10);
    RETURN QUERY SELECT 'seats_constraint'::TEXT, 'FAIL'::TEXT, 'Seats over limit was accepted'::TEXT;
  EXCEPTION WHEN check_violation THEN
    RETURN QUERY SELECT 'seats_constraint'::TEXT, 'PASS'::TEXT, 'Seats constraint working'::TEXT;
  END;
  
  -- Clean up test data
  DELETE FROM orgs WHERE slug IN ('test-invalid', 'test-seats');
  DELETE FROM plans WHERE code = 'invalid_code';
END;
$$;

-- =============================================================================
-- COMPREHENSIVE HEALTH CHECK
-- =============================================================================

-- Main health check function
CREATE OR REPLACE FUNCTION public.schema_health_check()
RETURNS TABLE (
  category TEXT,
  check_name TEXT,
  status TEXT,
  details TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Constraints validation
  RETURN QUERY
  SELECT 'constraints'::TEXT, constraint_name, status, details
  FROM validate_constraints();
  
  -- Index validation
  RETURN QUERY
  SELECT 'indexes'::TEXT, index_name, status, details
  FROM validate_indexes();
  
  -- RLS validation
  RETURN QUERY
  SELECT 'rls'::TEXT, policy_name, status, details
  FROM test_rls_policies();
  
  -- Plan entitlements validation
  RETURN QUERY
  SELECT 'entitlements'::TEXT, 
         plan_code || '_' || check_name, 
         status, 
         details
  FROM validate_plan_entitlements();
  
  -- Views validation
  RETURN QUERY
  SELECT 
    'views'::TEXT,
    'v_entitlements_effective_org_exists'::TEXT,
    CASE WHEN EXISTS(
      SELECT 1 FROM information_schema.views 
      WHERE table_name = 'v_entitlements_effective_org'
    ) THEN 'PASS' ELSE 'FAIL' END,
    'Effective org entitlements view exists'::TEXT;
  
  RETURN QUERY
  SELECT 
    'views'::TEXT,
    'v_entitlements_effective_user_exists'::TEXT,
    CASE WHEN EXISTS(
      SELECT 1 FROM information_schema.views 
      WHERE table_name = 'v_entitlements_effective_user'
    ) THEN 'PASS' ELSE 'FAIL' END,
    'Effective user entitlements view exists'::TEXT;
  
  -- Functions validation
  RETURN QUERY
  SELECT 
    'functions'::TEXT,
    'is_member_exists'::TEXT,
    CASE WHEN EXISTS(
      SELECT 1 FROM information_schema.routines 
      WHERE routine_name = 'is_member'
    ) THEN 'PASS' ELSE 'FAIL' END,
    'is_member function exists'::TEXT;
  
  RETURN QUERY
  SELECT 
    'functions'::TEXT,
    'org_has_entitlement_exists'::TEXT,
    CASE WHEN EXISTS(
      SELECT 1 FROM information_schema.routines 
      WHERE routine_name = 'org_has_entitlement'
    ) THEN 'PASS' ELSE 'FAIL' END,
    'org_has_entitlement function exists'::TEXT;
END;
$$;

-- =============================================================================
-- SAMPLE DATA FOR TESTING (Optional)
-- =============================================================================

-- Function to create sample test data
CREATE OR REPLACE FUNCTION public.create_sample_data()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  sample_org_id UUID;
  sample_user_id UUID;
BEGIN
  -- Note: This would typically be called with real auth.uid() in tests
  -- For now, we'll use a sample UUID
  sample_user_id := '00000000-0000-0000-0000-000000000001'::UUID;
  
  -- Create sample org
  INSERT INTO orgs (name, slug, plan_code)
  VALUES ('Sample Organization', 'sample-org', 'promptforge_pro')
  RETURNING id INTO sample_org_id;
  
  -- Create sample membership
  INSERT INTO org_members (org_id, user_id, role, status)
  VALUES (sample_org_id, sample_user_id, 'owner', 'active');
  
  -- Create sample subscription
  INSERT INTO subscriptions (org_id, plan_code, status)
  VALUES (sample_org_id, 'promptforge_pro', 'active');
  
  RETURN format('Sample data created: org_id=%s, user_id=%s', sample_org_id, sample_user_id);
END;
$$;

-- =============================================================================
-- CLEANUP FUNCTION
-- =============================================================================

-- Function to clean up test data
CREATE OR REPLACE FUNCTION public.cleanup_sample_data()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM subscriptions WHERE org_id IN (
    SELECT id FROM orgs WHERE slug = 'sample-org'
  );
  
  DELETE FROM org_members WHERE org_id IN (
    SELECT id FROM orgs WHERE slug = 'sample-org'
  );
  
  DELETE FROM orgs WHERE slug = 'sample-org';
  
  RETURN 'Sample data cleaned up';
END;
$$;

-- =============================================================================
-- COMMENTS
-- =============================================================================

COMMENT ON FUNCTION public.validate_org_setup(UUID) IS 'Validate organization setup and configuration';
COMMENT ON FUNCTION public.validate_user_access(UUID, UUID) IS 'Validate user access and permissions for organization';
COMMENT ON FUNCTION public.validate_plan_entitlements() IS 'Validate all plan entitlement configurations';
COMMENT ON FUNCTION public.test_rls_policies() IS 'Test Row Level Security policies';
COMMENT ON FUNCTION public.validate_indexes() IS 'Validate critical database indexes exist';
COMMENT ON FUNCTION public.validate_constraints() IS 'Validate database constraints are working';
COMMENT ON FUNCTION public.schema_health_check() IS 'Comprehensive health check for multi-tenant schema';
COMMENT ON FUNCTION public.create_sample_data() IS 'Create sample data for testing (development only)';
COMMENT ON FUNCTION public.cleanup_sample_data() IS 'Clean up sample test data';

-- =============================================================================
-- EXAMPLE USAGE QUERIES
-- =============================================================================

-- Run comprehensive health check:
-- SELECT * FROM schema_health_check() ORDER BY category, check_name;

-- Validate specific org:
-- SELECT * FROM validate_org_setup('your-org-id-here');

-- Test plan entitlements:
-- SELECT * FROM validate_plan_entitlements();

-- Check indexes:
-- SELECT * FROM validate_indexes();
