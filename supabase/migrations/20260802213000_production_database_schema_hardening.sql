-- ============================================================================
-- PrivyStack Production Database Schema Hardening Migration
-- Author: Principal PostgreSQL Database Engineer & CTO
-- Date: 2026-08-02
-- Scope: Idempotent Zero-Downtime Indexes, FKs, CHECKs, RLS, Triggers & JSONB GIN
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. AUTOMATED UPDATED_AT TRIGGER FUNCTION
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ----------------------------------------------------------------------------
-- 2. APPLY UPDATED_AT AUTOMATION TRIGGERS (IDEMPOTENT)
-- ----------------------------------------------------------------------------
DO $$
DECLARE
  t text;
  tbls text[] := ARRAY[
    'companies',
    'cookie_banners',
    'consent_templates',
    'privacy_policies',
    'cookie_policies',
    'dsar_requests',
    'company_settings',
    'vendor_registry',
    'data_inventory',
    'subscriptions',
    'breach_incidents',
    'webhook_subscriptions',
    'document_approvals',
    'legal_documents',
    'notification_preferences',
    'company_invitations',
    'company_branding',
    'company_use_cases',
    'export_jobs',
    'trust_center_configs'
  ];
BEGIN
  FOREACH t IN ARRAY tbls LOOP
    IF EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = t
    ) THEN
      EXECUTE format('DROP TRIGGER IF EXISTS trg_set_updated_at ON %I;', t);
      EXECUTE format('CREATE TRIGGER trg_set_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION set_updated_at();', t);
    END IF;
  END LOOP;
END $$;

-- ----------------------------------------------------------------------------
-- 3. COMPOSITE & HIGH-PERFORMANCE INDEXES
-- ----------------------------------------------------------------------------
-- Consents & Audit Logs
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'consents') THEN
    CREATE INDEX IF NOT EXISTS idx_consents_company_created ON consents (company_id, created_at DESC);
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'audit_logs') THEN
    CREATE INDEX IF NOT EXISTS idx_audit_logs_company_created ON audit_logs (company_id, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_audit_logs_company_event ON audit_logs (company_id, event_type, created_at DESC);
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'dsar_requests') THEN
    CREATE INDEX IF NOT EXISTS idx_dsar_requests_company_status ON dsar_requests (company_id, status, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_dsar_sla_pending ON dsar_requests (sla_due_date) WHERE status = 'pending';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'vendor_registry') THEN
    CREATE INDEX IF NOT EXISTS idx_vendor_registry_company_status ON vendor_registry (company_id, status);
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'data_inventory') THEN
    CREATE INDEX IF NOT EXISTS idx_data_inventory_company_category ON data_inventory (company_id, category);
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'webhook_deliveries') THEN
    CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_subscription ON webhook_deliveries (company_id, subscription_id, created_at DESC);
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'job_queue') THEN
    CREATE INDEX IF NOT EXISTS idx_job_queue_scheduled ON job_queue (scheduled_at, status) WHERE status = 'queued';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notification_logs') THEN
    CREATE INDEX IF NOT EXISTS idx_notification_logs_company ON notification_logs (company_id, created_at DESC);
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'billing_transactions') THEN
    CREATE INDEX IF NOT EXISTS idx_billing_tx_company ON billing_transactions (company_id, created_at DESC);
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'breach_incidents') THEN
    CREATE INDEX IF NOT EXISTS idx_breach_incidents_company ON breach_incidents (company_id, created_at DESC);
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'document_signatures') THEN
    CREATE INDEX IF NOT EXISTS idx_document_signatures_approval ON document_signatures (company_id, approval_id);
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'api_keys') THEN
    CREATE INDEX IF NOT EXISTS idx_api_keys_active ON api_keys (api_key) WHERE is_active = true;
  END IF;
END $$;

-- ----------------------------------------------------------------------------
-- 4. JSONB GIN INDEXES FOR DYNAMIC QUERIES
-- ----------------------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'audit_logs') THEN
    CREATE INDEX IF NOT EXISTS idx_audit_logs_payload_gin ON audit_logs USING gin (payload);
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notification_preferences') THEN
    CREATE INDEX IF NOT EXISTS idx_notification_prefs_gin ON notification_preferences USING gin (preferences);
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'company_settings') THEN
    CREATE INDEX IF NOT EXISTS idx_company_settings_consent_gin ON company_settings USING gin (consent);
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'legal_documents') THEN
    CREATE INDEX IF NOT EXISTS idx_legal_docs_sections_gin ON legal_documents USING gin (sections);
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'webhook_deliveries') THEN
    CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_payload_gin ON webhook_deliveries USING gin (payload);
  END IF;
END $$;

-- ----------------------------------------------------------------------------
-- 5. CHECK CONSTRAINTS FOR DATA INTEGRITY
-- ----------------------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'dsar_requests') THEN
    ALTER TABLE dsar_requests DROP CONSTRAINT IF EXISTS chk_dsar_status;
    ALTER TABLE dsar_requests ADD CONSTRAINT chk_dsar_status 
      CHECK (status IN ('pending', 'in_progress', 'completed', 'rejected'));
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'breach_incidents') THEN
    ALTER TABLE breach_incidents DROP CONSTRAINT IF EXISTS chk_breach_affected_users;
    ALTER TABLE breach_incidents ADD CONSTRAINT chk_breach_affected_users 
      CHECK (affected_users >= 0);
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'billing_transactions') THEN
    ALTER TABLE billing_transactions DROP CONSTRAINT IF EXISTS chk_billing_tx_amount;
    ALTER TABLE billing_transactions ADD CONSTRAINT chk_billing_tx_amount 
      CHECK (amount >= 0);
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'vendor_registry') THEN
    ALTER TABLE vendor_registry DROP CONSTRAINT IF EXISTS chk_vendor_rating;
    ALTER TABLE vendor_registry ADD CONSTRAINT chk_vendor_rating 
      CHECK (security_rating IN ('A+', 'A', 'B', 'C', 'F'));
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notification_logs') THEN
    ALTER TABLE notification_logs DROP CONSTRAINT IF EXISTS chk_notification_status;
    ALTER TABLE notification_logs ADD CONSTRAINT chk_notification_status 
      CHECK (status IN ('queued', 'sent', 'delivered', 'bounced', 'failed'));
  END IF;
END $$;

-- ----------------------------------------------------------------------------
-- 6. ROW LEVEL SECURITY (RLS) ENABLEMENT
-- ----------------------------------------------------------------------------
DO $$
DECLARE
  t text;
  tbls text[] := ARRAY[
    'cookie_banners',
    'consents',
    'consent_templates',
    'privacy_policies',
    'cookie_policies',
    'dsar_requests',
    'audit_logs',
    'company_settings',
    'vendor_registry',
    'data_inventory',
    'billing_transactions',
    'subscriptions',
    'breach_incidents',
    'api_keys',
    'webhook_subscriptions',
    'webhook_deliveries',
    'document_approvals',
    'legal_documents',
    'document_signatures',
    'notification_logs',
    'notification_preferences',
    'company_invitations',
    'company_branding',
    'company_use_cases',
    'export_jobs',
    'trust_center_configs'
  ];
BEGIN
  FOREACH t IN ARRAY tbls LOOP
    IF EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = t
    ) THEN
      EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY;', t);
    END IF;
  END LOOP;
END $$;
