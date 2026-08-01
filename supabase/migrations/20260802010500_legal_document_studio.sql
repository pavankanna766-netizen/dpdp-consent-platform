-- ============================================================
-- PRIVYSTACK — LEGAL DOCUMENT STUDIO ENGINE MIGRATION
-- Migration: 20260802010500_legal_document_studio.sql
-- Description: Creates a generic, reusable legal document studio engine
--              supporting Privacy Policies, Cookie Policies, DPAs, Terms of Service,
--              Vendor Agreements, Breach Reports, and Custom Legal Documents.
-- Idempotent & Zero-Downtime: Uses IF NOT EXISTS guards and RLS policies.
-- ============================================================

BEGIN;

-- 1. Create Generic Legal Documents Table
CREATE TABLE IF NOT EXISTS public.legal_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  document_type text NOT NULL DEFAULT 'custom',
  title text NOT NULL DEFAULT 'Legal Document',
  slug text NOT NULL,
  version integer NOT NULL DEFAULT 1,
  status text NOT NULL DEFAULT 'draft',
  html_content text NOT NULL DEFAULT '',
  plaintext_content text,
  sections jsonb NOT NULL DEFAULT '[]'::jsonb,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  reviewed_by_counsel boolean NOT NULL DEFAULT false,
  reviewed_at timestamptz,
  reviewed_by text,
  published_at timestamptz,
  archived boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Domain CHECK Constraints
DO $$ BEGIN
  ALTER TABLE public.legal_documents DROP CONSTRAINT IF EXISTS chk_legal_document_status;
  ALTER TABLE public.legal_documents ADD CONSTRAINT chk_legal_document_status
    CHECK (status IN ('draft', 'published', 'archived')) NOT VALID;
  ALTER TABLE public.legal_documents VALIDATE CONSTRAINT chk_legal_document_status;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.legal_documents DROP CONSTRAINT IF EXISTS chk_legal_document_type;
  ALTER TABLE public.legal_documents ADD CONSTRAINT chk_legal_document_type
    CHECK (document_type IN (
      'privacy_policy',
      'cookie_policy',
      'dpa',
      'terms_of_service',
      'vendor_agreement',
      'breach_report',
      'data_processing_agreement',
      'custom'
    )) NOT VALID;
  ALTER TABLE public.legal_documents VALIDATE CONSTRAINT chk_legal_document_type;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.legal_documents DROP CONSTRAINT IF EXISTS chk_legal_document_version;
  ALTER TABLE public.legal_documents ADD CONSTRAINT chk_legal_document_version
    CHECK (version > 0) NOT VALID;
  ALTER TABLE public.legal_documents VALIDATE CONSTRAINT chk_legal_document_version;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- 3. Enable RLS
ALTER TABLE public.legal_documents ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies
DROP POLICY IF EXISTS "Company members can manage legal documents" ON public.legal_documents;
CREATE POLICY "Company members can manage legal documents"
  ON public.legal_documents FOR ALL
  USING (public.is_company_member(company_id));

DROP POLICY IF EXISTS "Public can view published legal documents" ON public.legal_documents;
CREATE POLICY "Public can view published legal documents"
  ON public.legal_documents FOR SELECT
  USING (status = 'published' AND archived = false);

-- 5. Automated updated_at trigger
DROP TRIGGER IF EXISTS trg_legal_documents_updated_at ON public.legal_documents;
CREATE TRIGGER trg_legal_documents_updated_at
BEFORE UPDATE ON public.legal_documents
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_timestamp();

-- 6. High-Performance Indexes
CREATE INDEX IF NOT EXISTS idx_legal_documents_company_type
  ON public.legal_documents (company_id, document_type, version DESC);

CREATE INDEX IF NOT EXISTS idx_legal_documents_published
  ON public.legal_documents (company_id, document_type, version DESC)
  WHERE status = 'published' AND archived = false;

CREATE INDEX IF NOT EXISTS idx_legal_documents_slug
  ON public.legal_documents (company_id, slug);

COMMIT;
