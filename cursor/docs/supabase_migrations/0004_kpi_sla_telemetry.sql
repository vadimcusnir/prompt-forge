-- =============================================================================
-- PROMPTFORGE™ v3 - KPI/SLA TELEMETRY SYSTEM MIGRATION
-- =============================================================================
-- Purpose: Add comprehensive KPI/SLA monitoring tables and views
-- Features: TTA tracking, score monitoring, policy hits, SLA dashboard

begin;

-- =============================================================================
-- KPI METRICS TABLE
-- =============================================================================

create table if not exists kpi_metrics (
  id text primary key,
  execution_id text not null,
  user_id uuid not null,
  org_id uuid not null,
  module_id text not null,
  tta_seconds numeric(8,3) not null,           -- Time to Artifact in seconds
  tta_threshold numeric(8,3) not null,         -- SLA threshold for TTA
  tta_status text not null check (tta_status in ('within_sla', 'sla_breach', 'failed')),
  score integer not null check (score between 0 and 100),
  score_threshold integer not null check (score_threshold between 0 and 100),
  score_status text not null check (score_status in ('within_sla', 'sla_breach', 'failed')),
  verdict text not null check (verdict in ('pass', 'partial_pass', 'fail', 'unknown')),
  total_duration_ms bigint not null,           -- Total execution time
  token_count bigint not null,                 -- Total tokens used
  cost_usd numeric(10,4) not null,            -- Cost in USD
  model_used text not null,                    -- Model used for execution
  output_format text not null,                 -- Output format generated
  sevenD_context jsonb not null,               -- 7D context used
  error_message text,                          -- Error message if failed
  error_type text,                             -- Error type if failed
  timestamp timestamptz not null default now(),
  
  -- Indexes for performance
  constraint fk_kpi_metrics_user foreign key (user_id) references auth.users(id) on delete cascade,
  constraint fk_kpi_metrics_org foreign key (org_id) references organizations(id) on delete cascade
);

-- Performance indexes
create index if not exists idx_kpi_metrics_org_timestamp on kpi_metrics(org_id, timestamp desc);
create index if not exists idx_kpi_metrics_module_timestamp on kpi_metrics(module_id, timestamp desc);
create index if not exists idx_kpi_metrics_tta_status on kpi_metrics(tta_status, timestamp desc);
create index if not exists idx_kpi_metrics_score_status on kpi_metrics(score_status, timestamp desc);
create index if not exists idx_kpi_metrics_execution_id on kpi_metrics(execution_id);

-- =============================================================================
-- POLICY HITS TABLE
-- =============================================================================

create table if not exists policy_hits (
  id bigserial primary key,
  user_id uuid not null,
  org_id uuid not null,
  policy_type text not null,                   -- GDPR, IP, medical/financial, domain-specific
  policy_rule text not null,                   -- Specific rule that was triggered
  action text not null check (action in ('allowed', 'blocked', 'warning')),
  details jsonb not null default '{}',         -- Additional context
  timestamp timestamptz not null default now(),
  
  -- Indexes for performance
  constraint fk_policy_hits_user foreign key (user_id) references auth.users(id) on delete cascade,
  constraint fk_policy_hits_org foreign key (org_id) references organizations(id) on delete cascade
);

-- Performance indexes
create index if not exists idx_policy_hits_org_timestamp on policy_hits(org_id, timestamp desc);
create index if not exists idx_policy_hits_policy_type on policy_hits(policy_type, timestamp desc);
create index if not exists idx_policy_hits_action on policy_hits(action, timestamp desc);

-- =============================================================================
-- SLA METRICS TABLE (Aggregated metrics for dashboard)
-- =============================================================================

