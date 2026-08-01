-- ============================================================
-- PRIVYSTACK — COMPLETE DATABASE SETUP
-- Single idempotent script. Paste into Supabase SQL Editor.
-- Safe to re-run: uses IF NOT EXISTS / IF EXISTS guards.
-- ============================================================

BEGIN;

-- ============================================================
-- PART A: CONSENT PREFERENCES TABLE + HARDENING
-- (from migrations 20260714*)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.consent_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE RESTRICT,
  banner_id uuid NOT NULL REFERENCES public.cookie_banners(id) ON DELETE RESTRICT,
  consent_id uuid REFERENCES public.consents(id) ON DELETE RESTRICT,
  subject_identifier text NOT NULL,
  decision text NOT NULL CHECK (decision IN ('accepted', 'rejected', 'saved', 'withdrawn')),
  categories jsonb NOT NULL,
  banner_version integer NOT NULL CHECK (banner_version > 0),
  privacy_policy_version integer,
  cookie_policy_version integer,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS consent_preferences_subject_lookup_idx
  ON public.consent_preferences (company_id, banner_id, subject_identifier, created_at DESC);

CREATE INDEX IF NOT EXISTS consent_preferences_consent_id_idx
  ON public.consent_preferences (consent_id)
  WHERE consent_id IS NOT NULL;

ALTER TABLE public.consent_preferences ENABLE ROW LEVEL SECURITY;

-- Immutability trigger
CREATE OR REPLACE FUNCTION public.prevent_consent_preference_mutation()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'consent_preferences is append-only';
END;
$$;

DROP TRIGGER IF EXISTS consent_preferences_immutable ON public.consent_preferences;
CREATE TRIGGER consent_preferences_immutable
BEFORE UPDATE OR DELETE ON public.consent_preferences
FOR EACH ROW EXECUTE FUNCTION public.prevent_consent_preference_mutation();

-- Categories shape constraint
DO $$
BEGIN
  ALTER TABLE public.consent_preferences
    ADD CONSTRAINT consent_preferences_categories_object
    CHECK (jsonb_typeof(categories) = 'object');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

REVOKE UPDATE, DELETE ON public.consent_preferences FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.consent_preferences FROM anon, authenticated;

-- Complete categories constraint
DO $$
BEGIN
  ALTER TABLE public.consent_preferences
    ADD CONSTRAINT consent_preferences_complete_categories
    CHECK (
      categories ?& array['analytics', 'marketing', 'functional', 'personalization']
      AND jsonb_typeof(categories->'analytics') = 'boolean'
      AND jsonb_typeof(categories->'marketing') = 'boolean'
      AND jsonb_typeof(categories->'functional') = 'boolean'
      AND jsonb_typeof(categories->'personalization') = 'boolean'
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Tenant verification trigger for consent preferences
CREATE OR REPLACE FUNCTION public.verify_consent_preference_tenant()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.cookie_banners b
    WHERE b.id = new.banner_id AND b.company_id = new.company_id
  ) THEN
    RAISE EXCEPTION 'banner must belong to the consent preference company';
  END IF;

  IF new.consent_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.consents c
    WHERE c.id = new.consent_id AND c.company_id = new.company_id
  ) THEN
    RAISE EXCEPTION 'consent must belong to the consent preference company';
  END IF;

  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS consent_preferences_tenant_integrity ON public.consent_preferences;
CREATE TRIGGER consent_preferences_tenant_integrity
BEFORE INSERT ON public.consent_preferences
FOR EACH ROW EXECUTE FUNCTION public.verify_consent_preference_tenant();


-- ============================================================
-- PART B: RLS HELPER FUNCTIONS + ENABLE RLS + POLICIES
-- (from migration 20260718171700)
-- ============================================================

CREATE OR REPLACE FUNCTION public.current_user_clerk_id()
RETURNS text
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT coalesce(
    nullif(current_setting('request.jwt.claims', true)::json ->>'sub', ''),
    ''
  );
$$;

CREATE OR REPLACE FUNCTION public.is_company_member(company_id uuid)
RETURNS boolean
LANGUAGE plpgsql STABLE SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.company_members m
    WHERE m.company_id = is_company_member.company_id
      AND m.clerk_user_id = public.current_user_clerk_id()
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.is_scan_owner(scan_id uuid)
RETURNS boolean
LANGUAGE plpgsql STABLE SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.scanner_scans s
    WHERE s.id = is_scan_owner.scan_id
      AND public.is_company_member(s.company_id)
  );
END;
$$;

-- Enable RLS on all tables
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_use_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consent_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consent_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dsar_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scanner_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scanner_detections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scanner_findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.privacy_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cookie_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cookie_banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trust_centers ENABLE ROW LEVEL SECURITY;

-- RLS Policies (DROP IF EXISTS + CREATE for idempotency)

-- Companies
DROP POLICY IF EXISTS "Company members can read company" ON public.companies;
CREATE POLICY "Company members can read company"
  ON public.companies FOR SELECT
  USING (public.is_company_member(id));

