-- ============================================================
-- PRIVYSTACK — DOCUMENT RENDERER & EXPORT ENGINE MIGRATION
-- Migration: 20260802012500_document_export_engine.sql
-- Description: Creates document_exports table to track legal document downloads,
--              export formats (PDF, DOCX, HTML, Markdown), versioning, and IP audit trails.
-- Idempotent & Zero-Downtime: Uses IF NOT EXISTS guards and RLS policies.
-- ============================================================

BEGIN;

-- 1. Create Document Exports Audit Table
CREATE TABLE IF NOT EXISTS public.document_exports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  document_id uuid NOT NULL REFERENCES public.legal_documents(id) ON DELETE CASCADE,
  export_format text NOT NULL,
  filename text NOT NULL,
  version integer NOT NULL DEFAULT 1,
  document_hash text NOT NULL,
  exported_by text NOT NULL DEFAULT 'User',
  ip_address text NOT NULL DEFAULT '127.0.0.1',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Domain CHECK Constraint
DO $$ BEGIN
  ALTER TABLE public.document_exports DROP CONSTRAINT IF EXISTS chk_document_export_format;
  ALTER TABLE public.document_exports ADD CONSTRAINT chk_document_export_format
    CHECK (export_format IN ('pdf', 'docx', 'html', 'markdown', 'odt', 'rtf')) NOT VALID;
  ALTER TABLE public.document_exports VALIDATE CONSTRAINT chk_document_export_format;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- 3. Enable RLS
ALTER TABLE public.document_exports ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies
DROP POLICY IF EXISTS "Company members can view export history" ON public.document_exports;
CREATE POLICY "Company members can view export history"
  ON public.document_exports FOR ALL
  USING (public.is_company_member(company_id));

-- 5. High-Performance Index
CREATE INDEX IF NOT EXISTS idx_document_exports_doc
  ON public.document_exports (company_id, document_id, created_at DESC);

COMMIT;
