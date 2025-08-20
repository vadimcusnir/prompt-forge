-- 0029_enhanced_bundles_system.sql — Enhanced bundles system with export and licensing
begin;

-- Funcție pentru crearea unui bundle complet
create or replace function pf_create_bundle(
  p_run_id uuid,
  p_bundle_name text,
  p_description text default null,
  p_formats text[] default array['txt', 'md', 'json'],
  p_license_type text default 'proprietary',
  p_license_terms text default null,
  p_watermark_enabled boolean default true,
  p_expiry_days integer default null
)
returns uuid language plpgsql as $$
declare
  bundle_id uuid;
  module_id_val text;
  run_hash_val text;
  manifest_data jsonb;
  expiry_date_val timestamptz;
begin
  -- Obține informațiile run-ului
  select p.module_id, r.run_hash into module_id_val, run_hash_val
  from runs r
  join prompt_versions pv on pv.id = r.prompt_version_id
  join prompts p on p.id = pv.prompt_id
  where r.id = p_run_id;
  
  if not found then
    raise exception 'Run not found: %', p_run_id;
  end if;
  
  -- Calculează data de expirare
  if p_expiry_days is not null then
    expiry_date_val := now() + interval '1 day' * p_expiry_days;
  end if;
  
  -- Creează manifest-ul
  manifest_data := jsonb_build_object(
    'version', '1.0',
    'bundle_name', p_bundle_name,
    'description', coalesce(p_description, 'Generated bundle for ' || p_bundle_name),
    'module_id', module_id_val,
    'run_id', p_run_id,
    'formats', p_formats,
    'license', jsonb_build_object(
      'type', p_license_type,
      'terms', p_license_terms,
      'watermark_enabled', p_watermark_enabled
    ),
    'created_at', now(),
    'expires_at', expiry_date_val,
    'generator', 'PROMPTFORGE v3.0'
  );
  
  -- Creează bundle-ul
  insert into bundles (
    run_id,
    module_id,
    run_hash,
    formats,
    bundle_name,
    description,
    version,
    license_type,
    license_terms,
    watermark_enabled,
    manifest_json,
    expiry_date
  ) values (
    p_run_id,
    module_id_val,
    run_hash_val,
    p_formats,
    p_bundle_name,
    p_description,
    '1.0.0',
    p_license_type,
    p_license_terms,
    p_watermark_enabled,
    manifest_data,
    expiry_date_val
  ) returning id into bundle_id;
  
  -- Creează manifest-ul în tabela separată
  insert into manifests (bundle_id, json, manifest_version, generator_info)
  values (
    bundle_id,
    manifest_data,
    '1.0',
    jsonb_build_object(
      'generator', 'PROMPTFORGE v3.0',
      'schema_version', '1.0',
      'created_by', 'system'
    )
  );
  
  return bundle_id;
end $$;

-- Funcție pentru adăugarea unui artifact la bundle
create or replace function pf_add_artifact_to_bundle(
  p_bundle_id uuid,
  p_file_name text,
  p_content text,
  p_content_type text default 'text/plain',
  p_encoding text default 'utf-8'
)
returns bigint language plpgsql as $$
declare
  artifact_id bigint;
  content_bytes bytea;
  file_size bigint;
  file_hash text;
begin
  -- Convertește conținutul în bytes
  content_bytes := convert_to(p_content, p_encoding);
  file_size := length(content_bytes);
  
  -- Calculează hash-ul
  file_hash := encode(sha256(content_bytes), 'hex');
  
  -- Creează artifact-ul
  insert into artifacts (
    bundle_id,
    file_name,
    bytes,
    sha256,
    content_type,
    encoding,
    original_size_bytes
  ) values (
    p_bundle_id,
    p_file_name,
    file_size,
    file_hash,
    p_content_type,
    p_encoding,
    file_size
  ) returning id into artifact_id;
  
  -- Actualizează statisticile bundle-ului
  update bundles set
    export_format_count = (
      select count(*) from artifacts where bundle_id = p_bundle_id
    ),
    total_size_bytes = (
      select sum(bytes) from artifacts where bundle_id = p_bundle_id
    ),
    checksum_sha256 = (
      select encode(sha256(string_agg(sha256, '' order by file_name)::bytea), 'hex')
      from artifacts where bundle_id = p_bundle_id
    )
  where id = p_bundle_id;
  
  return artifact_id;
end $$;

-- Funcție pentru generarea conținutului TXT
create or replace function pf_generate_txt_content(p_run_id uuid)
returns text language plpgsql as $$
declare
  content text;
begin
  select r.processed_output into content
  from runs r
  where r.id = p_run_id;
  
  return coalesce(content, '');
end $$;

-- Funcție pentru generarea conținutului MD
create or replace function pf_generate_md_content(p_run_id uuid)
returns text language plpgsql as $$
declare
  content text;
  run_data record;
  score_data record;
  module_info record;
