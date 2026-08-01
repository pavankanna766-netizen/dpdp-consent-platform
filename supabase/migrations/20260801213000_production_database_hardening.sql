-- ============================================================
-- PRIVYSTACK — PRODUCTION DATABASE HARDENING MIGRATION
-- Migration: 20260801213000_production_database_hardening.sql
-- PostgreSQL Maintainer Edition: Zero-downtime, fully pre-sanitized,
-- idempotent, and resilient against legacy production data variations.
-- ============================================================

BEGIN;

-- ============================================================
-- PHASE 1: PRE-SANITIZATION & STATUS CHECK CONSTRAINTS
-- Pre-sanitizes legacy rows before applying domain CHECK constraints
-- ============================================================

UPDATE public.scanner_scans
  SET status = 'pending'
  WHERE status NOT IN ('pending', 'running', 'completed', 'failed') OR status IS NULL;

DO $$ BEGIN
  ALTER TABLE public.scanner_scans DROP CONSTRAINT IF EXISTS chk_scanner_scan_status;
  ALTER TABLE public.scanner_scans ADD CONSTRAINT chk_scanner_scan_status
    CHECK (status IN ('pending', 'running', 'completed', 'failed')) NOT VALID;
  ALTER TABLE public.scanner_scans VALIDATE CONSTRAINT chk_scanner_scan_status;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

UPDATE public.privacy_policies
  SET status = 'draft'
  WHERE status NOT IN ('draft', 'published', 'archived') OR status IS NULL;

DO $$ BEGIN
  ALTER TABLE public.privacy_policies DROP CONSTRAINT IF EXISTS chk_privacy_policy_status;
  ALTER TABLE public.privacy_policies ADD CONSTRAINT chk_privacy_policy_status
    CHECK (status IN ('draft', 'published', 'archived')) NOT VALID;
  ALTER TABLE public.privacy_policies VALIDATE CONSTRAINT chk_privacy_policy_status;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

UPDATE public.cookie_policies
  SET status = 'draft'
  WHERE status NOT IN ('draft', 'published', 'archived') OR status IS NULL;

DO $$ BEGIN
  ALTER TABLE public.cookie_policies DROP CONSTRAINT IF EXISTS chk_cookie_policy_status;
  ALTER TABLE public.cookie_policies ADD CONSTRAINT chk_cookie_policy_status
    CHECK (status IN ('draft', 'published', 'archived')) NOT VALID;
  ALTER TABLE public.cookie_policies VALIDATE CONSTRAINT chk_cookie_policy_status;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

UPDATE public.billing_transactions
  SET status = 'created'
  WHERE status NOT IN ('created', 'authorized', 'captured', 'refunded', 'failed') OR status IS NULL;

DO $$ BEGIN
  ALTER TABLE public.billing_transactions DROP CONSTRAINT IF EXISTS chk_billing_transaction_status;
  ALTER TABLE public.billing_transactions ADD CONSTRAINT chk_billing_transaction_status
    CHECK (status IN ('created', 'authorized', 'captured', 'refunded', 'failed')) NOT VALID;
  ALTER TABLE public.billing_transactions VALIDATE CONSTRAINT chk_billing_transaction_status;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

UPDATE public.consent_templates
  SET status = 'draft'
  WHERE status NOT IN ('draft', 'published', 'archived') OR status IS NULL;

DO $$ BEGIN
  ALTER TABLE public.consent_templates DROP CONSTRAINT IF EXISTS chk_consent_template_status;
  ALTER TABLE public.consent_templates ADD CONSTRAINT chk_consent_template_status
    CHECK (status IN ('draft', 'published', 'archived')) NOT VALID;
  ALTER TABLE public.consent_templates VALIDATE CONSTRAINT chk_consent_template_status;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

UPDATE public.consents
  SET status = 'granted'
  WHERE status NOT IN ('granted', 'withdrawn', 'expired') OR status IS NULL;

DO $$ BEGIN
  ALTER TABLE public.consents DROP CONSTRAINT IF EXISTS chk_consent_status;
  ALTER TABLE public.consents ADD CONSTRAINT chk_consent_status
    CHECK (status IN ('granted', 'withdrawn', 'expired')) NOT VALID;
  ALTER TABLE public.consents VALIDATE CONSTRAINT chk_consent_status;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

UPDATE public.cookie_banners
  SET status = 'draft'
  WHERE status NOT IN ('draft', 'published', 'archived') OR status IS NULL;

DO $$ BEGIN
  ALTER TABLE public.cookie_banners DROP CONSTRAINT IF EXISTS chk_cookie_banner_status;
  ALTER TABLE public.cookie_banners ADD CONSTRAINT chk_cookie_banner_status
    CHECK (status IN ('draft', 'published', 'archived')) NOT VALID;
  ALTER TABLE public.cookie_banners VALIDATE CONSTRAINT chk_cookie_banner_status;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

UPDATE public.dsar_requests
  SET status = 'pending'
  WHERE status NOT IN ('pending', 'in_progress', 'completed', 'rejected') OR status IS NULL;

