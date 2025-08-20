-- 0027_audit_logs_table.sql — audit logging system
begin;

-- AUDIT LOGS TABLE
create table if not exists audit_logs (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references projects(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  action text not null check (action in (
    'create', 'update', 'delete', 'archive', 'restore',
    'execute', 'export', 'import', 'share', 'clone'
  )),
  entity_type text not null check (entity_type in (
    'project', 'prompt', 'prompt_version', 'run', 'bundle', 
    'module', 'user', 'organization'
  )),
  entity_id text not null,
  old_values jsonb,
  new_values jsonb,
  metadata jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamptz default now()
);

-- INDEXES for performance
create index if not exists idx_audit_logs_project_id on audit_logs(project_id);
create index if not exists idx_audit_logs_user_id on audit_logs(user_id);
create index if not exists idx_audit_logs_action on audit_logs(action);
create index if not exists idx_audit_logs_entity_type on audit_logs(entity_type);
create index if not exists idx_audit_logs_entity_id on audit_logs(entity_id);
create index if not exists idx_audit_logs_created_at on audit_logs(created_at desc);
create index if not exists idx_audit_logs_project_created on audit_logs(project_id, created_at desc);

-- COMPOSITE indexes for common queries
create index if not exists idx_audit_logs_project_action on audit_logs(project_id, action);
create index if not exists idx_audit_logs_project_entity on audit_logs(project_id, entity_type);
create index if not exists idx_audit_logs_user_project on audit_logs(user_id, project_id);

-- RLS policies
alter table audit_logs enable row level security;

-- Policy: Users can only see audit logs for projects they have access to
create policy audit_logs_select_by_project_access on audit_logs
for select using (
  exists (
    select 1 from projects p
    join org_members om on om.org_id = p.org_id
    where p.id = audit_logs.project_id 
      and om.user_id = auth.uid()
  )
);

-- Policy: Only system/service role can insert audit logs
create policy audit_logs_insert_service_only on audit_logs
for insert with check (
  -- Allow service role to insert
  auth.jwt() ->> 'role' = 'service_role'
  or
  -- Allow authenticated users to insert their own actions
  (auth.uid() is not null and user_id = auth.uid())
);

-- Policy: No updates or deletes allowed (audit logs are immutable)
-- This is enforced by not creating update/delete policies

-- HELPER FUNCTIONS for audit logging
create or replace function log_audit_event(
  p_project_id uuid,
  p_user_id uuid,
  p_action text,
  p_entity_type text,
  p_entity_id text,
  p_old_values jsonb default null,
  p_new_values jsonb default null,
  p_metadata jsonb default null,
  p_ip_address inet default null,
  p_user_agent text default null
) returns uuid as $$
declare
  audit_id uuid;
begin
  insert into audit_logs (
    project_id, user_id, action, entity_type, entity_id,
    old_values, new_values, metadata, ip_address, user_agent
  ) values (
    p_project_id, p_user_id, p_action, p_entity_type, p_entity_id,
    p_old_values, p_new_values, p_metadata, p_ip_address, p_user_agent
  ) returning id into audit_id;
  
  return audit_id;
end;
$$ language plpgsql security definer;

-- TRIGGER FUNCTIONS for automatic audit logging

-- Function to log project changes
create or replace function audit_project_changes()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    perform log_audit_event(
      NEW.id,
      NEW.created_by,
      'create',
      'project',
      NEW.id::text,
      null,
      to_jsonb(NEW),
      jsonb_build_object(
        'event', 'project_created',
        'description', 'Project "' || NEW.name || '" was created'
      )
    );
    return NEW;
  elsif TG_OP = 'UPDATE' then
    perform log_audit_event(
      NEW.id,
      auth.uid(),
      'update',
      'project',
      NEW.id::text,
      to_jsonb(OLD),
      to_jsonb(NEW),
      jsonb_build_object(
        'event', 'project_updated',
        'description', 'Project "' || NEW.name || '" was updated',
        'changes', (
          select jsonb_object_agg(key, jsonb_build_object('old', old_val, 'new', new_val))
          from (
            select key, 
                   OLD_jsonb.value as old_val,
                   NEW_jsonb.value as new_val
            from jsonb_each(to_jsonb(OLD)) as OLD_jsonb(key, value)
            full outer join jsonb_each(to_jsonb(NEW)) as NEW_jsonb(key, value) using (key)
            where OLD_jsonb.value is distinct from NEW_jsonb.value
          ) changes
        )
      )
    );
    return NEW;
  elsif TG_OP = 'DELETE' then
    perform log_audit_event(
      OLD.id,
      auth.uid(),
      'delete',
      'project',
      OLD.id::text,
      to_jsonb(OLD),
      null,
      jsonb_build_object(
        'event', 'project_deleted',
        'description', 'Project "' || OLD.name || '" was deleted'
      )
    );
    return OLD;
  end if;
  return null;
end;
$$ language plpgsql security definer;

-- Function to log prompt changes
create or replace function audit_prompt_changes()
returns trigger as $$
declare
  proj_id uuid;
begin
  -- Get project_id from the prompt
  select project_id into proj_id from prompts where id = COALESCE(NEW.id, OLD.id);
  
  if TG_OP = 'INSERT' then
    perform log_audit_event(
      proj_id,
      NEW.created_by,
      'create',
      'prompt',
      NEW.id::text,
      null,
      to_jsonb(NEW),
      jsonb_build_object(
        'event', 'prompt_created',
        'description', 'Prompt "' || NEW.title || '" was created',
        'module_id', NEW.module_id
      )
    );
    return NEW;
  elsif TG_OP = 'UPDATE' then
    perform log_audit_event(
      proj_id,
      auth.uid(),
      'update',
      'prompt',
      NEW.id::text,
      to_jsonb(OLD),
      to_jsonb(NEW),
      jsonb_build_object(
        'event', 'prompt_updated',
        'description', 'Prompt "' || NEW.title || '" was updated',
        'module_id', NEW.module_id
      )
    );
    return NEW;
  elsif TG_OP = 'DELETE' then
    perform log_audit_event(
      proj_id,
      auth.uid(),
      'delete',
      'prompt',
      OLD.id::text,
      to_jsonb(OLD),
      null,
      jsonb_build_object(
        'event', 'prompt_deleted',
        'description', 'Prompt "' || OLD.title || '" was deleted',
        'module_id', OLD.module_id
      )
    );
    return OLD;
  end if;
  return null;
end;
$$ language plpgsql security definer;

-- Function to log run executions
create or replace function audit_run_executions()
returns trigger as $$
declare
  proj_id uuid;
  prompt_title text;
  module_id text;
begin
  -- Get project info from the run
  select p.project_id, pr.title, pr.module_id
  into proj_id, prompt_title, module_id
  from prompt_versions pv
  join prompts pr on pr.id = pv.prompt_id
  join projects p on p.id = pr.project_id
  where pv.id = COALESCE(NEW.prompt_version_id, OLD.prompt_version_id);
  
  if TG_OP = 'INSERT' then
    perform log_audit_event(
      proj_id,
      NEW.created_by,
      'execute',
      'run',
      NEW.id::text,
      null,
      to_jsonb(NEW),
      jsonb_build_object(
        'event', 'run_executed',
        'description', 'Run executed for prompt "' || prompt_title || '"',
        'module_id', module_id,
        'status', NEW.status,
        'run_hash', NEW.run_hash
      )
    );
    return NEW;
  elsif TG_OP = 'UPDATE' then
    perform log_audit_event(
      proj_id,
      auth.uid(),
      'update',
      'run',
      NEW.id::text,
      to_jsonb(OLD),
      to_jsonb(NEW),
      jsonb_build_object(
        'event', 'run_updated',
        'description', 'Run updated for prompt "' || prompt_title || '"',
        'module_id', module_id,
        'status', NEW.status
      )
    );
    return NEW;
  end if;
  return null;
end;
$$ language plpgsql security definer;

-- Function to log bundle exports
create or replace function audit_bundle_exports()
returns trigger as $$
declare
  proj_id uuid;
  run_info record;
begin
  -- Get project and run info
  select p.project_id, pr.title, pr.module_id, r.created_by as run_user
  into proj_id, run_info
  from runs r
  join prompt_versions pv on pv.id = r.prompt_version_id
  join prompts pr on pr.id = pv.prompt_id
  join projects p on p.id = pr.project_id
  where r.id = COALESCE(NEW.run_id, OLD.run_id);
  
  if TG_OP = 'INSERT' then
    perform log_audit_event(
      proj_id,
      run_info.run_user,
      'export',
      'bundle',
      NEW.id::text,
      null,
      to_jsonb(NEW),
      jsonb_build_object(
        'event', 'bundle_exported',
        'description', 'Bundle exported for run ' || NEW.run_id,
        'module_id', run_info.module_id,
        'formats', NEW.formats,
        'run_hash', NEW.run_hash
      )
    );
    return NEW;
  end if;
  return null;
end;
$$ language plpgsql security definer;

-- CREATE TRIGGERS
drop trigger if exists audit_project_changes_trigger on projects;
create trigger audit_project_changes_trigger
  after insert or update or delete on projects
  for each row execute function audit_project_changes();

drop trigger if exists audit_prompt_changes_trigger on prompts;
create trigger audit_prompt_changes_trigger
  after insert or update or delete on prompts
  for each row execute function audit_prompt_changes();

drop trigger if exists audit_run_executions_trigger on runs;
create trigger audit_run_executions_trigger
  after insert or update on runs
  for each row execute function audit_run_executions();

drop trigger if exists audit_bundle_exports_trigger on bundles;
create trigger audit_bundle_exports_trigger
  after insert on bundles
  for each row execute function audit_bundle_exports();

-- VIEWS for common audit queries

-- Recent project activity view
create or replace view project_recent_activity as
select 
  al.*,
  p.name as project_name,
  p.slug as project_slug,
  u.email as user_email
from audit_logs al
join projects p on p.id = al.project_id
left join auth.users u on u.id = al.user_id
where al.created_at >= now() - interval '30 days'
order by al.created_at desc;

-- Project activity summary view
create or replace view project_activity_summary as
select 
  al.project_id,
  p.name as project_name,
  count(*) as total_events,
  count(distinct al.user_id) as unique_users,
  count(*) filter (where al.action = 'execute') as total_runs,
  count(*) filter (where al.action = 'export') as total_exports,
  count(*) filter (where al.created_at >= now() - interval '7 days') as events_last_7d,
  count(*) filter (where al.created_at >= now() - interval '1 day') as events_last_1d,
  max(al.created_at) as last_activity
from audit_logs al
join projects p on p.id = al.project_id
group by al.project_id, p.name;

commit;