DROP POLICY IF EXISTS "Company owners can update company" ON public.companies;
CREATE POLICY "Company owners can update company"
  ON public.companies FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.company_members m
    WHERE m.company_id = id
      AND m.clerk_user_id = public.current_user_clerk_id()
      AND m.role = 'owner'
  ));

-- Company Members
DROP POLICY IF EXISTS "Members can view other members of their company" ON public.company_members;
CREATE POLICY "Members can view other members of their company"
  ON public.company_members FOR SELECT
  USING (clerk_user_id = public.current_user_clerk_id() OR public.is_company_member(company_id));

-- Company Settings
DROP POLICY IF EXISTS "Company members can select settings" ON public.company_settings;
CREATE POLICY "Company members can select settings"
  ON public.company_settings FOR SELECT
  USING (public.is_company_member(company_id));

DROP POLICY IF EXISTS "Company owners can modify settings" ON public.company_settings;
CREATE POLICY "Company owners can modify settings"
  ON public.company_settings FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.company_members m
    WHERE m.company_id = company_settings.company_id
      AND m.clerk_user_id = public.current_user_clerk_id()
      AND m.role = 'owner'
  ));

-- Company Use Cases
DROP POLICY IF EXISTS "Company members can read company use cases" ON public.company_use_cases;
CREATE POLICY "Company members can read company use cases"
  ON public.company_use_cases FOR SELECT
  USING (public.is_company_member(company_id));

DROP POLICY IF EXISTS "Company owners can manage company use cases" ON public.company_use_cases;
CREATE POLICY "Company owners can manage company use cases"
  ON public.company_use_cases FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.company_members m
    WHERE m.company_id = company_use_cases.company_id
      AND m.clerk_user_id = public.current_user_clerk_id()
      AND m.role = 'owner'
  ));

-- Consent Templates
DROP POLICY IF EXISTS "Company members can manage templates" ON public.consent_templates;
CREATE POLICY "Company members can manage templates"
  ON public.consent_templates FOR ALL
  USING (public.is_company_member(company_id));

DROP POLICY IF EXISTS "Public can read published templates" ON public.consent_templates;
CREATE POLICY "Public can read published templates"
  ON public.consent_templates FOR SELECT
  USING (status = 'published');

-- Consents
DROP POLICY IF EXISTS "Company members can view consents" ON public.consents;
CREATE POLICY "Company members can view consents"
  ON public.consents FOR SELECT
  USING (public.is_company_member(company_id));

-- Consent Preferences
DROP POLICY IF EXISTS "Company members can view consent preferences" ON public.consent_preferences;
CREATE POLICY "Company members can view consent preferences"
  ON public.consent_preferences FOR SELECT
  USING (public.is_company_member(company_id));

DROP POLICY IF EXISTS "Public and SDK can read visitor consent preferences" ON public.consent_preferences;
CREATE POLICY "Public and SDK can read visitor consent preferences"
  ON public.consent_preferences FOR SELECT
  USING (true);

-- Audit Logs
DROP POLICY IF EXISTS "Company members can read audit logs" ON public.audit_logs;
CREATE POLICY "Company members can read audit logs"
  ON public.audit_logs FOR SELECT
  USING (public.is_company_member(company_id));

-- DSAR Requests
DROP POLICY IF EXISTS "Company members can view and update DSAR requests" ON public.dsar_requests;
CREATE POLICY "Company members can view and update DSAR requests"
  ON public.dsar_requests FOR ALL
  USING (public.is_company_member(company_id));

-- Scanner Scans
DROP POLICY IF EXISTS "Company members can manage scans" ON public.scanner_scans;
CREATE POLICY "Company members can manage scans"
  ON public.scanner_scans FOR ALL
  USING (public.is_company_member(company_id));

-- Scanner Detections
DROP POLICY IF EXISTS "Company members can view detections" ON public.scanner_detections;
CREATE POLICY "Company members can view detections"
  ON public.scanner_detections FOR SELECT
  USING (public.is_scan_owner(scan_id));

-- Scanner Findings
DROP POLICY IF EXISTS "Company members can view findings" ON public.scanner_findings;
CREATE POLICY "Company members can view findings"
  ON public.scanner_findings FOR SELECT
  USING (public.is_scan_owner(scan_id));

-- Privacy Policies
DROP POLICY IF EXISTS "Company members can manage privacy policies" ON public.privacy_policies;
CREATE POLICY "Company members can manage privacy policies"
  ON public.privacy_policies FOR ALL
  USING (public.is_company_member(company_id));

DROP POLICY IF EXISTS "Public can view published privacy policies" ON public.privacy_policies;
CREATE POLICY "Public can view published privacy policies"
  ON public.privacy_policies FOR SELECT
  USING (status = 'published' AND archived = false);

-- Cookie Policies
DROP POLICY IF EXISTS "Company members can manage cookie policies" ON public.cookie_policies;
CREATE POLICY "Company members can manage cookie policies"
  ON public.cookie_policies FOR ALL
  USING (public.is_company_member(company_id));

DROP POLICY IF EXISTS "Public can view published cookie policies" ON public.cookie_policies;
CREATE POLICY "Public can view published cookie policies"
  ON public.cookie_policies FOR SELECT
  USING (status = 'published');

