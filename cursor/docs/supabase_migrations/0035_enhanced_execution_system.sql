-- 0027_enhanced_execution_system.sql — Enhanced execution system with runs, scores, bundles
begin;

-- Îmbunătățește schema runs cu telemetry completă
alter table runs 
  add column if not exists execution_time_ms integer,
  add column if not exists tokens_input integer,
  add column if not exists tokens_output integer,
  add column if not exists tokens_total integer,
  add column if not exists cost_usd numeric(10,6),
  add column if not exists model_used text,
  add column if not exists temperature numeric(3,2),
  add column if not exists max_tokens integer,
  add column if not exists provider text,
  add column if not exists error_message text,
  add column if not exists retry_count integer default 0,
  add column if not exists final_prompt text,
  add column if not exists raw_response text,
  add column if not exists processed_output text;

-- Adaugă constraints pentru runs
alter table runs
  add constraint if not exists ck_status_valid check (status in ('pending', 'running', 'completed', 'failed', 'timeout', 'cancelled')),
  add constraint if not exists ck_tokens_positive check (
    (tokens_input is null or tokens_input >= 0) and
    (tokens_output is null or tokens_output >= 0) and
    (tokens_total is null or tokens_total >= 0)
  ),
  add constraint if not exists ck_cost_positive check (cost_usd is null or cost_usd >= 0),
  add constraint if not exists ck_temperature_range check (temperature is null or (temperature >= 0 and temperature <= 2)),
  add constraint if not exists ck_retry_count_positive check (retry_count >= 0);

-- Îmbunătățește schema scores cu metadata de evaluare
alter table scores
  add column if not exists evaluator_version text,
  add column if not exists evaluation_method text default 'automated',
  add column if not exists confidence_score numeric(3,2),
  add column if not exists evaluation_time_ms integer,
  add column if not exists human_reviewed boolean default false,
  add column if not exists review_notes text,
  add column if not exists criteria_details jsonb,
  add column if not exists improvement_suggestions text[];

-- Adaugă constraints pentru scores
alter table scores
  add constraint if not exists ck_evaluation_method_valid check (
    evaluation_method in ('automated', 'human', 'hybrid', 'benchmark')
  ),
  add constraint if not exists ck_confidence_range check (
    confidence_score is null or (confidence_score >= 0 and confidence_score <= 1)
  );

-- Îmbunătățește schema bundles cu licensing și metadata
alter table bundles
  add column if not exists bundle_name text,
  add column if not exists description text,
  add column if not exists version text default '1.0.0',
  add column if not exists license_type text default 'proprietary',
  add column if not exists license_terms text,
  add column if not exists watermark_enabled boolean default true,
  add column if not exists export_format_count integer default 0,
  add column if not exists total_size_bytes bigint default 0,
  add column if not exists checksum_sha256 text,
  add column if not exists manifest_json jsonb,
  add column if not exists expiry_date timestamptz,
  add column if not exists download_count integer default 0,
  add column if not exists last_downloaded_at timestamptz;

-- Adaugă constraints pentru bundles
alter table bundles
  add constraint if not exists ck_license_type_valid check (
    license_type in ('proprietary', 'mit', 'apache', 'gpl', 'commercial', 'custom')
  ),
  add constraint if not exists ck_export_format_count_positive check (export_format_count >= 0),
  add constraint if not exists ck_total_size_positive check (total_size_bytes >= 0),
  add constraint if not exists ck_download_count_positive check (download_count >= 0);

-- Îmbunătățește schema artifacts cu metadata de fișiere
alter table artifacts
  add column if not exists content_type text,
  add column if not exists encoding text default 'utf-8',
  add column if not exists compression_type text,
  add column if not exists original_size_bytes bigint,
  add column if not exists download_url text,
  add column if not exists storage_path text,
  add column if not exists is_public boolean default false,
  add column if not exists access_count integer default 0,
  add column if not exists last_accessed_at timestamptz;

-- Adaugă constraints pentru artifacts
alter table artifacts
  add constraint if not exists ck_original_size_positive check (
    original_size_bytes is null or original_size_bytes >= 0
  ),
  add constraint if not exists ck_access_count_positive check (access_count >= 0);

-- Îmbunătățește schema manifests cu versioning
alter table manifests
  add column if not exists manifest_version text default '1.0',
  add column if not exists schema_version text default '1.0',
  add column if not exists generator_info jsonb,
  add column if not exists validation_status text default 'valid',
  add column if not exists validation_errors text[];

-- Adaugă constraints pentru manifests
alter table manifests
  add constraint if not exists ck_validation_status_valid check (
    validation_status in ('valid', 'invalid', 'warning', 'pending')
  );

-- Creează tabela pentru prompt history (istoric execuții)
create table if not exists prompt_history (
  id uuid primary key default uuid_generate_v4(),
  prompt_version_id uuid not null references prompt_versions(id) on delete cascade,
  run_id uuid references runs(id) on delete set null,
  user_id uuid, -- references auth.users(id)
  session_id text,
  parameters_used jsonb not null,
  execution_context jsonb,
  created_at timestamptz default now()
);

-- Creează tabela pentru run queue (coadă de execuție)
create table if not exists run_queue (
  id uuid primary key default uuid_generate_v4(),
  prompt_version_id uuid not null references prompt_versions(id) on delete cascade,
  parameters jsonb not null,
  priority integer default 0,
  scheduled_at timestamptz default now(),
  started_at timestamptz,
  completed_at timestamptz,
  status text not null default 'queued',
  worker_id text,
  error_message text,
  retry_count integer default 0,
  max_retries integer default 3,
  created_by uuid,
  created_at timestamptz default now()
);