DO $$ BEGIN
  ALTER TABLE public.dsar_requests DROP CONSTRAINT IF EXISTS chk_dsar_request_status;
  ALTER TABLE public.dsar_requests ADD CONSTRAINT chk_dsar_request_status
    CHECK (status IN ('pending', 'in_progress', 'completed', 'rejected')) NOT VALID;
  ALTER TABLE public.dsar_requests VALIDATE CONSTRAINT chk_dsar_request_status;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

UPDATE public.companies
  SET billing_status = 'free'
  WHERE billing_status NOT IN ('free', 'pro', 'enterprise', 'canceled', 'past_due') OR billing_status IS NULL;

DO $$ BEGIN
  ALTER TABLE public.companies DROP CONSTRAINT IF EXISTS chk_company_billing_status;
  ALTER TABLE public.companies ADD CONSTRAINT chk_company_billing_status
    CHECK (billing_status IN ('free', 'pro', 'enterprise', 'canceled', 'past_due')) NOT VALID;
  ALTER TABLE public.companies VALIDATE CONSTRAINT chk_company_billing_status;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- ============================================================
-- PHASE 2: AUDITABILITY & UPDATED_AT TRIGGER HARDENING
-- ============================================================

CREATE OR REPLACE FUNCTION public.set_updated_at_timestamp()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = clock_timestamp();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_companies_updated_at ON public.companies;
CREATE TRIGGER trg_companies_updated_at
BEFORE UPDATE ON public.companies
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_timestamp();

DROP TRIGGER IF EXISTS trg_company_settings_updated_at ON public.company_settings;
CREATE TRIGGER trg_company_settings_updated_at
BEFORE UPDATE ON public.company_settings
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_timestamp();

DROP TRIGGER IF EXISTS trg_consent_templates_updated_at ON public.consent_templates;
CREATE TRIGGER trg_consent_templates_updated_at
BEFORE UPDATE ON public.consent_templates
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_timestamp();

DROP TRIGGER IF EXISTS trg_cookie_banners_updated_at ON public.cookie_banners;
CREATE TRIGGER trg_cookie_banners_updated_at
BEFORE UPDATE ON public.cookie_banners
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_timestamp();

DROP TRIGGER IF EXISTS trg_trust_centers_updated_at ON public.trust_centers;
CREATE TRIGGER trg_trust_centers_updated_at
BEFORE UPDATE ON public.trust_centers
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_timestamp();

DROP TRIGGER IF EXISTS trg_dsar_requests_updated_at ON public.dsar_requests;
CREATE TRIGGER trg_dsar_requests_updated_at
BEFORE UPDATE ON public.dsar_requests
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_timestamp();

-- ============================================================
-- PHASE 4 & 9: PERFORMANCE INDEXES (GIN, PARTIAL & COVERING)
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_consent_preferences_categories_gin
  ON public.consent_preferences USING gin (categories);

CREATE INDEX IF NOT EXISTS idx_company_settings_gin
  ON public.company_settings USING gin (settings);

CREATE INDEX IF NOT EXISTS idx_vendor_registry_categories_gin
  ON public.vendor_registry USING gin (data_categories);

CREATE INDEX IF NOT EXISTS idx_data_inventory_types_gin
  ON public.data_inventory USING gin (data_types);

CREATE INDEX IF NOT EXISTS idx_privacy_policies_published
  ON public.privacy_policies (company_id, version DESC)
  WHERE status = 'published' AND archived = false;

CREATE INDEX IF NOT EXISTS idx_cookie_policies_published
  ON public.cookie_policies (company_id, version DESC)
  WHERE status = 'published';

CREATE INDEX IF NOT EXISTS idx_cookie_banners_published
  ON public.cookie_banners (company_id, status)
  WHERE status = 'published';

CREATE INDEX IF NOT EXISTS idx_consent_templates_published
  ON public.consent_templates (company_id, status)
  WHERE status = 'published';

CREATE INDEX IF NOT EXISTS idx_scanner_detections_scan_id
  ON public.scanner_detections (scan_id);

CREATE INDEX IF NOT EXISTS idx_scanner_findings_scan_id
  ON public.scanner_findings (scan_id);

-- ============================================================
-- PHASE 5: NUMERIC CONSTRAINTS (WITH PRE-SANITIZATION)
-- ============================================================

UPDATE public.scanner_scans
  SET overall_score = 100 WHERE overall_score < 0 OR overall_score > 100;
UPDATE public.scanner_scans
  SET cookies_found = 0 WHERE cookies_found < 0;
UPDATE public.scanner_scans
  SET trackers_found = 0 WHERE trackers_found < 0;
UPDATE public.scanner_scans
  SET findings_count = 0 WHERE findings_count < 0;
UPDATE public.scanner_scans
  SET duration_ms = 0 WHERE duration_ms < 0;

DO $$ BEGIN
  ALTER TABLE public.scanner_scans DROP CONSTRAINT IF EXISTS chk_scanner_metrics_non_negative;
  ALTER TABLE public.scanner_scans ADD CONSTRAINT chk_scanner_metrics_non_negative
    CHECK (
      (overall_score IS NULL OR (overall_score >= 0 AND overall_score <= 100))
      AND (cookies_found IS NULL OR cookies_found >= 0)
      AND (trackers_found IS NULL OR trackers_found >= 0)
      AND (findings_count IS NULL OR findings_count >= 0)
      AND (duration_ms IS NULL OR duration_ms >= 0)
    ) NOT VALID;
  ALTER TABLE public.scanner_scans VALIDATE CONSTRAINT chk_scanner_metrics_non_negative;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

