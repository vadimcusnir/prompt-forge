-- 0001_base.sql — core schema
begin;

create extension if not exists "uuid-ossp";
create extension if not exists pgcrypto;

-- ORGS & PROJECTS
create table if not exists orgs (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  name text not null,
  created_at timestamptz default now()
);

create table if not exists projects (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references orgs(id) on delete cascade,
  slug text not null,
  name text not null,
  created_at timestamptz default now(),
  unique (org_id, slug)
);

-- MODULES & VERSIONS
create table if not exists modules (
  id text primary key,                 -- "M01".."M50"
  title text not null,
  description text,
  created_at timestamptz default now()
);

create table if not exists module_versions (
  id uuid primary key default uuid_generate_v4(),
  module_id text not null references modules(id) on delete cascade,
  semver text not null,
  parent_version_id uuid references module_versions(id),
  changelog text,
  spec_json jsonb not null,
  created_by uuid,
  created_at timestamptz default now(),
  unique(module_id, semver)
);

-- PROMPTS & VERSIONS
create table if not exists prompts (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references projects(id) on delete cascade,
  module_id text not null references modules(id),
  title text not null,
  created_by uuid,
  created_at timestamptz default now()
);

create table if not exists prompt_versions (
  id uuid primary key default uuid_generate_v4(),
  prompt_id uuid not null references prompts(id) on delete cascade,
  module_version_id uuid references module_versions(id),
  semver text not null,
  parent_version_id uuid references prompt_versions(id),
  status text not null default 'active',  -- active|archived|deprecated
  params_7d jsonb not null,
  body_md text not null,
  body_txt text,
  body_json jsonb,
  diff_json jsonb,
  checksum_sha256 text not null,
  created_by uuid,
  created_at timestamptz default now(),
  unique(prompt_id, semver)
);

create table if not exists version_edges (
  id bigserial primary key,
  from_version uuid not null references prompt_versions(id) on delete cascade,
  to_version uuid not null references prompt_versions(id) on delete cascade,
  relation text not null check (relation in ('parent','merge')),
  created_at timestamptz default now(),
  unique(from_version, to_version, relation)
);

-- RUNS & SCORES
create table if not exists runs (
  id uuid primary key default uuid_generate_v4(),
  prompt_version_id uuid not null references prompt_versions(id) on delete cascade,
  run_hash text not null,
  parameter_set_7d jsonb not null,
  status text not null default 'ok',      -- ok|fail|partial
  telemetry jsonb,
  created_by uuid,
  created_at timestamptz default now(),
  unique(prompt_version_id, run_hash)
);

create table if not exists scores (
  run_id uuid primary key references runs(id) on delete cascade,
  clarity int not null check (clarity between 0 and 100),
  execution int not null check (execution between 0 and 100),
  ambiguity int not null check (ambiguity between 0 and 100),
  business_fit int not null check (business_fit between 0 and 100),
  composite numeric(5,2),
  verdict text not null check (verdict in ('pass','partial_pass','fail')),
  thresholds jsonb,
  weights jsonb,
  notes text
);

-- BUNDLES & ARTIFACTS & MANIFESTS & SIGNATURES
create table if not exists bundles (
  id uuid primary key default uuid_generate_v4(),
  run_id uuid not null references runs(id) on delete cascade,
  module_id text not null references modules(id),
  run_hash text not null,
  formats text[] not null,                -- {"txt","md","json","pdf"}
  created_at timestamptz default now(),
  unique(run_id)
);

create table if not exists artifacts (
  id bigserial primary key,
  bundle_id uuid not null references bundles(id) on delete cascade,
  file_name text not null,
  bytes bigint not null,
  sha256 text not null,
  created_at timestamptz default now(),
  unique(bundle_id, file_name)
);

create table if not exists manifests (
  bundle_id uuid primary key references bundles(id) on delete cascade,
  json jsonb not null,
  created_at timestamptz default now()
);

create table if not exists signatures (
  bundle_id uuid primary key references bundles(id) on delete cascade,
  algorithm text not null check (algorithm='ed25519'),
  signed_by text not null,
  signature text not null,
  created_at timestamptz default now()
);

-- TRIGGER: checksum auto-recalc
create or replace function pf_compute_checksum()
returns trigger as $$
declare
  payload text;
begin
  payload := coalesce(new.body_md,'') || coalesce(new.body_txt,'') ||
             coalesce(new.body_json::text,'') || coalesce(new.params_7d::text,'');
  new.checksum_sha256 := 'sha256:' || encode(digest(payload, 'sha256'),'hex');
  return new;
end; $$ language plpgsql;

drop trigger if exists trg_checksum on prompt_versions;
create trigger trg_checksum
before insert or update of body_md, body_txt, body_json, params_7d
on prompt_versions
for each row execute function pf_compute_checksum();

commit;
