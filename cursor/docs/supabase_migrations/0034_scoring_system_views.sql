-- 0028_scoring_system_views.sql — Views and functions for scoring system
begin;

-- View pentru run statistics
create or replace view run_statistics as
select 
  r.id,
  r.prompt_version_id,
  pv.prompt_id,
  p.module_id,
  m.title as module_title,
  r.status,
  r.execution_time_ms,
  r.tokens_total,
  r.cost_usd,
  r.model_used,
  r.provider,
  r.created_at,
  s.clarity,
  s.execution as execution_score,
  s.ambiguity,
  s.business_fit,
  s.composite,
  s.verdict,
  s.confidence_score,
  s.human_reviewed,
  -- Calculează grade performance
  case 
    when r.execution_time_ms <= 5000 then 'fast'
    when r.execution_time_ms <= 15000 then 'medium'
    else 'slow'
  end as performance_grade,
  -- Calculează cost efficiency
  case 
    when r.cost_usd <= 0.01 then 'low'
    when r.cost_usd <= 0.05 then 'medium'
    else 'high'
  end as cost_grade
from runs r
join prompt_versions pv on pv.id = r.prompt_version_id
join prompts p on p.id = pv.prompt_id
join modules m on m.id = p.module_id
left join scores s on s.run_id = r.id
where r.status = 'completed';

-- View pentru score trends
create or replace view score_trends as
select 
  p.module_id,
  m.title as module_title,
  date_trunc('day', r.created_at) as date,
  count(*) as total_runs,
  count(*) filter (where s.verdict = 'pass') as passed_runs,
  count(*) filter (where s.verdict = 'partial_pass') as partial_passed_runs,
  count(*) filter (where s.verdict = 'fail') as failed_runs,
  round(avg(s.composite), 2) as avg_composite_score,
  round(avg(s.clarity), 2) as avg_clarity,
  round(avg(s.execution), 2) as avg_execution,
  round(avg(s.ambiguity), 2) as avg_ambiguity,
  round(avg(s.business_fit), 2) as avg_business_fit,
  round(avg(r.execution_time_ms), 0) as avg_execution_time_ms,
  round(avg(r.cost_usd), 6) as avg_cost_usd
from runs r
join prompt_versions pv on pv.id = r.prompt_version_id
join prompts p on p.id = pv.prompt_id
join modules m on m.id = p.module_id
left join scores s on s.run_id = r.id
where r.status = 'completed'
group by p.module_id, m.title, date_trunc('day', r.created_at)
order by date desc, p.module_id;

-- View pentru performance metrics
create or replace view performance_metrics as
select 
  p.module_id,
  m.title as module_title,
  count(*) as total_runs,
  count(*) filter (where r.status = 'completed') as completed_runs,
  count(*) filter (where r.status = 'failed') as failed_runs,
  round(
    (count(*) filter (where r.status = 'completed')::numeric / count(*) * 100), 2
  ) as success_rate_percent,
  round(avg(r.execution_time_ms) filter (where r.status = 'completed'), 0) as avg_execution_time_ms,
  round(sum(r.cost_usd) filter (where r.status = 'completed'), 6) as total_cost_usd,
  round(avg(r.cost_usd) filter (where r.status = 'completed'), 6) as avg_cost_usd,
  sum(r.tokens_total) filter (where r.status = 'completed') as total_tokens,
  round(avg(r.tokens_total) filter (where r.status = 'completed'), 0) as avg_tokens,
  round(avg(s.composite) filter (where s.composite is not null), 2) as avg_composite_score,
  count(*) filter (where s.verdict = 'pass') as passed_runs,
  round(
    (count(*) filter (where s.verdict = 'pass')::numeric / 
     count(*) filter (where s.composite is not null) * 100), 2
  ) as pass_rate_percent,
  min(r.created_at) as first_run_at,
  max(r.created_at) as last_run_at
from runs r
join prompt_versions pv on pv.id = r.prompt_version_id
join prompts p on p.id = pv.prompt_id
join modules m on m.id = p.module_id
left join scores s on s.run_id = r.id
group by p.module_id, m.title
order by total_runs desc;