begin
  -- Obține datele run-ului
  select 
    r.processed_output,
    r.final_prompt,
    r.parameter_set_7d,
    r.model_used,
    r.provider,
    r.execution_time_ms,
    r.tokens_total,
    r.cost_usd,
    r.created_at,
    pv.semver as prompt_version,
    p.title as prompt_title
  into run_data
  from runs r
  join prompt_versions pv on pv.id = r.prompt_version_id
  join prompts p on p.id = pv.prompt_id
  where r.id = p_run_id;
  
  -- Obține scorul
  select * into score_data
  from scores s
  where s.run_id = p_run_id;
  
  -- Obține informații modul
  select m.* into module_info
  from runs r
  join prompt_versions pv on pv.id = r.prompt_version_id
  join prompts p on p.id = pv.prompt_id
  join modules m on m.id = p.module_id
  where r.id = p_run_id;
  
  -- Construiește markdown-ul
  content := format('# %s - Generated Output

**Generated on:** %s  
**Module:** %s (%s)  
**Prompt Version:** %s  
**Model:** %s (%s)

## 🎯 Configuration Parameters
```json
%s
```

## 📊 Performance Metrics
- **Execution Time:** %s ms
- **Tokens Used:** %s
- **Cost:** $%s USD

## 📈 Quality Scores
%s

## 🚀 Generated Content
```
%s
```

## 🔧 Technical Details
- **Final Prompt Used:**
```
%s
```

---
*Generated with PROMPTFORGE™ v3.0*',
    coalesce(run_data.prompt_title, 'Unnamed Prompt'),
    run_data.created_at::date,
    module_info.id,
    module_info.title,
    run_data.prompt_version,
    run_data.model_used,
    run_data.provider,
    run_data.parameter_set_7d::text,
    coalesce(run_data.execution_time_ms::text, 'N/A'),
    coalesce(run_data.tokens_total::text, 'N/A'),
    coalesce(run_data.cost_usd::text, 'N/A'),
    case 
      when score_data is not null then
        format('- **Clarity:** %s/100
- **Execution:** %s/100  
- **Ambiguity:** %s/100
- **Business Fit:** %s/100
- **Composite Score:** %s
- **Verdict:** %s',
          score_data.clarity,
          score_data.execution,
          score_data.ambiguity,
          score_data.business_fit,
          score_data.composite,
          upper(score_data.verdict))
      else '*No scoring data available*'
    end,
    coalesce(run_data.processed_output, 'No output generated'),
    coalesce(run_data.final_prompt, 'No prompt data available')
  );
  
  return content;
end $$;

-- Funcție pentru generarea conținutului JSON
create or replace function pf_generate_json_content(p_run_id uuid)
returns text language plpgsql as $$
declare
  json_data jsonb;
begin
  select jsonb_build_object(
    'run_id', r.id,
    'run_hash', r.run_hash,
    'created_at', r.created_at,
    'status', r.status,
    'module', jsonb_build_object(
      'id', m.id,
      'title', m.title,
      'description', m.description
    ),
    'prompt', jsonb_build_object(
      'id', p.id,
      'title', p.title,
      'version', pv.semver,
      'parameters', r.parameter_set_7d
    ),
    'execution', jsonb_build_object(
      'model_used', r.model_used,
      'provider', r.provider,
      'temperature', r.temperature,
      'max_tokens', r.max_tokens,
      'execution_time_ms', r.execution_time_ms,
      'tokens_input', r.tokens_input,
      'tokens_output', r.tokens_output,
      'tokens_total', r.tokens_total,
      'cost_usd', r.cost_usd
    ),
    'content', jsonb_build_object(
      'final_prompt', r.final_prompt,
      'raw_response', r.raw_response,
      'processed_output', r.processed_output
    ),
    'score', case 
      when s.run_id is not null then
        jsonb_build_object(
          'clarity', s.clarity,
          'execution', s.execution,
          'ambiguity', s.ambiguity,
          'business_fit', s.business_fit,
          'composite', s.composite,
          'verdict', s.verdict,
          'confidence_score', s.confidence_score,
          'evaluation_method', s.evaluation_method,
          'human_reviewed', s.human_reviewed
        )
      else null
    end,
    'metadata', jsonb_build_object(
      'generator', 'PROMPTFORGE v3.0',
      'schema_version', '1.0',
      'export_timestamp', now()
    )
  ) into json_data
  from runs r
  join prompt_versions pv on pv.id = r.prompt_version_id
  join prompts p on p.id = pv.prompt_id
  join modules m on m.id = p.module_id
  left join scores s on s.run_id = r.id
  where r.id = p_run_id;
  
  return json_data::text;
end $$;

-- Funcție pentru popularea automată a unui bundle cu toate formatele
create or replace function pf_populate_bundle_artifacts(p_bundle_id uuid)
returns integer language plpgsql as $$
declare
  bundle_data record;
  artifacts_created integer := 0;
  txt_content text;
  md_content text;
  json_content text;
  format_name text;
