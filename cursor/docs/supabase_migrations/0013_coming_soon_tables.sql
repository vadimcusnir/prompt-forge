-- 0013_coming_soon_tables.sql — Tables for coming soon page
begin;

-- Waitlist signups table
create table if not exists waitlist_signups (
  id uuid primary key default uuid_generate_v4(),
  email text unique not null,
  name text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Site settings table for admin controls
create table if not exists site_settings (
  id uuid primary key default uuid_generate_v4(),
  key text unique not null,
  value jsonb not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table waitlist_signups enable row level security;
alter table site_settings enable row level security;

-- Policies for waitlist_signups
drop policy if exists waitlist_public_insert on waitlist_signups;
drop policy if exists waitlist_admin_read on waitlist_signups;

create policy waitlist_public_insert on waitlist_signups
  for insert to public
  with check (true);

create policy waitlist_admin_read on waitlist_signups
  for select to authenticated
  using (true);

-- Policies for site_settings
drop policy if exists site_settings_admin_rw on site_settings;

create policy site_settings_admin_rw on site_settings
  for all to authenticated
  using (true)
  with check (true);

-- Insert default site settings
insert into site_settings (key, value) 
values ('coming_soon', '{"enabled": true, "message": "PROMPTFORGE™ v3.0 - Coming Soon!"}')
on conflict (key) do nothing;

-- Create indexes
create index if not exists idx_waitlist_email on waitlist_signups(email);
create index if not exists idx_waitlist_created_at on waitlist_signups(created_at);
create index if not exists idx_site_settings_key on site_settings(key);

commit;
