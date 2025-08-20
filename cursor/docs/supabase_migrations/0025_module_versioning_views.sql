-- 0025_module_versioning_views.sql — views and utilities for module versioning
begin;

-- View pentru latest versions per modul
create or replace view module_latest_versions as
select distinct on (mv.module_id)
  mv.id,
  mv.module_id,
  m.title as module_title,
  m.description as module_description,
  mv.semver,
  mv.changelog,
  mv.spec_json,
  mv.vectors,
  mv.requirements,
  mv.spec_text,
  mv.output_schema,
  mv.kpi,
  mv.guardrails,
  mv.enabled,
  mv.is_snapshot,
  mv.snapshot_reason,
  mv.created_by,
  mv.created_at,
  mv.updated_at
from module_versions mv
join modules m on m.id = mv.module_id
where mv.enabled = true
order by mv.module_id, pf_semver_compare(mv.semver, '0.0.0') desc, mv.created_at desc;

-- View pentru versioning history
create or replace view module_version_history as
select 
  mv.id,
  mv.module_id,
  m.title as module_title,
  mv.semver,
  mv.parent_version_id,
  parent_mv.semver as parent_semver,
  mv.changelog,
  mv.enabled,
  mv.is_snapshot,
  mv.snapshot_reason,
  mv.created_by,
  mv.created_at,
  -- Calculează tipul de increment
  case 
    when mv.parent_version_id is null then 'initial'
    when mv.is_snapshot then 'snapshot'
    else pf_version_increment_type(parent_mv.semver, mv.semver)
  end as increment_type
from module_versions mv
join modules m on m.id = mv.module_id
left join module_versions parent_mv on parent_mv.id = mv.parent_version_id
order by mv.module_id, pf_semver_compare(mv.semver, '0.0.0') desc, mv.created_at desc;

-- Funcție pentru determinarea tipului de increment
create or replace function pf_version_increment_type(old_version text, new_version text)
returns text language plpgsql immutable as $$
declare
  old_parts text[];
  new_parts text[];
  old_major int;
  old_minor int;
  old_patch int;
  new_major int;
  new_minor int;
  new_patch int;
begin
  if not pf_is_semver(old_version) or not pf_is_semver(new_version) then
    return 'invalid';
  end if;
  
  old_parts := string_to_array(split_part(split_part(old_version, '-', 1), '+', 1), '.');
  new_parts := string_to_array(split_part(split_part(new_version, '-', 1), '+', 1), '.');
  
  old_major := old_parts[1]::int;
  old_minor := old_parts[2]::int;
  old_patch := old_parts[3]::int;
  
  new_major := new_parts[1]::int;
  new_minor := new_parts[2]::int;
  new_patch := new_parts[3]::int;
  
  if new_major > old_major then return 'major';
  elsif new_minor > old_minor then return 'minor';
  elsif new_patch > old_patch then return 'patch';
  elsif pf_semver_compare(new_version, old_version) < 0 then return 'downgrade';
  else return 'unknown';
end $$;

-- View pentru statistici de versionare
create or replace view module_version_stats as
select 
  mv.module_id,
  m.title as module_title,
  count(*) as total_versions,
  count(*) filter (where mv.enabled) as enabled_versions,
  count(*) filter (where mv.is_snapshot) as snapshot_versions,
  max(mv.semver) as latest_semver,
  min(mv.created_at) as first_version_at,
  max(mv.created_at) as latest_version_at,
  array_agg(distinct mv.created_by) filter (where mv.created_by is not null) as contributors
from module_versions mv
join modules m on m.id = mv.module_id
group by mv.module_id, m.title
order by mv.module_id;

-- Funcție pentru crearea unei noi versiuni
create or replace function pf_create_module_version(
  p_module_id text,
  p_increment_type text default 'patch',
  p_changelog text default null,
  p_spec_json jsonb default null,
  p_vectors smallint[] default null,
  p_requirements text default null,
  p_spec_text text default null,
  p_output_schema jsonb default null,
  p_kpi jsonb default null,
  p_guardrails jsonb default null,
  p_enabled boolean default true,
  p_created_by uuid default null
)
returns uuid language plpgsql as $$
declare
  latest_version text;
  new_version text;
  parent_version_id uuid;
  new_version_id uuid;
begin
  -- Găsește ultima versiune
  select mv.semver, mv.id into latest_version, parent_version_id
  from module_versions mv
  where mv.module_id = p_module_id 
    and mv.enabled = true
  order by pf_semver_compare(mv.semver, '0.0.0') desc, mv.created_at desc
  limit 1;
  
  -- Calculează noua versiune
  if latest_version is null then
    new_version := '1.0.0';
    parent_version_id := null;
  else
    new_version := pf_semver_increment(latest_version, p_increment_type);
  end if;
  
  -- Creează noua versiune
  insert into module_versions (
    module_id,
    semver,
    parent_version_id,
    changelog,
    spec_json,
    vectors,
    requirements,
    spec_text,
    output_schema,
    kpi,
    guardrails,
    enabled,
    created_by
  ) values (
    p_module_id,
    new_version,
    parent_version_id,
    coalesce(p_changelog, 'Version ' || new_version),
    coalesce(p_spec_json, '{}'),
    coalesce(p_vectors, '{}'),
    p_requirements,
    p_spec_text,
    p_output_schema,
    p_kpi,
    p_guardrails,
    p_enabled,
    p_created_by
  ) returning id into new_version_id;
  
  return new_version_id;
end $$;

-- Funcție pentru crearea unui snapshot
create or replace function pf_create_module_snapshot(
  p_module_id text,
  p_snapshot_reason text,
  p_changelog text default null,
  p_created_by uuid default null
)
returns uuid language plpgsql as $$
declare
  latest_version_rec record;
  snapshot_version text;
  new_version_id uuid;
begin
  -- Găsește ultima versiune pentru snapshot
  select * into latest_version_rec
  from module_versions mv
  where mv.module_id = p_module_id 
    and mv.enabled = true
    and mv.is_snapshot = false
  order by pf_semver_compare(mv.semver, '0.0.0') desc, mv.created_at desc
  limit 1;
  
  if not found then
    raise exception 'No base version found for module %', p_module_id;
  end if;
  
  -- Creează snapshot version (adaugă timestamp)
  snapshot_version := latest_version_rec.semver || '-snapshot.' || extract(epoch from now())::bigint;
  
  -- Creează snapshot-ul
  insert into module_versions (
    module_id,
    semver,
    parent_version_id,
    changelog,
    spec_json,
    vectors,
    requirements,
    spec_text,
    output_schema,
    kpi,
    guardrails,
    enabled,
    is_snapshot,
    snapshot_reason,
    created_by
  ) values (
    p_module_id,
    snapshot_version,
    latest_version_rec.id,
    coalesce(p_changelog, 'Snapshot: ' || p_snapshot_reason),
    latest_version_rec.spec_json,
    latest_version_rec.vectors,
    latest_version_rec.requirements,
    latest_version_rec.spec_text,
    latest_version_rec.output_schema,
    latest_version_rec.kpi,
    latest_version_rec.guardrails,
    true,
    true,
    p_snapshot_reason,
    p_created_by
  ) returning id into new_version_id;
  
  return new_version_id;
end $$;

commit;