-- Cookie Banners
DROP POLICY IF EXISTS "Company members can manage cookie banners" ON public.cookie_banners;
CREATE POLICY "Company members can manage cookie banners"
  ON public.cookie_banners FOR ALL
  USING (public.is_company_member(company_id));

DROP POLICY IF EXISTS "Public can view published cookie banners" ON public.cookie_banners;
CREATE POLICY "Public can view published cookie banners"
  ON public.cookie_banners FOR SELECT
  USING (status = 'published');

-- Trust Centers
DROP POLICY IF EXISTS "Company members can manage trust centers" ON public.trust_centers;
CREATE POLICY "Company members can manage trust centers"
  ON public.trust_centers FOR ALL
  USING (public.is_company_member(company_id));


-- ============================================================
-- PART C: RATE LIMITING + IDEMPOTENCY + STATS FUNCTIONS
-- (from migration 20260718172000)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.rate_limit_buckets (
  key text PRIMARY KEY,
  tokens float NOT NULL,
  last_updated timestamptz NOT NULL
);

ALTER TABLE public.rate_limit_buckets ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.rate_limit_buckets FROM anon, authenticated;

CREATE OR REPLACE FUNCTION public.consume_rate_limit_token(
  p_key text,
  p_limit int,
  p_window_ms int
) RETURNS TABLE (
  allowed boolean,
  remaining int,
  reset_at bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_now timestamptz := clock_timestamp();
  v_tokens float;
  v_last_updated timestamptz;
  v_fill_rate float;
  v_new_tokens float;
  v_window_seconds float := p_window_ms::float / 1000.0;
BEGIN
  v_fill_rate := p_limit::float / v_window_seconds;

  INSERT INTO public.rate_limit_buckets (key, tokens, last_updated)
  VALUES (p_key, p_limit::float, v_now)
  ON CONFLICT (key) DO NOTHING;

  SELECT rb.tokens, rb.last_updated
  INTO v_tokens, v_last_updated
  FROM public.rate_limit_buckets rb
  WHERE rb.key = p_key
  FOR UPDATE;

  v_new_tokens := least(
    p_limit::float,
    v_tokens + (extract(epoch from (v_now - v_last_updated)) * v_fill_rate)
  );

  IF v_new_tokens >= 1.0 THEN
    allowed := true;
    remaining := floor(v_new_tokens - 1.0)::int;
    UPDATE public.rate_limit_buckets
    SET tokens = v_new_tokens - 1.0, last_updated = v_now
    WHERE rate_limit_buckets.key = p_key;
  ELSE
    allowed := false;
    remaining := floor(v_new_tokens)::int;
    UPDATE public.rate_limit_buckets
    SET tokens = v_new_tokens, last_updated = v_now
    WHERE rate_limit_buckets.key = p_key;
  END IF;

  reset_at := extract(epoch from v_now)::bigint * 1000 + p_window_ms;
  RETURN NEXT;
END;
$$;

CREATE TABLE IF NOT EXISTS public.idempotency_keys (
  key text PRIMARY KEY,
  response jsonb,
  expires_at timestamptz NOT NULL
);

ALTER TABLE public.idempotency_keys ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.idempotency_keys FROM anon, authenticated;


-- ============================================================
-- PART D: VENDOR REGISTRY + DATA INVENTORY
-- (from migration 20260718173000)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.vendor_registry (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name text NOT NULL,
  data_categories text[] NOT NULL,
  purpose text NOT NULL,
  agreement_clears_safeguard_bar boolean NOT NULL DEFAULT false,
  renewal_status text NOT NULL DEFAULT 'Active',
  contract_expiry timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.vendor_registry ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.data_inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  category text NOT NULL,
  data_subject text NOT NULL,
  purpose text NOT NULL,
  data_types text[] NOT NULL,
  shared_with_processor text,
  legal_basis text NOT NULL,
  retention_period text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.data_inventory ENABLE ROW LEVEL SECURITY;

-- Single ALL policy each (no redundant SELECT)
DROP POLICY IF EXISTS "Company members can read vendor registry" ON public.vendor_registry;
DROP POLICY IF EXISTS "Company members can manage vendor registry" ON public.vendor_registry;
CREATE POLICY "Company members can manage vendor registry"
  ON public.vendor_registry FOR ALL USING (public.is_company_member(company_id));

DROP POLICY IF EXISTS "Company members can read data inventory" ON public.data_inventory;
DROP POLICY IF EXISTS "Company members can manage data inventory" ON public.data_inventory;
CREATE POLICY "Company members can manage data inventory"
  ON public.data_inventory FOR ALL USING (public.is_company_member(company_id));


-- ============================================================
-- PART E: AUDIT LOG HARDENING + BREACH INCIDENTS
-- (from migration 20260718182000)
-- ============================================================

ALTER TABLE public.privacy_policies ADD COLUMN IF NOT EXISTS reviewed_by_counsel boolean NOT NULL DEFAULT false;
ALTER TABLE public.cookie_policies ADD COLUMN IF NOT EXISTS reviewed_by_counsel boolean NOT NULL DEFAULT false;

ALTER TABLE public.vendor_registry ADD COLUMN IF NOT EXISTS unconfirmed boolean NOT NULL DEFAULT true;
ALTER TABLE public.data_inventory ADD COLUMN IF NOT EXISTS unconfirmed boolean NOT NULL DEFAULT true;

ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS previous_entry_hash text;
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS entry_hash text;

-- Immutability trigger for audit_logs
CREATE OR REPLACE FUNCTION public.prevent_audit_log_mutation()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'audit_logs table is append-only and immutable';
END;
$$;

DROP TRIGGER IF EXISTS audit_logs_immutable ON public.audit_logs;
CREATE TRIGGER audit_logs_immutable
BEFORE UPDATE OR DELETE ON public.audit_logs
FOR EACH ROW EXECUTE FUNCTION public.prevent_audit_log_mutation();

-- Breach Incidents Table
CREATE TABLE IF NOT EXISTS public.breach_incidents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  breach_type text NOT NULL,
  affected_users int NOT NULL,
  data_categories text NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.breach_incidents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Company members can manage breach_incidents" ON public.breach_incidents;
CREATE POLICY "Company members can manage breach_incidents"
  ON public.breach_incidents FOR ALL USING (public.is_company_member(company_id));


-- ============================================================
-- PART F: RELATIONAL HARDENING (dual clocks, JOIN table, CHECKs)
-- (from migration 20260718185000)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.data_inventory_vendors (
  data_inventory_id uuid NOT NULL REFERENCES public.data_inventory(id) ON DELETE CASCADE,
  vendor_id uuid NOT NULL REFERENCES public.vendor_registry(id) ON DELETE CASCADE,
  PRIMARY KEY (data_inventory_id, vendor_id)
);

ALTER TABLE public.data_inventory_vendors ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Company members can manage data_inventory_vendors" ON public.data_inventory_vendors;
CREATE POLICY "Company members can manage data_inventory_vendors"
  ON public.data_inventory_vendors FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.data_inventory i
      WHERE i.id = data_inventory_id AND public.is_company_member(i.company_id)
    )
  );

