import crypto from "crypto";
import { updateSubscriptionPlan } from "@/repositories/subscription.repository";
import { notificationPlatformService } from "@/services/notification-platform.service";
import type { PlanTier } from "@/platform/billing/plans";

export class BillingPlatformService {
  verifyRazorpayWebhookSignature(bodyString: string, signature: string, secret: string): boolean {
    try {
      const expectedSig = crypto
        .createHmac("sha256", secret)
        .update(bodyString)
        .digest("hex");
      return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig));
    } catch {
      return false;
    }
  }

  async processSubscriptionCreated(companyId: string, planTier: PlanTier, customerEmail: string) {
    await updateSubscriptionPlan(companyId, planTier);

    await notificationPlatformService.publishDomainEvent({
      companyId,
      eventType: "BILLING_SUCCESSFUL",
      recipientEmail: customerEmail,
      title: `Subscription Activated (${planTier.toUpperCase()} Plan)`,
      metadata: { planTier, status: "active" },
    });
  }

  async processPaymentFailed(companyId: string, customerEmail: string, reason: string) {
    await notificationPlatformService.publishDomainEvent({
      companyId,
      eventType: "BILLING_FAILED",
      recipientEmail: customerEmail,
      title: "Action Required: Payment Processing Failed",
      metadata: { reason },
    });
  }
}

export const billingPlatformService = new BillingPlatformService();
