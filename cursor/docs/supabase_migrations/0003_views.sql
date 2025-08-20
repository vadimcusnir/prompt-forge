-- 0003_views.sql — helper views
begin;

create or replace view prompt_latest as
select distinct on (p.id)
  p.id as prompt_id, pv.id as prompt_version_id, pv.semver, pv.created_at
from prompts p
join prompt_versions pv on pv.prompt_id = p.id
order by p.id, pv.created_at desc;

create or replace view run_latest_bundle as
select r.id as run_id, b.id as bundle_id, b.created_at
from runs r
join bundles b on b.run_id = r.id
order by b.created_at desc;

commit;
