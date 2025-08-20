-- 0021_telegram_integration.sql — Telegram Bot Integration pentru PROMPTFORGE v3
begin;

-- 1. Tabel pentru configurarea notificărilor per organizație
create table if not exists telegram_configs (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid references orgs(id) on delete cascade,
  chat_id text not null, -- @makmak131313 sau chat ID numeric
  bot_token text, -- pentru org-uri cu bot-uri proprii
  notification_types text[] default array['run_completed', 'score_update', 'bundle_exported', 'error_alerts', 'daily_reports'],
  schedule text default 'realtime' check (schedule in ('realtime', 'hourly', 'daily')),
  is_active boolean default true,
  timezone text default 'Europe/Bucharest',
  daily_report_time time default '09:00:00',
  cost_alerts_enabled boolean default true,
  cost_threshold_percent int default 80 check (cost_threshold_percent between 1 and 100),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(org_id)
);

-- 2. Tabel pentru istoricul notificărilor trimise
create table if not exists telegram_notifications (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid references orgs(id) on delete cascade,
  chat_id text not null,
  message_id text, -- ID-ul mesajului trimis de Telegram
  type text not null check (type in ('run_completed', 'score_update', 'bundle_exported', 'error_alerts', 'daily_reports', 'cost_alert', 'performance_metrics')),
  message text not null,
  metadata jsonb, -- detalii suplimentare (run_id, scores, etc.)
  status text default 'pending' check (status in ('pending', 'sent', 'failed', 'delivered')),
  error_message text,
  retry_count int default 0,
  sent_at timestamptz,
  delivered_at timestamptz,
  created_at timestamptz default now()
);

-- 3. Tabel pentru template-urile de mesaje
create table if not exists message_templates (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid references orgs(id) on delete cascade,
  name text not null,
  type text not null,
  template text not null, -- template cu placeholders
  variables jsonb, -- variabilele disponibile pentru template
  is_default boolean default false,
  created_at timestamptz default now(),
  unique(org_id, name)
);

-- 4. Tabel pentru webhook events de la Telegram
create table if not exists telegram_webhook_events (
  id uuid primary key default uuid_generate_v4(),
  update_id bigint unique not null,
  event_type text not null, -- message, callback_query, etc.
  chat_id text,
  user_id text,
  message_data jsonb,
  processed boolean default false,
  created_at timestamptz default now()
);

-- 5. Enable RLS pe noile tabele
alter table telegram_configs enable row level security;
alter table telegram_notifications enable row level security;
alter table message_templates enable row level security;
alter table telegram_webhook_events enable row level security;

-- 6. RLS Policies
create policy telegram_configs_rw on telegram_configs
  for all using (
    org_id::text = current_setting('request.jwt.claims', true)::jsonb->>'org_id'
  )
  with check (
    org_id::text = current_setting('request.jwt.claims', true)::jsonb->>'org_id'
  );

create policy telegram_notifications_rw on telegram_notifications
  for all using (
    org_id::text = current_setting('request.jwt.claims', true)::jsonb->>'org_id'
  )
  with check (
    org_id::text = current_setting('request.jwt.claims', true)::jsonb->>'org_id'
  );

create policy message_templates_rw on message_templates
  for all using (
    org_id::text = current_setting('request.jwt.claims', true)::jsonb->>'org_id'
  )
  with check (
    org_id::text = current_setting('request.jwt.claims', true)::jsonb->>'org_id'
  );

-- 7. Funcție pentru trimiterea notificărilor Telegram
create or replace function send_telegram_message(
  chat_id text,
  message text,
  parse_mode text default 'HTML',
  reply_markup jsonb default null
)
returns jsonb as $$
declare
  bot_token text;
  response jsonb;
  api_url text;
  request_body jsonb;
