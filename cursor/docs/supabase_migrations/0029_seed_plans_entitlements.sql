-- Migration: 0029_seed_plans_entitlements.sql
-- Purpose: Seed master data for commercial gating
-- Follows: cursor/init + Brand OS (Pilot/Pro/Enterprise)

-- =============================================================================
-- ENTITLEMENT DEFINITIONS (Master Registry)
-- =============================================================================

INSERT INTO public.entitlement_definitions (key, name, description, category, value_type, default_value) VALUES
  -- Core Features
  ('can_use_all_modules', 'Access All Modules', 'Access to all M01-M50 modules', 'feature', 'boolean', 'false'),
  ('can_export_md', 'Export Markdown', 'Export prompts as .md files', 'feature', 'boolean', 'true'),
  ('can_export_json', 'Export JSON', 'Export prompts as .json files', 'feature', 'boolean', 'false'),
  ('can_export_pdf', 'Export PDF', 'Export prompts as .pdf files', 'feature', 'boolean', 'false'),
  ('can_export_bundle_zip', 'Export Bundle ZIP', 'Export complete bundle as .zip', 'feature', 'boolean', 'false'),
  
  -- GPT Integration
  ('can_use_gpt_editor', 'GPT Editor', 'Optimize prompts with GPT-4', 'feature', 'boolean', 'false'),
  ('can_use_gpt_test_real', 'Live GPT Testing', 'Run real GPT tests with scoring', 'feature', 'boolean', 'false'),
  ('has_evaluator_ai', 'AI Evaluator', 'AI-powered prompt evaluation', 'feature', 'boolean', 'false'),
  
  -- History & Cloud
  ('has_cloud_history', 'Cloud History', 'Persistent cloud history of runs', 'feature', 'boolean', 'false'),
  ('can_export_history', 'Export History', 'Export run history data', 'feature', 'boolean', 'false'),
  
  -- API & Enterprise
  ('has_api_access', 'API Access', 'Programmatic API access', 'feature', 'boolean', 'false'),
  ('has_white_label', 'White Label', 'White label branding options', 'feature', 'boolean', 'false'),
  ('has_priority_support', 'Priority Support', 'Priority customer support', 'feature', 'boolean', 'false'),
  ('has_custom_integrations', 'Custom Integrations', 'Custom integration development', 'feature', 'boolean', 'false'),
  
  -- Limits
  ('max_runs_per_month', 'Monthly Runs Limit', 'Maximum runs per month', 'limit', 'integer', '100'),
  ('max_exports_per_month', 'Monthly Exports Limit', 'Maximum exports per month', 'limit', 'integer', '50'),
  ('max_storage_mb', 'Storage Limit (MB)', 'Maximum storage in megabytes', 'limit', 'integer', '100'),
  ('max_api_calls_per_hour', 'API Rate Limit', 'Maximum API calls per hour', 'limit', 'integer', '0'),
  
  -- Seats & Team
  ('has_seats_gt1', 'Multiple Seats', 'Support for multiple team members', 'feature', 'boolean', 'false'),
  ('max_seats', 'Maximum Seats', 'Maximum number of team seats', 'limit', 'integer', '1'),
  
  -- Advanced Features
  ('has_advanced_analytics', 'Advanced Analytics', 'Detailed analytics and insights', 'feature', 'boolean', 'false'),
  ('has_custom_domains', 'Custom Domains', 'Custom domain support', 'feature', 'boolean', 'false'),
  ('has_sso', 'Single Sign-On', 'SSO integration support', 'feature', 'boolean', 'false'),
  ('has_audit_logs', 'Audit Logs', 'Comprehensive audit logging', 'feature', 'boolean', 'false')

ON CONFLICT (key) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  value_type = EXCLUDED.value_type,
  default_value = EXCLUDED.default_value,
  updated_at = NOW();

-- =============================================================================
-- PLANS (Brand OS: Pilot/Pro/Enterprise)
-- =============================================================================