begin
  -- Obține informațiile bundle-ului
  select * into bundle_data
  from bundles b
  where b.id = p_bundle_id;
  
  if not found then
    raise exception 'Bundle not found: %', p_bundle_id;
  end if;
  
  -- Generează și adaugă fiecare format
  foreach format_name in array bundle_data.formats
  loop
    case format_name
      when 'txt' then
        txt_content := pf_generate_txt_content(bundle_data.run_id);
        perform pf_add_artifact_to_bundle(
          p_bundle_id, 
          'prompt.txt', 
          txt_content, 
          'text/plain'
        );
        artifacts_created := artifacts_created + 1;
        
      when 'md' then
        md_content := pf_generate_md_content(bundle_data.run_id);
        perform pf_add_artifact_to_bundle(
          p_bundle_id, 
          'prompt.md', 
          md_content, 
          'text/markdown'
        );
        artifacts_created := artifacts_created + 1;
        
      when 'json' then
        json_content := pf_generate_json_content(bundle_data.run_id);
        perform pf_add_artifact_to_bundle(
          p_bundle_id, 
          'prompt.json', 
          json_content, 
          'application/json'
        );
        artifacts_created := artifacts_created + 1;
        
      else
        raise notice 'Unsupported format: %', format_name;
    end case;
  end loop;
  
  -- Adaugă manifest ca artifact
  perform pf_add_artifact_to_bundle(
    p_bundle_id,
    'manifest.json',
    (select json::text from manifests where bundle_id = p_bundle_id),
    'application/json'
  );
  artifacts_created := artifacts_created + 1;
  
  return artifacts_created;
end $$;

-- Funcție pentru înregistrarea unei descărcări
create or replace function pf_record_bundle_download(p_bundle_id uuid)
returns boolean language plpgsql as $$
begin
  update bundles set
    download_count = download_count + 1,
    last_downloaded_at = now()
  where id = p_bundle_id;
  
  return found;
end $$;

-- Funcție pentru verificarea validității unui bundle
create or replace function pf_validate_bundle(p_bundle_id uuid)
returns jsonb language plpgsql as $$
declare
  bundle_data record;
  validation_result jsonb;
  errors text[] := array[]::text[];
  warnings text[] := array[]::text[];
  artifact_count integer;
begin
  -- Obține datele bundle-ului
  select * into bundle_data
  from bundles b
  where b.id = p_bundle_id;
  
  if not found then
    return jsonb_build_object(
      'valid', false,
      'errors', array['Bundle not found']
    );
  end if;
  
  -- Verifică expirarea
  if bundle_data.expiry_date is not null and bundle_data.expiry_date < now() then
    errors := array_append(errors, 'Bundle has expired');
  end if;
  
  -- Verifică existența artifact-urilor
  select count(*) into artifact_count
  from artifacts a
  where a.bundle_id = p_bundle_id;
  
  if artifact_count = 0 then
    errors := array_append(errors, 'No artifacts found in bundle');
  elsif artifact_count != bundle_data.export_format_count then
    warnings := array_append(warnings, 'Artifact count mismatch');
  end if;
  
  -- Verifică checksum-ul
  if bundle_data.checksum_sha256 is null then
    warnings := array_append(warnings, 'Missing bundle checksum');
  end if;
  
  -- Verifică manifest-ul
  if bundle_data.manifest_json is null then
    errors := array_append(errors, 'Missing manifest data');
  end if;
  
  validation_result := jsonb_build_object(
    'valid', array_length(errors, 1) is null,
    'bundle_id', p_bundle_id,
    'errors', errors,
    'warnings', warnings,
    'artifact_count', artifact_count,
    'expected_artifacts', bundle_data.export_format_count,
    'has_checksum', bundle_data.checksum_sha256 is not null,
    'expires_at', bundle_data.expiry_date,
    'validated_at', now()
  );
  
  -- Actualizează statusul de validare în manifest
  update manifests set
    validation_status = case 
      when array_length(errors, 1) is null then 'valid'
      else 'invalid'
    end,
    validation_errors = errors
  where bundle_id = p_bundle_id;
  
  return validation_result;
end $$;

-- View pentru bundle status
create or replace view bundle_status as
select 
  b.id,
  b.bundle_name,
  b.version,
  b.license_type,
  b.created_at,
  b.expiry_date,
  b.download_count,
  b.export_format_count,
  b.total_size_bytes,
  count(a.id) as actual_artifact_count,
  b.checksum_sha256 is not null as has_checksum,
  m.validation_status,
  case 
    when b.expiry_date is not null and b.expiry_date < now() then 'expired'
    when m.validation_status = 'invalid' then 'invalid'
    when count(a.id) = 0 then 'empty'
    when count(a.id) != b.export_format_count then 'incomplete'
    else 'ready'
  end as status,
  rs.composite as run_score,
  rs.verdict as run_verdict
from bundles b
left join artifacts a on a.bundle_id = b.id
left join manifests m on m.bundle_id = b.id
left join runs r on r.id = b.run_id
left join scores rs on rs.run_id = r.id
group by b.id, b.bundle_name, b.version, b.license_type, b.created_at,
         b.expiry_date, b.download_count, b.export_format_count,
         b.total_size_bytes, b.checksum_sha256, m.validation_status,
         rs.composite, rs.verdict
order by b.created_at desc;

commit;
