-- ============================================================
-- PRIVYSTACK — ENTERPRISE BRANDING & THEME ENGINE MIGRATION
-- Migration: 20260802011400_branding_and_theme_engine.sql
-- Description: Creates company_branding table powering company-wide theme
--              inheritance across all legal documents and public portals.
-- Idempotent & Zero-Downtime: Uses IF NOT EXISTS guards and RLS policies.
-- ============================================================

BEGIN;

-- 1. Create Company Branding Table
CREATE TABLE IF NOT EXISTS public.company_branding (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid UNIQUE NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  theme_name text NOT NULL DEFAULT 'Professional',
  logo_url text,
  dark_logo_url text,
  primary_color text NOT NULL DEFAULT '#4f46e5',
  secondary_color text NOT NULL DEFAULT '#0f172a',
  accent_color text NOT NULL DEFAULT '#10b981',
  font_family text NOT NULL DEFAULT 'Inter',
  document_width text NOT NULL DEFAULT '800px',
  document_margin text NOT NULL DEFAULT '24px',
  header_enabled boolean NOT NULL DEFAULT true,
  header_config jsonb NOT NULL DEFAULT '{"showLogo": true, "showVersion": true, "showConfidential": true}'::jsonb,
  footer_enabled boolean NOT NULL DEFAULT true,
  footer_config jsonb NOT NULL DEFAULT '{"showPageNumbers": true, "showGeneratedDate": true}'::jsonb,
  watermark_enabled boolean NOT NULL DEFAULT false,
  watermark_config jsonb NOT NULL DEFAULT '{"text": "DRAFT", "opacity": 0.15, "rotation": -45}'::jsonb,
  cover_page_enabled boolean NOT NULL DEFAULT false,
  cover_page_config jsonb NOT NULL DEFAULT '{"showTagline": true, "showPreparedFor": true}'::jsonb,
  address text,
  support_email text,
  privacy_contact text,
  dpo_name text,
  phone_number text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Domain CHECK Constraints
DO $$ BEGIN
  ALTER TABLE public.company_branding DROP CONSTRAINT IF EXISTS chk_company_branding_theme;
  ALTER TABLE public.company_branding ADD CONSTRAINT chk_company_branding_theme
    CHECK (theme_name IN (
      'Professional',
      'Modern',
      'Corporate',
      'Minimal',
      'Government',
      'Startup',
      'Enterprise',
      'Healthcare',
      'FinTech',
      'EdTech',
      'Custom'
    )) NOT VALID;
  ALTER TABLE public.company_branding VALIDATE CONSTRAINT chk_company_branding_theme;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- 3. Enable RLS
ALTER TABLE public.company_branding ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies
DROP POLICY IF EXISTS "Company members can manage branding" ON public.company_branding;
CREATE POLICY "Company members can manage branding"
  ON public.company_branding FOR ALL
  USING (public.is_company_member(company_id));

DROP POLICY IF EXISTS "Public can view active branding" ON public.company_branding;
CREATE POLICY "Public can view active branding"
  ON public.company_branding FOR SELECT
  USING (true);

-- 5. Automated updated_at trigger
DROP TRIGGER IF EXISTS trg_company_branding_updated_at ON public.company_branding;
CREATE TRIGGER trg_company_branding_updated_at
BEFORE UPDATE ON public.company_branding
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_timestamp();

-- 6. High-Performance Index
CREATE INDEX IF NOT EXISTS idx_company_branding_lookup
  ON public.company_branding (company_id);

COMMIT;
