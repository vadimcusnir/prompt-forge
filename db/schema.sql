-- PROMPTFORGE v3 — Complete Supabase Schema
-- Multi-tenant architecture with RLS policies
-- Supports orgs, entitlements, modules, runs, bundles, and industry packs

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- CORE ORGANIZATION & TENANCY
-- ============================================================================

-- Organizations table
CREATE TABLE orgs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  domain VARCHAR(255),
  logo_url TEXT,
  plan_id VARCHAR(50) NOT NULL DEFAULT 'free',
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Organization members with roles
CREATE TABLE org_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'member', -- owner, admin, member, viewer
  permissions JSONB DEFAULT '{}',
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  joined_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(org_id, user_id)
);

-- ============================================================================
-- SUBSCRIPTIONS & ENTITLEMENTS
-- ============================================================================

-- Subscription plans
CREATE TABLE plans (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price_monthly DECIMAL(10,2),
  price_yearly DECIMAL(10,2),
  features JSONB NOT NULL,
  limits JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Organization subscriptions
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  plan_id VARCHAR(50) NOT NULL REFERENCES plans(id),
  status VARCHAR(50) NOT NULL DEFAULT 'active', -- active, canceled, past_due, unpaid
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  cancel_at_period_end BOOLEAN DEFAULT false,
  stripe_subscription_id VARCHAR(255),
  stripe_customer_id VARCHAR(255),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- MODULES & PARAMETER SETS
-- ============================================================================

-- Module definitions (M01-M50)
CREATE TABLE modules (
  id INTEGER PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  requirements TEXT NOT NULL,
  spec TEXT NOT NULL,
  output_schema TEXT NOT NULL,
  kpi TEXT NOT NULL,
  guardrails TEXT NOT NULL,
  vectors INTEGER[] NOT NULL,
  category VARCHAR(100),
  tags TEXT[],
  is_active BOOLEAN DEFAULT true,
  version VARCHAR(20) DEFAULT '1.0.0',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7D Parameter sets for modules
CREATE TABLE parameter_sets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  module_id INTEGER NOT NULL REFERENCES modules(id),
  org_id UUID REFERENCES orgs(id),
  name VARCHAR(255) NOT NULL,
  domain VARCHAR(50) NOT NULL,
  scale VARCHAR(50) NOT NULL,
  urgency VARCHAR(50) NOT NULL,
  complexity VARCHAR(50) NOT NULL,
  resources VARCHAR(50) NOT NULL,
  application VARCHAR(100) NOT NULL,
  output_format VARCHAR(50) NOT NULL,
  is_default BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT false,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- EXECUTION & RUNS
-- ============================================================================

-- Module execution runs
CREATE TABLE runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  run_id VARCHAR(100) UNIQUE NOT NULL, -- Format: YYYYMMDD-org-module-domain-semver
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  module_id INTEGER NOT NULL REFERENCES modules(id),
  parameter_set_id UUID REFERENCES parameter_sets(id),
  user_id UUID NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'running', -- running, completed, failed, canceled
  input_prompt TEXT NOT NULL,
  seven_d_params JSONB NOT NULL, -- Validated 7D parameters
  scores JSONB, -- clarity, execution, ambiguity, business_fit
  overall_score DECIMAL(5,2),
  token_count INTEGER,
  duration_ms INTEGER,
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Run artifacts (txt, md, json, pdf)
CREATE TABLE run_artifacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  run_id UUID NOT NULL REFERENCES runs(id) ON DELETE CASCADE,
  artifact_type VARCHAR(20) NOT NULL, -- txt, md, json, pdf
  content_hash VARCHAR(64) NOT NULL, -- SHA256 hash
  file_path TEXT NOT NULL,
  file_size INTEGER,
  mime_type VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- EXPORT BUNDLES & MANIFESTS
-- ============================================================================

-- Export bundles
CREATE TABLE bundles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  run_id UUID NOT NULL REFERENCES runs(id) ON DELETE CASCADE,
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  bundle_path TEXT NOT NULL,
  checksum_sha256 VARCHAR(64) NOT NULL,
  manifest JSONB NOT NULL,
  artifacts_count INTEGER NOT NULL DEFAULT 0,
  total_size INTEGER,
  export_format VARCHAR(20) NOT NULL, -- single, bundle, collection
  watermark_applied BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bundle artifacts mapping
CREATE TABLE bundle_artifacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bundle_id UUID NOT NULL REFERENCES bundles(id) ON DELETE CASCADE,
  artifact_type VARCHAR(20) NOT NULL,
  file_path TEXT NOT NULL,
  checksum VARCHAR(64) NOT NULL,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDUSTRY PACKS & PROJECTS
-- ============================================================================

-- Industry packs (ecommerce, education, fintech, etc.)
CREATE TABLE industry_packs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  industry VARCHAR(100) NOT NULL,
  modules INTEGER[] NOT NULL, -- Array of module IDs
  parameter_sets UUID[] NOT NULL, -- Array of parameter set IDs
  is_active BOOLEAN DEFAULT true,
  is_public BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Projects (collections of runs)
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  industry_pack_id UUID REFERENCES industry_packs(id),
  runs UUID[] NOT NULL DEFAULT '{}', -- Array of run IDs
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- RULESET VERSIONING & COMPLIANCE
-- ============================================================================

-- Ruleset versions (from ruleset.yml)
CREATE TABLE ruleset_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  version VARCHAR(20) NOT NULL,
  checksum VARCHAR(64) NOT NULL, -- SHA256 of ruleset.yml content
  content_hash VARCHAR(64) NOT NULL, -- Hash of parsed content
  metadata JSONB NOT NULL, -- Version info, release notes
  is_active BOOLEAN DEFAULT false,
  activated_at TIMESTAMPTZ,
  activated_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ruleset overrides log (user customizations)
CREATE TABLE ruleset_overrides_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  ruleset_version_id UUID NOT NULL REFERENCES ruleset_versions(id),
  override_type VARCHAR(50) NOT NULL, -- 7d_params, scoring, export
  original_value JSONB NOT NULL,
  new_value JSONB NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- TELEMETRY & AUDIT
-- ============================================================================

-- Telemetry events (PII-safe)
CREATE TABLE telemetry_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type VARCHAR(100) NOT NULL,
  org_id UUID REFERENCES orgs(id),
  user_id UUID,
  session_id VARCHAR(255),
  metadata JSONB NOT NULL, -- Event-specific data (no PII)
  ip_hash VARCHAR(64), -- Hashed IP for privacy
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit log for sensitive operations
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES orgs(id),
  user_id UUID NOT NULL,
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50) NOT NULL,
  resource_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Core indexes
CREATE INDEX idx_orgs_slug ON orgs(slug);
CREATE INDEX idx_orgs_plan_id ON orgs(plan_id);
CREATE INDEX idx_org_members_org_id ON org_members(org_id);
CREATE INDEX idx_org_members_user_id ON org_members(user_id);
CREATE INDEX idx_subscriptions_org_id ON subscriptions(org_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);

-- Module and parameter indexes
CREATE INDEX idx_parameter_sets_module_id ON parameter_sets(module_id);
CREATE INDEX idx_parameter_sets_org_id ON parameter_sets(org_id);
CREATE INDEX idx_parameter_sets_domain ON parameter_sets(domain);

-- Run indexes
CREATE INDEX idx_runs_org_id ON runs(org_id);
CREATE INDEX idx_runs_module_id ON runs(module_id);
CREATE INDEX idx_runs_user_id ON runs(user_id);
CREATE INDEX idx_runs_status ON runs(status);
CREATE INDEX idx_runs_created_at ON runs(created_at);
CREATE INDEX idx_runs_run_id ON runs(run_id);

-- Bundle indexes
CREATE INDEX idx_bundles_run_id ON bundles(run_id);
CREATE INDEX idx_bundles_org_id ON bundles(org_id);
CREATE INDEX idx_bundles_checksum ON bundles(checksum_sha256);

-- Industry pack indexes
CREATE INDEX idx_industry_packs_slug ON industry_packs(slug);
CREATE INDEX idx_industry_packs_industry ON industry_packs(industry);

-- Telemetry indexes
CREATE INDEX idx_telemetry_events_org_id ON telemetry_events(org_id);
CREATE INDEX idx_telemetry_events_event_type ON telemetry_events(event_type);
CREATE INDEX idx_telemetry_events_created_at ON telemetry_events(created_at);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE orgs ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE parameter_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE run_artifacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE bundles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bundle_artifacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE industry_packs ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE ruleset_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ruleset_overrides_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE telemetry_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to all tables
CREATE TRIGGER update_orgs_updated_at BEFORE UPDATE ON orgs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_org_members_updated_at BEFORE UPDATE ON org_members FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_parameter_sets_updated_at BEFORE UPDATE ON parameter_sets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_modules_updated_at BEFORE UPDATE ON modules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_runs_updated_at BEFORE UPDATE ON runs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_industry_packs_updated_at BEFORE UPDATE ON industry_packs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate run_id
CREATE OR REPLACE FUNCTION generate_run_id(
  p_org_id UUID,
  p_module_id INTEGER,
  p_domain VARCHAR(50)
)
RETURNS VARCHAR(100) AS $$
DECLARE
  v_date VARCHAR(8);
  v_org_slug VARCHAR(100);
  v_semver VARCHAR(20);
BEGIN
  v_date := TO_CHAR(NOW(), 'YYYYMMDD');
  SELECT slug INTO v_org_slug FROM orgs WHERE id = p_org_id;
  v_semver := '1.0.0'; -- Default semver
  
  RETURN v_date || '-' || COALESCE(v_org_slug, 'unknown') || '-' || p_module_id || '-' || p_domain || '-' || v_semver;
END;
$$ LANGUAGE plpgsql;

-- Function to validate 7D parameters
CREATE OR REPLACE FUNCTION validate_7d_params(
  p_domain VARCHAR(50),
  p_scale VARCHAR(50),
  p_urgency VARCHAR(50),
  p_complexity VARCHAR(50),
  p_resources VARCHAR(50),
  p_application VARCHAR(100),
  p_output_format VARCHAR(50)
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Validate against hardcoded enums (client-safe validation)
  RETURN (
    p_domain IN ('generic', 'ecommerce', 'education', 'fintech', 'healthcare', 'legal', 'marketing', 'sales', 'support', 'technical') AND
    p_scale IN ('individual', 'team', 'department', 'organization', 'enterprise') AND
    p_urgency IN ('low', 'normal', 'high', 'critical') AND
    p_complexity IN ('simple', 'medium', 'complex', 'expert') AND
    p_resources IN ('minimal', 'standard', 'enhanced', 'premium') AND
    p_application IN ('content_ops', 'customer_support', 'sales_enablement', 'training', 'documentation', 'analysis') AND
    p_output_format IN ('single', 'bundle', 'collection')
  );
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- VIEWS FOR COMMON QUERIES
-- ============================================================================

-- View for effective entitlements
CREATE VIEW v_effective_entitlements AS
SELECT 
  o.id as org_id,
  o.name as org_name,
  o.plan_id,
  p.features,
  p.limits,
  s.status as subscription_status,
  s.current_period_end
FROM orgs o
JOIN plans p ON o.plan_id = p.id
LEFT JOIN subscriptions s ON o.id = s.org_id AND s.status = 'active';

-- View for run statistics
CREATE VIEW v_run_stats AS
SELECT 
  r.org_id,
  r.module_id,
  m.name as module_name,
  COUNT(*) as total_runs,
  AVG(r.overall_score) as avg_score,
  AVG(r.duration_ms) as avg_duration,
  AVG(r.token_count) as avg_tokens,
  MAX(r.created_at) as last_run
FROM runs r
JOIN modules m ON r.module_id = m.id
WHERE r.status = 'completed'
GROUP BY r.org_id, r.module_id, m.name;

-- View for bundle exports
CREATE VIEW v_bundle_exports AS
SELECT 
  b.id,
  b.run_id,
  b.org_id,
  b.export_format,
  b.artifacts_count,
  b.total_size,
  b.watermark_applied,
  b.created_at,
  r.module_id,
  m.name as module_name,
  o.name as org_name
FROM bundles b
JOIN runs r ON b.run_id = r.id
JOIN modules m ON r.module_id = m.id
JOIN orgs o ON b.org_id = o.id;