create table if not exists sla_metrics (
  id bigserial primary key,
  org_id uuid not null,
  module_id text,                              -- NULL for org-wide metrics
  time_period text not null check (time_period in ('hour', 'day', 'week', 'month')),
  start_date timestamptz not null,
  end_date timestamptz not null,
  
  -- TTA metrics
  tta_p50 numeric(8,3) not null,              -- 50th percentile TTA
  tta_p90 numeric(8,3) not null,              -- 90th percentile TTA
  tta_p95 numeric(8,3) not null,              -- 95th percentile TTA
  tta_sla_breach_rate numeric(5,2) not null,  -- Percentage of TTA breaches
  
  -- Score metrics
  avg_score numeric(5,2) not null,             -- Average score
  score_sla_breach_rate numeric(5,2) not null, -- Percentage of score breaches
  pass_rate numeric(5,2) not null,             -- Pass rate percentage
  
  -- Export metrics
  export_success_rate numeric(5,2) not null,   -- Export success rate
  
  -- Policy metrics
  policy_hit_rate numeric(5,2) not null,       -- Policy hit rate
  
  -- Overall SLA status
  sla_status text not null check (sla_status in ('green', 'yellow', 'red')),
  sla_score numeric(5,2) not null check (sla_score between 0 and 100),
  
  -- Metadata
  total_runs bigint not null,                  -- Total runs in period
  successful_runs bigint not null,             -- Successful runs in period
  failed_runs bigint not null,                 -- Failed runs in period
  
  created_at timestamptz not null default now(),
  
  -- Constraints
  constraint fk_sla_metrics_org foreign key (org_id) references organizations(id) on delete cascade,
  unique(org_id, module_id, time_period, start_date, end_date)
);

-- Performance indexes
create index if not exists idx_sla_metrics_org_period on sla_metrics(org_id, time_period, start_date desc);
create index if not exists idx_sla_metrics_module_period on sla_metrics(module_id, time_period, start_date desc);
create index if not exists idx_sla_metrics_status on sla_metrics(sla_status, start_date desc);

-- =============================================================================
-- ENHANCED RUNS TABLE (Add telemetry fields)
-- =============================================================================

-- Add telemetry fields to existing runs table
alter table if exists runs add column if not exists telemetry jsonb;
alter table if exists runs add column if not exists execution_metrics jsonb;
alter table if exists runs add column if not exists tta_seconds numeric(8,3);
alter table if exists runs add column if not exists tta_status text check (tta_status in ('within_sla', 'sla_breach', 'failed'));
alter table if exists runs add column if not exists score_status text check (score_status in ('within_sla', 'sla_breach', 'failed'));

-- Index for telemetry queries
create index if not exists idx_runs_telemetry on runs using gin(telemetry);
create index if not exists idx_runs_execution_metrics on runs using gin(execution_metrics);

-- =============================================================================
-- DASHBOARD VIEWS
-- =============================================================================

