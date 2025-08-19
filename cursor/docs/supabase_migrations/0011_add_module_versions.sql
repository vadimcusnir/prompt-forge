-- 0011_add_module_versions.sql — sample module_version seed & link
begin;

do $$
declare env text := current_setting('app.env', true);
begin
  if env is null or env = 'dev' then
    insert into module_versions (module_id, semver, changelog, spec_json)
    values ('M07','1.0.0','Initial spec','{"name":"Risk & Trust Reversal"}'::jsonb)
    on conflict do nothing;
  end if;
end $$;

commit;
