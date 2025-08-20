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
  0013_coming_soon_tables.sql
  0014_stripe_integration.sql
  0015_correct_stripe_prices.sql
  0016_convert_to_usd.sql
  0017_update_stripe_price_ids.sql
  0018_cloud_history_multi_user.sql
  0019_cloud_history_rls.sql
  0020_cloud_history_seed.sql
  0021_telegram_integration.sql
  0022_foundation_multi_tenant.sql
  0023_seed_full_catalog.sql
  0024_enhanced_module_versions.sql
  0025_module_versioning_views.sql
  0026_seed_initial_module_versions.sql
  0029_seed_plans_entitlements.sql
  0030_validation_tests.sql
  0031_grants_policies.sql
  0032_plan_code_canonical.sql
  0033_enhanced_bundles_system.sql
  0034_scoring_system_views.sql
  0035_enhanced_execution_system.sql
  0036_audit_logs_table.sql

Notes:
- Uses SemVer for module_versions and prompt_versions.
- JWT must include `org_id` claim for RLS policies.
- Set `app.env` GUC to 'dev' | 'prod' for seeding behavior.
- Cloud history requires `hasCloudHistory` entitlement.
- Multi-user support with role-based access control (owner/admin/member/viewer).
- Automatic cleanup of old data for orgs without cloud history access.
- Telegram integration for real-time notifications and reporting.
- Multi-tenant foundation (0022) must be applied before entitlements (0029+).