INSERT INTO public.plans (code, name, description, price_monthly_usd, price_yearly_usd, max_seats, max_runs_per_month, max_storage_mb, features, active, public) VALUES
  
  -- Free/Pilot Plan
  ('promptforge_pilot', 'Pilot', 'Perfect for getting started with prompt engineering', 
   0, 0, 1, 100, 100, 
   '{"highlight": "Free forever", "badge": ""}', 
   true, true),
  
  -- Pro Plan  
  ('promptforge_pro', 'Pro', 'For professionals and growing teams', 
   2900, 29000, 5, 1000, 1000, 
   '{"highlight": "Most Popular", "badge": "popular"}', 
   true, true),
  
  -- Enterprise Plan
  ('promptforge_enterprise', 'Enterprise', 'For organizations requiring advanced features and support', 
   9900, 99000, 50, 10000, 10000, 
   '{"highlight": "Advanced", "badge": "enterprise"}', 
   true, true),
   
  -- Legacy Creator (for migration)
  ('promptforge_creator', 'Creator', 'Legacy plan - use Pro instead', 
   1900, 19000, 3, 500, 500, 
   '{"highlight": "", "badge": "legacy"}', 
   false, false)

ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price_monthly_usd = EXCLUDED.price_monthly_usd,
  price_yearly_usd = EXCLUDED.price_yearly_usd,
  max_seats = EXCLUDED.max_seats,
  max_runs_per_month = EXCLUDED.max_runs_per_month,
  max_storage_mb = EXCLUDED.max_storage_mb,
  features = EXCLUDED.features,
  active = EXCLUDED.active,
  public = EXCLUDED.public,
  updated_at = NOW();

-- =============================================================================
-- PLAN ENTITLEMENTS MAPPING
-- =============================================================================

-- Pilot Plan Entitlements
INSERT INTO public.plan_entitlements (plan_code, entitlement_key, value) VALUES
  ('promptforge_pilot', 'can_export_md', 'true'),
  ('promptforge_pilot', 'max_runs_per_month', '100'),
  ('promptforge_pilot', 'max_exports_per_month', '50'),
  ('promptforge_pilot', 'max_storage_mb', '100'),
  ('promptforge_pilot', 'max_seats', '1')
ON CONFLICT (plan_code, entitlement_key) DO UPDATE SET value = EXCLUDED.value;

-- Pro Plan Entitlements
INSERT INTO public.plan_entitlements (plan_code, entitlement_key, value) VALUES
  ('promptforge_pro', 'can_use_all_modules', 'true'),
  ('promptforge_pro', 'can_export_md', 'true'),
  ('promptforge_pro', 'can_export_json', 'true'),
  ('promptforge_pro', 'can_export_pdf', 'true'),
  ('promptforge_pro', 'can_use_gpt_editor', 'true'),
  ('promptforge_pro', 'can_use_gpt_test_real', 'true'),
  ('promptforge_pro', 'has_evaluator_ai', 'true'),
  ('promptforge_pro', 'has_cloud_history', 'true'),
  ('promptforge_pro', 'can_export_history', 'true'),
  ('promptforge_pro', 'has_seats_gt1', 'true'),
  ('promptforge_pro', 'max_runs_per_month', '1000'),
  ('promptforge_pro', 'max_exports_per_month', '500'),
  ('promptforge_pro', 'max_storage_mb', '1000'),
  ('promptforge_pro', 'max_seats', '5'),
  ('promptforge_pro', 'has_advanced_analytics', 'true')
ON CONFLICT (plan_code, entitlement_key) DO UPDATE SET value = EXCLUDED.value;

