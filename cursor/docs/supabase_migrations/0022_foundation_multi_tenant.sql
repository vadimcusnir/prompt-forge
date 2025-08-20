-- PromptForge™ Multi-Tenant Foundation Schema
-- Migration: 0022_foundation_multi_tenant.sql
-- Purpose: Core multi-tenant structure with commercial gating
-- Follows: cursor/init non_deviation_laws + audit requirements

-- =============================================================================
-- EXTENSIONS & FUNCTIONS
-- =============================================================================

-- Enable UUID extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Helper function to check if user is member of org
CREATE OR REPLACE FUNCTION public.is_member(org_uuid UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM org_members 
    WHERE org_id = org_uuid 
    AND user_id = auth.uid()
    AND status = 'active'
  );
$$;

-- Function to get current org from JWT or context
CREATE OR REPLACE FUNCTION public.current_org_id()
RETURNS UUID
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (auth.jwt() ->> 'org_id')::UUID,
    (SELECT org_id FROM org_members WHERE user_id = auth.uid() AND role = 'owner' LIMIT 1)
  );
$$;

-- Generic updated_at trigger function
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- =============================================================================
-- CORE TABLES
-- =============================================================================

-- Organizations (multi-tenant root)
CREATE TABLE IF NOT EXISTS public.orgs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL CHECK (length(name) >= 2 AND length(name) <= 100),
  slug TEXT UNIQUE NOT NULL CHECK (slug ~ '^[a-z0-9][a-z0-9-]*[a-z0-9]$'),
  
  -- Billing & limits
  plan_code TEXT DEFAULT 'promptforge_free' CHECK (
    plan_code IN ('promptforge_free', 'promptforge_creator', 'promptforge_pro', 'promptforge_enterprise')
  ),
  seats_limit INTEGER DEFAULT 1 CHECK (seats_limit >= 1),
  seats_used INTEGER DEFAULT 1 CHECK (seats_used >= 0),
  
  -- Status & metadata
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'deleted')),
  settings JSONB DEFAULT '{}',
  
  -- Audit fields
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  
  CONSTRAINT seats_used_within_limit CHECK (seats_used <= seats_limit)
);

-- Organization membership
CREATE TABLE IF NOT EXISTS public.org_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES public.orgs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Role hierarchy: owner > admin > member > viewer
  role TEXT NOT NULL DEFAULT 'member' CHECK (
    role IN ('owner', 'admin', 'member', 'viewer')
  ),
  
  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'invited', 'suspended')),
  
  -- Permissions override (JSONB for flexibility)
  permissions JSONB DEFAULT '{}',
  
  -- Invitation metadata
  invited_by UUID REFERENCES auth.users(id),
  invited_at TIMESTAMPTZ,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  UNIQUE(org_id, user_id)
);

-- Plans definition (master data)
CREATE TABLE IF NOT EXISTS public.plans (
  code TEXT PRIMARY KEY CHECK (code ~ '^promptforge_[a-z_]+$'),
  name TEXT NOT NULL,
  description TEXT,
  
  -- Pricing
  price_monthly_usd INTEGER DEFAULT 0 CHECK (price_monthly_usd >= 0), -- cents
  price_yearly_usd INTEGER DEFAULT 0 CHECK (price_yearly_usd >= 0),   -- cents
  
  -- Limits
  max_seats INTEGER DEFAULT 1 CHECK (max_seats >= 1),
  max_runs_per_month INTEGER DEFAULT 100 CHECK (max_runs_per_month >= 0),
  max_storage_mb INTEGER DEFAULT 100 CHECK (max_storage_mb >= 0),
  
  -- Features (boolean flags for basic gating)
  features JSONB DEFAULT '{}',
  
  -- Status
  active BOOLEAN DEFAULT true,
  public BOOLEAN DEFAULT true, -- visible in pricing page
  
  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Subscriptions (org-level billing)
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES public.orgs(id) ON DELETE CASCADE,
  plan_code TEXT NOT NULL REFERENCES public.plans(code),
  
  -- Billing cycle
  billing_cycle TEXT DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly')),
  
  -- Status
  status TEXT DEFAULT 'active' CHECK (
    status IN ('active', 'trialing', 'past_due', 'canceled', 'unpaid', 'incomplete')
  ),
  
  -- Dates
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,
  canceled_at TIMESTAMPTZ,
  
  -- Stripe integration
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  stripe_price_id TEXT,
  
  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  UNIQUE(org_id) -- one subscription per org for now
);

