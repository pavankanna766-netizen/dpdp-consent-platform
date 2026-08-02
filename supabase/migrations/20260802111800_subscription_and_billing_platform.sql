-- ============================================================
-- PRIVYSTACK — SUBSCRIPTION & BILLING PLATFORM MIGRATION
-- Migration: 20260802111800_subscription_and_billing_platform.sql
-- Description: Creates subscriptions, company_usage, and invoices tables
--              supporting commercial tiers (Starter, Pro, Business, Enterprise),
--              usage metering resets, Razorpay webhooks, and invoice generation.
-- Idempotent & Zero-Downtime: Uses IF NOT EXISTS guards and RLS policies.
-- ============================================================

BEGIN;

-- 1. Create Subscriptions Table
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid UNIQUE NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  plan_tier text NOT NULL DEFAULT 'starter',
  billing_cycle text NOT NULL DEFAULT 'monthly',
  status text NOT NULL DEFAULT 'active',
  current_period_start timestamptz NOT NULL DEFAULT now(),
  current_period_end timestamptz NOT NULL DEFAULT (now() + interval '30 days'),
  razorpay_customer_id text,
  razorpay_subscription_id text,
  cancel_at_period_end boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Domain CHECK Constraint for Subscriptions
DO $$ BEGIN
  ALTER TABLE public.subscriptions DROP CONSTRAINT IF EXISTS chk_subscription_status;
  ALTER TABLE public.subscriptions ADD CONSTRAINT chk_subscription_status
    CHECK (status IN ('trialing', 'active', 'past_due', 'canceled', 'unpaid', 'paused')) NOT VALID;
  ALTER TABLE public.subscriptions VALIDATE CONSTRAINT chk_subscription_status;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- 3. Create Company Usage Metering Table
CREATE TABLE IF NOT EXISTS public.company_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid UNIQUE NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  scans_count integer NOT NULL DEFAULT 0,
  api_requests_count integer NOT NULL DEFAULT 0,
  policies_generated_count integer NOT NULL DEFAULT 0,
  pdf_exports_count integer NOT NULL DEFAULT 0,
  billing_period_start timestamptz NOT NULL DEFAULT date_trunc('month', now()),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 4. Create Invoices Table
CREATE TABLE IF NOT EXISTS public.invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  invoice_number text UNIQUE NOT NULL,
  amount numeric(10,2) NOT NULL,
  currency text NOT NULL DEFAULT 'INR',
  status text NOT NULL DEFAULT 'paid',
  payment_method text NOT NULL DEFAULT 'razorpay',
  receipt_url text,
  pdf_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 5. Enable RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies
DROP POLICY IF EXISTS "Company members can view subscription" ON public.subscriptions;
CREATE POLICY "Company members can view subscription"
  ON public.subscriptions FOR ALL
  USING (public.is_company_member(company_id));

DROP POLICY IF EXISTS "Company members can view usage" ON public.company_usage;
CREATE POLICY "Company members can view usage"
  ON public.company_usage FOR ALL
  USING (public.is_company_member(company_id));

DROP POLICY IF EXISTS "Company members can view invoices" ON public.invoices;
CREATE POLICY "Company members can view invoices"
  ON public.invoices FOR ALL
  USING (public.is_company_member(company_id));

-- 7. Automated updated_at trigger
DROP TRIGGER IF EXISTS trg_subscriptions_updated_at ON public.subscriptions;
CREATE TRIGGER trg_subscriptions_updated_at
BEFORE UPDATE ON public.subscriptions
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_timestamp();

-- 8. High-Performance Index
CREATE INDEX IF NOT EXISTS idx_subscriptions_company
  ON public.subscriptions (company_id, status);

COMMIT;
