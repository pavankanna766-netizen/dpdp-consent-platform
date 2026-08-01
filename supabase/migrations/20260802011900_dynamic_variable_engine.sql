-- ============================================================
-- PRIVYSTACK — DYNAMIC VARIABLE ENGINE MIGRATION
-- Migration: 20260802011900_dynamic_variable_engine.sql
-- Description: Adds custom_variables column to company_branding table
--              to support custom tenant-defined dynamic template variables.
-- Idempotent & Zero-Downtime: Uses IF NOT EXISTS guards.
-- ============================================================

BEGIN;

-- 1. Add custom_variables JSONB column to company_branding
ALTER TABLE public.company_branding
  ADD COLUMN IF NOT EXISTS custom_variables jsonb NOT NULL DEFAULT '{}'::jsonb;

COMMIT;
