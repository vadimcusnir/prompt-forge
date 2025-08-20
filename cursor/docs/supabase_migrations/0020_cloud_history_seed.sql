-- 0020_cloud_history_seed.sql — Seed data pentru cloud history și multi-user
begin;

-- 1. Seed plans cu feature flags
insert into plans (code, name, flags) values
  ('pilot', 'Pilot', '{"canExportPDF":false,"canExportJSON":true,"canUseGptTestReal":false,"hasCloudHistory":false,"hasEvaluatorAI":false,"maxRunsPerDay":10,"maxProjects":1}'),
  ('pro', 'Pro', '{"canExportPDF":true,"canExportJSON":true,"canUseGptTestReal":true,"hasCloudHistory":true,"hasEvaluatorAI":true,"maxRunsPerDay":100,"maxProjects":5}'),
  ('enterprise', 'Enterprise', '{"canExportPDF":true,"canExportJSON":true,"canUseGptTestReal":true,"hasCloudHistory":true,"hasEvaluatorAI":true,"hasAPI":true,"maxRunsPerDay":1000,"maxProjects":50,"customModules":true}')
on conflict (code) do update set
  name = excluded.name,
  flags = excluded.flags;

-- 2. Seed domain_configs pentru industry profiles
insert into domain_configs (industry, jargon, kpis, compliance_notes, default_output_format, risk_level, style_bias) values
  ('FinTech', 
   '["compliance","regulatory","risk_management","kyc","aml","pci_dss","gdpr"]',
   '["conversion_rate","fraud_detection","regulatory_compliance","user_trust"]',
   'Strict regulatory compliance required. Focus on risk mitigation and user protection.',
   'playbook',
   'high',
   '{"tone":"professional","style":"precise","risk_awareness":"high"}'
  ),
  ('E-commerce', 
   '["conversion_optimization","cart_abandonment","customer_lifetime_value","retention"]',
   '["conversion_rate","average_order_value","customer_retention","lifetime_value"]',
   'Focus on user experience and conversion optimization. GDPR compliance for EU customers.',
   'checklist',
   'medium',
   '{"tone":"friendly","style":"actionable","urgency":"medium"}'
  ),
  ('SaaS', 
   '["product_market_fit","user_onboarding","feature_adoption","churn_rate"]',
   '["user_activation","feature_adoption","churn_rate","expansion_revenue"]',
   'Focus on user experience and product adoption. Clear value proposition required.',
   'spec',
   'medium',
   '{"tone":"helpful","style":"clear","user_focus":"high"}'
  ),
  ('Education', 
   '["learning_outcomes","student_engagement","knowledge_retention","assessment"]',
   '["completion_rate","knowledge_retention","student_satisfaction","learning_outcomes"]',
   'Focus on learning effectiveness and student engagement. Accessibility compliance required.',
   'playbook',
   'low',
   '{"tone":"encouraging","style":"educational","clarity":"high"}'
  ),
  ('Healthcare', 
   '["patient_safety","clinical_guidelines","evidence_based","compliance"]',
   '["patient_outcomes","safety_incidents","compliance_rate","efficiency"]',
   'Critical safety requirements. Must follow clinical guidelines and regulatory standards.',
   'checklist',
   'critical',
   '{"tone":"professional","style":"precise","safety_focus":"critical"}'
  ),
  ('Legal', 
   '["legal_compliance","case_law","regulatory_requirements","risk_management"]',
   '["compliance_rate","case_outcomes","client_satisfaction","efficiency"]',
   'Legal accuracy is critical. Must follow current case law and regulatory requirements.',
   'spec',
   'high',
   '{"tone":"formal","style":"precise","legal_accuracy":"critical"}'
  ),
  ('Consulting', 
   '["client_engagement","deliverables","project_management","value_delivery"]',
   '["client_satisfaction","project_success","value_delivered","repeat_business"]',
   'Focus on client value and project delivery. Clear communication and expectations.',
   'playbook',
   'medium',
   '{"tone":"professional","style":"strategic","client_focus":"high"}'
  ),
  ('Marketing', 
   '["brand_awareness","lead_generation","conversion_optimization","roi"]',
   '["brand_awareness","lead_quality","conversion_rate","roi"]',
   'Focus on measurable outcomes and ROI. Brand consistency and audience targeting.',
   'checklist',
   'low',
   '{"tone":"engaging","style":"creative","measurability":"high"}'
  )
