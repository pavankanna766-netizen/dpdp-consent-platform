-- ============================================================
-- PRIVYSTACK — ENTERPRISE ORGANIZATION MANAGEMENT & RBAC MIGRATION
-- Migration: 20260802110100_enterprise_organization_rbac.sql
-- Description: Creates company_invitations table supporting single-use token invitations,
--              7-day token expiration, member status suspension, and multi-role RBAC.
-- Idempotent & Zero-Downtime: Uses IF NOT EXISTS guards and RLS policies.
-- ============================================================

BEGIN;

-- 1. Create Company Invitations Table
CREATE TABLE IF NOT EXISTS public.company_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  email text NOT NULL,
  role text NOT NULL DEFAULT 'compliance_manager',
  token text UNIQUE NOT NULL,
  invited_by text NOT NULL,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Domain CHECK Constraint for Invitations
DO $$ BEGIN
  ALTER TABLE public.company_invitations DROP CONSTRAINT IF EXISTS chk_company_invitation_status;
  ALTER TABLE public.company_invitations ADD CONSTRAINT chk_company_invitation_status
    CHECK (status IN ('pending', 'accepted', 'revoked', 'expired')) NOT VALID;
  ALTER TABLE public.company_invitations VALIDATE CONSTRAINT chk_company_invitation_status;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- 3. Add Member Status Column if not present in company_members
ALTER TABLE public.company_members ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active';

DO $$ BEGIN
  ALTER TABLE public.company_members DROP CONSTRAINT IF EXISTS chk_company_member_status;
  ALTER TABLE public.company_members ADD CONSTRAINT chk_company_member_status
    CHECK (status IN ('active', 'suspended')) NOT VALID;
  ALTER TABLE public.company_members VALIDATE CONSTRAINT chk_company_member_status;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- 4. Enable RLS
ALTER TABLE public.company_invitations ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies
DROP POLICY IF EXISTS "Company members can view invitations" ON public.company_invitations;
CREATE POLICY "Company members can view invitations"
  ON public.company_invitations FOR ALL
  USING (public.is_company_member(company_id));

-- 6. High-Performance Index
CREATE INDEX IF NOT EXISTS idx_company_invitations_token
  ON public.company_invitations (token);

COMMIT;