-- Main KPI/SLA Dashboard View
create or replace view kpi_sla_dashboard as
select 
  k.org_id,
  k.module_id,
  date_trunc('day', k.timestamp) as date,
  
  -- TTA Metrics
  count(*) as total_runs,
  avg(k.tta_seconds) as avg_tta_seconds,
  percentile_cont(0.5) within group (order by k.tta_seconds) as tta_p50,
  percentile_cont(0.9) within group (order by k.tta_seconds) as tta_p90,
  percentile_cont(0.95) within group (order by k.tta_seconds) as tta_p95,
  
  -- SLA Compliance
  count(*) filter (where k.tta_status = 'within_sla') as tta_within_sla,
  count(*) filter (where k.tta_status = 'sla_breach') as tta_breaches,
  round(
    (count(*) filter (where k.tta_status = 'within_sla')::numeric / count(*)::numeric) * 100, 2
  ) as tta_compliance_rate,
  
  -- Score Metrics
  avg(k.score) as avg_score,
  count(*) filter (where k.score >= k.score_threshold) as score_within_sla,
  count(*) filter (where k.score < k.score_threshold) as score_breaches,
  round(
    (count(*) filter (where k.score >= k.score_threshold)::numeric / count(*)::numeric) * 100, 2
  ) as score_compliance_rate,
  
  -- Pass Rate
  count(*) filter (where k.verdict = 'pass') as pass_count,
  count(*) filter (where k.verdict in ('pass', 'partial_pass')) as partial_pass_count,
  count(*) filter (where k.verdict = 'fail') as fail_count,
  round(
    (count(*) filter (where k.verdict = 'pass')::numeric / count(*)::numeric) * 100, 2
  ) as pass_rate,
  
  -- Export Success
  count(*) filter (where k.output_format != 'none') as export_success_count,
  round(
    (count(*) filter (where k.output_format != 'none')::numeric / count(*)::numeric) * 100, 2
  ) as export_success_rate,
  
  -- Cost Metrics
  sum(k.cost_usd) as total_cost_usd,
  avg(k.cost_usd) as avg_cost_usd,
  sum(k.token_count) as total_tokens,
  avg(k.token_count) as avg_tokens_per_run,
  
  -- Overall SLA Status
  case 
    when avg(k.tta_seconds) <= 60 and avg(k.score) >= 80 and 
         (count(*) filter (where k.tta_status = 'within_sla')::numeric / count(*)::numeric) >= 0.99
    then 'green'
    when avg(k.tta_seconds) <= 120 and avg(k.score) >= 70 and
         (count(*) filter (where k.tta_status = 'within_sla')::numeric / count(*)::numeric) >= 0.95
    then 'yellow'
    else 'red'
  end as sla_status,
  
  -- SLA Score (0-100)
  round(
    (
      -- TTA compliance (40% weight)
      (count(*) filter (where k.tta_status = 'within_sla')::numeric / count(*)::numeric) * 40 +
      -- Score compliance (30% weight)
      (count(*) filter (where k.score >= k.score_threshold)::numeric / count(*)::numeric) * 30 +
      -- Pass rate (20% weight)
      (count(*) filter (where k.verdict = 'pass')::numeric / count(*)::numeric) * 20 +
      -- Export success (10% weight)
      (count(*) filter (where k.output_format != 'none')::numeric / count(*)::numeric) * 10
    ), 2
  ) as sla_score

from kpi_metrics k
group by k.org_id, k.module_id, date_trunc('day', k.timestamp)
order by k.org_id, k.module_id, date desc;

-- Policy Hits Summary View
create or replace view policy_hits_summary as
select 
  ph.org_id,
  ph.policy_type,
  ph.action,
  date_trunc('day', ph.timestamp) as date,
  count(*) as hit_count,
  count(*) filter (where ph.action = 'blocked') as blocked_count,
  count(*) filter (where ph.action = 'warning') as warning_count,
  count(*) filter (where ph.action = 'allowed') as allowed_count,
  round(
    (count(*) filter (where ph.action = 'blocked')::numeric / count(*)::numeric) * 100, 2
  ) as block_rate,
  round(
    (count(*) filter (where ph.action = 'warning')::numeric / count(*)::numeric) * 100, 2
  ) as warning_rate

from policy_hits ph
group by ph.org_id, ph.policy_type, ph.action, date_trunc('day', ph.timestamp)
order by ph.org_id, ph.policy_type, date desc;

-- Real-time SLA Monitoring View
create or replace view real_time_sla_monitoring as
select 
  k.org_id,
  k.module_id,
  k.timestamp,
  k.tta_seconds,
  k.tta_status,
  k.score,
  k.score_status,
  k.verdict,
  k.output_format,
  k.total_duration_ms,
  k.cost_usd,
  k.model_used,
  
  -- SLA Breach Detection
  case 
    when k.tta_status = 'sla_breach' then 'TTA_BREACH'
    when k.score_status = 'sla_breach' then 'SCORE_BREACH'
    when k.verdict = 'fail' then 'FAILED_EXECUTION'
    else 'WITHIN_SLA'
  end as breach_type,
  
  -- Severity Level
  case 
    when k.tta_seconds > 300 or k.score < 60 then 'critical'
    when k.tta_seconds > 180 or k.score < 70 then 'high'
    when k.tta_seconds > 120 or k.score < 80 then 'medium'
    else 'low'
  end as severity_level

