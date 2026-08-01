-- ============================================================
-- PRIVYSTACK — TRUST CENTER ENTERPRISE PORTAL MIGRATION
-- Migration: 20260802002500_trust_center_enterprise_portal.sql
-- Description: Adds custom branding (logo, primary color), security contacts,
--              DPO details, security certifications, and live system status to trust_centers.
-- Idempotent: Uses ADD COLUMN IF NOT EXISTS guards.
-- ============================================================

BEGIN;

-- 1. Incremental Column Additions
ALTER TABLE public.trust_centers ADD COLUMN IF NOT EXISTS brand_color text NOT NULL DEFAULT '#4f46e5';
ALTER TABLE public.trust_centers ADD COLUMN IF NOT EXISTS logo_url text;
ALTER TABLE public.trust_centers ADD COLUMN IF NOT EXISTS security_email text NOT NULL DEFAULT 'security@company.com';
ALTER TABLE public.trust_centers ADD COLUMN IF NOT EXISTS dpo_name text NOT NULL DEFAULT 'Data Protection Officer';
ALTER TABLE public.trust_centers ADD COLUMN IF NOT EXISTS dpo_email text NOT NULL DEFAULT 'privacy@company.com';
ALTER TABLE public.trust_centers ADD COLUMN IF NOT EXISTS security_certifications text[] NOT NULL DEFAULT '{"DPDP Act 2023 Compliant", "ISO 27001 Certified", "SOC 2 Type II Compliant"}';
ALTER TABLE public.trust_centers ADD COLUMN IF NOT EXISTS system_status text NOT NULL DEFAULT 'operational';
ALTER TABLE public.trust_centers ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- 2. Domain CHECK Constraint
DO $$ BEGIN
  ALTER TABLE public.trust_centers DROP CONSTRAINT IF EXISTS chk_trust_center_system_status;
  ALTER TABLE public.trust_centers ADD CONSTRAINT chk_trust_center_system_status
    CHECK (system_status IN ('operational', 'degraded', 'maintenance')) NOT VALID;
  ALTER TABLE public.trust_centers VALIDATE CONSTRAINT chk_trust_center_system_status;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- 3. Automated updated_at trigger
DROP TRIGGER IF EXISTS trg_trust_centers_updated_at ON public.trust_centers;
CREATE TRIGGER trg_trust_centers_updated_at
BEFORE UPDATE ON public.trust_centers
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_timestamp();

COMMIT;