-- Policy counsel CHECK constraints
DO $$
BEGIN
  ALTER TABLE public.privacy_policies DROP CONSTRAINT IF EXISTS chk_privacy_policy_counsel;
  ALTER TABLE public.privacy_policies ADD CONSTRAINT chk_privacy_policy_counsel
    CHECK (status <> 'published' OR reviewed_by_counsel = true);
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE public.cookie_policies DROP CONSTRAINT IF EXISTS chk_cookie_policy_counsel;
  ALTER TABLE public.cookie_policies ADD CONSTRAINT chk_cookie_policy_counsel
    CHECK (status <> 'published' OR reviewed_by_counsel = true);
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Add breach incident dual deadline columns
ALTER TABLE public.breach_incidents DROP COLUMN IF EXISTS notification_deadline;
ALTER TABLE public.breach_incidents ADD COLUMN IF NOT EXISTS certin_deadline timestamptz;
ALTER TABLE public.breach_incidents ADD COLUMN IF NOT EXISTS dpbi_deadline timestamptz;
ALTER TABLE public.breach_incidents ADD COLUMN IF NOT EXISTS certin_notified_at timestamptz;
ALTER TABLE public.breach_incidents ADD COLUMN IF NOT EXISTS dpbi_notified_at timestamptz;

-- Backfill existing rows so NOT NULL can be applied
UPDATE public.breach_incidents SET certin_deadline = created_at + interval '6 hours' WHERE certin_deadline IS NULL;
UPDATE public.breach_incidents SET dpbi_deadline = created_at + interval '72 hours' WHERE dpbi_deadline IS NULL;

DO $$ BEGIN ALTER TABLE public.breach_incidents ALTER COLUMN certin_deadline SET NOT NULL; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.breach_incidents ALTER COLUMN dpbi_deadline SET NOT NULL; EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- DSAR SLA due date
ALTER TABLE public.dsar_requests ADD COLUMN IF NOT EXISTS sla_due_date timestamptz;


-- ============================================================
-- PART G: BILLING / RAZORPAY
-- (from migration 20260718192000)
-- ============================================================

ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS billing_status text NOT NULL DEFAULT 'free';
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS plan_id text;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS subscription_id text;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS current_period_end timestamptz;

CREATE TABLE IF NOT EXISTS public.billing_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  razorpay_payment_id text UNIQUE NOT NULL,
  razorpay_order_id text NOT NULL,
  razorpay_signature text NOT NULL,
  amount integer NOT NULL CHECK (amount > 0),
  currency text NOT NULL DEFAULT 'INR',
  status text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.billing_transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Company members can read billing_transactions" ON public.billing_transactions;
CREATE POLICY "Company members can read billing_transactions"
  ON public.billing_transactions FOR SELECT USING (public.is_company_member(company_id));