-- View pentru bundle analytics
create or replace view bundle_analytics as
select 
  b.id,
  b.bundle_name,
  b.run_id,
  r.prompt_version_id,
  p.module_id,
  m.title as module_title,
  b.version,
  b.license_type,
  b.formats,
  b.total_size_bytes,
  b.download_count,
  b.created_at,
  b.last_downloaded_at,
  s.composite as score,
  s.verdict,
  count(a.id) as artifact_count,
  array_agg(a.file_name) as artifact_files,
  array_agg(a.content_type) as content_types
from bundles b
join runs r on r.id = b.run_id
join prompt_versions pv on pv.id = r.prompt_version_id
join prompts p on p.id = pv.prompt_id
join modules m on m.id = p.module_id
left join scores s on s.run_id = r.id
left join artifacts a on a.bundle_id = b.id
group by b.id, b.bundle_name, b.run_id, r.prompt_version_id, 
         p.module_id, m.title, b.version, b.license_type, 
         b.formats, b.total_size_bytes, b.download_count,
         b.created_at, b.last_downloaded_at, s.composite, s.verdict
order by b.created_at desc;

-- Funcție pentru evaluarea automată a unui prompt
create or replace function pf_evaluate_prompt_output(
  prompt_text text,
  expected_output text,
  actual_output text,
  evaluation_criteria jsonb default null
)
returns jsonb language plpgsql as $$
declare
  clarity_score integer := 75;
  execution_score integer := 75;
  ambiguity_score integer := 25;
  business_fit_score integer := 75;
  confidence numeric(3,2) := 0.8;
  evaluation_notes text[] := array[]::text[];
  result jsonb;
begin
  -- Evaluare de bază (poate fi înlocuită cu AI evaluation)
  
  -- Clarity: verifică lungimea și structura
  if length(actual_output) < 50 then
    clarity_score := clarity_score - 20;
    evaluation_notes := array_append(evaluation_notes, 'Output too short');
  elsif length(actual_output) > 2000 then
    clarity_score := clarity_score - 10;
    evaluation_notes := array_append(evaluation_notes, 'Output might be too verbose');
  end if;
  
  -- Execution: verifică dacă conține cuvinte cheie din prompt
  if position(lower(split_part(prompt_text, ' ', 1)) in lower(actual_output)) = 0 then
    execution_score := execution_score - 15;
    evaluation_notes := array_append(evaluation_notes, 'Missing key terms from prompt');
  end if;
  
  -- Ambiguity: verifică pentru cuvinte ambigue
  if actual_output ~* '\b(maybe|perhaps|possibly|might|could be)\b' then
    ambiguity_score := ambiguity_score + 20;
    evaluation_notes := array_append(evaluation_notes, 'Contains ambiguous language');
  end if;
  
  -- Business fit: verifică pentru structură profesională
  if actual_output ~* '\b(action|strategy|implementation|results?)\b' then
    business_fit_score := business_fit_score + 10;
  end if;
  
  -- Normalizează scorurile
  clarity_score := greatest(0, least(100, clarity_score));
  execution_score := greatest(0, least(100, execution_score));
  ambiguity_score := greatest(0, least(100, ambiguity_score));
  business_fit_score := greatest(0, least(100, business_fit_score));
  
  result := jsonb_build_object(
    'clarity', clarity_score,
    'execution', execution_score,
    'ambiguity', ambiguity_score,
    'business_fit', business_fit_score,
    'confidence', confidence,
    'evaluation_method', 'automated',
    'notes', evaluation_notes,
    'evaluated_at', now()
  );
  
  return result;
end $$;

-- Funcție pentru crearea unui run complet cu scoring
create or replace function pf_create_run_with_score(
  p_prompt_version_id uuid,
  p_parameter_set jsonb,
  p_final_prompt text,
  p_raw_response text,
  p_processed_output text,
  p_model_used text default 'gpt-4',
  p_provider text default 'openai',
  p_temperature numeric default 0.7,
  p_max_tokens integer default 1000,
  p_execution_time_ms integer default null,
  p_tokens_input integer default null,
  p_tokens_output integer default null
)
returns uuid language plpgsql as $$
declare
  run_id uuid;
  run_hash_text text;
  evaluation_result jsonb;
  total_tokens integer;
