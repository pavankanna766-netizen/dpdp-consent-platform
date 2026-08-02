import { NextResponse } from "next/server";
import { billingPlatformService } from "@/services/billing-platform.service";
import type { PlanTier } from "@/platform/billing/plans";

export async function POST(request: Request) {
  try {
    const bodyString = await request.text();
    const signature = request.headers.get("x-razorpay-signature") || "";
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || "privystack_rzp_secret";

    // Verify Razorpay Webhook Signature
    const isValid = billingPlatformService.verifyRazorpayWebhookSignature(
      bodyString,
      signature,
      webhookSecret
    );

    if (!isValid && process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "Invalid Razorpay webhook signature" }, { status: 400 });
    }

    const payload = JSON.parse(bodyString);
    const event = payload.event;

    if (event === "subscription.charged" || event === "payment.captured") {
      const companyId = payload.payload?.payment?.entity?.notes?.companyId || payload.companyId;
      const planTier: PlanTier = payload.payload?.payment?.entity?.notes?.planTier || "professional";
      const customerEmail = payload.payload?.payment?.entity?.email || "customer@company.com";

      if (companyId) {
        await billingPlatformService.processSubscriptionCreated(companyId, planTier, customerEmail);
      }
    } else if (event === "payment.failed") {
      const companyId = payload.payload?.payment?.entity?.notes?.companyId || payload.companyId;
      const customerEmail = payload.payload?.payment?.entity?.email || "customer@company.com";

      if (companyId) {
        await billingPlatformService.processPaymentFailed(companyId, customerEmail, "Card Declined");
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
