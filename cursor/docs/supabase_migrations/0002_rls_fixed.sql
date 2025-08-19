-- 0002_rls_fixed.sql — Row Level Security policies
begin;

-- Enable RLS on all tables
alter table orgs enable row level security;
alter table projects enable row level security;
alter table modules enable row level security;
alter table module_versions enable row level security;
alter table prompts enable row level security;
alter table prompt_versions enable row level security;
alter table version_edges enable row level security;
alter table runs enable row level security;
alter table scores enable row level security;
alter table bundles enable row level security;
alter table artifacts enable row level security;
alter table manifests enable row level security;
alter table signatures enable row level security;

-- Drop existing policies if they exist
drop policy if exists modules_read_public on modules;
drop policy if exists module_versions_read_public on module_versions;
drop policy if exists org_read on projects;
drop policy if exists org_write on projects;
drop policy if exists prompts_read on prompts;
drop policy if exists prompts_write on prompts;
drop policy if exists prompt_versions_read on prompt_versions;
drop policy if exists prompt_versions_write on prompt_versions;
drop policy if exists version_edges_read on version_edges;
drop policy if exists runs_read on runs;
drop policy if exists runs_write on runs;
drop policy if exists scores_rw on scores;
drop policy if exists bundles_rw on bundles;
drop policy if exists artifacts_rw on artifacts;
drop policy if exists manifests_rw on manifests;
drop policy if exists signatures_rw on signatures;

-- MODULES - Public read access
create policy modules_read_public on modules
  for select using (true);
create policy module_versions_read_public on module_versions
  for select using (true);

-- Projects RLS by org_id claim
create policy org_read on projects
  for select using ( org_id::text = current_setting('request.jwt.claims', true)::jsonb->>'org_id' );

create policy org_write on projects
  for insert with check ( org_id::text = current_setting('request.jwt.claims', true)::jsonb->>'org_id' );

-- Propagate org scoping via projects for dependent tables
-- PROMPTS
create policy prompts_read on prompts
  for select using (
    exists (select 1 from projects pr
            where pr.id = prompts.project_id
              and pr.org_id::text = current_setting('request.jwt.claims', true)::jsonb->>'org_id')
  );

create policy prompts_write on prompts
  for all using (true)
  with check (
    exists (select 1 from projects pr
            where pr.id = prompts.project_id
              and pr.org_id::text = current_setting('request.jwt.claims', true)::jsonb->>'org_id')
  );

-- PROMPT_VERSIONS
create policy prompt_versions_read on prompt_versions
  for select using (
    exists (select 1 from prompts p join projects pr on pr.id = p.project_id
            where p.id = prompt_versions.prompt_id
              and pr.org_id::text = current_setting('request.jwt.claims', true)::jsonb->>'org_id')
  );

create policy prompt_versions_write on prompt_versions
  for all using (true)
  with check (
    exists (select 1 from prompts p join projects pr on pr.id = p.project_id
            where p.id = prompt_versions.prompt_id
              and pr.org_id::text = current_setting('request.jwt.claims', true)::jsonb->>'org_id')
  );

-- VERSION_EDGES
create policy version_edges_read on version_edges
  for select using (
    exists (select 1 from prompt_versions pv join prompts p on p.id = pv.prompt_id
            join projects pr on pr.id = p.project_id
            where pv.id = version_edges.from_version
               or pv.id = version_edges.to_version
              and pr.org_id::text = current_setting('request.jwt.claims', true)::jsonb->>'org_id')
  );

-- RUNS
create policy runs_read on runs
  for select using (
    exists (select 1 from prompt_versions pv join prompts p on p.id = pv.prompt_id
            join projects pr on pr.id = p.project_id
            where pv.id = runs.prompt_version_id
              and pr.org_id::text = current_setting('request.jwt.claims', true)::jsonb->>'org_id')
  );

create policy runs_write on runs
  for all using (true)
  with check (
    exists (select 1 from prompt_versions pv join prompts p on p.id = pv.prompt_id
            join projects pr on pr.id = p.project_id
            where pv.id = runs.prompt_version_id
              and pr.org_id::text = current_setting('request.jwt.claims', true)::jsonb->>'org_id')
  );