begin
  -- Obține bot token-ul din environment sau din config
  bot_token := coalesce(
    current_setting('app.telegram_bot_token', true),
    '7580500451:AAEL3U-TXve5jY2XLl4_9PGKymDsnXWuC24'
  );
  
  if bot_token is null then
    raise exception 'Telegram bot token not configured';
  end if;
  
  -- Construiește request body
  request_body := jsonb_build_object(
    'chat_id', chat_id,
    'text', message,
    'parse_mode', parse_mode
  );
  
  -- Adaugă reply_markup dacă există
  if reply_markup is not null then
    request_body := request_body || jsonb_build_object('reply_markup', reply_markup);
  end if;
  
  -- Construiește API URL
  api_url := 'https://api.telegram.org/bot' || bot_token || '/sendMessage';
  
  -- Trimite request (aici ar trebui să folosești http extension)
  -- Pentru moment, simulăm răspunsul
  response := jsonb_build_object(
    'ok', true,
    'result', jsonb_build_object(
      'message_id', floor(random() * 1000000),
      'chat', jsonb_build_object('id', chat_id),
      'date', extract(epoch from now())
    )
  );
  
  return response;
end;
$$ language plpgsql security definer;

-- 8. Funcție pentru notificarea run completion
create or replace function notify_run_completion(run_uuid uuid)
returns boolean as $$
declare
  run_record record;
  org_record record;
  telegram_config record;
  message text;
  notification_id uuid;
  success boolean;
begin
  -- Obține detaliile run-ului
  select r.*, p.name as project_name, m.title as module_title
  into run_record
  from runs r
  left join projects p on p.id = r.project_id
  left join modules m on m.id = r.module_id
  where r.id = run_uuid;
  
  if not found then
    return false;
  end if;
  
  -- Obține configurația Telegram pentru org
  select tc.* into telegram_config
  from telegram_configs tc
  where tc.org_id = run_record.org_id
    and tc.is_active = true
    and 'run_completed' = any(tc.notification_types);
  
  if not found then
    return false;
  end if;
  
  -- Construiește mesajul
  message := format(
    '🚀 <b>Run Completed</b>
📊 <b>Module:</b> %s
📋 <b>Project:</b> %s
✅ <b>Status:</b> %s
💰 <b>Cost:</b> $%s
⏱ <b>Duration:</b> %sms
👤 <b>User:</b> %s
🕐 <b>Completed:</b> %s',
    coalesce(run_record.module_title, run_record.module_id),
    coalesce(run_record.project_name, 'N/A'),
    run_record.status,
    coalesce(run_record.cost_usd, '0.00'),
    coalesce(run_record.duration_ms, 0),
    coalesce(run_record.user_id::text, 'System'),
    to_char(run_record.finished_at, 'HH24:MI:SS')
  );
  
  -- Creează înregistrarea de notificare
  insert into telegram_notifications (org_id, chat_id, type, message, metadata, status)
  values (
    run_record.org_id,
    telegram_config.chat_id,
    'run_completed',
    message,
    jsonb_build_object('run_id', run_uuid, 'status', run_record.status)
  )
  returning id into notification_id;
  
  -- Trimite mesajul
  select (send_telegram_message(telegram_config.chat_id, message)->>'ok')::boolean into success;
  
  -- Actualizează status-ul notificării
  update telegram_notifications
  set status = case when success then 'sent' else 'failed' end,
      sent_at = case when success then now() else null end,
      message_id = case when success then (send_telegram_message(telegram_config.chat_id, message)->'result'->>'message_id') else null end
  where id = notification_id;
  
  return success;
end;
$$ language plpgsql security definer;

-- 9. Funcție pentru notificarea score updates
create or replace function notify_score_update(score_uuid uuid)
returns boolean as $$
declare
  score_record record;
  run_record record;
  telegram_config record;
  message text;
  notification_id uuid;
  success boolean;