-- ============================================================
-- PART H: TENANT ISOLATION HARDENING
-- (from migration 20260721200000)
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_audit_stats(p_company_id uuid)
RETURNS json LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_total int; v_today int; v_event_types int;
BEGIN
  IF NOT public.is_company_member(p_company_id) THEN
    RETURN json_build_object('total', 0, 'today', 0, 'eventTypes', 0);
  END IF;
  SELECT count(*)::int INTO v_total FROM public.audit_logs WHERE company_id = p_company_id;
  SELECT count(*)::int INTO v_today FROM public.audit_logs WHERE company_id = p_company_id AND created_at >= date_trunc('day', clock_timestamp());
  SELECT count(distinct event_type)::int INTO v_event_types FROM public.audit_logs WHERE company_id = p_company_id;
  RETURN json_build_object('total', v_total, 'today', v_today, 'eventTypes', v_event_types);
END;
$$;

CREATE OR REPLACE FUNCTION public.get_consent_stats(p_company_id uuid)
RETURNS json LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_total int; v_granted int; v_withdrawn int;
BEGIN
  IF NOT public.is_company_member(p_company_id) THEN
    RETURN json_build_object('total', 0, 'granted', 0, 'withdrawn', 0);
  END IF;
  SELECT count(*)::int INTO v_total FROM public.consents WHERE company_id = p_company_id;
  SELECT count(*)::int INTO v_granted FROM public.consents WHERE company_id = p_company_id AND status = 'granted';
  SELECT count(*)::int INTO v_withdrawn FROM public.consents WHERE company_id = p_company_id AND status = 'withdrawn';
  RETURN json_build_object('total', v_total, 'granted', v_granted, 'withdrawn', v_withdrawn);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.get_audit_stats(uuid) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_consent_stats(uuid) FROM anon, authenticated;

-- Fix dangerous public INSERT policies
DROP POLICY IF EXISTS "Public and SDK can insert consent records" ON public.consents;
DROP POLICY IF EXISTS "Insert consents with valid company" ON public.consents;
CREATE POLICY "Insert consents with valid company"
  ON public.consents FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.companies c WHERE c.id = company_id)
    AND EXISTS (SELECT 1 FROM public.consent_templates t WHERE t.id = template_id AND t.company_id = company_id AND t.status = 'published')
  );

DROP POLICY IF EXISTS "Public can submit DSAR requests" ON public.dsar_requests;
DROP POLICY IF EXISTS "Insert DSAR with valid company" ON public.dsar_requests;
CREATE POLICY "Insert DSAR with valid company"
  ON public.dsar_requests FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.companies c WHERE c.id = company_id));

-- Tenant validation triggers
CREATE OR REPLACE FUNCTION public.verify_consent_tenant()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.consent_templates t WHERE t.id = new.template_id AND t.company_id = new.company_id
  ) THEN RAISE EXCEPTION 'consent template must belong to the specified company'; END IF;
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS consent_tenant_integrity ON public.consents;
CREATE TRIGGER consent_tenant_integrity
BEFORE INSERT ON public.consents
FOR EACH ROW EXECUTE FUNCTION public.verify_consent_tenant();

CREATE OR REPLACE FUNCTION public.verify_dsar_tenant()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.companies c WHERE c.id = new.company_id) THEN
    RAISE EXCEPTION 'company_id must reference a valid company';
  END IF;
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS dsar_tenant_integrity ON public.dsar_requests;
CREATE TRIGGER dsar_tenant_integrity
BEFORE INSERT ON public.dsar_requests
FOR EACH ROW EXECUTE FUNCTION public.verify_dsar_tenant();

-- Revoke direct write on sensitive tables
REVOKE INSERT, UPDATE, DELETE ON public.audit_logs FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.billing_transactions FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.breach_incidents FROM anon;


-- ============================================================
-- PART I: PRODUCTION HARDENING (NEW)
-- ============================================================

-- 1. RBAC role constraint
UPDATE public.company_members SET role = 'viewer'
WHERE role IS NULL OR role NOT IN ('owner', 'admin', 'viewer');

ALTER TABLE public.company_members ALTER COLUMN role SET NOT NULL;
ALTER TABLE public.company_members ALTER COLUMN role SET DEFAULT 'viewer';

DO $$
BEGIN
  ALTER TABLE public.company_members ADD CONSTRAINT chk_member_role CHECK (role IN ('owner', 'admin', 'viewer'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 2. Role-aware RLS policies
DROP POLICY IF EXISTS "Company admins can modify settings" ON public.company_settings;
CREATE POLICY "Company admins can modify settings"
  ON public.company_settings FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.company_members m
    WHERE m.company_id = company_settings.company_id
      AND m.clerk_user_id = public.current_user_clerk_id()
      AND m.role IN ('owner', 'admin')
  ));

DROP POLICY IF EXISTS "Company admins can create breach incidents" ON public.breach_incidents;
CREATE POLICY "Company admins can create breach incidents"
  ON public.breach_incidents FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.company_members m
    WHERE m.company_id = breach_incidents.company_id
      AND m.clerk_user_id = public.current_user_clerk_id()
      AND m.role IN ('owner', 'admin')
  ));