begin
  -- Calculează hash-ul pentru run
  run_hash_text := encode(sha256((p_parameter_set::text || p_final_prompt)::bytea), 'hex');
  
  -- Calculează total tokens
  total_tokens := coalesce(p_tokens_input, 0) + coalesce(p_tokens_output, 0);
  
  -- Creează run-ul
  insert into runs (
    prompt_version_id,
    run_hash,
    parameter_set_7d,
    status,
    execution_time_ms,
    tokens_input,
    tokens_output,
    tokens_total,
    model_used,
    provider,
    temperature,
    max_tokens,
    final_prompt,
    raw_response,
    processed_output
  ) values (
    p_prompt_version_id,
    run_hash_text,
    p_parameter_set,
    'completed',
    p_execution_time_ms,
    p_tokens_input,
    p_tokens_output,
    total_tokens,
    p_model_used,
    p_provider,
    p_temperature,
    p_max_tokens,
    p_final_prompt,
    p_raw_response,
    p_processed_output
  ) returning id into run_id;
  
  -- Evaluează automat output-ul
  evaluation_result := pf_evaluate_prompt_output(
    p_final_prompt,
    '', -- expected_output (poate fi adăugat mai târziu)
    p_processed_output
  );
  
  -- Creează scorul
  insert into scores (
    run_id,
    clarity,
    execution,
    ambiguity,
    business_fit,
    evaluator_version,
    evaluation_method,
    confidence_score,
    criteria_details
  ) values (
    run_id,
    (evaluation_result->>'clarity')::integer,
    (evaluation_result->>'execution')::integer,
    (evaluation_result->>'ambiguity')::integer,
    (evaluation_result->>'business_fit')::integer,
    'v1.0',
    evaluation_result->>'evaluation_method',
    (evaluation_result->>'confidence')::numeric,
    evaluation_result
  );
  
  return run_id;
end $$;

-- Funcție pentru actualizarea scorului manual
create or replace function pf_update_score_manual(
  p_run_id uuid,
  p_clarity integer,
  p_execution integer,
  p_ambiguity integer,
  p_business_fit integer,
  p_notes text default null,
  p_reviewed_by uuid default null
)
returns boolean language plpgsql as $$
begin
  update scores set
    clarity = p_clarity,
    execution = p_execution,
    ambiguity = p_ambiguity,
    business_fit = p_business_fit,
    evaluation_method = 'human',
    human_reviewed = true,
    review_notes = p_notes,
    criteria_details = criteria_details || jsonb_build_object(
      'manual_review_at', now(),
      'reviewed_by', p_reviewed_by
    )
  where run_id = p_run_id;
  
  return found;
end $$;

-- Funcție pentru calcularea trend-urilor de performanță
create or replace function pf_calculate_performance_trend(
  p_module_id text,
  p_days integer default 30
)
returns jsonb language plpgsql as $$
declare
  current_avg numeric;
  previous_avg numeric;
  trend_direction text;
  result jsonb;
begin
  -- Media actuală (ultimele p_days zile)
  select avg(s.composite) into current_avg
  from runs r
  join prompt_versions pv on pv.id = r.prompt_version_id
  join prompts p on p.id = pv.prompt_id
  join scores s on s.run_id = r.id
  where p.module_id = p_module_id
    and r.created_at >= now() - interval '1 day' * p_days
    and r.status = 'completed';
    
  -- Media precedentă (p_days zile înainte)
  select avg(s.composite) into previous_avg
  from runs r
  join prompt_versions pv on pv.id = r.prompt_version_id
  join prompts p on p.id = pv.prompt_id
  join scores s on s.run_id = r.id
  where p.module_id = p_module_id
    and r.created_at >= now() - interval '1 day' * (p_days * 2)
    and r.created_at < now() - interval '1 day' * p_days
    and r.status = 'completed';
    
  -- Determină direcția trend-ului
  if current_avg is null or previous_avg is null then
    trend_direction := 'insufficient_data';
  elsif current_avg > previous_avg + 2 then
    trend_direction := 'improving';
  elsif current_avg < previous_avg - 2 then
    trend_direction := 'declining';
  else
    trend_direction := 'stable';
  end if;
  
  result := jsonb_build_object(
    'module_id', p_module_id,
    'period_days', p_days,
    'current_average', round(coalesce(current_avg, 0), 2),
    'previous_average', round(coalesce(previous_avg, 0), 2),
    'trend_direction', trend_direction,
    'change_points', round(coalesce(current_avg, 0) - coalesce(previous_avg, 0), 2),
    'calculated_at', now()
  );
  
  return result;
end $$;

commit;
