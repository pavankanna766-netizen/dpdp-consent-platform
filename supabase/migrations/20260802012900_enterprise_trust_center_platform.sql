-- ============================================================
-- PRIVYSTACK — ENTERPRISE TRUST CENTER PLATFORM MIGRATION
-- Migration: 20260802012900_enterprise_trust_center_platform.sql
-- Description: Adds show_vendors, show_inventory, security_txt_content, pgp_key_url,
--              and faq_items to trust_centers table for public portal customization.
-- Fix: Uses native jsonb_build_array() and jsonb_build_object() functions to guarantee
--      zero string parsing or 0x0d carriage return errors in any SQL editor.
-- Idempotent & Zero-Downtime: Uses IF NOT EXISTS guards.
-- ============================================================

BEGIN;

-- 1. Incremental Column Additions
ALTER TABLE public.trust_centers ADD COLUMN IF NOT EXISTS show_vendors boolean NOT NULL DEFAULT true;
ALTER TABLE public.trust_centers ADD COLUMN IF NOT EXISTS show_inventory boolean NOT NULL DEFAULT true;
ALTER TABLE public.trust_centers ADD COLUMN IF NOT EXISTS security_txt_content text NOT NULL DEFAULT 'Contact: mailto:security@company.com';
ALTER TABLE public.trust_centers ADD COLUMN IF NOT EXISTS pgp_key_url text;
ALTER TABLE public.trust_centers ADD COLUMN IF NOT EXISTS faq_items jsonb NOT NULL DEFAULT jsonb_build_array(
  jsonb_build_object(
    'question', 'How does company protect personal data?',
    'answer', 'We comply with DPDP Act 2023, enforce SOC 2 Type II controls, and encrypt data at rest using AES-256.'
  )
);

COMMIT;
