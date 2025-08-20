-- Migration: 0031_grants_policies.sql
-- Purpose: Tighten RLS, add self-service org creation, and apply GRANTs
-- Follows: cursor/init laws and P1 governance

-- =============================================================================
-- SCHEMA GRANTS (Supabase roles)
-- =============================================================================

GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;

-- Base grants (RLS will still enforce row-level constraints)
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.orgs TO authenticated;
GRANT SELECT ON TABLE public.orgs TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.org_members TO authenticated;
GRANT SELECT ON TABLE public.org_members TO anon; -- minimal exposure (names/slugs via join guarded by orgs RLS)
GRANT SELECT ON TABLE public.plans TO anon, authenticated;
GRANT SELECT ON TABLE public.entitlement_definitions TO anon, authenticated;
GRANT SELECT ON TABLE public.plan_entitlements TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.subscriptions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.org_entitlements TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.user_addons TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.api_keys TO authenticated;

-- Views
GRANT SELECT ON TABLE public.v_entitlements_effective_org TO anon, authenticated;
GRANT SELECT ON TABLE public.v_entitlements_effective_user TO authenticated;

-- Functions (execution permissions)
GRANT EXECUTE ON FUNCTION public.is_member(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.current_org_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.org_has_entitlement(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.user_has_entitlement(UUID, UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_entitlement_value(UUID, TEXT) TO authenticated;

-- =============================================================================
-- RLS POLICIES (DROP/CREATE for idempotence)
-- =============================================================================

-- ORGS
DROP POLICY IF EXISTS "Members can view their org" ON public.orgs;
DROP POLICY IF EXISTS orgs_select_members ON public.orgs;
DROP POLICY IF EXISTS orgs_insert_self ON public.orgs;
DROP POLICY IF EXISTS orgs_update_owner_admin ON public.orgs;

CREATE POLICY orgs_select_members
  ON public.orgs FOR SELECT
  TO authenticated
  USING (public.is_member(id));

-- Self-service org creation (any authenticated can create an org they own)
CREATE POLICY orgs_insert_self
  ON public.orgs FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY orgs_update_owner_admin
  ON public.orgs FOR UPDATE
  TO authenticated
  USING (
    id IN (
      SELECT org_id FROM public.org_members
      WHERE user_id = auth.uid()
      AND role IN ('owner','admin')
      AND status = 'active'
    )
  )
  WITH CHECK (
    id IN (
      SELECT org_id FROM public.org_members
      WHERE user_id = auth.uid()
      AND role IN ('owner','admin')
      AND status = 'active'
    )
  );

-- No DELETE policy for orgs (restricted to service_role)

-- ORG MEMBERS
DROP POLICY IF EXISTS "Members can view org membership" ON public.org_members;
DROP POLICY IF EXISTS "Admins can manage org membership" ON public.org_members;
DROP POLICY IF EXISTS org_members_select ON public.org_members;
DROP POLICY IF EXISTS org_members_insert ON public.org_members;
DROP POLICY IF EXISTS org_members_update ON public.org_members;
DROP POLICY IF EXISTS org_members_delete ON public.org_members;

CREATE POLICY org_members_select
  ON public.org_members FOR SELECT
  TO authenticated
  USING (public.is_member(org_id));

CREATE POLICY org_members_insert
  ON public.org_members FOR INSERT
  TO authenticated
  WITH CHECK (
    org_id IN (
      SELECT org_id FROM public.org_members
      WHERE user_id = auth.uid()
      AND role IN ('owner','admin')
      AND status = 'active'
    )
    AND role IN ('owner','admin','member','viewer')
  );

CREATE POLICY org_members_update
  ON public.org_members FOR UPDATE
  TO authenticated
  USING (
    org_id IN (
      SELECT org_id FROM public.org_members
      WHERE user_id = auth.uid()
      AND role IN ('owner','admin')
      AND status = 'active'
    )
  )
  WITH CHECK (
    org_id IN (
      SELECT org_id FROM public.org_members
      WHERE user_id = auth.uid()
      AND role IN ('owner','admin')
      AND status = 'active'
    )
  );

CREATE POLICY org_members_delete
  ON public.org_members FOR DELETE
  TO authenticated
  USING (
    org_id IN (
      SELECT org_id FROM public.org_members
      WHERE user_id = auth.uid()
      AND role IN ('owner','admin')
      AND status = 'active'
    )
  );

-- PLANS / ENTITLEMENTS (publicly readable)
DROP POLICY IF EXISTS "Plans are publicly readable" ON public.plans;
DROP POLICY IF EXISTS plans_public_select ON public.plans;
CREATE POLICY plans_public_select
  ON public.plans FOR SELECT
  TO anon, authenticated
  USING (public = true);

DROP POLICY IF EXISTS "Entitlement definitions are publicly readable" ON public.entitlement_definitions;
DROP POLICY IF EXISTS entitlement_definitions_public_select ON public.entitlement_definitions;
CREATE POLICY entitlement_definitions_public_select
  ON public.entitlement_definitions FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Plan entitlements are publicly readable" ON public.plan_entitlements;
DROP POLICY IF EXISTS plan_entitlements_public_select ON public.plan_entitlements;
CREATE POLICY plan_entitlements_public_select
  ON public.plan_entitlements FOR SELECT
  TO anon, authenticated
  USING (true);

-- SUBSCRIPTIONS
DROP POLICY IF EXISTS "Members can view org subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "Owners can manage org subscription" ON public.subscriptions;
DROP POLICY IF EXISTS subscriptions_select ON public.subscriptions;
DROP POLICY IF EXISTS subscriptions_write ON public.subscriptions;

CREATE POLICY subscriptions_select
  ON public.subscriptions FOR SELECT
  TO authenticated
  USING (public.is_member(org_id));

CREATE POLICY subscriptions_write
  ON public.subscriptions FOR INSERT
  TO authenticated
  WITH CHECK (
    org_id IN (
      SELECT org_id FROM public.org_members
      WHERE user_id = auth.uid()
      AND role = 'owner'
      AND status = 'active'
    )
  );

CREATE POLICY subscriptions_update
  ON public.subscriptions FOR UPDATE
  TO authenticated
  USING (
    org_id IN (
      SELECT org_id FROM public.org_members
      WHERE user_id = auth.uid()
      AND role = 'owner'
      AND status = 'active'
    )
  )
  WITH CHECK (
    org_id IN (
      SELECT org_id FROM public.org_members
      WHERE user_id = auth.uid()
      AND role = 'owner'
      AND status = 'active'
    )
  );

-- ORG ENTITLEMENTS
DROP POLICY IF EXISTS org_entitlements_select ON public.org_entitlements;
DROP POLICY IF EXISTS org_entitlements_write ON public.org_entitlements;

CREATE POLICY org_entitlements_select
  ON public.org_entitlements FOR SELECT
  TO authenticated
  USING (public.is_member(org_id));

CREATE POLICY org_entitlements_write
  ON public.org_entitlements FOR ALL
  TO authenticated
  USING (
    org_id IN (
      SELECT org_id FROM public.org_members
      WHERE user_id = auth.uid()
      AND role IN ('owner','admin')
      AND status = 'active'
    )
  )
  WITH CHECK (
    org_id IN (
      SELECT org_id FROM public.org_members
      WHERE user_id = auth.uid()
      AND role IN ('owner','admin')
      AND status = 'active'
    )
  );

-- USER ADDONS
DROP POLICY IF EXISTS user_addons_select ON public.user_addons;
DROP POLICY IF EXISTS user_addons_write ON public.user_addons;

CREATE POLICY user_addons_select
  ON public.user_addons FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR public.is_member(org_id));

CREATE POLICY user_addons_write
  ON public.user_addons FOR ALL
  TO authenticated
  USING (
    org_id IN (
      SELECT org_id FROM public.org_members
      WHERE user_id = auth.uid()
      AND role IN ('owner','admin')
      AND status = 'active'
    )
  )
  WITH CHECK (
    org_id IN (
      SELECT org_id FROM public.org_members
      WHERE user_id = auth.uid()
      AND role IN ('owner','admin')
      AND status = 'active'
    )
  );

-- API KEYS (tighten visibility to admins/owners)
DROP POLICY IF EXISTS "Members can view org API keys" ON public.api_keys;
DROP POLICY IF EXISTS "Admins can manage org API keys" ON public.api_keys;
DROP POLICY IF EXISTS api_keys_select ON public.api_keys;
DROP POLICY IF EXISTS api_keys_write ON public.api_keys;

CREATE POLICY api_keys_select
  ON public.api_keys FOR SELECT
  TO authenticated
  USING (
    org_id IN (
      SELECT org_id FROM public.org_members
      WHERE user_id = auth.uid()
      AND role IN ('owner','admin')
      AND status = 'active'
    )
  );

CREATE POLICY api_keys_write
  ON public.api_keys FOR ALL
  TO authenticated
  USING (
    org_id IN (
      SELECT org_id FROM public.org_members
      WHERE user_id = auth.uid()
      AND role IN ('owner','admin')
      AND status = 'active'
    )
  )
  WITH CHECK (
    org_id IN (
      SELECT org_id FROM public.org_members
      WHERE user_id = auth.uid()
      AND role IN ('owner','admin')
      AND status = 'active'
    )
  );

-- =============================================================================
-- AUTO-OWNER TRIGGER ON ORG CREATION
-- =============================================================================

CREATE OR REPLACE FUNCTION public.make_creator_owner()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.created_by IS NOT NULL THEN
    INSERT INTO public.org_members (org_id, user_id, role, status)
    VALUES (NEW.id, NEW.created_by, 'owner', 'active')
    ON CONFLICT (org_id, user_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS make_creator_owner_trigger ON public.orgs;
CREATE TRIGGER make_creator_owner_trigger
  AFTER INSERT ON public.orgs
  FOR EACH ROW EXECUTE FUNCTION public.make_creator_owner();

-- =============================================================================
-- NOTES
-- =============================================================================
-- This migration assumes Supabase roles (anon, authenticated, service_role) exist.
-- RLS remains authoritative for row-level access; GRANTs are permissive at table level only.
