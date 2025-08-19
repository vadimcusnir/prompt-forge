-- 0004_indexes.sql — performance indexes
begin;

create index if not exists idx_prompt_versions_latest on prompt_versions (prompt_id, created_at desc);
create index if not exists idx_runs_by_version on runs (prompt_version_id, created_at desc);
create index if not exists idx_artifacts_by_bundle on artifacts (bundle_id);
create index if not exists idx_bundles_by_run on bundles (run_id);
create index if not exists idx_projects_by_org on projects (org_id);

commit;
