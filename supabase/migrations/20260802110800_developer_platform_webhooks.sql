-- ============================================================
-- PRIVYSTACK — DEVELOPER PLATFORM & WEBHOOK INFRASTRUCTURE MIGRATION
-- Migration: 20260802110800_developer_platform_webhooks.sql
-- Description: Creates webhook_subscriptions and webhook_deliveries tables
--              supporting HMAC SHA-256 signed webhooks, replay protection,
--              exponential backoff retries, and delivery audit history.
-- Idempotent & Zero-Downtime: Uses IF NOT EXISTS guards and RLS policies.
-- ============================================================

BEGIN;

-- 1. Create Webhook Subscriptions Table
CREATE TABLE IF NOT EXISTS public.webhook_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  url text NOT NULL,
  secret text NOT NULL,
  events jsonb NOT NULL DEFAULT '["*"]'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  failure_count integer NOT NULL DEFAULT 0,
  disabled_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Create Webhook Deliveries Table
CREATE TABLE IF NOT EXISTS public.webhook_deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  subscription_id uuid NOT NULL REFERENCES public.webhook_subscriptions(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  payload jsonb NOT NULL,
  signature text NOT NULL,
  response_status integer,
  response_body text,
  attempts integer NOT NULL DEFAULT 1,
  status text NOT NULL DEFAULT 'delivered',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 3. Domain CHECK Constraint for Webhook Delivery Status
DO $$ BEGIN
  ALTER TABLE public.webhook_deliveries DROP CONSTRAINT IF EXISTS chk_webhook_delivery_status;
  ALTER TABLE public.webhook_deliveries ADD CONSTRAINT chk_webhook_delivery_status
    CHECK (status IN ('delivered', 'failed', 'retrying', 'dlq')) NOT VALID;
  ALTER TABLE public.webhook_deliveries VALIDATE CONSTRAINT chk_webhook_delivery_status;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- 4. Enable RLS
ALTER TABLE public.webhook_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_deliveries ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies
DROP POLICY IF EXISTS "Company members can manage webhook subscriptions" ON public.webhook_subscriptions;
CREATE POLICY "Company members can manage webhook subscriptions"
  ON public.webhook_subscriptions FOR ALL
  USING (public.is_company_member(company_id));

DROP POLICY IF EXISTS "Company members can view webhook deliveries" ON public.webhook_deliveries;
CREATE POLICY "Company members can view webhook deliveries"
  ON public.webhook_deliveries FOR ALL
  USING (public.is_company_member(company_id));

-- 6. Automated updated_at trigger
DROP TRIGGER IF EXISTS trg_webhook_subscriptions_updated_at ON public.webhook_subscriptions;
CREATE TRIGGER trg_webhook_subscriptions_updated_at
BEFORE UPDATE ON public.webhook_subscriptions
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_timestamp();

-- 7. High-Performance Index
CREATE INDEX IF NOT EXISTS idx_webhook_subscriptions_company
  ON public.webhook_subscriptions (company_id, is_active);

COMMIT;
