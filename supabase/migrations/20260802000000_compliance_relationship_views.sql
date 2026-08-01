-- ============================================================
-- PRIVYSTACK — COMPLIANCE RELATIONSHIP ENGINE MIGRATION
-- Migration: 20260802000000_compliance_relationship_views.sql
-- Description: Creates relational database views connecting Company, Data
--              Inventory, Vendors, Policies, Scanner, Consents, and Trust Center.
-- Idempotent: Uses CREATE OR REPLACE VIEW guards.
-- Fix: Uses tc.company_id instead of non-existent tc.id column.
-- ============================================================

BEGIN;

-- 1. Create Consolidated Compliance Graph Summary View
CREATE OR REPLACE VIEW public.v_compliance_relationship_summary AS
SELECT
  c.id AS company_id,
  c.company_name,
  c.website,
  c.industry,
  c.is_onboarded,
  (SELECT COUNT(*) FROM public.data_inventory di WHERE di.company_id = c.id) AS total_inventory_items,
  (SELECT COUNT(*) FROM public.vendor_registry vr WHERE vr.company_id = c.id) AS total_vendors,
  (SELECT COUNT(*) FROM public.privacy_policies pp WHERE pp.company_id = c.id AND pp.status = 'published') AS published_privacy_policies,
  (SELECT COUNT(*) FROM public.cookie_policies cp WHERE cp.company_id = c.id AND cp.status = 'published') AS published_cookie_policies,
  (SELECT COUNT(*) FROM public.scanner_scans ss WHERE ss.company_id = c.id AND ss.status = 'completed') AS total_completed_scans,
  (SELECT overall_score FROM public.scanner_scans ss WHERE ss.company_id = c.id AND ss.status = 'completed' ORDER BY ss.created_at DESC LIMIT 1) AS latest_scan_score,
  (SELECT COUNT(*) FROM public.consents cn WHERE cn.company_id = c.id AND cn.status = 'granted') AS total_active_consents,
  (SELECT COUNT(*) FROM public.dsar_requests dr WHERE dr.company_id = c.id AND dr.status = 'pending') AS pending_dsar_requests,
  tc.company_id AS trust_center_company_id
FROM public.companies c
LEFT JOIN public.trust_centers tc ON tc.company_id = c.id;

COMMIT;
