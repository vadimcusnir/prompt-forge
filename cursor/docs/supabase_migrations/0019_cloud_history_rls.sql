-- 0019_cloud_history_rls.sql — RLS policies pentru cloud history și multi-user
begin;

-- Enable RLS pe noile tabele
alter table parameter_sets enable row level security;
alter table domain_configs enable row level security;
alter table org_members enable row level security;
alter table plans enable row level security;
alter table subscriptions enable row level security;
alter table entitlements enable row level security;
alter table api_keys enable row level security;

-- Drop existing policies dacă există
drop policy if exists parameter_sets_rw on parameter_sets;
drop policy if exists domain_configs_read on domain_configs;
drop policy if exists org_members_rw on org_members;
drop policy if exists plans_read on plans;
drop policy if exists subscriptions_rw on subscriptions;
drop policy if exists entitlements_rw on entitlements;
drop policy if exists api_keys_rw on api_keys;

-- 1. PARAMETER_SETS - RLS per org
create policy parameter_sets_rw on parameter_sets
  for all using (
    org_id::text = current_setting('request.jwt.claims', true)::jsonb->>'org_id'
  )
  with check (
    org_id::text = current_setting('request.jwt.claims', true)::jsonb->>'org_id'
  );

-- 2. DOMAIN_CONFIGS - Public read, org write
create policy domain_configs_read on domain_configs
  for select using (true);

-- 3. ORG_MEMBERS - RLS per org, user poate vedea doar membrii din org-ul său
create policy org_members_rw on org_members
  for all using (
    org_id::text = current_setting('request.jwt.claims', true)::jsonb->>'org_id'
  )
  with check (
    org_id::text = current_setting('request.jwt.claims', true)::jsonb->>'org_id'
  );

-- 4. PLANS - Public read
create policy plans_read on plans
  for select using (true);

-- 5. SUBSCRIPTIONS - RLS per org
create policy subscriptions_rw on subscriptions
  for all using (
    org_id::text = current_setting('request.jwt.claims', true)::jsonb->>'org_id'
  )
  with check (
    org_id::text = current_setting('request.jwt.claims', true)::jsonb->>'org_id'
  );

-- 6. ENTITLEMENTS - RLS per org și user
create policy entitlements_rw on entitlements
  for all using (
    org_id::text = current_setting('request.jwt.claims', true)::jsonb->>'org_id'
    and (
      user_id is null -- org-wide entitlements
      or user_id::text = current_setting('request.jwt.claims', true)::jsonb->>'sub'
    )
  )
  with check (
    org_id::text = current_setting('request.jwt.claims', true)::jsonb->>'org_id'
    and (
      user_id is null -- org-wide entitlements
      or user_id::text = current_setting('request.jwt.claims', true)::jsonb->>'sub'
    )
  );

-- 7. API_KEYS - RLS per org
create policy api_keys_rw on api_keys
  for all using (
    org_id::text = current_setting('request.jwt.claims', true)::jsonb->>'org_id'
  )
  with check (
    org_id::text = current_setting('request.jwt.claims', true)::jsonb->>'org_id'
  );

-- 8. Actualizează RLS pentru runs cu noile coloane
drop policy if exists runs_read on runs;
drop policy if exists runs_write on runs;

create policy runs_read on runs
  for select using (
    org_id::text = current_setting('request.jwt.claims', true)::jsonb->>'org_id'
  );

create policy runs_write on runs
  for all using (
    org_id::text = current_setting('request.jwt.claims', true)::jsonb->>'org_id'
  )
  with check (
    org_id::text = current_setting('request.jwt.claims', true)::jsonb->>'org_id'
  );

-- 9. Actualizează RLS pentru bundles cu noile coloane
drop policy if exists bundles_rw on bundles;

create policy bundles_rw on bundles
  for all using (
    org_id::text = current_setting('request.jwt.claims', true)::jsonb->>'org_id'
  )
  with check (
    org_id::text = current_setting('request.jwt.claims', true)::jsonb->>'org_id'
  );

-- 10. Creează funcție helper pentru verificarea entitlements
create or replace function check_entitlement(flag_name text, user_uuid uuid default null)
returns boolean as $$
declare
  has_flag boolean;
begin
  -- Verifică org-wide entitlement
  select exists(
    select 1 from entitlements e
    where e.org_id::text = current_setting('request.jwt.claims', true)::jsonb->>'org_id'
      and e.flag = flag_name
      and e.value = true
      and e.user_id is null
      and (e.expires_at is null or e.expires_at > now())
  ) into has_flag;
  
  if has_flag then
    return true;
  end if;
  
  -- Verifică user-specific entitlement dacă user_uuid este specificat
  if user_uuid is not null then
    select exists(
      select 1 from entitlements e
      where e.org_id::text = current_setting('request.jwt.claims', true)::jsonb->>'org_id'
        and e.flag = flag_name
        and e.value = true
        and e.user_id = user_uuid
        and (e.expires_at is null or e.expires_at > now())
    ) into has_flag;
    
    if has_flag then
      return true;
    end if;
  end if;
  
  return false;
end;
$$ language plpgsql security definer;

-- 11. Creează funcție pentru verificarea rolului user-ului în org
create or replace function get_user_role(org_uuid uuid)
returns text as $$
declare
  user_role text;
begin
  select om.role into user_role
  from org_members om
  where om.org_id = org_uuid
    and om.user_id::text = current_setting('request.jwt.claims', true)::jsonb->>'sub';
  
  return coalesce(user_role, 'none');
end;
$$ language plpgsql security definer;

-- 12. Creează funcție pentru verificarea dacă user-ul este owner/admin
create or replace function is_org_admin(org_uuid uuid)
returns boolean as $$
begin
  return get_user_role(org_uuid) in ('owner', 'admin');
end;
$$ language plpgsql security definer;

-- 13. Creează policy pentru org_members care permite owner să facă modificări
create policy org_members_admin on org_members
  for update using (
    org_id::text = current_setting('request.jwt.claims', true)::jsonb->>'org_id'
    and is_org_admin(org_id)
  )
  with check (
    org_id::text = current_setting('request.jwt.claims', true)::jsonb->>'org_id'
    and is_org_admin(org_id)
  );

-- 14. Creează policy pentru org_members care permite owner să ștergă membri
create policy org_members_delete on org_members
  for delete using (
    org_id::text = current_setting('request.jwt.claims', true)::jsonb->>'org_id'
    and is_org_admin(org_id)
    and user_id != org_id -- owner nu se poate șterge pe sine
  );

-- 15. Creează policy pentru orgs care permite doar owner să facă modificări
alter table orgs enable row level security;
drop policy if exists orgs_rw on orgs;

create policy orgs_rw on orgs
  for all using (
    id::text = current_setting('request.jwt.claims', true)::jsonb->>'org_id'
  )
  with check (
    id::text = current_setting('request.jwt.claims', true)::jsonb->>'org_id'
  );

-- 16. Creează policy pentru projects care permite doar admin să facă modificări
drop policy if exists org_write on projects;

create policy org_write on projects
  for all using (
    org_id::text = current_setting('request.jwt.claims', true)::jsonb->>'org_id'
  )
  with check (
    org_id::text = current_setting('request.jwt.claims', true)::jsonb->>'org_id'
    and is_org_admin(org_id)
  );

commit;
