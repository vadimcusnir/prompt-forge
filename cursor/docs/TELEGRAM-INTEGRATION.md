# PROMPTFORGE™ v3 — Telegram Integration

## 🚀 **Overview**

Integrarea Telegram pentru PROMPTFORGE™ v3 oferă notificări în timp real, rapoarte automate și interacțiune directă cu utilizatorii prin bot-ul @cusnir_bot în grupul @makmak131313.

## 🤖 **Bot Configuration**

### **Detalii Bot:**
- **Username:** @cusnir_bot
- **Token:** `7580500451:AAEL3U-TXve5jY2XLl4_9PGKymDsnXWuC24`
- **Group:** @makmak131313
- **Features:** Rich formatting, inline keyboards, webhook support

### **Environment Variables:**
```bash
# .env.local
TELEGRAM_BOT_TOKEN=7580500451:AAEL3U-TXve5jY2XLl4_9PGKymDsnXWuC24
TELEGRAM_DEFAULT_CHAT_ID=@makmak131313
TELEGRAM_BOT_USERNAME=cusnir_bot
WEBHOOK_URL=https://your-domain.com/api/telegram/webhook
```

## 📱 **Features Implementate**

### 1. **Real-time Notifications**
- 🚀 **Run Completions** - Când se termină execuții
- 📊 **Score Updates** - Actualizări scoruri Evaluator AI
- 📦 **Bundle Exports** - Confirmări export bundle-uri
- 🚨 **Error Alerts** - Alerte pentru erori și probleme
- 📈 **Daily Reports** - Rapoarte zilnice automate
- 💰 **Cost Alerts** - Alerte pentru costuri mari

### 2. **Interactive Commands**
- `/start` - Mesaj de bun venit
- `/help` - Ajutor și comenzi disponibile
- `/status` - Status sistem în timp real
- `/daily` - Raport zilnic personalizat
- `/config` - Configurare notificări

### 3. **Rich Formatting**
- **HTML Support** - Bold, italic, emoji
- **Inline Keyboards** - Butoane interactive
- **Structured Messages** - Layout organizat
- **Emoji Integration** - Iconițe pentru tipuri diferite

## 🗄️ **Database Schema**

### **Tabele Principale:**

#### 1. **telegram_configs**
```sql
telegram_configs (
  id uuid PK,
  org_id uuid FK(orgs),
  chat_id text NOT NULL, -- @makmak131313
  bot_token text, -- pentru org-uri cu bot-uri proprii
  notification_types text[], -- ['run_completed', 'score_update', ...]
  schedule text CHECK('realtime','hourly','daily'),
  is_active boolean DEFAULT true,
  timezone text DEFAULT 'Europe/Bucharest',
  daily_report_time time DEFAULT '09:00:00',
  cost_alerts_enabled boolean DEFAULT true,
  cost_threshold_percent int DEFAULT 80,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
)
```

#### 2. **telegram_notifications**
```sql
telegram_notifications (
  id uuid PK,
  org_id uuid FK(orgs),
  chat_id text NOT NULL,
  message_id text, -- ID-ul mesajului trimis de Telegram
  type text NOT NULL, -- 'run_completed', 'score_update', etc.
  message text NOT NULL,
  metadata jsonb, -- detalii suplimentare
  status text DEFAULT 'pending', -- 'pending','sent','failed','delivered'
  error_message text,
  retry_count int DEFAULT 0,
  sent_at timestamptz,
  delivered_at timestamptz,
  created_at timestamptz DEFAULT now()
)
```

#### 3. **message_templates**
```sql
message_templates (
  id uuid PK,
  org_id uuid FK(orgs),
  name text NOT NULL,
  type text NOT NULL,
  template text NOT NULL, -- template cu placeholders
  variables jsonb, -- variabilele disponibile
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
)
```

#### 4. **telegram_webhook_events**
```sql
telegram_webhook_events (
  id uuid PK,
  update_id bigint UNIQUE NOT NULL,
  event_type text NOT NULL, -- 'message', 'callback_query', etc.
  chat_id text,
  user_id text,
  message_data jsonb,
  processed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
)
```