-- Adaugă constraints pentru run_queue
alter table run_queue
  add constraint ck_queue_status_valid check (
    status in ('queued', 'running', 'completed', 'failed', 'cancelled', 'timeout')
  ),
  add constraint ck_priority_range check (priority >= -100 and priority <= 100),
  add constraint ck_retry_counts_positive check (
    retry_count >= 0 and max_retries >= 0 and retry_count <= max_retries
  );

-- Creează tabela pentru execution metrics (metrici de execuție)
create table if not exists execution_metrics (
  id uuid primary key default uuid_generate_v4(),
  run_id uuid not null references runs(id) on delete cascade,
  metric_name text not null,
  metric_value numeric,
  metric_unit text,
  metric_type text not null,
  measurement_time timestamptz default now(),
  metadata jsonb
);

-- Adaugă constraints pentru execution_metrics
alter table execution_metrics
  add constraint ck_metric_type_valid check (
    metric_type in ('performance', 'quality', 'cost', 'usage', 'error', 'custom')
  );

-- Funcții utilitare pentru runs
create or replace function pf_calculate_run_cost(
  tokens_input integer,
  tokens_output integer,
  model_used text,
  provider text default 'openai'
)
returns numeric(10,6) language plpgsql immutable as $$
declare
  input_rate numeric(10,6) := 0.0;
  output_rate numeric(10,6) := 0.0;
begin
  -- Rate-uri aproximative per 1K tokens (se pot actualiza)
  case
    when model_used ilike '%gpt-4%' then
      input_rate := 0.03;
      output_rate := 0.06;
    when model_used ilike '%gpt-3.5%' then
      input_rate := 0.001;
      output_rate := 0.002;
    when model_used ilike '%claude%' then
      input_rate := 0.008;
      output_rate := 0.024;
    else
      input_rate := 0.001;
      output_rate := 0.002;
  end case;
  
  return (coalesce(tokens_input, 0) * input_rate / 1000.0) + 
         (coalesce(tokens_output, 0) * output_rate / 1000.0);
end $$;

-- Funcție pentru calcularea scorului compozit
create or replace function pf_calculate_composite_score(
  clarity integer,
  execution integer,
  ambiguity integer,
  business_fit integer,
  weights jsonb default null
)
returns numeric(5,2) language plpgsql immutable as $$
declare
  w_clarity numeric := coalesce((weights->>'clarity')::numeric, 0.25);
  w_execution numeric := coalesce((weights->>'execution')::numeric, 0.25);
  w_ambiguity numeric := coalesce((weights->>'ambiguity')::numeric, 0.20);
  w_business_fit numeric := coalesce((weights->>'business_fit')::numeric, 0.30);
  composite numeric(5,2);
begin
  -- Ambiguity e inversat (scor mai mic = mai bun)
  composite := (clarity * w_clarity + 
                execution * w_execution + 
                (100 - ambiguity) * w_ambiguity + 
                business_fit * w_business_fit);
  
  return round(composite, 2);
end $$;

-- Trigger pentru actualizarea automată a scorului compozit
create or replace function trg_update_composite_score()
returns trigger language plpgsql as $$
begin
  new.composite := pf_calculate_composite_score(
    new.clarity, 
    new.execution, 
    new.ambiguity, 
    new.business_fit, 
    new.weights
  );
  
  -- Determină verdictul bazat pe composite și thresholds
  if new.composite >= coalesce((new.thresholds->>'pass')::numeric, 85) then
    new.verdict := 'pass';
  elsif new.composite >= coalesce((new.thresholds->>'partial_pass')::numeric, 70) then
    new.verdict := 'partial_pass';
  else
    new.verdict := 'fail';
  end if;
  
  return new;
end $$;

drop trigger if exists scores_update_composite on scores;
create trigger scores_update_composite
  before insert or update on scores
  for each row execute procedure trg_update_composite_score();

-- Trigger pentru actualizarea costului în runs
create or replace function trg_update_run_cost()
returns trigger language plpgsql as $$
begin
  if new.tokens_input is not null or new.tokens_output is not null then
    new.cost_usd := pf_calculate_run_cost(
      new.tokens_input,
      new.tokens_output,
      new.model_used,
      new.provider
    );
  end if;
  return new;
end $$;

drop trigger if exists runs_update_cost on runs;
create trigger runs_update_cost
  before insert or update on runs
  for each row execute procedure trg_update_run_cost();

-- Indici pentru performanță
create index if not exists runs_status_idx on runs (status);
create index if not exists runs_created_at_idx on runs (created_at desc);
create index if not exists runs_prompt_version_status_idx on runs (prompt_version_id, status);
create index if not exists runs_model_provider_idx on runs (model_used, provider);

create index if not exists scores_composite_idx on scores (composite desc);
create index if not exists scores_verdict_idx on scores (verdict);

create index if not exists bundles_created_at_idx on bundles (created_at desc);
create index if not exists bundles_license_type_idx on bundles (license_type);

create index if not exists prompt_history_user_idx on prompt_history (user_id, created_at desc);
create index if not exists prompt_history_session_idx on prompt_history (session_id, created_at desc);

create index if not exists run_queue_status_priority_idx on run_queue (status, priority desc);
create index if not exists run_queue_scheduled_at_idx on run_queue (scheduled_at);

create index if not exists execution_metrics_run_metric_idx on execution_metrics (run_id, metric_name);
create index if not exists execution_metrics_type_time_idx on execution_metrics (metric_type, measurement_time desc);

commit;
