-- ============================================================
-- PRIVYSTACK — TRIGGER.DEV & INNGEST JOB ORCHESTRATION MIGRATION
-- Migration: 20260802104600_trigger_job_orchestration.sql
-- Description: Adds progress, correlation_id, concurrency_key, idempotency_key,
--              and cancelled_at to public.job_queue for enterprise orchestration.
-- Idempotent & Zero-Downtime: Uses IF NOT EXISTS guards.
-- ============================================================

BEGIN;

-- 1. Add Orchestration Metadata Columns
ALTER TABLE public.job_queue ADD COLUMN IF NOT EXISTS progress integer NOT NULL DEFAULT 0;
ALTER TABLE public.job_queue ADD COLUMN IF NOT EXISTS correlation_id text;
ALTER TABLE public.job_queue ADD COLUMN IF NOT EXISTS concurrency_key text;
ALTER TABLE public.job_queue ADD COLUMN IF NOT EXISTS idempotency_key text;
ALTER TABLE public.job_queue ADD COLUMN IF NOT EXISTS cancelled_at timestamptz;

-- 2. Expand Status Domain Constraint
DO $$ BEGIN
  ALTER TABLE public.job_queue DROP CONSTRAINT IF EXISTS chk_job_queue_status;
  ALTER TABLE public.job_queue ADD CONSTRAINT chk_job_queue_status
    CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'dlq', 'cancelled', 'paused')) NOT VALID;
  ALTER TABLE public.job_queue VALIDATE CONSTRAINT chk_job_queue_status;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- 3. Idempotency Index
CREATE INDEX IF NOT EXISTS idx_job_queue_idempotency
  ON public.job_queue (company_id, idempotency_key)
  WHERE idempotency_key IS NOT NULL;

COMMIT;
