# Coming Soon Homepage Prompt (Cursos Agent)

**Objective:** Generate a temporary "Coming Soon" homepage with waitlist form and thank-you page.

## Key Requirements
Generate a temporary Coming Soon homepage that:

1. Auto-installs at project bootstrap (before any other modules, routes, or pages load).
2. Uses the default site design and components from the PromptForge v3 UI (blueprint inside promptforge.zip).
3. Displays a signup form for the waiting list:
   - On submit, insert participant data (email, name, created_at) into Supabase → table waitlist_signups.
   - Validate email, prevent duplicates.
   - Persist with RLS (multi-tenant, org-scoped).
4. Shows a thank-you page after submission, styled in the same UI theme.
5. Must be fully isolated:
   - No interference with other routes, modules, or systems.
   - Can be enabled/disabled by a single toggle/flag (COMING_SOON=true in .env).
   - When disabled, the system runs normally without residual effects.
6. Must be easy to install and remove:
   - One API endpoint: /api/toggle-coming-soon (admin-only) → flips state in Supabase table site_settings.
   - State persisted per org/project (projects table).
7. Bundle export:
   - Save the generated Coming Soon prompt + UI spec as bundle (.txt/.md/.json/.pdf) in Supabase Storage.
   - Apply checksum + manifest for audit.


## Database Schema
```sql
create table if not exists public.waitlist_signups (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references public.orgs(id) on delete cascade,
  email text not null unique,
  name text,
  created_at timestamptz not null default now()
);
```
