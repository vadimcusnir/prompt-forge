-- 0018_cloud_history_multi_user.sql — Cloud history + multi-user implementation
begin;

-- 1. Adaug coloanele necesare pentru cloud history în tabelele existente
alter table runs 
  add column if not exists org_id uuid references orgs(id) on delete cascade,
  add column if not exists user_id uuid references auth.users(id) on delete set null,
  add column if not exists project_id uuid references projects(id) on delete set null,
  add column if not exists module_id text references modules(id),
  add column if not exists parameter_set_id uuid,
  add column if not exists type text check (type in ('generation','test','agent_execution')),
  add column if not exists model text,
  add column if not exists tokens_used int,
  add column if not exists cost_usd numeric(10,4),
  add column if not exists duration_ms int,
  add column if not exists started_at timestamptz default now(),
  add column if not exists finished_at timestamptz;

-- 2. Actualizează tabelul scores pentru prompt_scores
alter table scores 
  add column if not exists alignment int check (alignment between 0 and 100),
  add column if not exists feedback jsonb;

-- 3. Actualizează tabelul bundles pentru cloud storage
alter table bundles
  add column if not exists org_id uuid references orgs(id) on delete cascade,
  add column if not exists project_id uuid references projects(id) on delete set null,
  add column if not exists user_id uuid references auth.users(id) on delete set null,
  add column if not exists paths jsonb, -- {md:'...',json:'...',pdf:'...',zip:'...'}
  add column if not exists checksum text,
  add column if not exists version text, -- semver
  add column if not exists exported_at timestamptz default now(),
  add column if not exists license_notice text;

-- 4. Creează tabelul parameter_sets pentru engine 7D
create table if not exists parameter_sets (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid references orgs(id) on delete cascade,
  domain text not null,
  scale text not null check (scale in ('personal_brand','solo','startup','boutique_agency','smb','corporate','enterprise')),
  urgency text not null check (urgency in ('low','planned','sprint','pilot','crisis')),
  complexity text not null check (complexity in ('foundational','standard','advanced','expert')),
  resources text not null check (resources in ('minimal','solo','lean_team','agency_stack','full_stack_org','enterprise_budget')),
  application text not null check (application in ('training','audit','implementation','strategy','crisis_response','experimentation','documentation')),
  output_formats text[] not null,
  overrides jsonb, -- bias-uri locale
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default now()
);

-- 5. Creează tabelul domain_configs pentru profiluri industry
create table if not exists domain_configs (
  id uuid primary key default uuid_generate_v4(),
  industry text unique not null,
  jargon jsonb,
  kpis jsonb,
  compliance_notes text,
  default_output_format text,
  risk_level text check (risk_level in ('low','medium','high','critical')),
  style_bias jsonb,
  created_at timestamptz default now()
);