-- SCORES
create policy scores_rw on scores
  for all using (
    exists (select 1 from runs r join prompt_versions pv on pv.id = r.prompt_version_id
            join prompts p on p.id = pv.prompt_id
            join projects pr on pr.id = p.project_id
            where r.id = scores.run_id
              and pr.org_id::text = current_setting('request.jwt.claims', true)::jsonb->>'org_id')
  )
  with check (
    exists (select 1 from runs r join prompt_versions pv on pv.id = r.prompt_version_id
            join prompts p on p.id = pv.prompt_id
            join projects pr on pr.id = p.project_id
            where r.id = scores.run_id
              and pr.org_id::text = current_setting('request.jwt.claims', true)::jsonb->>'org_id')
  );

-- BUNDLES / ARTIFACTS / MANIFESTS / SIGNATURES
create policy bundles_rw on bundles
  for all using (
    exists (select 1 from runs r join prompt_versions pv on pv.id = r.prompt_version_id
            join prompts p on p.id = pv.prompt_id
            join projects pr on pr.id = p.project_id
            where r.id = bundles.run_id
              and pr.org_id::text = current_setting('request.jwt.claims', true)::jsonb->>'org_id')
  )
  with check (
    exists (select 1 from runs r join prompt_versions pv on pv.id = r.prompt_version_id
            join prompts p on p.id = pv.prompt_id
            join projects pr on pr.id = p.project_id
            where r.id = bundles.run_id
              and pr.org_id::text = current_setting('request.jwt.claims', true)::jsonb->>'org_id')
  );

create policy artifacts_rw on artifacts
  for all using (
    exists (select 1 from bundles b join runs r on r.id = b.run_id
            join prompt_versions pv on pv.id = r.prompt_version_id
            join prompts p on p.id = pv.prompt_id
            join projects pr on pr.id = p.project_id
            where b.id = artifacts.bundle_id
              and pr.org_id::text = current_setting('request.jwt.claims', true)::jsonb->>'org_id')
  )
  with check (
    exists (select 1 from bundles b join runs r on r.id = b.run_id
            join prompt_versions pv on pv.id = r.prompt_version_id
            join prompts p on p.id = pv.prompt_id
            join projects pr on pr.id = p.project_id
            where b.id = artifacts.bundle_id
              and pr.org_id::text = current_setting('request.jwt.claims', true)::jsonb->>'org_id')
  );

create policy manifests_rw on manifests
  for all using (
    exists (select 1 from bundles b join runs r on r.id = b.run_id
            join prompt_versions pv on pv.id = r.prompt_version_id
            join prompts p on p.id = pv.prompt_id
            join projects pr on pr.id = p.project_id
            where b.id = manifests.bundle_id
              and pr.org_id::text = current_setting('request.jwt.claims', true)::jsonb->>'org_id')
  )
  with check (
    exists (select 1 from bundles b join runs r on r.id = b.run_id
            join prompt_versions pv on pv.id = r.prompt_version_id
            join prompts p on p.id = pv.prompt_id
            join projects pr on pr.id = p.project_id
            where b.id = manifests.bundle_id
              and pr.org_id::text = current_setting('request.jwt.claims', true)::jsonb->>'org_id')
  );

create policy signatures_rw on signatures
  for all using (
    exists (select 1 from bundles b join runs r on r.id = b.run_id
            join prompt_versions pv on pv.id = r.prompt_version_id
            join prompts p on p.id = pv.prompt_id
            join projects pr on pr.id = p.project_id
            where b.id = signatures.bundle_id
              and pr.org_id::text = current_setting('request.jwt.claims', true)::jsonb->>'org_id')
  )
  with check (
    exists (select 1 from bundles b join runs r on r.id = b.run_id
            join prompt_versions pv on pv.id = r.prompt_version_id
            join prompts p on p.id = pv.prompt_id
            join projects pr on pr.id = p.project_id
            where b.id = signatures.bundle_id
              and pr.org_id::text = current_setting('request.jwt.claims', true)::jsonb->>'org_id')
  );

commit;
