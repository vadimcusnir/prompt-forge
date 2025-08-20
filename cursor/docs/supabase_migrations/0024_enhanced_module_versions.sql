-- 0024_enhanced_module_versions.sql — enhanced module_versions schema with SemVer validation
begin;

-- Funcții pentru validare și comparare SemVer
create or replace function pf_is_semver(p text)
returns boolean language sql immutable as $$
  select p ~ '^[0-9]+\.[0-9]+\.[0-9]+(-[0-9A-Za-z-]+(\.[0-9A-Za-z-]+)*)?(\+[0-9A-Za-z-]+(\.[0-9A-Za-z-]+)*)?$'
$$;

-- Funcție pentru comparare SemVer (returns -1, 0, 1)
create or replace function pf_semver_compare(v1 text, v2 text)
returns int language plpgsql immutable as $$
declare
  v1_parts text[];
  v2_parts text[];
  v1_major int;
  v1_minor int;
  v1_patch int;
  v2_major int;
  v2_minor int;
  v2_patch int;
begin
  -- Validare SemVer
  if not pf_is_semver(v1) or not pf_is_semver(v2) then
    raise exception 'Invalid SemVer format: % or %', v1, v2;
  end if;
  
  -- Parse versions (ignora pre-release și metadata pentru simplitate)
  v1_parts := string_to_array(split_part(split_part(v1, '-', 1), '+', 1), '.');
  v2_parts := string_to_array(split_part(split_part(v2, '-', 1), '+', 1), '.');
  
  v1_major := v1_parts[1]::int;
  v1_minor := v1_parts[2]::int;
  v1_patch := v1_parts[3]::int;
  
  v2_major := v2_parts[1]::int;
  v2_minor := v2_parts[2]::int;
  v2_patch := v2_parts[3]::int;
  
  -- Comparare
  if v1_major > v2_major then return 1;
  elsif v1_major < v2_major then return -1;
  elsif v1_minor > v2_minor then return 1;
  elsif v1_minor < v2_minor then return -1;
  elsif v1_patch > v2_patch then return 1;
  elsif v1_patch < v2_patch then return -1;
  else return 0;
  end if;
end $$;

-- Funcție pentru increment SemVer
create or replace function pf_semver_increment(version text, part text default 'patch')
returns text language plpgsql immutable as $$
declare
  v_parts text[];
  major int;
  minor int;
  patch int;
begin
  if not pf_is_semver(version) then
    raise exception 'Invalid SemVer format: %', version;
  end if;
  
  v_parts := string_to_array(split_part(split_part(version, '-', 1), '+', 1), '.');
  major := v_parts[1]::int;
  minor := v_parts[2]::int;
  patch := v_parts[3]::int;
  
  case part
    when 'major' then
      return (major + 1) || '.0.0';
    when 'minor' then
      return major || '.' || (minor + 1) || '.0';
    when 'patch' then
      return major || '.' || minor || '.' || (patch + 1);
    else
      raise exception 'Invalid increment part: %. Must be major, minor, or patch', part;
  end case;
end $$;

-- Îmbunătățește schema module_versions cu snapshot și validări
alter table module_versions 
  add column if not exists vectors smallint[] not null default '{}',
  add column if not exists requirements text,
  add column if not exists spec_text text,
  add column if not exists output_schema jsonb,
  add column if not exists kpi jsonb,
  add column if not exists guardrails jsonb,
  add column if not exists enabled boolean not null default true,
  add column if not exists is_snapshot boolean not null default false,
  add column if not exists snapshot_reason text;

-- Adaugă constraints pentru validare
alter table module_versions 
  add constraint if not exists ck_semver_valid check (pf_is_semver(semver)),
  add constraint if not exists ck_output_schema_isobj check (output_schema is null or jsonb_typeof(output_schema) = 'object'),
  add constraint if not exists ck_kpi_isobj check (kpi is null or jsonb_typeof(kpi) = 'object'),
  add constraint if not exists ck_guardrails_isobj check (guardrails is null or jsonb_typeof(guardrails) = 'object'),
  add constraint if not exists ck_snapshot_reason check (not is_snapshot or snapshot_reason is not null);

-- Trigger pentru updated_at
create or replace function trg_module_versions_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

-- Dacă nu există deja, adaugă coloana updated_at
alter table module_versions add column if not exists updated_at timestamptz not null default now();

drop trigger if exists module_versions_set_updated_at on module_versions;
create trigger module_versions_set_updated_at
  before update on module_versions
  for each row execute procedure trg_module_versions_updated_at();

-- Indici pentru performanță
create index if not exists module_versions_semver_idx on module_versions (module_id, semver);
create index if not exists module_versions_enabled_idx on module_versions (enabled);
create index if not exists module_versions_is_snapshot_idx on module_versions (is_snapshot);
create index if not exists module_versions_created_at_idx on module_versions (created_at desc);

commit;
