import { logger } from "@/platform/logger";
import type { AnalyticsEventName, AnalyticsEventPayload } from "./events";

export class AnalyticsService {
  private readonly apiKey: string | undefined;
  private readonly apiHost: string;
  private optOut = false;

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    this.apiHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://app.posthog.com";
  }

  get isConfigured(): boolean {
    return !!this.apiKey && !this.optOut;
  }

  setOptOut(optOut: boolean) {
    this.optOut = optOut;
    logger.info(`[ANALYTICS] Opt-out preference updated: ${optOut}`);
  }

  async capture(event: AnalyticsEventName, payload: AnalyticsEventPayload) {
    if (!this.isConfigured) {
      logger.info(`[ANALYTICS SILENT LOG] ${event}`, {
        companyId: payload.companyId,
        userId: payload.userId || "anonymous",
        properties: payload.properties || {},
      });
      return;
    }

    try {
      // Production PostHog HTTP Event Capture REST API (works in Edge, Node, & Browser runtimes)
      await fetch(`${this.apiHost}/capture/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          api_key: this.apiKey,
          event,
          distinct_id: payload.userId || payload.companyId,
          properties: {
            $lib: "privystack-analytics",
            company_id: payload.companyId,
            user_id: payload.userId || "anonymous",
            ...payload.properties,
          },
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (error: unknown) {
      // Graceful silent degradation — analytics failures NEVER disrupt core business requests
      const msg = error instanceof Error ? error.message : String(error);
      logger.warn(`[ANALYTICS DISPATCH FAILED] ${event}`, { error: msg });
    }
  }

  // Domain Conveniences
  async trackCompanyCreated(companyId: string, userId: string, companyName: string) {
    return this.capture("company_created", { companyId, userId, properties: { companyName } });
  }

  async trackOnboardingCompleted(companyId: string, userId: string) {
    return this.capture("onboarding_completed", { companyId, userId });
  }

  async trackScanStarted(companyId: string, userId: string, targetUrl: string) {
    return this.capture("first_scan_started", { companyId, userId, properties: { targetUrl } });
  }

  async trackScanCompleted(companyId: string, userId: string, score: number, findingsCount: number) {
    return this.capture("first_scan_completed", { companyId, userId, properties: { score, findingsCount } });
  }

  async trackTrustCenterPublished(companyId: string, userId: string, slug: string) {
    return this.capture("trust_center_published", { companyId, userId, properties: { slug } });
  }

  async trackBillingUpgraded(companyId: string, userId: string, planTier: string, amount: string) {
    return this.capture("billing_upgraded", { companyId, userId, properties: { planTier, amount } });
  }
}

export const analyticsService = new AnalyticsService();
