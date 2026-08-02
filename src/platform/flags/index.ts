import { getCompanySettings } from "@/repositories/company-settings.repository";
import { getCompanySubscription } from "@/repositories/subscription.repository";

export type FeatureFlagKey =
  | "trust_center"
  | "legal_studio"
  | "scanner_ai"
  | "webhooks_v2"
  | "custom_domain"
  | "dpbi_reporting"
  | "multi_region_export"
  | "sso_integration";

export interface FeatureFlagRules {
  trust_center: boolean;
  legal_studio: boolean;
  scanner_ai: boolean;
  webhooks_v2: boolean;
  custom_domain: boolean;
  dpbi_reporting: boolean;
  multi_region_export: boolean;
  sso_integration: boolean;
}

// Plan defaults mapping
const PLAN_FEATURE_MATRIX: Record<string, Partial<FeatureFlagRules>> = {
  free: {
    trust_center: true,
    legal_studio: false,
    scanner_ai: false,
    webhooks_v2: false,
    custom_domain: false,
    dpbi_reporting: true,
    multi_region_export: false,
    sso_integration: false,
  },
  starter: {
    trust_center: true,
    legal_studio: true,
    scanner_ai: false,
    webhooks_v2: true,
    custom_domain: false,
    dpbi_reporting: true,
    multi_region_export: false,
    sso_integration: false,
  },
  growth: {
    trust_center: true,
    legal_studio: true,
    scanner_ai: true,
    webhooks_v2: true,
    custom_domain: true,
    dpbi_reporting: true,
    multi_region_export: true,
    sso_integration: false,
  },
  enterprise: {
    trust_center: true,
    legal_studio: true,
    scanner_ai: true,
    webhooks_v2: true,
    custom_domain: true,
    dpbi_reporting: true,
    multi_region_export: true,
    sso_integration: true,
  },
};

export async function isFeatureEnabled(
  companyId: string,
  flag: FeatureFlagKey
): Promise<boolean> {
  try {
    // 1. Check environment global overrides
    const envOverride = process.env[`FEATURE_FLAG_${flag.toUpperCase()}`];
    if (envOverride === "true") return true;
    if (envOverride === "false") return false;

    // 2. Check company settings overrides
    const settingsRes = await getCompanySettings(companyId);
    const settingsData = settingsRes.data?.consent as Record<string, unknown> | undefined;
    if (settingsData && typeof settingsData.feature_flags === "object" && settingsData.feature_flags !== null) {
      const overrides = settingsData.feature_flags as Record<string, boolean>;
      if (typeof overrides[flag] === "boolean") {
        return overrides[flag];
      }
    }

    // 3. Fallback to subscription plan feature matrix
    const subRes = await getCompanySubscription(companyId);
    const planId = subRes.data?.plan_id || "free";
    const matrix = PLAN_FEATURE_MATRIX[planId] || PLAN_FEATURE_MATRIX.free;

    return matrix[flag] ?? false;
  } catch (error) {
    console.warn(`[FeatureFlags] Error evaluating flag '${flag}' for company ${companyId}:`, error);
    return false;
  }
}
