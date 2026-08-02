-- ============================================================
-- PRIVYSTACK — ENTERPRISE NOTIFICATION PLATFORM MIGRATION
-- Migration: 20260802105500_notification_platform.sql
-- Description: Creates notification_preferences and notification_logs tables
--              supporting event-driven multi-provider notifications (Resend/SMTP),
--              delivery tracking, bounce handling, and statutory compliance alerts.
-- Idempotent & Zero-Downtime: Uses IF NOT EXISTS guards and RLS policies.
-- ============================================================

BEGIN;

-- 1. Create Notification Preferences Table
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  user_email text NOT NULL,
  preferences jsonb NOT NULL DEFAULT '{"security_alerts": true, "dsar_updates": true, "compliance_reminders": true, "billing_notices": true}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (company_id, user_email)
);

-- 2. Create Notification Delivery Logs Table
CREATE TABLE IF NOT EXISTS public.notification_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  recipient_email text NOT NULL,
  subject text NOT NULL,
  provider text NOT NULL DEFAULT 'resend',
  status text NOT NULL DEFAULT 'sent',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  idempotency_key text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 3. Domain CHECK Constraint for Delivery Status
DO $$ BEGIN
  ALTER TABLE public.notification_logs DROP CONSTRAINT IF EXISTS chk_notification_log_status;
  ALTER TABLE public.notification_logs ADD CONSTRAINT chk_notification_log_status
    CHECK (status IN ('queued', 'sent', 'delivered', 'bounced', 'failed')) NOT VALID;
  ALTER TABLE public.notification_logs VALIDATE CONSTRAINT chk_notification_log_status;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- 4. Enable RLS
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies
DROP POLICY IF EXISTS "Company members can manage notification preferences" ON public.notification_preferences;
CREATE POLICY "Company members can manage notification preferences"
  ON public.notification_preferences FOR ALL
  USING (public.is_company_member(company_id));

DROP POLICY IF EXISTS "Company members can view notification logs" ON public.notification_logs;
CREATE POLICY "Company members can view notification logs"
  ON public.notification_logs FOR ALL
  USING (public.is_company_member(company_id));

-- 6. Automated updated_at trigger
DROP TRIGGER IF EXISTS trg_notification_preferences_updated_at ON public.notification_preferences;
CREATE TRIGGER trg_notification_preferences_updated_at
BEFORE UPDATE ON public.notification_preferences
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_timestamp();

-- 7. High-Performance Index
CREATE INDEX IF NOT EXISTS idx_notification_logs_lookup
  ON public.notification_logs (company_id, event_type, created_at DESC);

COMMIT;