from kpi_metrics k
where k.timestamp >= now() - interval '24 hours'
order by k.timestamp desc;

-- =============================================================================
-- FUNCTIONS FOR AUTOMATED SLA CALCULATION
-- =============================================================================

-- Function to calculate hourly SLA metrics
create or replace function calculate_hourly_sla_metrics()
returns void as $$
begin
  insert into sla_metrics (
    org_id, module_id, time_period, start_date, end_date,
    tta_p50, tta_p90, tta_p95, tta_sla_breach_rate,
    avg_score, score_sla_breach_rate, pass_rate,
    export_success_rate, policy_hit_rate,
    sla_status, sla_score,
    total_runs, successful_runs, failed_runs
  )
  select 
    k.org_id,
    k.module_id,
    'hour'::text,
    date_trunc('hour', k.timestamp),
    date_trunc('hour', k.timestamp) + interval '1 hour',
    
    -- TTA metrics
    percentile_cont(0.5) within group (order by k.tta_seconds),
    percentile_cont(0.9) within group (order by k.tta_seconds),
    percentile_cont(0.95) within group (order by k.tta_seconds),
    round(
      (count(*) filter (where k.tta_status = 'sla_breach')::numeric / count(*)::numeric) * 100, 2
    ),
    
    -- Score metrics
    round(avg(k.score), 2),
    round(
      (count(*) filter (where k.score < k.score_threshold)::numeric / count(*)::numeric) * 100, 2
    ),
    round(
      (count(*) filter (where k.verdict = 'pass')::numeric / count(*)::numeric) * 100, 2
    ),
    
    -- Export metrics
    round(
      (count(*) filter (where k.output_format != 'none')::numeric / count(*)::numeric) * 100, 2
    ),
    
    -- Policy metrics (from policy_hits table)
    coalesce(
      (select round(
        (count(*)::numeric / (select count(*) from kpi_metrics km where km.org_id = k.org_id and km.timestamp >= date_trunc('hour', k.timestamp) and km.timestamp < date_trunc('hour', k.timestamp) + interval '1 hour')) * 100, 2
      ) from policy_hits ph where ph.org_id = k.org_id and ph.timestamp >= date_trunc('hour', k.timestamp) and ph.timestamp < date_trunc('hour', k.timestamp) + interval '1 hour'), 0
    ),
    
    -- Overall SLA status
    case 
      when avg(k.tta_seconds) <= 60 and avg(k.score) >= 80 and 
           (count(*) filter (where k.tta_status = 'within_sla')::numeric / count(*)::numeric) >= 0.99
      then 'green'
      when avg(k.tta_seconds) <= 120 and avg(k.score) >= 70 and
           (count(*) filter (where k.tta_status = 'within_sla')::numeric / count(*)::numeric) >= 0.95
      then 'yellow'
      else 'red'
    end,
    
    -- SLA Score
    round(
      (
        (count(*) filter (where k.tta_status = 'within_sla')::numeric / count(*)::numeric) * 40 +
        (count(*) filter (where k.score >= k.score_threshold)::numeric / count(*)::numeric) * 30 +
        (count(*) filter (where k.verdict = 'pass')::numeric / count(*)::numeric) * 20 +
        (count(*) filter (where k.output_format != 'none')::numeric / count(*)::numeric) * 10
      ), 2
    ),
    
    -- Run counts
    count(*),
    count(*) filter (where k.verdict != 'fail'),
    count(*) filter (where k.verdict = 'fail')
    
  from kpi_metrics k
  where k.timestamp >= now() - interval '1 hour'
  group by k.org_id, k.module_id, date_trunc('hour', k.timestamp)
  
  on conflict (org_id, module_id, time_period, start_date, end_date)
  do update set
    tta_p50 = excluded.tta_p50,
    tta_p90 = excluded.tta_p90,
    tta_p95 = excluded.tta_p95,
    tta_sla_breach_rate = excluded.tta_sla_breach_rate,
    avg_score = excluded.avg_score,
    score_sla_breach_rate = excluded.score_sla_breach_rate,
    pass_rate = excluded.pass_rate,
    export_success_rate = excluded.export_success_rate,
    policy_hit_rate = excluded.policy_hit_rate,
    sla_status = excluded.sla_status,
    sla_score = excluded.sla_score,
    total_runs = excluded.total_runs,
    successful_runs = excluded.successful_runs,
    failed_runs = excluded.failed_runs,
    created_at = now();
