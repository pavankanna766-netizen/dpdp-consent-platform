-- ============================================================
-- PRIVYSTACK — ONBOARDING & SDK API KEYS MIGRATION
-- Migration: 20260801220000_sdk_api_keys_and_onboarding.sql
-- Description: Adds API keys table, onboarding progress fields, and
--              SDK connection verification fields safely.
-- Idempotent: Uses IF NOT EXISTS / IF EXISTS guards.
-- ============================================================

BEGIN;

-- 1. Add onboarding tracking columns to companies table
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS onboarding_step integer NOT NULL DEFAULT 1;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS sdk_connected boolean NOT NULL DEFAULT false;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS sdk_last_ping_at timestamptz;

-- 2. Create public.api_keys table
CREATE TABLE IF NOT EXISTS public.api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  key_name text NOT NULL DEFAULT 'Live SDK Key',
  api_key text UNIQUE NOT NULL,
  environment text NOT NULL DEFAULT 'production' CHECK (environment IN ('development', 'production')),
  is_active boolean NOT NULL DEFAULT true,
  last_used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on api_keys
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies for api_keys
DROP POLICY IF EXISTS "Company members can manage API keys" ON public.api_keys;
CREATE POLICY "Company members can manage API keys"
  ON public.api_keys FOR ALL
  USING (public.is_company_member(company_id));

-- Public / SDK can read active API keys for verification
DROP POLICY IF EXISTS "Public can verify active API keys" ON public.api_keys;
CREATE POLICY "Public can verify active API keys"
  ON public.api_keys FOR SELECT
  USING (is_active = true);

-- 4. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_api_keys_company_id ON public.api_keys (company_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_lookup ON public.api_keys (api_key, is_active);

COMMIT;