-- Enterprise Plan Entitlements (everything + enterprise features)
INSERT INTO public.plan_entitlements (plan_code, entitlement_key, value) VALUES
  ('promptforge_enterprise', 'can_use_all_modules', 'true'),
  ('promptforge_enterprise', 'can_export_md', 'true'),
  ('promptforge_enterprise', 'can_export_json', 'true'),
  ('promptforge_enterprise', 'can_export_pdf', 'true'),
  ('promptforge_enterprise', 'can_export_bundle_zip', 'true'),
  ('promptforge_enterprise', 'can_use_gpt_editor', 'true'),
  ('promptforge_enterprise', 'can_use_gpt_test_real', 'true'),
  ('promptforge_enterprise', 'has_evaluator_ai', 'true'),
  ('promptforge_enterprise', 'has_cloud_history', 'true'),
  ('promptforge_enterprise', 'can_export_history', 'true'),
  ('promptforge_enterprise', 'has_api_access', 'true'),
  ('promptforge_enterprise', 'has_white_label', 'true'),
  ('promptforge_enterprise', 'has_priority_support', 'true'),
  ('promptforge_enterprise', 'has_custom_integrations', 'true'),
  ('promptforge_enterprise', 'has_seats_gt1', 'true'),
  ('promptforge_enterprise', 'max_runs_per_month', '10000'),
  ('promptforge_enterprise', 'max_exports_per_month', '5000'),
  ('promptforge_enterprise', 'max_storage_mb', '10000'),
  ('promptforge_enterprise', 'max_api_calls_per_hour', '1000'),
  ('promptforge_enterprise', 'max_seats', '50'),
  ('promptforge_enterprise', 'has_advanced_analytics', 'true'),
  ('promptforge_enterprise', 'has_custom_domains', 'true'),
  ('promptforge_enterprise', 'has_sso', 'true'),
  ('promptforge_enterprise', 'has_audit_logs', 'true')
ON CONFLICT (plan_code, entitlement_key) DO UPDATE SET value = EXCLUDED.value;

-- Legacy Creator Plan (for migration)
INSERT INTO public.plan_entitlements (plan_code, entitlement_key, value) VALUES
  ('promptforge_creator', 'can_export_md', 'true'),
  ('promptforge_creator', 'can_export_json', 'true'),
  ('promptforge_creator', 'has_cloud_history', 'true'),
  ('promptforge_creator', 'max_runs_per_month', '500'),
  ('promptforge_creator', 'max_exports_per_month', '250'),
  ('promptforge_creator', 'max_storage_mb', '500'),
  ('promptforge_creator', 'max_seats', '3')
ON CONFLICT (plan_code, entitlement_key) DO UPDATE SET value = EXCLUDED.value;

-- =============================================================================
-- VIEWS FOR EFFECTIVE ENTITLEMENTS
-- =============================================================================

-- View: Effective entitlements per organization
CREATE OR REPLACE VIEW public.v_entitlements_effective_org AS
SELECT 
  o.id as org_id,
  o.name as org_name,
  o.plan_code,
  COALESCE(
    jsonb_object_agg(
      COALESCE(oe.entitlement_key, pe.entitlement_key), 
      COALESCE(oe.value, pe.value)
    ) FILTER (WHERE COALESCE(oe.entitlement_key, pe.entitlement_key) IS NOT NULL),
    '{}'::jsonb
  ) as entitlements
FROM public.orgs o
LEFT JOIN public.subscriptions s ON s.org_id = o.id AND s.status = 'active'
LEFT JOIN public.plan_entitlements pe ON pe.plan_code = COALESCE(s.plan_code, o.plan_code)
LEFT JOIN public.org_entitlements oe ON oe.org_id = o.id 
  AND (oe.expires_at IS NULL OR oe.expires_at > NOW())
GROUP BY o.id, o.name, o.plan_code;

-- View: Effective entitlements per user (includes user addons)
CREATE OR REPLACE VIEW public.v_entitlements_effective_user AS
SELECT 
  o.id as org_id,
  om.user_id,
  o.name as org_name,
  o.plan_code,
  om.role,
  COALESCE(
    jsonb_object_agg(
      entitlement_key, 
      entitlement_value
    ) FILTER (WHERE entitlement_key IS NOT NULL),
    '{}'::jsonb
  ) as entitlements