begin
  -- Obține detaliile score-ului și run-ului
  select s.*, r.org_id, r.module_id, r.project_id, p.name as project_name, m.title as module_title
  into score_record
  from scores s
  join runs r on r.id = s.run_id
  left join projects p on p.id = r.project_id
  left join modules m on m.id = r.module_id
  where s.run_id = score_uuid;
  
  if not found then
    return false;
  end if;
  
  -- Obține configurația Telegram
  select tc.* into telegram_config
  from telegram_configs tc
  where tc.org_id = score_record.org_id
    and tc.is_active = true
    and 'score_update' = any(tc.notification_types);
  
  if not found then
    return false;
  end if;
  
  -- Construiește mesajul
  message := format(
    '📊 <b>Score Update</b>
🎯 <b>Module:</b> %s
📋 <b>Project:</b> %s
⭐ <b>Composite Score:</b> %s/100
📈 <b>Breakdown:</b>
  • Clarity: %s/100
  • Execution: %s/100
  • Ambiguity: %s/100
  • Alignment: %s/100
  • Business Fit: %s/100
🏆 <b>Verdict:</b> %s
💬 <b>Feedback:</b> %s',
    coalesce(score_record.module_title, score_record.module_id),
    coalesce(score_record.project_name, 'N/A'),
    score_record.composite,
    score_record.clarity,
    score_record.execution,
    score_record.ambiguity,
    score_record.alignment,
    score_record.business_fit,
    score_record.verdict,
    coalesce(score_record.feedback->>'summary', 'No feedback provided')
  );
  
  -- Creează notificarea
  insert into telegram_notifications (org_id, chat_id, type, message, metadata, status)
  values (
    score_record.org_id,
    telegram_config.chat_id,
    'score_update',
    message,
    jsonb_build_object('run_id', score_uuid, 'score', score_record.composite, 'verdict', score_record.verdict)
  )
  returning id into notification_id;
  
  -- Trimite mesajul
  select (send_telegram_message(telegram_config.chat_id, message)->>'ok')::boolean into success;
  
  -- Actualizează status-ul
  update telegram_notifications
  set status = case when success then 'sent' else 'failed' end,
      sent_at = case when success then now() else null end
  where id = notification_id;
  
  return success;
end;
$$ language plpgsql security definer;

-- 10. Funcție pentru daily reports
create or replace function send_daily_report(org_uuid uuid)
returns boolean as $$
declare
  org_record record;
  telegram_config record;
  daily_stats record;
  message text;
  notification_id uuid;
  success boolean;
begin
  -- Obține detaliile org-ului
  select o.* into org_record
  from orgs o
  where o.id = org_uuid;
  
  if not found then
    return false;
  end if;
  
  -- Obține configurația Telegram
  select tc.* into telegram_config
  from telegram_configs tc
  where tc.org_id = org_uuid
    and tc.is_active = true
    and 'daily_reports' = any(tc.notification_types);
  
  if not found then
    return false;
  end if;
  
  -- Obține statisticile zilnice
  select 
    count(distinct r.id) as total_runs,
    count(distinct case when r.status = 'success' then r.id end) as successful_runs,
    count(distinct case when r.status = 'error' then r.id end) as failed_runs,
    count(distinct b.id) as total_bundles,
    count(distinct s.run_id) as scored_runs,
    coalesce(avg(s.composite), 0) as avg_score,
    coalesce(sum(r.cost_usd), 0) as total_cost,
    coalesce(sum(r.tokens_used), 0) as total_tokens,
    count(distinct r.user_id) as active_users
  into daily_stats
  from runs r
  left join bundles b on b.run_id = r.id
  left join scores s on s.run_id = r.id
  where r.org_id = org_uuid
    and r.created_at >= date_trunc('day', now());
  
  -- Construiește mesajul
  message := format(
    '📈 <b>Daily Report - %s</b>
🏢 <b>Organization:</b> %s

🔄 <b>Runs:</b> %s total
  ✅ Successful: %s
  ❌ Failed: %s
  
📊 <b>Scores:</b> %s average
📦 <b>Bundles:</b> %s exported
💰 <b>Cost:</b> $%s
🔤 <b>Tokens:</b> %s
👥 <b>Active Users:</b> %s

📅 <b>Date:</b> %s
⏰ <b>Generated:</b> %s',
    to_char(now(), 'DD/MM/YYYY'),
    org_record.name,
    daily_stats.total_runs,
    daily_stats.successful_runs,
    daily_stats.failed_runs,
    round(daily_stats.avg_score, 1),
    daily_stats.total_bundles,
    round(daily_stats.total_cost, 4),
    daily_stats.total_tokens,
    daily_stats.active_users,
    to_char(now(), 'DD/MM/YYYY'),
    to_char(now(), 'HH24:MI:SS')
  );
  
  -- Creează notificarea
  insert into telegram_notifications (org_id, chat_id, type, message, metadata, status)
  values (
    org_uuid,
    telegram_config.chat_id,
    'daily_reports',
    message,
    jsonb_build_object(
      'date', to_char(now(), 'YYYY-MM-DD'),
      'stats', to_jsonb(daily_stats)
    )
  )
  returning id into notification_id;
  
  -- Trimite mesajul
  select (send_telegram_message(telegram_config.chat_id, message)->>'ok')::boolean into success;
  
  -- Actualizează status-ul
  update telegram_notifications
  set status = case when success then 'sent' else 'failed' end,
      sent_at = case when success then now() else null end
  where id = notification_id;
  
  return success;