-- 3. Enable pgcrypto
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 4. ATOMIC AUDIT LOG INSERT (fixes hash-chain race condition)
CREATE OR REPLACE FUNCTION public.create_audit_log_atomic(
  p_company_id uuid, p_event_type text, p_entity_type text,
  p_entity_id text, p_actor text, p_payload jsonb
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_previous_hash text; v_entry_hash text; v_hash_input text;
  v_new_id uuid; v_created_at timestamptz;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext('audit_log_' || p_company_id::text));

  SELECT entry_hash INTO v_previous_hash FROM public.audit_logs
  WHERE company_id = p_company_id ORDER BY created_at DESC LIMIT 1;

  IF v_previous_hash IS NULL THEN
    v_previous_hash := '0000000000000000000000000000000000000000000000000000000000000000';
  END IF;

  v_hash_input := jsonb_build_object(
    'previous_entry_hash', v_previous_hash, 'company_id', p_company_id,
    'event_type', p_event_type, 'entity_type', p_entity_type,
    'entity_id', p_entity_id, 'actor', p_actor, 'payload', p_payload
  )::text;

  v_entry_hash := encode(digest(v_hash_input, 'sha256'), 'hex');
  v_new_id := gen_random_uuid();
  v_created_at := clock_timestamp();

  INSERT INTO public.audit_logs (
    id, company_id, event_type, entity_type, entity_id,
    actor, payload, previous_entry_hash, entry_hash, created_at
  ) VALUES (
    v_new_id, p_company_id, p_event_type, p_entity_type, p_entity_id,
    p_actor, p_payload, v_previous_hash, v_entry_hash, v_created_at
  );

  RETURN jsonb_build_object(
    'id', v_new_id, 'company_id', p_company_id, 'event_type', p_event_type,
    'entity_type', p_entity_type, 'entity_id', p_entity_id, 'actor', p_actor,
    'entry_hash', v_entry_hash, 'created_at', v_created_at
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.create_audit_log_atomic(uuid, text, text, text, text, jsonb) FROM anon, authenticated;

-- 5. AUDIT LOG CHAIN INTEGRITY VERIFICATION
CREATE OR REPLACE FUNCTION public.verify_audit_chain(p_company_id uuid)
RETURNS TABLE (total_entries bigint, verified_entries bigint, broken_at_id uuid, broken_at_created timestamptz, chain_valid boolean)
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_row RECORD; v_expected_hash text; v_hash_input text;
  v_prev_hash text := '0000000000000000000000000000000000000000000000000000000000000000';
  v_total bigint := 0; v_verified bigint := 0;
  v_broken_id uuid := NULL; v_broken_ts timestamptz := NULL;
BEGIN
  IF NOT public.is_company_member(p_company_id) THEN
    total_entries := 0; verified_entries := 0; chain_valid := false; RETURN NEXT; RETURN;
  END IF;

  FOR v_row IN SELECT * FROM public.audit_logs WHERE company_id = p_company_id ORDER BY created_at ASC LOOP
    v_total := v_total + 1;
    IF v_row.previous_entry_hash IS DISTINCT FROM v_prev_hash THEN
      v_broken_id := v_row.id; v_broken_ts := v_row.created_at; EXIT;
    END IF;
    v_hash_input := jsonb_build_object(
      'previous_entry_hash', v_row.previous_entry_hash, 'company_id', v_row.company_id,
      'event_type', v_row.event_type, 'entity_type', v_row.entity_type,
      'entity_id', v_row.entity_id, 'actor', v_row.actor, 'payload', v_row.payload
    )::text;
    v_expected_hash := encode(digest(v_hash_input, 'sha256'), 'hex');
    IF v_row.entry_hash IS DISTINCT FROM v_expected_hash THEN
      v_broken_id := v_row.id; v_broken_ts := v_row.created_at; EXIT;
    END IF;
    v_verified := v_verified + 1;
    v_prev_hash := v_row.entry_hash;
  END LOOP;

  total_entries := v_total; verified_entries := v_verified;
  broken_at_id := v_broken_id; broken_at_created := v_broken_ts;
  chain_valid := (v_broken_id IS NULL AND v_total > 0);
  RETURN NEXT;
END;
$$;

GRANT EXECUTE ON FUNCTION public.verify_audit_chain(uuid) TO authenticated;

-- 6. ENCRYPTION HELPERS
CREATE OR REPLACE FUNCTION public.encrypt_sensitive(plaintext text, encryption_key text)
RETURNS bytea LANGUAGE sql IMMUTABLE AS $$ SELECT pgp_sym_encrypt(plaintext, encryption_key); $$;

CREATE OR REPLACE FUNCTION public.decrypt_sensitive(ciphertext bytea, encryption_key text)
RETURNS text LANGUAGE sql IMMUTABLE AS $$ SELECT pgp_sym_decrypt(ciphertext, encryption_key); $$;

REVOKE EXECUTE ON FUNCTION public.encrypt_sensitive(text, text) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.decrypt_sensitive(bytea, text) FROM anon, authenticated;

ALTER TABLE public.dsar_requests ADD COLUMN IF NOT EXISTS encrypted_description bytea;
ALTER TABLE public.consents ADD COLUMN IF NOT EXISTS encrypted_subject bytea;

-- 7. HEALTH CHECK
CREATE OR REPLACE FUNCTION public.health_check()
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_table_count int;
BEGIN
  SELECT count(*)::int INTO v_table_count FROM information_schema.tables
  WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
  RETURN jsonb_build_object('status', 'healthy', 'timestamp', clock_timestamp(), 'db', 'connected', 'tables', v_table_count);
END;
$$;

GRANT EXECUTE ON FUNCTION public.health_check() TO anon, authenticated;

-- 8. DATA ERASURE (DPDP right to erasure)
CREATE OR REPLACE FUNCTION public.erase_company_data(p_company_id uuid, p_confirmation text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_company_name text;
BEGIN
  IF p_confirmation != 'CONFIRM_PERMANENT_DELETION' THEN
    RAISE EXCEPTION 'Deletion requires confirmation string: CONFIRM_PERMANENT_DELETION';
  END IF;
  SELECT company_name INTO v_company_name FROM public.companies WHERE id = p_company_id;
  IF v_company_name IS NULL THEN RAISE EXCEPTION 'Company not found: %', p_company_id; END IF;

  PERFORM public.create_audit_log_atomic(p_company_id, 'company.data_erasure_initiated', 'company',
    p_company_id::text, 'system.erasure',
    jsonb_build_object('company_name', v_company_name, 'reason', 'Account closure / DPDP erasure request'));

  DELETE FROM public.scanner_findings WHERE scan_id IN (SELECT id FROM public.scanner_scans WHERE company_id = p_company_id);
  DELETE FROM public.scanner_detections WHERE scan_id IN (SELECT id FROM public.scanner_scans WHERE company_id = p_company_id);
  DELETE FROM public.scanner_scans WHERE company_id = p_company_id;
  DELETE FROM public.data_inventory_vendors WHERE data_inventory_id IN (SELECT id FROM public.data_inventory WHERE company_id = p_company_id);
  DELETE FROM public.data_inventory WHERE company_id = p_company_id;
  DELETE FROM public.vendor_registry WHERE company_id = p_company_id;
  DELETE FROM public.consent_preferences WHERE company_id = p_company_id;
  DELETE FROM public.consents WHERE company_id = p_company_id;
  DELETE FROM public.consent_templates WHERE company_id = p_company_id;
  DELETE FROM public.dsar_requests WHERE company_id = p_company_id;
  DELETE FROM public.cookie_banners WHERE company_id = p_company_id;
  DELETE FROM public.cookie_policies WHERE company_id = p_company_id;
  DELETE FROM public.privacy_policies WHERE company_id = p_company_id;
  DELETE FROM public.trust_centers WHERE company_id = p_company_id;
  DELETE FROM public.billing_transactions WHERE company_id = p_company_id;
  DELETE FROM public.breach_incidents WHERE company_id = p_company_id;
  DELETE FROM public.company_settings WHERE company_id = p_company_id;
  DELETE FROM public.company_use_cases WHERE company_id = p_company_id;
  DELETE FROM public.company_members WHERE company_id = p_company_id;
  DELETE FROM public.companies WHERE id = p_company_id;

  RETURN jsonb_build_object('status', 'erased', 'company_id', p_company_id, 'company_name', v_company_name, 'erased_at', clock_timestamp());
END;
$$;

REVOKE EXECUTE ON FUNCTION public.erase_company_data(uuid, text) FROM anon, authenticated;

-- 9. RETENTION CLEANUP
CREATE OR REPLACE FUNCTION public.cleanup_expired_data()
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_orphaned_logs int; v_expired_rl int; v_expired_ik int;
BEGIN
  DELETE FROM public.audit_logs WHERE company_id NOT IN (SELECT id FROM public.companies) AND created_at < (clock_timestamp() - interval '90 days');
  GET DIAGNOSTICS v_orphaned_logs = ROW_COUNT;
  DELETE FROM public.rate_limit_buckets WHERE last_updated < (clock_timestamp() - interval '24 hours');
  GET DIAGNOSTICS v_expired_rl = ROW_COUNT;
  DELETE FROM public.idempotency_keys WHERE expires_at < clock_timestamp();
  GET DIAGNOSTICS v_expired_ik = ROW_COUNT;
  RETURN jsonb_build_object('orphaned_audit_logs_purged', v_orphaned_logs, 'expired_rate_limits_purged', v_expired_rl, 'expired_idempotency_keys_purged', v_expired_ik, 'cleaned_at', clock_timestamp());
END;
$$;

REVOKE EXECUTE ON FUNCTION public.cleanup_expired_data() FROM anon, authenticated;

-- 10. TIGHTEN TRUST CENTER PUBLIC ACCESS
DROP POLICY IF EXISTS "Public can view public trust centers" ON public.trust_centers;
DROP POLICY IF EXISTS "Public can view company trust centers" ON public.trust_centers;
CREATE POLICY "Public can view company trust centers"
  ON public.trust_centers FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.companies c WHERE c.id = company_id));