on conflict (industry) do update set
  jargon = excluded.jargon,
  kpis = excluded.kpis,
  compliance_notes = excluded.compliance_notes,
  default_output_format = excluded.default_output_format,
  risk_level = excluded.risk_level,
  style_bias = excluded.style_bias;

-- 3. Seed parameter_sets pentru engine 7D
insert into parameter_sets (org_id, domain, scale, urgency, complexity, resources, application, output_formats, overrides) values
  (null, 'FinTech', 'enterprise', 'crisis', 'expert', 'full_stack_org', 'crisis_response', '{playbook,json,checklist}', '{"compliance_focus":"high","risk_mitigation":"critical"}'),
  (null, 'E-commerce', 'startup', 'sprint', 'standard', 'lean_team', 'implementation', '{checklist,playbook}', '{"conversion_focus":"high","user_experience":"priority"}'),
  (null, 'SaaS', 'corporate', 'planned', 'advanced', 'agency_stack', 'strategy', '{spec,playbook,json}', '{"product_focus":"high","user_adoption":"priority"}'),
  (null, 'Education', 'smb', 'low', 'foundational', 'solo', 'training', '{playbook,checklist}', '{"learning_focus":"high","accessibility":"required"}'),
  (null, 'Healthcare', 'enterprise', 'crisis', 'expert', 'full_stack_org', 'crisis_response', '{checklist,playbook}', '{"safety_focus":"critical","compliance":"mandatory"}'),
  (null, 'Legal', 'corporate', 'planned', 'advanced', 'agency_stack', 'audit', '{spec,checklist}', '{"legal_accuracy":"critical","compliance":"mandatory"}'),
  (null, 'Consulting', 'boutique_agency', 'sprint', 'standard', 'agency_stack', 'implementation', '{playbook,spec}', '{"client_focus":"high","value_delivery":"priority"}'),
  (null, 'Marketing', 'startup', 'pilot', 'standard', 'lean_team', 'experimentation', '{checklist,playbook}', '{"creativity":"high","measurability":"required"}');

-- 4. Creează funcție pentru generarea automată de parameter_sets per org
create or replace function generate_org_parameter_sets(org_uuid uuid)
returns void as $$
declare
  domain_record record;
begin
  -- Generează parameter_sets pentru fiecare domain disponibil
  for domain_record in select industry from domain_configs loop
    insert into parameter_sets (org_id, domain, scale, urgency, complexity, resources, application, output_formats, overrides)
    values (
      org_uuid,
      domain_record.industry,
      'startup', -- default scale
      'planned', -- default urgency
      'standard', -- default complexity
      'lean_team', -- default resources
      'implementation', -- default application
      '{checklist,playbook}', -- default output formats
      '{}' -- no overrides initially
    );
  end loop;
end;
$$ language plpgsql security definer;

-- 5. Creează funcție pentru verificarea entitlements în views
create or replace function has_cloud_history_access(org_uuid uuid, user_uuid uuid default null)
returns boolean as $$
begin
  return check_entitlement('hasCloudHistory', user_uuid);
end;
$$ language plpgsql security definer;

-- 6. Creează funcție pentru verificarea dacă user-ul poate exporta PDF
create or replace function can_export_pdf(org_uuid uuid, user_uuid uuid default null)
returns boolean as $$
begin
  return check_entitlement('canExportPDF', user_uuid);
end;
$$ language plpgsql security definer;

