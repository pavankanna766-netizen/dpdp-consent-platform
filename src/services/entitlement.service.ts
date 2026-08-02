import { PLAN_CONFIGS, type PlanTier } from "@/platform/billing/plans";
import { getCompanySubscription, getCompanyUsage, incrementUsageMetric } from "@/repositories/subscription.repository";

export class EntitlementService {
  async getPlanConfig(companyId: string) {
    const subRes = await getCompanySubscription(companyId);
    const planTier: PlanTier = subRes.data?.plan_tier || "starter";
    return {
      subscription: subRes.data,
      config: PLAN_CONFIGS[planTier],
    };
  }

  async checkScanQuota(companyId: string): Promise<{ allowed: boolean; remaining: number }> {
    const { config } = await this.getPlanConfig(companyId);
    const usageRes = await getCompanyUsage(companyId);
    const current = usageRes.data?.scans_count || 0;
    const limit = config.limits.monthlyScans;

    return {
      allowed: current < limit,
      remaining: Math.max(0, limit - current),
    };
  }

  async canAccessFeature(companyId: string, feature: keyof typeof PLAN_CONFIGS.starter.features): Promise<boolean> {
    const { config } = await this.getPlanConfig(companyId);
    return config.features[feature] ?? false;
  }

  async recordScanUsage(companyId: string) {
    await incrementUsageMetric(companyId, "scans");
  }

  async recordApiUsage(companyId: string) {
    await incrementUsageMetric(companyId, "api_requests");
  }

  async recordPolicyUsage(companyId: string) {
    await incrementUsageMetric(companyId, "policies");
  }
}

export const entitlementService = new EntitlementService();
