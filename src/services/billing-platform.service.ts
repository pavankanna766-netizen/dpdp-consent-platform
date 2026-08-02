import crypto from "crypto";
import { updateSubscriptionPlan } from "@/repositories/subscription.repository";
import { notificationPlatformService } from "@/services/notification-platform.service";
import type { PlanTier } from "@/platform/billing/plans";

// In-memory idempotency cache for duplicate webhook detection
const processedEventIds = new Set<string>();

export class BillingPlatformService {
  verifyRazorpayWebhookSignature(bodyString: string, signature: string, secret: string): boolean {
    if (!bodyString || !signature || !secret) {
      return false;
    }

    try {
      const expectedSig = crypto
        .createHmac("sha256", secret)
        .update(bodyString)
        .digest("hex");

      const sigBuffer = Buffer.from(signature, "utf8");
      const expectedBuffer = Buffer.from(expectedSig, "utf8");

      if (sigBuffer.length !== expectedBuffer.length) {
        return false;
      }

      return crypto.timingSafeEqual(sigBuffer, expectedBuffer);
    } catch {
      return false;
    }
  }

  isDuplicateEvent(eventId: string): boolean {
    if (!eventId) return false;
    if (processedEventIds.has(eventId)) {
      return true;
    }
    processedEventIds.add(eventId);

    // Keep cache size bounded to last 10,000 events
    if (processedEventIds.size > 10000) {
      const firstItem = processedEventIds.values().next().value;
      if (firstItem) processedEventIds.delete(firstItem);
    }
    return false;
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