## 🔧 **API Endpoints**

### 1. **Webhook Handler**
```typescript
// POST /api/telegram/webhook
// Procesează toate update-urile de la Telegram
```

### 2. **Configuration Management**
```typescript
// GET /api/telegram/config?org_id={id}
// Obține configurația Telegram pentru o organizație

// POST /api/telegram/config
// Creează sau actualizează configurația

// PUT /api/telegram/config
// Actualizează configurația existentă

// DELETE /api/telegram/config?id={id}
// Dezactivează configurația
```

## 🎯 **Notification Types**

### 1. **Run Completed**
```typescript
🚀 <b>Run Completed</b>
📊 <b>Module:</b> M07 Risk & Trust
📋 <b>Project:</b> FinTech Compliance
✅ <b>Status:</b> success
💰 <b>Cost:</b> $0.0234
⏱ <b>Duration:</b> 1247ms
👤 <b>User:</b> user123
🕐 <b>Completed:</b> 14:32:15
```

### 2. **Score Update**
```typescript
📊 <b>Score Update</b>
🎯 <b>Module:</b> M07 Risk & Trust
📋 <b>Project:</b> FinTech Compliance
⭐ <b>Composite Score:</b> 87/100
📈 <b>Breakdown:</b>
  • Clarity: 92/100
  • Execution: 88/100
  • Ambiguity: 85/100
  • Alignment: 89/100
  • Business Fit: 91/100
🏆 <b>Verdict:</b> pass
💬 <b>Feedback:</b> Excellent compliance focus
```

### 3. **Daily Report**
```typescript
📈 <b>Daily Report - 18/01/2025</b>
🏢 <b>Organization:</b> FinTech Corp

🔄 <b>Runs:</b> 24 total
  ✅ Successful: 22
  ❌ Failed: 2
  
📊 <b>Scores:</b> 85.3 average
📦 <b>Bundles:</b> 18 exported
💰 <b>Cost:</b> $0.5234
🔤 <b>Tokens:</b> 12450
👥 <b>Active Users:</b> 8

📅 <b>Date:</b> 18/01/2025
⏰ <b>Generated:</b> 09:00:00
```

### 4. **Cost Alert**
```typescript
⚠️ <b>Cost Alert</b>
💰 <b>Current Daily Cost:</b> $4.67
🚨 <b>Threshold:</b> $5.00 (80%)
📊 <b>Usage:</b> 93.4%
🏢 <b>Organization:</b> FinTech Corp

⏰ <b>Alert Time:</b> 14:32:15
```

## 🔄 **Automation & Triggers**

### 1. **Automatic Notifications**
```sql
-- Trigger pentru run completion
create trigger trg_notify_run_completion
  after update on runs
  for each row execute function trigger_notify_run_completion();

-- Trigger pentru score updates
create trigger trg_notify_score_update
  after insert or update on scores
  for each row execute function trigger_notify_score_update();
```

### 2. **Scheduled Reports**
```sql
-- Raport zilnic la 9:00 AM
select cron.schedule('daily-telegram-report', '0 9 * * *', $$
  select send_daily_report(org_id) from orgs;
$$);
```

### 3. **Cost Monitoring**
```sql
-- Verificare cost alerts la fiecare run
create trigger trg_check_cost_alerts
  after insert on runs
  for each row execute function check_cost_alerts(new.org_id);
```

## 🎨 **Message Templates**

### 1. **Default Templates**
```sql
-- Template pentru run completed
'🚀 <b>Run Completed</b>
📊 <b>Module:</b> {{module_title}}
📋 <b>Project:</b> {{project_name}}
✅ <b>Status:</b> {{status}}
💰 <b>Cost:</b> ${{cost}}
⏱ <b>Duration:</b> {{duration}}ms
👤 <b>User:</b> {{user_id}}
🕐 <b>Completed:</b> {{completed_at}}'

-- Template pentru score update
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
💬 <b>Feedback:</b> {{feedback}}'
```