end;
$$ language plpgsql;

-- =============================================================================
-- TRIGGERS FOR AUTOMATED UPDATES
-- =============================================================================

-- Trigger to update runs table when KPI metrics are inserted
create or replace function update_runs_telemetry()
returns trigger as $$
begin
  update runs 
  set 
    telemetry = jsonb_build_object(
      'tta_seconds', new.tta_seconds,
      'tta_status', new.tta_status,
      'score', new.score,
      'score_status', new.score_status,
      'verdict', new.verdict,
      'total_duration_ms', new.total_duration_ms,
      'token_count', new.token_count,
      'cost_usd', new.cost_usd,
      'model_used', new.model_used,
      'output_format', new.output_format
    ),
    execution_metrics = jsonb_build_object(
      'duration_ms', new.total_duration_ms,
      'token_count', new.token_count,
      'cost_usd', new.cost_usd,
      'model_used', new.model_used
    ),
    tta_seconds = new.tta_seconds,
    tta_status = new.tta_status,
    score_status = new.score_status
  where id = new.execution_id;
  
  return new;
end;
$$ language plpgsql;

create trigger trg_update_runs_telemetry
after insert on kpi_metrics
for each row execute function update_runs_telemetry();

-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================================

-- Enable RLS on new tables
alter table kpi_metrics enable row level security;
alter table policy_hits enable row level security;
alter table sla_metrics enable row level security;

-- KPI Metrics RLS
create policy "Users can view their own org's KPI metrics" on kpi_metrics
  for select using (org_id in (
    select org_id from user_organizations where user_id = auth.uid()
  ));

create policy "Users can insert KPI metrics for their org" on kpi_metrics
  for insert with check (org_id in (
    select org_id from user_organizations where user_id = auth.uid()
  ));

-- Policy Hits RLS
create policy "Users can view their own org's policy hits" on policy_hits
  for select using (org_id in (
    select org_id from user_organizations where user_id = auth.uid()
  ));

create policy "Users can insert policy hits for their org" on policy_hits
  for insert with check (org_id in (
    select org_id from user_organizations where user_id = auth.uid()
  ));

-- SLA Metrics RLS
create policy "Users can view their own org's SLA metrics" on sla_metrics
  for select using (org_id in (
    select org_id from user_organizations where user_id = auth.uid()
  ));

create policy "Users can insert SLA metrics for their org" on sla_metrics
  for insert with check (org_id in (
    select org_id from user_organizations where user_id = auth.uid()
  ));

-- =============================================================================
-- GRANTS
-- =============================================================================

-- Grant access to authenticated users
grant select, insert on kpi_metrics to authenticated;
grant select, insert on policy_hits to authenticated;
grant select, insert on sla_metrics to authenticated;

-- Grant access to views
grant select on kpi_sla_dashboard to authenticated;
grant select on policy_hits_summary to authenticated;
grant select on real_time_sla_monitoring to authenticated;

-- Grant execute on functions
grant execute on function calculate_hourly_sla_metrics() to authenticated;

commit;
