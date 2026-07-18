-- 1. Add billing and subscription tracking fields to companies table
alter table public.companies add column if not exists billing_status text not null default 'free';
alter table public.companies add column if not exists plan_id text;
alter table public.companies add column if not exists subscription_id text;
alter table public.companies add column if not exists current_period_end timestamptz;

-- 2. Create billing_transactions table for idempotent payment logs
create table if not exists public.billing_transactions (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  razorpay_payment_id text unique not null,
  razorpay_order_id text not null,
  razorpay_signature text not null,
  amount integer not null check (amount > 0),
  currency text not null default 'INR',
  status text not null,
  created_at timestamptz not null default now()
);

-- 3. Enable RLS on billing_transactions
alter table public.billing_transactions enable row level security;
drop policy if exists "Company members can read billing_transactions" on public.billing_transactions;
create policy "Company members can read billing_transactions"
  on public.billing_transactions for select using (public.is_company_member(company_id));