FROM public.orgs o
JOIN public.org_members om ON om.org_id = o.id AND om.status = 'active'
LEFT JOIN public.subscriptions s ON s.org_id = o.id AND s.status = 'active'
LEFT JOIN (
  -- Plan entitlements
  SELECT pe.plan_code, pe.entitlement_key, pe.value as entitlement_value
  FROM public.plan_entitlements pe
  
  UNION ALL
  
  -- Org-level overrides
  SELECT o2.plan_code, oe.entitlement_key, oe.value as entitlement_value
  FROM public.org_entitlements oe
  JOIN public.orgs o2 ON o2.id = oe.org_id
  WHERE oe.expires_at IS NULL OR oe.expires_at > NOW()
  
  UNION ALL
  
  -- User-level addons
  SELECT o3.plan_code, ua.entitlement_key, ua.value as entitlement_value
  FROM public.user_addons ua
  JOIN public.orgs o3 ON o3.id = ua.org_id
  WHERE ua.expires_at IS NULL OR ua.expires_at > NOW()
) combined_entitlements ON combined_entitlements.plan_code = COALESCE(s.plan_code, o.plan_code)
GROUP BY o.id, om.user_id, o.name, o.plan_code, om.role;

-- =============================================================================
-- HELPER FUNCTIONS FOR ENTITLEMENT CHECKING
-- =============================================================================

-- Function to check if org has specific entitlement
CREATE OR REPLACE FUNCTION public.org_has_entitlement(
  org_uuid UUID, 
  entitlement_key TEXT
)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT (entitlements ->> entitlement_key)::boolean 
     FROM v_entitlements_effective_org 
     WHERE org_id = org_uuid),
    false
  );
$$;

-- Function to check if user has specific entitlement
CREATE OR REPLACE FUNCTION public.user_has_entitlement(
  org_uuid UUID, 
  user_uuid UUID, 
  entitlement_key TEXT
)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT (entitlements ->> entitlement_key)::boolean 
     FROM v_entitlements_effective_user 
     WHERE org_id = org_uuid AND user_id = user_uuid),
    false
  );
$$;

-- Function to get entitlement value (for limits)
CREATE OR REPLACE FUNCTION public.get_entitlement_value(
  org_uuid UUID, 
  entitlement_key TEXT
)
RETURNS JSONB
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT entitlements -> entitlement_key 
     FROM v_entitlements_effective_org 
     WHERE org_id = org_uuid),
    (SELECT default_value FROM entitlement_definitions WHERE key = entitlement_key)
  );
$$;

-- =============================================================================
-- COMMENTS
-- =============================================================================

COMMENT ON VIEW public.v_entitlements_effective_org IS 'Computed entitlements per organization including plan and overrides';
COMMENT ON VIEW public.v_entitlements_effective_user IS 'Computed entitlements per user including org and user-specific addons';
COMMENT ON FUNCTION public.org_has_entitlement(UUID, TEXT) IS 'Check if organization has specific boolean entitlement';
COMMENT ON FUNCTION public.user_has_entitlement(UUID, UUID, TEXT) IS 'Check if user has specific boolean entitlement';
COMMENT ON FUNCTION public.get_entitlement_value(UUID, TEXT) IS 'Get entitlement value (for limits and non-boolean values)';

-- =============================================================================
-- VALIDATION QUERIES (for testing)
-- =============================================================================

-- Test query: Show all plans with their entitlements
-- SELECT 
--   p.code,
--   p.name,
--   jsonb_object_agg(pe.entitlement_key, pe.value) as entitlements
-- FROM plans p
-- LEFT JOIN plan_entitlements pe ON pe.plan_code = p.code
-- WHERE p.active = true
-- GROUP BY p.code, p.name
-- ORDER BY p.code;

-- Test query: Show effective entitlements for a sample org
-- SELECT * FROM v_entitlements_effective_org LIMIT 1;
