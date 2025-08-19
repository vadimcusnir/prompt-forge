-- 0014_stripe_integration.sql — Stripe integration tables for billing
begin;

-- Stripe customers table - links with users
create table if not exists stripe_customers (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  stripe_customer_id text unique not null,
  email text not null,
  name text,
  metadata jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Stripe products table - available products
create table if not exists stripe_products (
  id uuid primary key default uuid_generate_v4(),
  stripe_product_id text unique not null,
  name text not null,
  description text,
  active boolean default true,
  metadata jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Stripe prices table - product pricing
create table if not exists stripe_prices (
  id uuid primary key default uuid_generate_v4(),
  stripe_price_id text unique not null,
  product_id uuid references stripe_products(id) on delete cascade,
  stripe_product_id text not null,
  active boolean default true,
  currency text default 'usd',
  unit_amount integer not null, -- amount in cents
  recurring jsonb, -- for subscriptions: {interval: 'month', interval_count: 1}
  metadata jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Stripe subscriptions table - user subscriptions
create table if not exists stripe_subscriptions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  stripe_customer_id text not null,
  stripe_subscription_id text unique not null,
  stripe_price_id text not null,
  product_id uuid references stripe_products(id),
  status text not null, -- 'active', 'canceled', 'past_due', 'unpaid', 'trialing'
  current_period_start timestamptz not null,
  current_period_end timestamptz not null,
  cancel_at_period_end boolean default false,
  canceled_at timestamptz,
  trial_start timestamptz,
  trial_end timestamptz,
  metadata jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Stripe webhooks log table
create table if not exists stripe_webhooks (
  id uuid primary key default uuid_generate_v4(),
  stripe_event_id text unique not null,
  event_type text not null,
  event_data jsonb not null,
  processed boolean default false,
  processed_at timestamptz,
  error_message text,
  created_at timestamptz default now()
);

-- Stripe invoices table - payment history
create table if not exists stripe_invoices (
  id uuid primary key default uuid_generate_v4(),
  stripe_invoice_id text unique not null,
  stripe_customer_id text not null,
  stripe_subscription_id text,
  amount_paid integer not null, -- amount in cents
  currency text default 'usd',
  status text not null, -- 'paid', 'open', 'void', 'uncollectible'
  invoice_pdf text,
  hosted_invoice_url text,
  metadata jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Stripe payment intents table - payment tracking
create table if not exists stripe_payment_intents (
  id uuid primary key default uuid_generate_v4(),
  stripe_payment_intent_id text unique not null,
  stripe_customer_id text not null,
  amount integer not null, -- amount in cents
  currency text default 'usd',
  status text not null, -- 'requires_payment_method', 'requires_confirmation', 'requires_action', 'processing', 'requires_capture', 'canceled', 'succeeded'
  payment_method_types text[],
  metadata jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS on all tables
alter table stripe_customers enable row level security;
alter table stripe_products enable row level security;
alter table stripe_prices enable row level security;
alter table stripe_subscriptions enable row level security;
alter table stripe_webhooks enable row level security;
alter table stripe_invoices enable row level security;
alter table stripe_payment_intents enable row level security;

-- RLS Policies for stripe_customers
drop policy if exists stripe_customers_user_read on stripe_customers;
drop policy if exists stripe_customers_user_insert on stripe_customers;
drop policy if exists stripe_customers_admin_rw on stripe_customers;

create policy stripe_customers_user_read on stripe_customers
  for select to authenticated
  using (user_id = auth.uid());

create policy stripe_customers_user_insert on stripe_customers
  for insert to authenticated
  with check (user_id = auth.uid());

create policy stripe_customers_admin_rw on stripe_customers
  for all to authenticated
  using (auth.jwt() ->> 'role' = 'admin')
  with check (auth.jwt() ->> 'role' = 'admin');

-- RLS Policies for stripe_products (read-only for users)
drop policy if exists stripe_products_public_read on stripe_products;
drop policy if exists stripe_products_admin_rw on stripe_products;

create policy stripe_products_public_read on stripe_products
  for select to authenticated
  using (active = true);

create policy stripe_products_admin_rw on stripe_products
  for all to authenticated
  using (auth.jwt() ->> 'role' = 'admin')
  with check (auth.jwt() ->> 'role' = 'admin');

-- RLS Policies for stripe_prices (read-only for users)
drop policy if exists stripe_prices_public_read on stripe_prices;
drop policy if exists stripe_prices_admin_rw on stripe_prices;

create policy stripe_prices_public_read on stripe_prices
  for select to authenticated
  using (active = true);

create policy stripe_prices_admin_rw on stripe_prices
  for all to authenticated
  using (auth.jwt() ->> 'role' = 'admin')
  with check (auth.jwt() ->> 'role' = 'admin');

-- RLS Policies for stripe_subscriptions
drop policy if exists stripe_subscriptions_user_read on stripe_subscriptions;
drop policy if exists stripe_subscriptions_admin_rw on stripe_subscriptions;

create policy stripe_subscriptions_user_read on stripe_subscriptions
  for select to authenticated
  using (user_id = auth.uid());

create policy stripe_subscriptions_admin_rw on stripe_subscriptions
  for all to authenticated
  using (auth.jwt() ->> 'role' = 'admin')
  with check (auth.jwt() ->> 'role' = 'admin');

-- RLS Policies for stripe_webhooks (admin only)
drop policy if exists stripe_webhooks_admin_rw on stripe_webhooks;

create policy stripe_webhooks_admin_rw on stripe_webhooks
  for all to authenticated
  using (auth.jwt() ->> 'role' = 'admin')
  with check (auth.jwt() ->> 'role' = 'admin');

-- RLS Policies for stripe_invoices
drop policy if exists stripe_invoices_user_read on stripe_invoices;
drop policy if exists stripe_invoices_admin_rw on stripe_invoices;

create policy stripe_invoices_user_read on stripe_invoices
  for select to authenticated
  using (stripe_customer_id in (
    select stripe_customer_id from stripe_customers where user_id = auth.uid()
  ));

create policy stripe_invoices_admin_rw on stripe_invoices
  for all to authenticated
  using (auth.jwt() ->> 'role' = 'admin')
  with check (auth.jwt() ->> 'role' = 'admin');

-- RLS Policies for stripe_payment_intents
drop policy if exists stripe_payment_intents_user_read on stripe_payment_intents;
drop policy if exists stripe_payment_intents_admin_rw on stripe_payment_intents;

create policy stripe_payment_intents_user_read on stripe_payment_intents
  for select to authenticated
  using (stripe_customer_id in (
    select stripe_customer_id from stripe_customers where user_id = auth.uid()
  ));

create policy stripe_payment_intents_admin_rw on stripe_payment_intents
  for all to authenticated
  using (auth.jwt() ->> 'role' = 'admin')
  with check (auth.jwt() ->> 'role' = 'admin');

-- Create indexes for performance
create index if not exists idx_stripe_customers_user_id on stripe_customers(user_id);
create index if not exists idx_stripe_customers_stripe_id on stripe_customers(stripe_customer_id);
create index if not exists idx_stripe_products_active on stripe_products(active);
create index if not exists idx_stripe_prices_product_id on stripe_prices(product_id);
create index if not exists idx_stripe_prices_active on stripe_prices(active);
create index if not exists idx_stripe_subscriptions_user_id on stripe_subscriptions(user_id);
create index if not exists idx_stripe_subscriptions_status on stripe_subscriptions(status);
create index if not exists idx_stripe_webhooks_event_type on stripe_webhooks(event_type);
create index if not exists idx_stripe_webhooks_processed on stripe_webhooks(processed);
create index if not exists idx_stripe_invoices_customer_id on stripe_invoices(stripe_customer_id);
create index if not exists idx_stripe_payment_intents_customer_id on stripe_payment_intents(stripe_customer_id);

-- Insert default products (these will be synced from Stripe)
insert into stripe_products (stripe_product_id, name, description, active) values
  ('promptforge_free', 'PROMPTFORGE™ Free', 'Free plan with basic features', true),
  ('promptforge_creator', 'PROMPTFORGE™ Creator', 'Creator plan for content creators', true),
  ('promptforge_pro', 'PROMPTFORGE™ Pro', 'Professional plan for businesses', true),
  ('promptforge_enterprise', 'PROMPTFORGE™ Enterprise', 'Enterprise plan with custom features', true),
  ('industry_ecommerce', 'E-commerce Industry Pack', 'Specialized modules for e-commerce', true),
  ('industry_education', 'Education Industry Pack', 'Specialized modules for education', true),
  ('industry_fintech', 'FinTech Industry Pack', 'Specialized modules for fintech', true)
on conflict (stripe_product_id) do nothing;

-- Insert default prices (these will be synced from Stripe)
insert into stripe_prices (stripe_price_id, product_id, stripe_product_id, unit_amount, recurring, active) values
  ('price_free', (select id from stripe_products where stripe_product_id = 'promptforge_free'), 'promptforge_free', 0, '{"interval": "month", "interval_count": 1}', true),
  ('price_creator', (select id from stripe_products where stripe_product_id = 'promptforge_creator'), 'promptforge_creator', 1900, '{"interval": "month", "interval_count": 1}', true),
  ('price_pro', (select id from stripe_products where stripe_product_id = 'promptforge_pro'), 'promptforge_pro', 4900, '{"interval": "month", "interval_count": 1}', true),
  ('price_enterprise', (select id from stripe_products where stripe_product_id = 'promptforge_enterprise'), 'promptforge_enterprise', 19900, '{"interval": "month", "interval_count": 1}', true),
  ('price_ecommerce', (select id from stripe_products where stripe_product_id = 'industry_ecommerce'), 'industry_ecommerce', 9900, null, true),
  ('price_education', (select id from stripe_products where stripe_product_id = 'industry_education'), 'industry_education', 7900, null, true),
  ('price_fintech', (select id from stripe_products where stripe_product_id = 'industry_fintech'), 'industry_fintech', 12900, null, true)
on conflict (stripe_price_id) do nothing;

commit;
