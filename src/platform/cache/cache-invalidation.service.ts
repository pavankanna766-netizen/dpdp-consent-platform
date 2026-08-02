import {
  cacheInvalidate,
  cacheInvalidateCompany,
  type CacheDomain,
} from "./cache-layer";
import { logger } from "@/platform/logger";

// ---------------------------------------------------------------------------
// Cache Invalidation Service — Automatic invalidation on domain mutations
// ---------------------------------------------------------------------------
// Call these after writes/updates/publishes to keep cache consistent.
// All methods are fire-and-forget safe — failures are logged, never thrown.
// ---------------------------------------------------------------------------

export class CacheInvalidationService {
  // ---- Single Domain ----

  async onUpdate(domain: CacheDomain, companyId: string, entityId?: string) {
    await cacheInvalidate(domain, companyId, entityId);
  }

  async onDelete(domain: CacheDomain, companyId: string, entityId?: string) {
    await cacheInvalidate(domain, companyId, entityId);
  }

  // ---- Domain-Specific Convenience Methods ----

  async onPolicyPublished(companyId: string, policyType: "privacy_policy" | "cookie_policy") {
    await cacheInvalidate(policyType, companyId);
    await cacheInvalidate("trust_center", companyId);
    logger.info("[CacheInvalidation] Policy published — invalidated policy + trust center", { companyId, policyType });
  }

  async onOnboardingCompleted(companyId: string) {
    await cacheInvalidateCompany(companyId);
    logger.info("[CacheInvalidation] Onboarding completed — full company cache flushed", { companyId });
  }

  async onScannerCompleted(companyId: string) {
    await cacheInvalidate("scanner_summary", companyId);
    await cacheInvalidate("dashboard_metrics", companyId);
    await cacheInvalidate("trust_center", companyId);
    logger.info("[CacheInvalidation] Scanner completed — invalidated scanner + dashboard + trust", { companyId });
  }

  async onVendorRegistryChanged(companyId: string) {
    await cacheInvalidate("vendor_registry", companyId);
    await cacheInvalidate("trust_center", companyId);
  }

  async onInventoryChanged(companyId: string) {
    await cacheInvalidate("data_inventory", companyId);
    await cacheInvalidate("dashboard_metrics", companyId);
  }

  async onSettingsChanged(companyId: string) {
    await cacheInvalidate("company_settings", companyId);
    await cacheInvalidate("branding", companyId);
    await cacheInvalidate("trust_center", companyId);
  }

  async onConsentTemplateChanged(companyId: string) {
    await cacheInvalidate("consent_template", companyId);
  }

  async onBrandingChanged(companyId: string) {
    await cacheInvalidate("branding", companyId);
    await cacheInvalidate("trust_center", companyId);
  }

  // ---- Full Company Flush ----

  async flushCompany(companyId: string) {
    await cacheInvalidateCompany(companyId);
  }
}

export const cacheInvalidationService = new CacheInvalidationService();
