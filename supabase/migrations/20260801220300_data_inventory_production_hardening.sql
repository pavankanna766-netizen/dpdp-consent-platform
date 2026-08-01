-- ============================================================
-- PRIVYSTACK — DATA INVENTORY PRODUCTION HARDENING MIGRATION
-- Migration: 20260801220300_data_inventory_production_hardening.sql
-- Description: Adds processing activities, storage locations, cross-border
--              transfer, encryption metadata, owner details, status checks,
--              and AI classification fields to data_inventory.
-- Idempotent: Uses ADD COLUMN IF NOT EXISTS guards.
-- ============================================================

BEGIN;

-- 1. Incremental Column Additions
ALTER TABLE public.data_inventory ADD COLUMN IF NOT EXISTS processing_activity text NOT NULL DEFAULT 'Web Browsing & Analytics';
ALTER TABLE public.data_inventory ADD COLUMN IF NOT EXISTS storage_location text NOT NULL DEFAULT 'AWS ap-south-1 (Mumbai)';
ALTER TABLE public.data_inventory ADD COLUMN IF NOT EXISTS cross_border_transfer boolean NOT NULL DEFAULT false;
ALTER TABLE public.data_inventory ADD COLUMN IF NOT EXISTS transfer_countries text[] NOT NULL DEFAULT '{}';
ALTER TABLE public.data_inventory ADD COLUMN IF NOT EXISTS encryption_status text NOT NULL DEFAULT 'AES-256 at rest, TLS 1.3 in transit';
ALTER TABLE public.data_inventory ADD COLUMN IF NOT EXISTS owner_email text;
ALTER TABLE public.data_inventory ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active';
ALTER TABLE public.data_inventory ADD COLUMN IF NOT EXISTS ai_classification_confidence numeric DEFAULT 0.95;
ALTER TABLE public.data_inventory ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- 2. Domain CHECK Constraints
DO $$ BEGIN
  ALTER TABLE public.data_inventory DROP CONSTRAINT IF EXISTS chk_data_inventory_status;
  ALTER TABLE public.data_inventory ADD CONSTRAINT chk_data_inventory_status
    CHECK (status IN ('active', 'archived', 'review_required')) NOT VALID;
  ALTER TABLE public.data_inventory VALIDATE CONSTRAINT chk_data_inventory_status;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.data_inventory DROP CONSTRAINT IF EXISTS chk_data_inventory_ai_confidence;
  ALTER TABLE public.data_inventory ADD CONSTRAINT chk_data_inventory_ai_confidence
    CHECK (ai_classification_confidence >= 0 AND ai_classification_confidence <= 1) NOT VALID;
  ALTER TABLE public.data_inventory VALIDATE CONSTRAINT chk_data_inventory_ai_confidence;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- 3. Automated updated_at trigger
DROP TRIGGER IF EXISTS trg_data_inventory_updated_at ON public.data_inventory;
CREATE TRIGGER trg_data_inventory_updated_at
BEFORE UPDATE ON public.data_inventory
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_timestamp();

-- 4. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_data_inventory_company_status ON public.data_inventory (company_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_data_inventory_category ON public.data_inventory (company_id, category);

COMMIT;