-- Entitlement definitions (master data)
CREATE TABLE IF NOT EXISTS public.entitlement_definitions (
  key TEXT PRIMARY KEY CHECK (key ~ '^[a-z][a-z0-9_]*$'),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'feature' CHECK (category IN ('feature', 'limit', 'addon')),
  
  -- Value constraints
  value_type TEXT DEFAULT 'boolean' CHECK (value_type IN ('boolean', 'integer', 'string', 'json')),
  default_value JSONB DEFAULT 'false',
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Plan entitlements (which entitlements each plan includes)
CREATE TABLE IF NOT EXISTS public.plan_entitlements (
  plan_code TEXT NOT NULL REFERENCES public.plans(code) ON DELETE CASCADE,
  entitlement_key TEXT NOT NULL REFERENCES public.entitlement_definitions(key) ON DELETE CASCADE,
  value JSONB NOT NULL DEFAULT 'true',
  
  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  PRIMARY KEY (plan_code, entitlement_key)
);

-- Organization-level entitlement overrides
CREATE TABLE IF NOT EXISTS public.org_entitlements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES public.orgs(id) ON DELETE CASCADE,
  entitlement_key TEXT NOT NULL REFERENCES public.entitlement_definitions(key) ON DELETE CASCADE,
  value JSONB NOT NULL,
  
  -- Metadata
  reason TEXT, -- why this override exists
  expires_at TIMESTAMPTZ, -- optional expiry
  granted_by UUID REFERENCES auth.users(id),
  
  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  UNIQUE(org_id, entitlement_key)
);

-- User-level addons (individual entitlements)
CREATE TABLE IF NOT EXISTS public.user_addons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES public.orgs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entitlement_key TEXT NOT NULL REFERENCES public.entitlement_definitions(key) ON DELETE CASCADE,
  value JSONB NOT NULL,
  
  -- Metadata
  reason TEXT,
  expires_at TIMESTAMPTZ,
  granted_by UUID REFERENCES auth.users(id),
  
  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  UNIQUE(org_id, user_id, entitlement_key)
);

-- API Keys (Enterprise feature)
CREATE TABLE IF NOT EXISTS public.api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES public.orgs(id) ON DELETE CASCADE,
  
  -- Key data
  key_hash TEXT NOT NULL UNIQUE, -- bcrypt hash of the key
  key_prefix TEXT NOT NULL, -- first 8 chars for display: "pf_live_12345678..."
  name TEXT NOT NULL CHECK (length(name) >= 1 AND length(name) <= 100),
  
  -- Permissions & limits
  scopes TEXT[] DEFAULT ARRAY['api:run'] CHECK (array_length(scopes, 1) > 0),
  rate_limit_per_hour INTEGER DEFAULT 1000 CHECK (rate_limit_per_hour > 0),
  
  -- Status
  active BOOLEAN DEFAULT true,
  last_used_at TIMESTAMPTZ,
  usage_count BIGINT DEFAULT 0,
  
  -- Audit
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT valid_scopes CHECK (
    scopes <@ ARRAY['api:run', 'api:export', 'api:history', 'api:admin']
  )
);

-- =============================================================================
-- TRIGGERS
-- =============================================================================