-- 11. RATE LIMIT HIT LOGGING
CREATE TABLE IF NOT EXISTS public.rate_limit_log (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  key text NOT NULL, ip_address text, endpoint text,
  blocked_at timestamptz NOT NULL DEFAULT clock_timestamp()
);

ALTER TABLE public.rate_limit_log ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.rate_limit_log FROM anon, authenticated;
CREATE INDEX IF NOT EXISTS idx_rate_limit_log_blocked_at ON public.rate_limit_log (blocked_at DESC);
CREATE INDEX IF NOT EXISTS idx_rate_limit_log_key ON public.rate_limit_log (key, blocked_at DESC);

CREATE OR REPLACE FUNCTION public.log_rate_limit_hit(p_key text, p_ip_address text DEFAULT NULL, p_endpoint text DEFAULT NULL)
RETURNS void LANGUAGE sql SECURITY DEFINER AS $$
  INSERT INTO public.rate_limit_log (key, ip_address, endpoint) VALUES (p_key, p_ip_address, p_endpoint);
$$;

REVOKE EXECUTE ON FUNCTION public.log_rate_limit_hit(text, text, text) FROM anon, authenticated;

-- 12. CONSENT PREFERENCES INSERT GUARD
DROP POLICY IF EXISTS "Public and SDK can insert consent preferences" ON public.consent_preferences;
DROP POLICY IF EXISTS "Service insert consent preferences" ON public.consent_preferences;
CREATE POLICY "Service insert consent preferences"
  ON public.consent_preferences FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.companies c WHERE c.id = company_id)
    AND EXISTS (SELECT 1 FROM public.cookie_banners b WHERE b.id = banner_id AND b.company_id = company_id)
  );

