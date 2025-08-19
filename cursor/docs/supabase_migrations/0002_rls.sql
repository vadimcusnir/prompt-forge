-- 0002_rls.sql — row level security & policies
begin;

-- Enable RLS
alter table if exists orgs enable row level security;
alter table if exists projects enable row level security;
alter table if exists prompts enable row level security;
alter table if exists prompt_versions enable row level security;
alter table if exists version_edges enable row level security;
alter table if exists runs enable row level security;
alter table if exists scores enable row level security;
alter table if exists bundles enable row level security;
alter table if exists artifacts enable row level security;
alter table if exists manifests enable row level security;
alter table if exists signatures enable row level security;
alter table if exists modules enable row level security;
alter table if exists module_versions enable row level security;

-- Simple public read on modules/module_versions (optional)
create policy if not exists modules_read_public on modules
  for select using (true);
create policy if not exists module_versions_read_public on module_versions
  for select using (true);

-- Projects RLS by org_id claim
create policy if not exists org_read on projects
  for select using ( org_id::text = current_setting('request.jwt.claims', true)::jsonb->>'org_id' );

create policy if not exists org_write on projects
  for insert with check ( org_id::text = current_setting('request.jwt.claims', true)::jsonb->>'org_id' );

-- Propagate org scoping via projects for dependent tables
-- PROMPTS
create policy if not exists prompts_read on prompts
  for select using (
    exists (select 1 from projects pr
            where pr.id = prompts.project_id
              and pr.org_id::text = current_setting('request.jwt.claims', true)::jsonb->>'org_id')
  );

create policy if not exists prompts_write on prompts
  for all using (true)
  with check (
    exists (select 1 from projects pr
            where pr.id = prompts.project_id
              and pr.org_id::text = current_setting('request.jwt.claims', true)::jsonb->>'org_id')
  );

-- PROMPT_VERSIONS
create policy if not exists prompt_versions_read on prompt_versions
  for select using (
    exists (select 1 from prompts p join projects pr on pr.id = p.project_id
            where p.id = prompt_versions.prompt_id
              and pr.org_id::text = current_setting('request.jwt.claims', true)::jsonb->>'org_id')
  );

create policy if not exists prompt_versions_write on prompt_versions
  for all using (true)
  with check (
    exists (select 1 from prompts p join projects pr on pr.id = p.project_id
            where p.id = prompt_versions.prompt_id
              and pr.org_id::text = current_setting('request.jwt.claims', true)::jsonb->>'org_id')
  );

-- VERSION_EDGES
create policy if not exists version_edges_read on version_edges
  for select using (
    exists (select 1 from prompt_versions pv join prompts p on p.id = pv.prompt_id
            join projects pr on pr.id = p.project_id
            where pv.id = version_edges.from_version
               or pv.id = version_edges.to_version
              and pr.org_id::text = current_setting('request.jwt.claims', true)::jsonb->>'org_id')
  );

-- RUNS
create policy if not exists runs_read on runs
  for select using (
    exists (select 1 from prompt_versions pv join prompts p on p.id = pv.prompt_id
            join projects pr on pr.id = p.project_id
            where pv.id = runs.prompt_version_id
              and pr.org_id::text = current_setting('request.jwt.claims', true)::jsonb->>'org_id')
  );

create policy if not exists runs_write on runs
  for all using (true)
  with check (
    exists (select 1 from prompt_versions pv join prompts p on p.id = pv.prompt_id
            join projects pr on pr.id = p.project_id
            where pv.id = runs.prompt_version_id
              and pr.org_id::text = current_setting('request.jwt.claims', true)::jsonb->>'org_id')
  );

-- SCORES
create policy if not exists scores_rw on scores
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
create policy if not exists bundles_rw on bundles
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

create policy if not exists artifacts_rw on artifacts
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

create policy if not exists manifests_rw on manifests
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

create policy if not exists signatures_rw on signatures
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