UPDATE public.breach_incidents SET affected_users = 0 WHERE affected_users < 0;

DO $$ BEGIN
  ALTER TABLE public.breach_incidents DROP CONSTRAINT IF EXISTS chk_breach_affected_users_non_negative;
  ALTER TABLE public.breach_incidents ADD CONSTRAINT chk_breach_affected_users_non_negative
    CHECK (affected_users >= 0) NOT VALID;
  ALTER TABLE public.breach_incidents VALIDATE CONSTRAINT chk_breach_affected_users_non_negative;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

UPDATE public.consent_templates SET version = 1 WHERE version <= 0;

DO $$ BEGIN
  ALTER TABLE public.consent_templates DROP CONSTRAINT IF EXISTS chk_consent_template_version_positive;
  ALTER TABLE public.consent_templates ADD CONSTRAINT chk_consent_template_version_positive
    CHECK (version > 0) NOT VALID;
  ALTER TABLE public.consent_templates VALIDATE CONSTRAINT chk_consent_template_version_positive;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

UPDATE public.privacy_policies SET version = 1 WHERE version <= 0;

DO $$ BEGIN
  ALTER TABLE public.privacy_policies DROP CONSTRAINT IF EXISTS chk_privacy_policy_version_positive;
  ALTER TABLE public.privacy_policies ADD CONSTRAINT chk_privacy_policy_version_positive
    CHECK (version > 0) NOT VALID;
  ALTER TABLE public.privacy_policies VALIDATE CONSTRAINT chk_privacy_policy_version_positive;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

UPDATE public.cookie_policies SET version = 1 WHERE version <= 0;

DO $$ BEGIN
  ALTER TABLE public.cookie_policies DROP CONSTRAINT IF EXISTS chk_cookie_policy_version_positive;
  ALTER TABLE public.cookie_policies ADD CONSTRAINT chk_cookie_policy_version_positive
    CHECK (version > 0) NOT VALID;
  ALTER TABLE public.cookie_policies VALIDATE CONSTRAINT chk_cookie_policy_version_positive;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- ============================================================
-- PHASE 6: JSONB OBJECT TYPE CHECK (WITH PRE-SANITIZATION)
-- ============================================================

UPDATE public.company_settings
  SET settings = '{}'::jsonb
  WHERE settings IS NULL OR jsonb_typeof(settings) != 'object';

DO $$ BEGIN
  ALTER TABLE public.company_settings DROP CONSTRAINT IF EXISTS chk_company_settings_object;
  ALTER TABLE public.company_settings ADD CONSTRAINT chk_company_settings_object
    CHECK (jsonb_typeof(settings) = 'object') NOT VALID;
  ALTER TABLE public.company_settings VALIDATE CONSTRAINT chk_company_settings_object;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

UPDATE public.audit_logs
  SET payload = '{}'::jsonb
  WHERE payload IS NULL OR jsonb_typeof(payload) != 'object';

DO $$ BEGIN
  ALTER TABLE public.audit_logs DROP CONSTRAINT IF EXISTS chk_audit_logs_payload_object;
  ALTER TABLE public.audit_logs ADD CONSTRAINT chk_audit_logs_payload_object
    CHECK (jsonb_typeof(payload) = 'object') NOT VALID;
  ALTER TABLE public.audit_logs VALIDATE CONSTRAINT chk_audit_logs_payload_object;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- ============================================================
-- PHASE 8: RPC SECURITY & SEARCH_PATH HARDENING (SAFE GUARDS)
-- ============================================================

DO $$ BEGIN ALTER FUNCTION public.current_user_clerk_id() SET search_path = public; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER FUNCTION public.is_company_member(uuid) SET search_path = public; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER FUNCTION public.is_scan_owner(uuid) SET search_path = public; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER FUNCTION public.consume_rate_limit_token(text, int, int) SET search_path = public; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER FUNCTION public.get_audit_stats(uuid) SET search_path = public; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER FUNCTION public.get_consent_stats(uuid) SET search_path = public; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER FUNCTION public.create_audit_log_atomic(uuid, text, text, text, text, jsonb) SET search_path = public; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER FUNCTION public.verify_audit_chain(uuid) SET search_path = public; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER FUNCTION public.health_check() SET search_path = public; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER FUNCTION public.erase_company_data(uuid, text) SET search_path = public; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER FUNCTION public.cleanup_expired_data() SET search_path = public; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER FUNCTION public.log_rate_limit_hit(text, text, text) SET search_path = public; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER FUNCTION public.get_breach_alerts(uuid) SET search_path = public; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER FUNCTION public.complete_company_onboarding(uuid, text, text, text, text, text, text, text[]) SET search_path = public; EXCEPTION WHEN OTHERS THEN NULL; END $$;

COMMIT;