-- Updated_at triggers
CREATE TRIGGER set_orgs_updated_at
  BEFORE UPDATE ON public.orgs
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_org_members_updated_at
  BEFORE UPDATE ON public.org_members
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_plans_updated_at
  BEFORE UPDATE ON public.plans
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_entitlement_definitions_updated_at
  BEFORE UPDATE ON public.entitlement_definitions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_org_entitlements_updated_at
  BEFORE UPDATE ON public.org_entitlements
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_user_addons_updated_at
  BEFORE UPDATE ON public.user_addons
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_api_keys_updated_at
  BEFORE UPDATE ON public.api_keys
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Guard last owner trigger
CREATE OR REPLACE FUNCTION public.guard_last_owner()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  owner_count INTEGER;
BEGIN
  -- Only check for owner role changes/deletions
  IF (TG_OP = 'DELETE' AND OLD.role = 'owner') OR 
     (TG_OP = 'UPDATE' AND OLD.role = 'owner' AND NEW.role != 'owner') THEN
    
    -- Count remaining owners for this org
    SELECT COUNT(*) INTO owner_count
    FROM org_members 
    WHERE org_id = COALESCE(OLD.org_id, NEW.org_id)
    AND role = 'owner' 
    AND status = 'active'
    AND id != OLD.id; -- exclude current record
    
    IF owner_count = 0 THEN
      RAISE EXCEPTION 'Cannot remove the last owner from organization';
    END IF;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER guard_last_owner_trigger
  BEFORE UPDATE OR DELETE ON public.org_members
  FOR EACH ROW EXECUTE FUNCTION public.guard_last_owner();

-- Seats usage trigger
CREATE OR REPLACE FUNCTION public.update_seats_usage()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE orgs 
    SET seats_used = (
      SELECT COUNT(*) FROM org_members 
      WHERE org_id = NEW.org_id AND status = 'active'
    )
    WHERE id = NEW.org_id;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Only update if status changed
    IF OLD.status != NEW.status THEN
      UPDATE orgs 
      SET seats_used = (
        SELECT COUNT(*) FROM org_members 
        WHERE org_id = NEW.org_id AND status = 'active'
      )
      WHERE id = NEW.org_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE orgs 
    SET seats_used = (
      SELECT COUNT(*) FROM org_members 
      WHERE org_id = OLD.org_id AND status = 'active'
    )
    WHERE id = OLD.org_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER update_seats_usage_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.org_members
  FOR EACH ROW EXECUTE FUNCTION public.update_seats_usage();

-- =============================================================================
-- INDEXES FOR PERFORMANCE
-- =============================================================================

-- Org members lookups
CREATE INDEX IF NOT EXISTS idx_org_members_org_id ON public.org_members(org_id);
CREATE INDEX IF NOT EXISTS idx_org_members_user_id ON public.org_members(user_id);
CREATE INDEX IF NOT EXISTS idx_org_members_org_user ON public.org_members(org_id, user_id);
CREATE INDEX IF NOT EXISTS idx_org_members_role ON public.org_members(org_id, role) WHERE status = 'active';

-- Subscriptions
CREATE INDEX IF NOT EXISTS idx_subscriptions_org_id ON public.subscriptions(org_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_id ON public.subscriptions(stripe_subscription_id) WHERE stripe_subscription_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);

-- Entitlements
CREATE INDEX IF NOT EXISTS idx_org_entitlements_org_id ON public.org_entitlements(org_id);
CREATE INDEX IF NOT EXISTS idx_org_entitlements_key ON public.org_entitlements(entitlement_key);
CREATE INDEX IF NOT EXISTS idx_user_addons_org_user ON public.user_addons(org_id, user_id);
CREATE INDEX IF NOT EXISTS idx_user_addons_key ON public.user_addons(entitlement_key);

