-- ============================================================
-- PRIVYSTACK — VENDOR REGISTRY PRODUCTION HARDENING MIGRATION
-- Migration: 20260801235300_vendor_registry_production_hardening.sql
-- Description: Adds DPA document URLs, DPA expiry dates, security ratings,
--              SCC requirement flags, country, and scanner discovery flags.
-- Idempotent: Uses ADD COLUMN IF NOT EXISTS guards.
-- ============================================================

BEGIN;

-- 1. Incremental Column Additions
ALTER TABLE public.vendor_registry ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT 'Analytics & Marketing';
ALTER TABLE public.vendor_registry ADD COLUMN IF NOT EXISTS data_received text[] NOT NULL DEFAULT '{}';
ALTER TABLE public.vendor_registry ADD COLUMN IF NOT EXISTS dpa_uploaded boolean NOT NULL DEFAULT false;
ALTER TABLE public.vendor_registry ADD COLUMN IF NOT EXISTS dpa_url text;
ALTER TABLE public.vendor_registry ADD COLUMN IF NOT EXISTS dpa_expiry timestamptz;
ALTER TABLE public.vendor_registry ADD COLUMN IF NOT EXISTS country text NOT NULL DEFAULT 'United States';
ALTER TABLE public.vendor_registry ADD COLUMN IF NOT EXISTS scc_required boolean NOT NULL DEFAULT false;
ALTER TABLE public.vendor_registry ADD COLUMN IF NOT EXISTS security_rating text NOT NULL DEFAULT 'A';
ALTER TABLE public.vendor_registry ADD COLUMN IF NOT EXISTS last_review_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.vendor_registry ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active';
ALTER TABLE public.vendor_registry ADD COLUMN IF NOT EXISTS scanner_discovered boolean NOT NULL DEFAULT false;
ALTER TABLE public.vendor_registry ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- 2. Domain CHECK Constraints
DO $$ BEGIN
  ALTER TABLE public.vendor_registry DROP CONSTRAINT IF EXISTS chk_vendor_security_rating;
  ALTER TABLE public.vendor_registry ADD CONSTRAINT chk_vendor_security_rating
    CHECK (security_rating IN ('A+', 'A', 'B', 'C', 'F')) NOT VALID;
  ALTER TABLE public.vendor_registry VALIDATE CONSTRAINT chk_vendor_security_rating;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.vendor_registry DROP CONSTRAINT IF EXISTS chk_vendor_status;
  ALTER TABLE public.vendor_registry ADD CONSTRAINT chk_vendor_status
    CHECK (status IN ('active', 'under_review', 'expired', 'terminated')) NOT VALID;
  ALTER TABLE public.vendor_registry VALIDATE CONSTRAINT chk_vendor_status;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- 3. Automated updated_at trigger
DROP TRIGGER IF EXISTS trg_vendor_registry_updated_at ON public.vendor_registry;
CREATE TRIGGER trg_vendor_registry_updated_at
BEFORE UPDATE ON public.vendor_registry
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_timestamp();

-- 4. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_vendor_registry_company_status ON public.vendor_registry (company_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_vendor_registry_dpa_expiry ON public.vendor_registry (company_id, dpa_expiry);

COMMIT;