-- 7. Creează funcție pentru verificarea dacă user-ul poate folosi Evaluator AI
create or replace function can_use_evaluator_ai(org_uuid uuid, user_uuid uuid default null)
returns boolean as $$
begin
  return check_entitlement('hasEvaluatorAI', user_uuid);
end;
$$ language plpgsql security definer;

-- 8. Creează funcție pentru verificarea limitelor de runs per day
create or replace function check_runs_limit(org_uuid uuid, user_uuid uuid default null)
returns boolean as $$
declare
  max_runs int;
  current_runs int;
begin
  -- Obține limita din entitlements
  select cast(e.value as int) into max_runs
  from entitlements e
  where e.org_id = org_uuid
    and e.flag = 'maxRunsPerDay'
    and (e.user_id = user_uuid or e.user_id is null)
    and (e.expires_at is null or e.expires_at > now())
  limit 1;
  
  if max_runs is null then
    return true; -- no limit set
  end if;
  
  -- Verifică câte runs a făcut user-ul astăzi
  select count(*) into current_runs
  from runs r
  where r.org_id = org_uuid
    and r.user_id = user_uuid
    and r.created_at >= date_trunc('day', now());
  
  return current_runs < max_runs;
end;
$$ language plpgsql security definer;

-- 9. Creează funcție pentru verificarea limitelor de proiecte
create or replace function check_projects_limit(org_uuid uuid)
returns boolean as $$
declare
  max_projects int;
  current_projects int;
begin
  -- Obține limita din entitlements org-wide
  select cast(e.value as int) into max_projects
  from entitlements e
  where e.org_id = org_uuid
    and e.flag = 'maxProjects'
    and e.user_id is null
    and (e.expires_at is null or e.expires_at > now())
  limit 1;
  
  if max_projects is null then
    return true; -- no limit set
  end if;
  
  -- Verifică câte proiecte are org-ul
  select count(*) into current_projects
  from projects p
  where p.org_id = org_uuid;
  
  return current_projects < max_projects;
end;
$$ language plpgsql security definer;

-- 10. Creează trigger pentru generarea automată de parameter_sets când se creează un org nou
create or replace function trigger_generate_org_parameter_sets()
returns trigger as $$
begin
  if tg_op = 'INSERT' then
    perform generate_org_parameter_sets(new.id);
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_generate_org_parameter_sets on orgs;
create trigger trg_generate_org_parameter_sets
  after insert on orgs
  for each row execute function trigger_generate_org_parameter_sets();

-- 11. Creează funcție pentru audit trail
create or replace function log_audit_event(
  table_name text,
  operation text,
  record_id uuid,
  old_data jsonb default null,
  new_data jsonb default null
)
returns void as $$
begin
  -- Aici poți implementa logarea în un tabel de audit
  -- Pentru moment, doar logăm în console
  raise notice 'AUDIT: % on % table, record_id: %, old: %, new: %', 
    operation, table_name, record_id, old_data, new_data;
end;
$$ language plpgsql;

-- 12. Creează funcție pentru cleanup automat al datelor vechi
create or replace function cleanup_old_data()
returns void as $$
begin
  -- Șterge runs mai vechi de 90 de zile pentru org-urile fără cloud history
  delete from runs r
  where r.created_at < now() - interval '90 days'
    and exists (
      select 1 from orgs o
      where o.id = r.org_id
        and not has_cloud_history_access(o.id)
    );
  
  -- Șterge bundles mai vechi de 90 de zile pentru org-urile fără cloud history
  delete from bundles b
  where b.exported_at < now() - interval '90 days'
    and exists (
      select 1 from orgs o
      where o.id = b.org_id
        and not has_cloud_history_access(o.id)
    );
end;
$$ language plpgsql;

-- 13. Creează job pentru cleanup automat (dacă folosești pg_cron)
-- select cron.schedule('cleanup-old-data', '0 2 * * *', 'select cleanup_old_data();');

commit;