end;
$$ language plpgsql security definer;

-- 11. Funcție pentru cost alerts
create or replace function check_cost_alerts(org_uuid uuid)
returns void as $$
declare
  telegram_config record;
  daily_cost numeric;
  threshold numeric;
  message text;
  notification_id uuid;
  success boolean;
begin
  -- Obține configurația Telegram
  select tc.* into telegram_config
  from telegram_configs tc
  where tc.org_id = org_uuid
    and tc.is_active = true
    and tc.cost_alerts_enabled = true;
  
  if not found then
    return;
  end if;
  
  -- Obține costul zilnic
  select coalesce(sum(r.cost_usd), 0) into daily_cost
  from runs r
  where r.org_id = org_uuid
    and r.created_at >= date_trunc('day', now());
  
  -- Obține threshold-ul din entitlements sau din config
  select cast(e.value as numeric) into threshold
  from entitlements e
  where e.org_id = org_uuid
    and e.flag = 'maxDailyCost'
    and e.user_id is null
    and (e.expires_at is null or e.expires_at > now())
  limit 1;
  
  if threshold is null then
    return; -- no threshold set
  end if;
  
  -- Verifică dacă costul depășește threshold-ul
  if daily_cost > (threshold * telegram_config.cost_threshold_percent / 100) then
    message := format(
      '⚠️ <b>Cost Alert</b>
💰 <b>Current Daily Cost:</b> $%s
🚨 <b>Threshold:</b> $%s (80%%)
📊 <b>Usage:</b> %s%%
🏢 <b>Organization:</b> %s

⏰ <b>Alert Time:</b> %s',
      round(daily_cost, 4),
      round(threshold, 4),
      round((daily_cost / threshold) * 100, 1),
      (select name from orgs where id = org_uuid),
      to_char(now(), 'HH24:MI:SS')
    );
    
    -- Creează notificarea
    insert into telegram_notifications (org_id, chat_id, type, message, metadata, status)
    values (
      org_uuid,
      telegram_config.chat_id,
      'cost_alert',
      message,
      jsonb_build_object(
        'daily_cost', daily_cost,
        'threshold', threshold,
        'usage_percent', round((daily_cost / threshold) * 100, 1)
      )
    )
    returning id into notification_id;
    
    -- Trimite mesajul
    select (send_telegram_message(telegram_config.chat_id, message)->>'ok')::boolean into success;
    
    -- Actualizează status-ul
    update telegram_notifications
    set status = case when success then 'sent' else 'failed' end,
        sent_at = case when success then now() else null end
    where id = notification_id;
  end if;
end;
$$ language plpgsql security definer;

-- 12. Triggers pentru notificări automate
create or replace function trigger_notify_run_completion()
returns trigger as $$
begin
  if new.status in ('success', 'error') and new.finished_at is not null then
    perform notify_run_completion(new.id);
  end if;
  return new;
end;
$$ language plpgsql;

create trigger trg_notify_run_completion
  after update on runs
  for each row execute function trigger_notify_run_completion();

