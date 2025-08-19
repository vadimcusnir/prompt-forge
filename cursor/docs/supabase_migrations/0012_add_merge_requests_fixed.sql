-- 0012_add_merge_requests_fixed.sql — MR table (optional enterprise)
begin;

create table if not exists merge_requests (
  id uuid primary key default uuid_generate_v4(),
  prompt_id uuid not null references prompts(id) on delete cascade,
  source_version uuid not null references prompt_versions(id),
  target_version uuid not null references prompt_versions(id),
  status text not null default 'open',    -- open|approved|rejected
  created_by uuid,
  created_at timestamptz default now(),
  reviewed_by uuid,
  reviewed_at timestamptz
);

alter table if exists merge_requests enable row level security;

-- Drop existing policy if it exists
drop policy if exists merge_requests_rw on merge_requests;

create policy merge_requests_rw on merge_requests
  for all using (
    exists (select 1 from prompts p join projects pr on pr.id = p.project_id
            where p.id = merge_requests.prompt_id
              and pr.org_id::text = current_setting('request.jwt.claims', true)::jsonb->>'org_id')
  )
  with check (
    exists (select 1 from prompts p join projects pr on pr.id = p.project_id
            where p.id = merge_requests.prompt_id
              and pr.org_id::text = current_setting('request.jwt.claims', true)::jsonb->>'org_id')
  );

commit;