-- 13. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_audit_logs_company_created ON public.audit_logs (company_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_consents_company_subject ON public.consents (company_id, subject_identifier, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_consents_active_lookup ON public.consents (company_id, template_id, subject_identifier, status) WHERE status = 'granted';
CREATE INDEX IF NOT EXISTS idx_dsar_company_status ON public.dsar_requests (company_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_scanner_company_status ON public.scanner_scans (company_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_billing_company_created ON public.billing_transactions (company_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_breach_company_deadlines ON public.breach_incidents (company_id, dpbi_deadline, certin_deadline);
CREATE INDEX IF NOT EXISTS idx_company_members_clerk_user ON public.company_members (clerk_user_id);

-- 14. BREACH NOTIFICATION ALERTS
CREATE OR REPLACE FUNCTION public.get_breach_alerts(p_company_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_overdue_certin int; v_overdue_dpbi int; v_approaching int;
BEGIN
  IF NOT public.is_company_member(p_company_id) THEN RETURN jsonb_build_object('error', 'unauthorized'); END IF;
  SELECT count(*)::int INTO v_overdue_certin FROM public.breach_incidents
    WHERE company_id = p_company_id AND certin_notified_at IS NULL AND certin_deadline < clock_timestamp();
  SELECT count(*)::int INTO v_overdue_dpbi FROM public.breach_incidents
    WHERE company_id = p_company_id AND dpbi_notified_at IS NULL AND dpbi_deadline < clock_timestamp();
  SELECT count(*)::int INTO v_approaching FROM public.breach_incidents
    WHERE company_id = p_company_id AND (
      (certin_notified_at IS NULL AND certin_deadline BETWEEN clock_timestamp() AND clock_timestamp() + interval '6 hours')
      OR (dpbi_notified_at IS NULL AND dpbi_deadline BETWEEN clock_timestamp() AND clock_timestamp() + interval '24 hours'));
  RETURN jsonb_build_object('overdue_certin', v_overdue_certin, 'overdue_dpbi', v_overdue_dpbi, 'approaching_deadlines', v_approaching, 'checked_at', clock_timestamp());
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_breach_alerts(uuid) TO authenticated;

-- 15. COMPLETE_COMPANY_ONBOARDING (missing function referenced in code)
CREATE OR REPLACE FUNCTION public.complete_company_onboarding(
  p_company_id uuid, p_company_name text, p_industry text, p_company_size text,
  p_website text, p_country text, p_timezone text, p_use_cases text[]
) RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.companies SET company_name = p_company_name, industry = p_industry,
    company_size = p_company_size, website = p_website, country = p_country,
    timezone = p_timezone, is_onboarded = true, updated_at = clock_timestamp()
  WHERE id = p_company_id;
  DELETE FROM public.company_use_cases WHERE company_id = p_company_id;
  INSERT INTO public.company_use_cases (company_id, use_case) SELECT p_company_id, unnest(p_use_cases);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.complete_company_onboarding(uuid, text, text, text, text, text, text, text[])
  FROM anon, authenticated;


COMMIT;

-- ============================================================
-- VERIFICATION (run these separately after the migration)
-- ============================================================
-- SELECT public.health_check();
-- SELECT constraint_name FROM information_schema.table_constraints WHERE table_name = 'company_members' AND constraint_type = 'CHECK';
-- SELECT proname FROM pg_proc WHERE proname IN ('create_audit_log_atomic', 'verify_audit_chain', 'health_check', 'erase_company_data', 'get_breach_alerts', 'complete_company_onboarding');
-- SELECT indexname FROM pg_indexes WHERE schemaname = 'public' AND indexname LIKE 'idx_%' ORDER BY indexname;
-- SELECT extname FROM pg_extension WHERE extname = 'pgcrypto';