### 2. **Custom Templates**
```sql
-- Org-uri pot crea template-uri proprii
insert into message_templates (org_id, name, type, template, variables) values (
  'org-uuid',
  'custom_run_notification',
  'run_completed',
  '🎯 {{project_name}} - {{module_title}} completed in {{duration}}ms',
  '{"project_name": "string", "module_title": "string", "duration": "integer"}'
);
```

## 🔐 **Security & RLS**

### 1. **Row Level Security**
```sql
-- Telegram configs - doar org-ul propriu
create policy telegram_configs_rw on telegram_configs
  for all using (
    org_id::text = current_setting('request.jwt.claims', true)::jsonb->>'org_id'
  );

-- Notifications - doar org-ul propriu
create policy telegram_notifications_rw on telegram_notifications
  for all using (
    org_id::text = current_setting('request.jwt.claims', true)::jsonb->>'org_id'
  );
```

### 2. **Webhook Security**
```sql
-- Secret token pentru webhook
secret_token: 'promptforge_v3_secret'

-- Verificare în webhook handler
if (request.headers['x-telegram-bot-api-secret-token'] !== secretToken) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

## 🚀 **Setup & Deployment**

### 1. **Database Migration**
```bash
# Aplică migrația Telegram
psql -d promptforge -f cursor/docs/supabase_migrations/0021_telegram_integration.sql
```

### 2. **Webhook Setup**
```bash
# Setează webhook-ul
WEBHOOK_URL=https://yourdomain.com/api/telegram/webhook \
node scripts/setup-telegram-webhook.js
```

### 3. **Environment Configuration**
```bash
# Verifică configurația
curl "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getWebhookInfo"
```

## 🧪 **Testing**

### 1. **Manual Testing**
```bash
# 1. Merge în grupul @makmak131313
# 2. Scrie /start
# 3. Scrie /help
# 4. Scrie /status
# 5. Scrie /daily
```

### 2. **API Testing**
```bash
# Testează webhook-ul
curl -X POST https://yourdomain.com/api/telegram/webhook \
  -H "Content-Type: application/json" \
  -d '{"update_id":123,"message":{"chat":{"id":"@makmak131313"},"text":"/start"}}'
```

### 3. **Database Testing**
```sql
-- Verifică configurația
select * from telegram_configs where org_id = 'your-org-id';

-- Verifică notificările
select * from telegram_notifications order by created_at desc limit 10;

-- Testează funcțiile
select notify_run_completion('run-uuid');
select send_daily_report('org-uuid');
```

## 📊 **Monitoring & Analytics**

### 1. **Notification Metrics**
```sql
-- View pentru analytics notificări
create view v_telegram_analytics as
select 
  org_id,
  date_trunc('day', created_at) as date,
  type,
  status,
  count(*) as total,
  count(case when status = 'sent' then 1 end) as successful,
  count(case when status = 'failed' then 1 end) as failed
from telegram_notifications
group by org_id, date_trunc('day', created_at), type, status;
```

### 2. **Delivery Rate Monitoring**
```sql
-- Verifică rate-ul de delivery
select 
  org_id,
  count(*) as total_notifications,
  count(case when status = 'sent' then 1 end) as successful,
  round(
    (count(case when status = 'sent' then 1 end)::float / count(*)) * 100, 
    2
  ) as delivery_rate
from telegram_notifications
group by org_id;
```

### 3. **Performance Monitoring**
```sql
-- Verifică timpul de răspuns
select 
  type,
  avg(extract(epoch from (sent_at - created_at))) as avg_response_time_seconds,
  max(extract(epoch from (sent_at - created_at))) as max_response_time_seconds
from telegram_notifications
where status = 'sent' and sent_at is not null
group by type;
```

## 🔧 **Troubleshooting**

### 1. **Common Issues**

#### **Webhook not receiving updates**
```bash
# Verifică webhook-ul
curl "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getWebhookInfo"

# Verifică logs
tail -f /var/log/nginx/access.log | grep telegram
```

#### **Bot not responding**
```bash
# Verifică bot info
curl "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getMe"

# Verifică permisiunile în grup
curl -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getChatMember" \
  -H "Content-Type: application/json" \
  -d '{"chat_id":"@makmak131313","user_id":"bot-id"}'
