# PROMPTFORGE™ v3 — Supabase Migrations
Timestamp: 20250818_234824

Order of execution:
  0001_base.sql
  0002_rls.sql
  0003_views.sql
  0004_indexes.sql
  0005_seed_modules.sql
  0010_backfill_versions.sql
  0011_add_module_versions.sql
  0012_add_merge_requests.sql

Notes:
- Uses SemVer for module_versions and prompt_versions.
- JWT must include `org_id` claim for RLS policies.
- Set `app.env` GUC to 'dev' | 'prod' for seeding behavior.
