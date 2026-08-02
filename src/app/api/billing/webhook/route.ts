import { NextResponse } from "next/server";
import { billingPlatformService } from "@/services/billing-platform.service";
import { logger } from "@/platform/logger";
import type { PlanTier } from "@/platform/billing/plans";

const SUPPORTED_EVENTS = new Set([
  "payment.authorized",
  "payment.captured",
  "payment.failed",
  "subscription.charged",
  "subscription.cancelled",
]);

interface RazorpayWebhookPayload {
  id?: string;
  event_id?: string;
  event?: string;
  companyId?: string;
  payload?: {
    payment?: {
      entity?: {
        id?: string;
        email?: string;
        error_description?: string;
        notes?: {
          companyId?: string;
          planId?: PlanTier;
          planTier?: PlanTier;
        };
      };
    };
    subscription?: {
      entity?: {
        id?: string;
      };
    };
  };
}

export async function POST(request: Request) {
  const startTime = performance.now();

  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!webhookSecret) {
      logger.error("[RAZORPAY WEBHOOK ERROR] RAZORPAY_WEBHOOK_SECRET is not configured");
      return NextResponse.json({ error: "Webhook secret unconfigured" }, { status: 500 });
    }

    const signature = request.headers.get("x-razorpay-signature");
    if (!signature) {
      logger.warn("[RAZORPAY WEBHOOK FAILED] Missing x-razorpay-signature header");
      return NextResponse.json({ error: "Unauthorized: Missing webhook signature header" }, { status: 401 });
    }

    let bodyString = "";
    try {
      bodyString = await request.text();
    } catch {
      logger.warn("[RAZORPAY WEBHOOK FAILED] Failed to read request body stream");
      return NextResponse.json({ error: "Unauthorized: Malformed request body stream" }, { status: 401 });
    }

    // 1. Webhook signature verification MUST ALWAYS execute regardless of NODE_ENV
    const isSignatureValid = billingPlatformService.verifyRazorpayWebhookSignature(
      bodyString,
      signature,
      webhookSecret
    );

    if (!isSignatureValid) {
      const latency = Math.round(performance.now() - startTime);
      logger.warn("[RAZORPAY WEBHOOK REJECTED] Invalid HMAC signature", {
        verificationSuccess: false,
        latency,
      });
      return NextResponse.json({ error: "Unauthorized: Invalid webhook signature" }, { status: 401 });
    }

    let payload: RazorpayWebhookPayload;
    try {
      payload = JSON.parse(bodyString) as RazorpayWebhookPayload;
    } catch {
      logger.warn("[RAZORPAY WEBHOOK FAILED] Malformed JSON payload");
      return NextResponse.json({ error: "Unauthorized: Malformed JSON payload" }, { status: 401 });
    }

    const eventId = payload.event_id || payload.id || `evt_${Date.now()}`;
    const eventType = payload.event || "";
    const paymentEntity = payload.payload?.payment?.entity || {};
    const paymentId = paymentEntity.id || payload.payload?.subscription?.entity?.id || "pay_unknown";
    const companyId = paymentEntity.notes?.companyId || payload.companyId || "comp_unknown";

    // 2. Idempotency check: ignore duplicate deliveries
    if (billingPlatformService.isDuplicateEvent(eventId)) {
      const latency = Math.round(performance.now() - startTime);
      logger.info("[RAZORPAY WEBHOOK DUPLICATE IGNORED]", {
        eventId,
        eventType,
        paymentId,
        companyId,
        verificationSuccess: true,
        latency,
      });
      return NextResponse.json({ received: true, duplicate: true });
    }

    // 3. Process supported events only
    if (!SUPPORTED_EVENTS.has(eventType)) {
      const latency = Math.round(performance.now() - startTime);
      logger.info("[RAZORPAY WEBHOOK UNKNOWN EVENT IGNORED]", {
        eventId,
        eventType,
        paymentId,
        companyId,
        verificationSuccess: true,
        latency,
      });
      return NextResponse.json({ received: true, ignored: true });
    }

    if (eventType === "subscription.charged" || eventType === "payment.captured" || eventType === "payment.authorized") {
      const planTier: PlanTier = paymentEntity.notes?.planId || paymentEntity.notes?.planTier || "professional";
      const customerEmail = paymentEntity.email || "customer@company.com";

      if (companyId && companyId !== "comp_unknown") {
        await billingPlatformService.processSubscriptionCreated(companyId, planTier, customerEmail);
      }
    } else if (eventType === "payment.failed" || eventType === "subscription.cancelled") {
      const customerEmail = paymentEntity.email || "customer@company.com";
      const reason = paymentEntity.error_description || "Payment or Subscription Status Cancelled/Failed";

      if (companyId && companyId !== "comp_unknown") {
        await billingPlatformService.processPaymentFailed(companyId, customerEmail, reason);
      }
    }

    const latency = Math.round(performance.now() - startTime);
    logger.info("[RAZORPAY WEBHOOK PROCESSED]", {
      eventId,
      eventType,
      paymentId,
      companyId,
      verificationSuccess: true,
      latency,
    });

    return NextResponse.json({ received: true });
  } catch (error: unknown) {
    const latency = Math.round(performance.now() - startTime);
    const msg = error instanceof Error ? error.message : "Internal Webhook Error";

    logger.error("[RAZORPAY WEBHOOK UNHANDLED ERROR]", {
      error: msg,
      latency,
    });

    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
