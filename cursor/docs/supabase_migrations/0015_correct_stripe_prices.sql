-- 0015_correct_stripe_prices.sql — Corectarea prețurilor Stripe conform /cursor
begin;

-- Șterge prețurile existente
delete from stripe_prices;
delete from stripe_products;

-- Reinserează produsele cu prețurile corecte conform /cursor
insert into stripe_products (stripe_product_id, name, description, active) values
  ('promptforge_free', 'PROMPTFORGE™ Free', 'Free plan with basic features - 3 modules (M01, M10, M18), basic export (.txt), 7 days retention', true),
  ('promptforge_creator', 'PROMPTFORGE™ Creator', 'Creator plan for content creators - ALL modules, .md export, 30 days retention, local history', true),
  ('promptforge_pro', 'PROMPTFORGE™ Pro', 'Professional plan for businesses - ALL modules, .md/.json/.pdf export, GPT live test, Evaluator AI, 90 days retention', true),
  ('promptforge_enterprise', 'PROMPTFORGE™ Enterprise', 'Enterprise plan with custom features - Everything + API, WhiteLabel, Bundle ZIP, multi-seat, unlimited retention', true),
  ('industry_ecommerce', 'E-commerce Industry Pack', 'Specialized modules for e-commerce - 6 e-commerce specific modules, KPI templates, conversion optimization, playbook & checklist', true),
  ('industry_education', 'Education Industry Pack', 'Specialized modules for education - 6 education modules, curriculum templates, assessment tools', true),
  ('industry_fintech', 'FinTech Industry Pack', 'Specialized modules for fintech - 6 fintech modules, compliance templates, risk management', true)
on conflict (stripe_product_id) do nothing;

-- Reinserează prețurile cu valorile corecte
insert into stripe_prices (stripe_price_id, product_id, stripe_product_id, unit_amount, currency, recurring, active) values
  -- Free plan
  ('price_free', (select id from stripe_products where stripe_product_id = 'promptforge_free'), 'promptforge_free', 0, 'eur', '{"interval": "month", "interval_count": 1}', true),
  
  -- Creator plan - monthly și yearly
  ('price_creator_monthly', (select id from stripe_products where stripe_product_id = 'promptforge_creator'), 'promptforge_creator', 2900, 'eur', '{"interval": "month", "interval_count": 1}', true),
  ('price_creator_yearly', (select id from stripe_products where stripe_product_id = 'promptforge_creator'), 'promptforge_creator', 29000, 'eur', '{"interval": "year", "interval_count": 1}', true),
  
  -- Pro plan - monthly și yearly
  ('price_pro_monthly', (select id from stripe_products where stripe_product_id = 'promptforge_pro'), 'promptforge_pro', 7900, 'eur', '{"interval": "month", "interval_count": 1}', true),
  ('price_pro_yearly', (select id from stripe_products where stripe_product_id = 'promptforge_pro'), 'promptforge_pro', 79000, 'eur', '{"interval": "year", "interval_count": 1}', true),
  
  -- Enterprise plan - custom pricing
  ('price_enterprise_custom', (select id from stripe_products where stripe_product_id = 'promptforge_enterprise'), 'promptforge_enterprise', 0, 'eur', null, true),
  
  -- Industry packs - yearly
  ('price_ecommerce_yearly', (select id from stripe_products where stripe_product_id = 'industry_ecommerce'), 'industry_ecommerce', 149000, 'eur', '{"interval": "year", "interval_count": 1}', true),
  ('price_education_yearly', (select id from stripe_products where stripe_product_id = 'industry_education'), 'industry_education', 149000, 'eur', '{"interval": "year", "interval_count": 1}', true),
  ('price_fintech_yearly', (select id from stripe_products where stripe_product_id = 'industry_fintech'), 'industry_fintech', 199000, 'eur', '{"interval": "year", "interval_count": 1}', true)
on conflict (stripe_price_id) do nothing;

commit;
