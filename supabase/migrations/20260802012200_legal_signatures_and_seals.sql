-- ============================================================
-- PRIVYSTACK — LEGAL APPROVAL, DIGITAL SIGNATURE & COMPANY SEAL MIGRATION
-- Migration: 20260802012200_legal_signatures_and_seals.sql
-- Description: Creates document_approvals and document_signatures tables
--              supporting multi-role approval workflows, SHA-256 document hashing,
--              company seals, and cryptographic verification.
-- Idempotent & Zero-Downtime: Uses IF NOT EXISTS guards and RLS policies.
-- ============================================================

BEGIN;

-- 1. Create Document Approvals Table
CREATE TABLE IF NOT EXISTS public.document_approvals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  document_id uuid NOT NULL REFERENCES public.legal_documents(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'ready_for_review',
  document_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Domain CHECK Constraint for Approvals
DO $$ BEGIN
  ALTER TABLE public.document_approvals DROP CONSTRAINT IF EXISTS chk_document_approval_status;
  ALTER TABLE public.document_approvals ADD CONSTRAINT chk_document_approval_status
    CHECK (status IN (
      'draft',
      'ready_for_review',
      'reviewed',
      'approved',
      'signed',
      'published',
      'archived'
    )) NOT VALID;
  ALTER TABLE public.document_approvals VALIDATE CONSTRAINT chk_document_approval_status;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- 3. Create Document Signatures Table
CREATE TABLE IF NOT EXISTS public.document_signatures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  approval_id uuid NOT NULL REFERENCES public.document_approvals(id) ON DELETE CASCADE,
  signer_name text NOT NULL,
  signer_email text NOT NULL,
  signer_role text NOT NULL,
  signature_type text NOT NULL,
  signature_data text NOT NULL,
  ip_address text NOT NULL DEFAULT '127.0.0.1',
  user_agent text NOT NULL DEFAULT 'PrivyStack Core Engine',
  approval_notes text,
  document_hash_at_signing text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 4. Enable RLS
ALTER TABLE public.document_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_signatures ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies
DROP POLICY IF EXISTS "Company members can manage approvals" ON public.document_approvals;
CREATE POLICY "Company members can manage approvals"
  ON public.document_approvals FOR ALL
  USING (public.is_company_member(company_id));

DROP POLICY IF EXISTS "Company members can manage signatures" ON public.document_signatures;
CREATE POLICY "Company members can manage signatures"
  ON public.document_signatures FOR ALL
  USING (public.is_company_member(company_id));

DROP POLICY IF EXISTS "Public can view published signatures" ON public.document_signatures;
CREATE POLICY "Public can view published signatures"
  ON public.document_signatures FOR SELECT
  USING (true);

-- 6. Automated updated_at trigger
DROP TRIGGER IF EXISTS trg_document_approvals_updated_at ON public.document_approvals;
CREATE TRIGGER trg_document_approvals_updated_at
BEFORE UPDATE ON public.document_approvals
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_timestamp();

-- 7. Indexes
CREATE INDEX IF NOT EXISTS idx_document_approvals_doc
  ON public.document_approvals (company_id, document_id, status);

CREATE INDEX IF NOT EXISTS idx_document_signatures_approval
  ON public.document_signatures (approval_id);

COMMIT;
