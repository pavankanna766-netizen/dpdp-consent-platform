-- ============================================================
-- PRIVYSTACK — PRODUCTION PLATFORM INFRASTRUCTURE MIGRATION
-- Migration: 20260802014500_production_platform_infrastructure.sql
-- Description: Creates job_queue and job_dead_letter_queue tables supporting
--              asynchronous background job execution, retries, exponential backoff,
--              and dead-letter queue (DLQ) tracking for Scanner, Policy, and PDF tasks.
-- Idempotent & Zero-Downtime: Uses IF NOT EXISTS guards and RLS policies.
-- ============================================================

BEGIN;

-- 1. Create Job Queue Table
CREATE TABLE IF NOT EXISTS public.job_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  job_type text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'pending',
  attempts integer NOT NULL DEFAULT 0,
  max_attempts integer NOT NULL DEFAULT 3,
  last_error text,
  run_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Domain CHECK Constraint for Job Queue Status
DO $$ BEGIN
  ALTER TABLE public.job_queue DROP CONSTRAINT IF EXISTS chk_job_queue_status;
  ALTER TABLE public.job_queue ADD CONSTRAINT chk_job_queue_status
    CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'dlq')) NOT VALID;
  ALTER TABLE public.job_queue VALIDATE CONSTRAINT chk_job_queue_status;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- 3. Create Job Dead Letter Queue (DLQ) Table
CREATE TABLE IF NOT EXISTS public.job_dead_letter_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  job_id uuid NOT NULL,
  job_type text NOT NULL,
  payload jsonb NOT NULL,
  failure_reason text NOT NULL,
  attempts integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 4. Enable RLS
ALTER TABLE public.job_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_dead_letter_queue ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies
DROP POLICY IF EXISTS "Company members can view job queue" ON public.job_queue;
CREATE POLICY "Company members can view job queue"
  ON public.job_queue FOR ALL
  USING (public.is_company_member(company_id));

DROP POLICY IF EXISTS "Company members can view dlq" ON public.job_dead_letter_queue;
CREATE POLICY "Company members can view dlq"
  ON public.job_dead_letter_queue FOR ALL
  USING (public.is_company_member(company_id));

-- 6. Automated updated_at trigger
DROP TRIGGER IF EXISTS trg_job_queue_updated_at ON public.job_queue;
CREATE TRIGGER trg_job_queue_updated_at
BEFORE UPDATE ON public.job_queue
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_timestamp();

-- 7. High-Performance Index
CREATE INDEX IF NOT EXISTS idx_job_queue_pending
  ON public.job_queue (status, run_at)
  WHERE status = 'pending';

COMMIT;