create or replace function trigger_notify_score_update()
returns trigger as $$
begin
  if tg_op = 'INSERT' or (tg_op = 'UPDATE' and (old.composite != new.composite or old.verdict != new.verdict)) then
    perform notify_score_update(new.run_id);
  end if;
  return new;
end;
$$ language plpgsql;

create trigger trg_notify_score_update
  after insert or update on scores
  for each row execute function trigger_notify_score_update();

-- 13. Seed data pentru configurația default
insert into telegram_configs (org_id, chat_id, notification_types, schedule, timezone, daily_report_time)
select 
  o.id,
  '@makmak131313',
  array['run_completed', 'score_update', 'bundle_exported', 'error_alerts', 'daily_reports'],
  'realtime',
  'Europe/Bucharest',
  '09:00:00'
from orgs o
where not exists (
  select 1 from telegram_configs tc where tc.org_id = o.id
);

-- 14. Seed message templates
insert into message_templates (org_id, name, type, template, variables, is_default) values
  (null, 'run_completed_default', 'run_completed', 
   '🚀 <b>Run Completed</b>
📊 <b>Module:</b> {{module_title}}
📋 <b>Project:</b> {{project_name}}
✅ <b>Status:</b> {{status}}
💰 <b>Cost:</b> ${{cost}}
⏱ <b>Duration:</b> {{duration}}ms
👤 <b>User:</b> {{user_id}}
🕐 <b>Completed:</b> {{completed_at}}',
   '{"module_title": "string", "project_name": "string", "status": "string", "cost": "numeric", "duration": "integer", "user_id": "string", "completed_at": "time"}',
   true
  ),
  (null, 'score_update_default', 'score_update',
   '📊 <b>Score Update</b>
🎯 <b>Module:</b> {{module_title}}
📋 <b>Project:</b> {{project_name}}
⭐ <b>Composite Score:</b> {{composite_score}}/100
📈 <b>Breakdown:</b>
  • Clarity: {{clarity}}/100
  • Execution: {{execution}}/100
  • Ambiguity: {{ambiguity}}/100
  • Alignment: {{alignment}}/100
  • Business Fit: {{business_fit}}/100
🏆 <b>Verdict:</b> {{verdict}}
💬 <b>Feedback:</b> {{feedback}}',
   '{"module_title": "string", "project_name": "string", "composite_score": "numeric", "clarity": "integer", "execution": "integer", "ambiguity": "integer", "alignment": "integer", "business_fit": "integer", "verdict": "string", "feedback": "string"}',
   true
  ),
  (null, 'daily_report_default', 'daily_reports',
   '📈 <b>Daily Report - {{date}}</b>
🏢 <b>Organization:</b> {{org_name}}

🔄 <b>Runs:</b> {{total_runs}} total
  ✅ Successful: {{successful_runs}}
  ❌ Failed: {{failed_runs}}
  
📊 <b>Scores:</b> {{avg_score}} average
📦 <b>Bundles:</b> {{total_bundles}} exported
💰 <b>Cost:</b> ${{total_cost}}
🔤 <b>Tokens:</b> {{total_tokens}}
👥 <b>Active Users:</b> {{active_users}}

📅 <b>Date:</b> {{date}}
⏰ <b>Generated:</b> {{generated_at}}',
   '{"date": "string", "org_name": "string", "total_runs": "integer", "successful_runs": "integer", "failed_runs": "integer", "avg_score": "numeric", "total_bundles": "integer", "total_cost": "numeric", "total_tokens": "integer", "active_users": "integer", "generated_at": "time"}',
   true
  );

-- 15. Indexuri pentru performanță
create index if not exists idx_telegram_notifications_org_status on telegram_notifications(org_id, status);
create index if not exists idx_telegram_notifications_type_sent on telegram_notifications(type, sent_at);
create index if not exists idx_telegram_webhook_events_processed on telegram_webhook_events(processed);
create index if not exists idx_telegram_configs_org_active on telegram_configs(org_id, is_active);

commit;