-- 6. Creează tabelul org_members pentru multi-user
create table if not exists org_members (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references orgs(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner','admin','member','viewer')),
  created_at timestamptz default now(),
  unique(org_id, user_id)
);

-- 7. Creează tabelul plans pentru feature flags
create table if not exists plans (
  code text primary key,
  name text not null,
  flags jsonb not null, -- {"canExportPDF":true,"hasCloudHistory":true,"hasEvaluatorAI":true}
  created_at timestamptz default now()
);

-- 8. Creează tabelul subscriptions pentru Stripe
create table if not exists subscriptions (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references orgs(id) on delete cascade,
  stripe_customer_id text,
  plan_code text not null references plans(code),
  status text not null check (status in ('active','trialing','past_due','canceled','unpaid')),
  seats int default 1,
  trial_end timestamptz,
  created_at timestamptz default now()
);

-- 9. Creează tabelul entitlements pentru drepturi efective
create table if not exists entitlements (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references orgs(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade, -- null pentru org-wide
  flag text not null,
  value boolean not null default true,
  source text not null check (source in ('plan','addon','license')),
  expires_at timestamptz,
  created_at timestamptz default now()
);

-- 10. Creează tabelul api_keys pentru Enterprise
create table if not exists api_keys (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references orgs(id) on delete cascade,
  name text not null,
  key_hash text not null,
  permissions jsonb not null,
  last_used timestamptz,
  expires_at timestamptz,
  created_at timestamptz default now()
);

-- 11. Adaugă foreign keys pentru parameter_sets
alter table runs 
  add constraint fk_runs_parameter_set 
  foreign key (parameter_set_id) references parameter_sets(id) on delete set null;

-- 12. Adaugă foreign key pentru domain_configs
alter table parameter_sets 
  add constraint fk_parameter_sets_domain 
  foreign key (domain) references domain_configs(industry) on delete restrict;

-- 13. Creează views pentru raportare per proiect
create or replace view v_project_runs as
select 
  p.id as project_id,
  p.name as project_name,
  p.org_id,
  r.id as run_id,
  r.type,
  r.status,
  r.model,
  r.tokens_used,
  r.cost_usd,
  r.duration_ms,
  r.created_at,
  r.created_by,
  m.id as module_id,
  m.title as module_title,
  ps.domain,
  ps.scale,
  ps.urgency,
  ps.complexity
from projects p
join runs r on r.project_id = p.id
left join modules m on m.id = r.module_id
left join parameter_sets ps on ps.id = r.parameter_set_id
where p.org_id::text = current_setting('request.jwt.claims', true)::jsonb->>'org_id';

create or replace view v_project_scores as
select 
  p.id as project_id,
  p.name as project_name,
  p.org_id,
  r.id as run_id,
  r.type,
  r.status,
  s.clarity,
  s.execution,
  s.ambiguity,
  s.alignment,
  s.business_fit,
  s.composite,
  s.verdict,
  s.feedback,
  r.created_at,
  m.id as module_id,
  m.title as module_title
from projects p
join runs r on r.project_id = p.id
join scores s on s.run_id = r.id
left join modules m on m.id = r.module_id
where p.org_id::text = current_setting('request.jwt.claims', true)::jsonb->>'org_id';

create or replace view v_project_bundles as
select 
  p.id as project_id,
  p.name as project_name,
  p.org_id,
  b.id as bundle_id,
  b.formats,
  b.paths,
  b.checksum,
  b.version,
  b.exported_at,
  r.id as run_id,
  r.type as run_type,
  r.status as run_status,
  m.id as module_id,
  m.title as module_title
from projects p
join runs r on r.project_id = p.id
join bundles b on b.run_id = r.id
left join modules m on m.id = r.module_id
where p.org_id::text = current_setting('request.jwt.claims', true)::jsonb->>'org_id';

create or replace view v_project_analytics as
select 
  p.id as project_id,
  p.name as project_name,
  p.org_id,
  count(distinct r.id) as total_runs,
  count(distinct case when r.status = 'success' then r.id end) as successful_runs,
  count(distinct case when r.status = 'error' then r.id end) as failed_runs,
  count(distinct b.id) as total_bundles,
  count(distinct s.run_id) as scored_runs,
  avg(s.composite) as avg_score,
  sum(r.cost_usd) as total_cost,
  sum(r.tokens_used) as total_tokens,
  min(r.created_at) as first_run,
  max(r.created_at) as last_run
from projects p
left join runs r on r.project_id = p.id
left join bundles b on b.run_id = r.id
left join scores s on s.run_id = r.id
where p.org_id::text = current_setting('request.jwt.claims', true)::jsonb->>'org_id'
group by p.id, p.name, p.org_id;

-- 14. Creează view pentru user activity
create or replace view v_user_activity as
select 
  om.user_id,
  om.org_id,
  om.role,
  count(distinct r.id) as total_runs,
  count(distinct b.id) as total_bundles,
  sum(r.cost_usd) as total_cost,
  sum(r.tokens_used) as total_tokens,
  max(r.created_at) as last_activity
from org_members om
left join runs r on r.user_id = om.user_id and r.org_id = om.org_id
left join bundles b on b.run_id = r.id
where om.org_id::text = current_setting('request.jwt.claims', true)::jsonb->>'org_id'
group by om.user_id, om.org_id, om.role;

-- 15. Creează view pentru org overview
create or replace view v_org_overview as
select 
  o.id as org_id,
  o.name as org_name,
  o.slug as org_slug,
  count(distinct om.user_id) as total_members,
  count(distinct p.id) as total_projects,
  count(distinct r.id) as total_runs,
  count(distinct b.id) as total_bundles,
  sum(r.cost_usd) as total_cost,
  sum(r.tokens_used) as total_tokens,
  max(r.created_at) as last_activity
from orgs o
left join org_members om on om.org_id = o.id
left join projects p on p.org_id = o.id
left join runs r on r.org_id = o.id
left join bundles b on b.run_id = r.id
where o.id::text = current_setting('request.jwt.claims', true)::jsonb->>'org_id'
group by o.id, o.name, o.slug;

-- 16. Adaugă indexuri pentru performanță
create index if not exists idx_runs_org_user on runs(org_id, user_id);
create index if not exists idx_runs_project on runs(project_id);
create index if not exists idx_runs_created_at on runs(created_at desc);
create index if not exists idx_bundles_org_user on bundles(org_id, user_id);
create index if not exists idx_bundles_project on bundles(project_id);
create index if not exists idx_bundles_exported_at on bundles(exported_at desc);
create index if not exists idx_parameter_sets_domain on parameter_sets(domain);
create index if not exists idx_org_members_user on org_members(user_id);
create index if not exists idx_subscriptions_org on subscriptions(org_id);
create index if not exists idx_entitlements_org_user on entitlements(org_id, user_id);

commit;
