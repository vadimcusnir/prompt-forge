-- 0010_backfill_versions.sql — backfill for existing prompts (dev)
begin;

do $$
declare env text := current_setting('app.env', true);
begin
  if env is null or env = 'dev' then
    -- creează versiuni 1.0.0 pentru prompts existente fără versiuni
    insert into prompt_versions (prompt_id, semver, status, params_7d, body_md, body_txt, body_json, checksum_sha256)
    select p.id, '1.0.0', 'active', '{}'::jsonb, coalesce(p.title,'') as body_md, p.title, '{}'::jsonb, 'sha256:seed'
    from prompts p
    where not exists (select 1 from prompt_versions pv where pv.prompt_id = p.id);
  end if;
end $$;

commit;
