-- PROMPTFORGE v3 — RLS Policies
-- Multi-tenant access control and security policies
-- Implements org-based isolation and entitlement-based access

-- ============================================================================
-- HELPER FUNCTIONS FOR RLS
-- ============================================================================

-- Function to get current user's org_id from JWT
CREATE OR REPLACE FUNCTION auth.org_id()
RETURNS UUID AS $$
BEGIN
  RETURN (current_setting('request.jwt.claims', true)::json->>'org_id')::UUID;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get current user_id from JWT
CREATE OR REPLACE FUNCTION auth.user_id()
RETURNS UUID AS $$
BEGIN
  RETURN (current_setting('request.jwt.claims', true)::json->>'sub')::UUID;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is org member
CREATE OR REPLACE FUNCTION auth.is_org_member(p_org_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS(
    SELECT 1 FROM org_members 
    WHERE org_id = p_org_id 
    AND user_id = auth.user_id() 
    AND status = 'active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is org admin or owner
CREATE OR REPLACE FUNCTION auth.is_org_admin(p_org_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS(
    SELECT 1 FROM org_members 
    WHERE org_id = p_org_id 
    AND user_id = auth.user_id() 
    AND status = 'active'
    AND role IN ('owner', 'admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has specific permission
CREATE OR REPLACE FUNCTION auth.has_permission(p_org_id UUID, p_permission VARCHAR(100))
RETURNS BOOLEAN AS $$
DECLARE
  v_role VARCHAR(50);
  v_permissions JSONB;
BEGIN
  SELECT role, permissions INTO v_role, v_permissions
  FROM org_members 
  WHERE org_id = p_org_id 
  AND user_id = auth.user_id() 
  AND status = 'active';
  
  -- Owner has all permissions
  IF v_role = 'owner' THEN
    RETURN true;
  END IF;
  
  -- Admin has most permissions
  IF v_role = 'admin' AND p_permission != 'billing_manage' THEN
    RETURN true;
  END IF;
  
  -- Check specific permission
  RETURN COALESCE(v_permissions->>p_permission, 'false')::BOOLEAN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- ORGANIZATION POLICIES
-- ============================================================================

-- Orgs table policies
CREATE POLICY "Users can view their own orgs" ON orgs
  FOR SELECT USING (auth.is_org_member(id));

CREATE POLICY "Only org owners can update orgs" ON orgs
  FOR UPDATE USING (auth.is_org_admin(id));

CREATE POLICY "Only org owners can delete orgs" ON orgs
  FOR DELETE USING (auth.is_org_admin(id));

-- Org members policies
CREATE POLICY "Users can view org members in their orgs" ON org_members
  FOR SELECT USING (auth.is_org_member(org_id));

CREATE POLICY "Only org admins can manage members" ON org_members
  FOR ALL USING (auth.is_org_admin(org_id));

-- ============================================================================
-- SUBSCRIPTION POLICIES
-- ============================================================================

-- Subscriptions policies
CREATE POLICY "Users can view subscriptions in their orgs" ON subscriptions
  FOR SELECT USING (auth.is_org_member(org_id));

CREATE POLICY "Only org admins can manage subscriptions" ON subscriptions
  FOR ALL USING (auth.is_org_admin(org_id));

-- ============================================================================
-- MODULE POLICIES
-- ============================================================================

-- Modules are public (read-only)
CREATE POLICY "Anyone can view active modules" ON modules
  FOR SELECT USING (is_active = true);

CREATE POLICY "Only system admins can modify modules" ON modules
  FOR ALL USING (false); -- Modules are system-managed

-- Parameter sets policies
CREATE POLICY "Users can view public parameter sets" ON parameter_sets
  FOR SELECT USING (is_public = true OR auth.is_org_member(org_id));

CREATE POLICY "Users can create parameter sets in their orgs" ON parameter_sets
  FOR INSERT WITH CHECK (auth.is_org_member(org_id));

CREATE POLICY "Users can update their org's parameter sets" ON parameter_sets
  FOR UPDATE USING (auth.is_org_member(org_id));

CREATE POLICY "Users can delete their org's parameter sets" ON parameter_sets
  FOR DELETE USING (auth.is_org_member(org_id));

-- ============================================================================
-- RUN POLICIES
-- ============================================================================

-- Runs policies
CREATE POLICY "Users can view runs in their orgs" ON runs
  FOR SELECT USING (auth.is_org_member(org_id));

CREATE POLICY "Users can create runs in their orgs" ON runs
  FOR INSERT WITH CHECK (auth.is_org_member(org_id));

CREATE POLICY "Users can update their own runs" ON runs
  FOR UPDATE USING (
    auth.is_org_member(org_id) AND 
    (user_id = auth.user_id() OR auth.is_org_admin(org_id))
  );

CREATE POLICY "Users can delete their own runs" ON runs
  FOR DELETE USING (
    auth.is_org_member(org_id) AND 
    (user_id = auth.user_id() OR auth.is_org_admin(org_id))
  );

-- Run artifacts policies
CREATE POLICY "Users can view artifacts for runs in their orgs" ON run_artifacts
  FOR SELECT USING (
    EXISTS(
      SELECT 1 FROM runs r 
      WHERE r.id = run_artifacts.run_id 
      AND auth.is_org_member(r.org_id)
    )
  );

CREATE POLICY "Users can create artifacts for runs in their orgs" ON run_artifacts
  FOR INSERT WITH CHECK (
    EXISTS(
      SELECT 1 FROM runs r 
      WHERE r.id = run_artifacts.run_id 
      AND auth.is_org_member(r.org_id)
    )
  );

-- ============================================================================
-- BUNDLE POLICIES
-- ============================================================================

-- Bundles policies
CREATE POLICY "Users can view bundles in their orgs" ON bundles
  FOR SELECT USING (auth.is_org_member(org_id));

CREATE POLICY "Users can create bundles in their orgs" ON bundles
  FOR INSERT WITH CHECK (auth.is_org_member(org_id));

CREATE POLICY "Users can update bundles in their orgs" ON bundles
  FOR UPDATE USING (auth.is_org_member(org_id));

CREATE POLICY "Users can delete bundles in their orgs" ON bundles
  FOR DELETE USING (auth.is_org_member(org_id));

-- Bundle artifacts policies
CREATE POLICY "Users can view bundle artifacts in their orgs" ON bundle_artifacts
  FOR SELECT USING (
    EXISTS(
      SELECT 1 FROM bundles b 
      WHERE b.id = bundle_artifacts.bundle_id 
      AND auth.is_org_member(b.org_id)
    )
  );

-- ============================================================================
-- INDUSTRY PACK POLICIES
-- ============================================================================

-- Industry packs policies
CREATE POLICY "Anyone can view public industry packs" ON industry_packs
  FOR SELECT USING (is_public = true OR auth.is_org_member(org_id));

CREATE POLICY "Only system admins can manage industry packs" ON industry_packs
  FOR ALL USING (false); -- Industry packs are system-managed

-- Projects policies
CREATE POLICY "Users can view projects in their orgs" ON projects
  FOR SELECT USING (auth.is_org_member(org_id));

CREATE POLICY "Users can create projects in their orgs" ON projects
  FOR INSERT WITH CHECK (auth.is_org_member(org_id));

CREATE POLICY "Users can update projects in their orgs" ON projects
  FOR UPDATE USING (auth.is_org_member(org_id));

CREATE POLICY "Users can delete projects in their orgs" ON projects
  FOR DELETE USING (auth.is_org_member(org_id));

-- ============================================================================
-- RULESET POLICIES
-- ============================================================================

-- Ruleset versions are public (read-only)
CREATE POLICY "Anyone can view ruleset versions" ON ruleset_versions
  FOR SELECT USING (true);

CREATE POLICY "Only system admins can modify ruleset versions" ON ruleset_versions
  FOR ALL USING (false);

-- Ruleset overrides policies
CREATE POLICY "Users can view overrides in their orgs" ON ruleset_overrides_log
  FOR SELECT USING (auth.is_org_member(org_id));

CREATE POLICY "Users can create overrides in their orgs" ON ruleset_overrides_log
  FOR INSERT WITH CHECK (auth.is_org_member(org_id));

-- ============================================================================
-- TELEMETRY POLICIES
-- ============================================================================

-- Telemetry events policies
CREATE POLICY "Users can view telemetry in their orgs" ON telemetry_events
  FOR SELECT USING (auth.is_org_member(org_id));

CREATE POLICY "Users can create telemetry events in their orgs" ON telemetry_events
  FOR INSERT WITH CHECK (auth.is_org_member(org_id));

-- Audit logs policies
CREATE POLICY "Users can view audit logs in their orgs" ON audit_logs
  FOR SELECT USING (auth.is_org_member(org_id));

CREATE POLICY "System can create audit logs" ON audit_logs
  FOR INSERT WITH CHECK (true);

-- ============================================================================
-- VIEW POLICIES
-- ============================================================================

-- Effective entitlements view
CREATE POLICY "Users can view entitlements for their orgs" ON v_effective_entitlements
  FOR SELECT USING (auth.is_org_member(org_id));

-- Run stats view
CREATE POLICY "Users can view stats for their orgs" ON v_run_stats
  FOR SELECT USING (auth.is_org_member(org_id));

-- Bundle exports view
CREATE POLICY "Users can view exports for their orgs" ON v_bundle_exports
  FOR SELECT USING (auth.is_org_member(org_id));

-- ============================================================================
-- FUNCTION SECURITY
-- ============================================================================

-- Grant execute permissions on helper functions
GRANT EXECUTE ON FUNCTION auth.org_id() TO authenticated;
GRANT EXECUTE ON FUNCTION auth.user_id() TO authenticated;
GRANT EXECUTE ON FUNCTION auth.is_org_member(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION auth.is_org_admin(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION auth.has_permission(UUID, VARCHAR) TO authenticated;

-- Grant execute permissions on business functions
GRANT EXECUTE ON FUNCTION generate_run_id(UUID, INTEGER, VARCHAR) TO authenticated;
GRANT EXECUTE ON FUNCTION validate_7d_params(VARCHAR, VARCHAR, VARCHAR, VARCHAR, VARCHAR, VARCHAR, VARCHAR) TO authenticated;
GRANT EXECUTE ON FUNCTION update_updated_at_column() TO authenticated;

-- ============================================================================
-- DEFAULT PERMISSIONS
-- ============================================================================

-- Set default permissions for new tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT INSERT ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT UPDATE ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT DELETE ON TABLES TO authenticated;

-- Grant usage on sequences
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO authenticated;