```

#### **Notifications not sending**
```sql
-- Verifică status-ul notificărilor
select * from telegram_notifications 
where status = 'failed' 
order by created_at desc limit 10;

-- Verifică configurația
select * from telegram_configs 
where org_id = 'your-org-id' and is_active = true;
```

### 2. **Debug Commands**
```bash
# Testează bot-ul manual
curl -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" \
  -H "Content-Type: application/json" \
  -d '{"chat_id":"@makmak131313","text":"🧪 Test message","parse_mode":"HTML"}'

# Verifică webhook-ul
curl "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getWebhookInfo"
```

## 📈 **Performance Optimization**

### 1. **Database Indexes**
```sql
-- Indexuri pentru performanță
create index idx_telegram_notifications_org_status on telegram_notifications(org_id, status);
create index idx_telegram_notifications_type_sent on telegram_notifications(type, sent_at);
create index idx_telegram_configs_org_active on telegram_configs(org_id, is_active);
```

### 2. **Batch Processing**
```sql
-- Procesare în batch pentru notificări multe
create function process_notification_batch()
returns void as $$
begin
  -- Procesează notificările în batch
  update telegram_notifications
  set status = 'processing'
  where status = 'pending'
  and created_at < now() - interval '1 minute';
end;
$$ language plpgsql;
```

### 3. **Rate Limiting**
```sql
-- Rate limiting pentru notificări
create function check_notification_rate_limit(org_uuid uuid, max_per_hour int default 100)
returns boolean as $$
declare
  current_count int;
begin
  select count(*) into current_count
  from telegram_notifications
  where org_id = org_uuid
    and created_at >= now() - interval '1 hour';
  
  return current_count < max_per_hour;
end;
$$ language plpgsql;
```

## 🎯 **Future Enhancements**

### 1. **Advanced Features**
- **Media Support** - Trimite imagini, documente, PDF-uri
- **Voice Messages** - Notificări vocale
- **Video Calls** - Integrare cu video calls pentru support
- **Channels** - Suport pentru canale publice

### 2. **AI Integration**
- **Smart Notifications** - Notificări inteligente bazate pe context
- **Natural Language** - Comenzi în limbaj natural
- **Predictive Alerts** - Alerte predictive bazate pe ML
- **Sentiment Analysis** - Analiză sentiment pentru feedback

### 3. **Enterprise Features**
- **Multi-bot Support** - Suport pentru multiple bot-uri per org
- **Advanced Security** - 2FA, encryption, audit trails
- **Compliance** - GDPR, SOC2, HIPAA compliance
- **Integration APIs** - Webhook-uri pentru sisteme externe

## 📚 **Resources**

### 1. **Documentation**
- [Telegram Bot API](https://core.telegram.org/bots/api)
- [Telegram Bot Development](https://core.telegram.org/bots)
- [Webhook Setup Guide](https://core.telegram.org/bots/webhooks)

### 2. **Tools**
- [BotFather](https://t.me/botfather) - Creează și configurează bot-uri
- [Telegram Webhook Tester](https://webhook.site/) - Testează webhook-urile
- [Telegram Bot Analytics](https://botanalytics.co/) - Analytics pentru bot-uri

### 3. **Community**
- [Telegram Bot Developers](https://t.me/BotDevelopment)
- [Telegram API Support](https://t.me/TelegramAPI)
- [PROMPTFORGE Community](https://t.me/promptforge)

## 🎉 **Conclusion**

Integrarea Telegram pentru PROMPTFORGE™ v3 oferă:

✅ **Real-time Notifications** - Notificări instant pentru toate evenimentele importante  
✅ **Rich Interaction** - Comenzi interactive și mesaje formatate frumos  
✅ **Automation** - Rapoarte automate și alerte inteligente  
✅ **Scalability** - Suport pentru multiple organizații și utilizatori  
✅ **Security** - RLS, webhook security, și audit trails  
✅ **Monitoring** - Analytics comprehensive și debugging tools  
✅ **Flexibility** - Template-uri customizabile și configurare avansată  

Bot-ul @cusnir_bot este gata să primească notificări și să ofere suport interactiv pentru echipa PROMPTFORGE! 🚀