-- API Keys
CREATE INDEX IF NOT EXISTS idx_api_keys_org_id ON public.api_keys(org_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_prefix ON public.api_keys(key_prefix);
CREATE INDEX IF NOT EXISTS idx_api_keys_active ON public.api_keys(org_id, active) WHERE active = true;

-- Audit/time-based queries
CREATE INDEX IF NOT EXISTS idx_orgs_created_at ON public.orgs(created_at);
CREATE INDEX IF NOT EXISTS idx_org_members_created_at ON public.org_members(created_at);
CREATE INDEX IF NOT EXISTS idx_subscriptions_period_end ON public.subscriptions(current_period_end) WHERE status = 'active';

-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE public.orgs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.org_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entitlement_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_entitlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.org_entitlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_addons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

-- Orgs: members can read their org, owners can update
CREATE POLICY "Members can view their org"
  ON public.orgs FOR SELECT
  TO authenticated
  USING (public.is_member(id));

CREATE POLICY "Owners can update their org"
  ON public.orgs FOR UPDATE
  TO authenticated
  USING (
    id IN (
      SELECT org_id FROM org_members 
      WHERE user_id = auth.uid() 
      AND role IN ('owner', 'admin')
      AND status = 'active'
    )
  );

-- Org members: members can view, admins+ can manage
CREATE POLICY "Members can view org membership"
  ON public.org_members FOR SELECT
  TO authenticated
  USING (public.is_member(org_id));

CREATE POLICY "Admins can manage org membership"
  ON public.org_members FOR ALL
  TO authenticated
  USING (
    org_id IN (
      SELECT org_id FROM org_members 
      WHERE user_id = auth.uid() 
      AND role IN ('owner', 'admin')
      AND status = 'active'
    )
  );

-- Plans: public read access
CREATE POLICY "Plans are publicly readable"
  ON public.plans FOR SELECT
  TO authenticated
  USING (public = true);

-- Subscriptions: org members can view, owners can manage
CREATE POLICY "Members can view org subscription"
  ON public.subscriptions FOR SELECT
  TO authenticated
  USING (public.is_member(org_id));

CREATE POLICY "Owners can manage org subscription"
  ON public.subscriptions FOR ALL
  TO authenticated
  USING (
    org_id IN (
      SELECT org_id FROM org_members 
      WHERE user_id = auth.uid() 
      AND role = 'owner'
      AND status = 'active'
    )
  );

-- Entitlement definitions: public read
CREATE POLICY "Entitlement definitions are publicly readable"
  ON public.entitlement_definitions FOR SELECT
  TO authenticated
  USING (true);

-- Plan entitlements: public read
CREATE POLICY "Plan entitlements are publicly readable"
  ON public.plan_entitlements FOR SELECT
  TO authenticated
  USING (true);

-- Org entitlements: org members can view
CREATE POLICY "Members can view org entitlements"
  ON public.org_entitlements FOR SELECT
  TO authenticated
  USING (public.is_member(org_id));

-- User addons: user and org members can view
CREATE POLICY "User can view their addons"
  ON public.user_addons FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR public.is_member(org_id));

-- API keys: org members can view, admins+ can manage
CREATE POLICY "Members can view org API keys"
  ON public.api_keys FOR SELECT
  TO authenticated
  USING (public.is_member(org_id));

CREATE POLICY "Admins can manage org API keys"
  ON public.api_keys FOR ALL
  TO authenticated
  USING (
    org_id IN (
      SELECT org_id FROM org_members 
      WHERE user_id = auth.uid() 
      AND role IN ('owner', 'admin')
      AND status = 'active'
    )
  );

-- =============================================================================
-- COMMENTS FOR DOCUMENTATION
-- =============================================================================

COMMENT ON TABLE public.orgs IS 'Multi-tenant organizations - root entity for all data';
COMMENT ON TABLE public.org_members IS 'Organization membership with role-based access';
COMMENT ON TABLE public.plans IS 'Subscription plans master data';
COMMENT ON TABLE public.subscriptions IS 'Active subscriptions per organization';
COMMENT ON TABLE public.entitlement_definitions IS 'Master list of all possible entitlements';
COMMENT ON TABLE public.plan_entitlements IS 'Which entitlements each plan includes';
COMMENT ON TABLE public.org_entitlements IS 'Organization-level entitlement overrides';
COMMENT ON TABLE public.user_addons IS 'Individual user entitlements/addons';
COMMENT ON TABLE public.api_keys IS 'Enterprise API keys for programmatic access';

COMMENT ON FUNCTION public.is_member(UUID) IS 'Check if current user is active member of given org';
COMMENT ON FUNCTION public.current_org_id() IS 'Get current org ID from JWT or user context';
COMMENT ON FUNCTION public.guard_last_owner() IS 'Prevent removal of last owner from organization';
COMMENT ON FUNCTION public.update_seats_usage() IS 'Maintain accurate seats_used count on orgs table';
