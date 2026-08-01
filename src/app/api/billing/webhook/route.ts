import { NextRequest, NextResponse } from "next/server";
import { createBillingTransaction, updateCompanySubscription } from "@/repositories/billing.repository";
import { createAuditLog } from "@/repositories/audit.repository";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!signature || !webhookSecret) {
      return NextResponse.json({ error: "Missing webhook signature credentials" }, { status: 400 });
    }

    // Cryptographically verify webhook signature
    const expected = crypto
      .createHmac("sha256", webhookSecret)
      .update(rawBody)
      .digest("hex");

    if (expected !== signature) {
      return NextResponse.json({ error: "Webhook verification failed" }, { status: 400 });
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;

    if (event === "order.paid" || event === "payment.captured") {
      const payment = payload.payload.payment.entity;
      const orderId = payment.order_id;
      const paymentId = payment.id;
      const amount = payment.amount; // in paise
      const companyId = payment.notes?.companyId;
      const planId = payment.notes?.planId || "starter";

      if (companyId) {
        // Idempotent insertion
        const { error: txError } = await createBillingTransaction({
          company_id: companyId,
          razorpay_payment_id: paymentId,
          razorpay_order_id: orderId,
          razorpay_signature: signature,
          amount,
          currency: "INR",
          status: "captured",
        });

        if (!txError) {
          const periodEnd = new Date();
          periodEnd.setDate(periodEnd.getDate() + 30);

          await updateCompanySubscription(companyId, {
            billing_status: "premium",
            plan_id: planId,
            current_period_end: periodEnd.toISOString(),
          });

          await createAuditLog({
            company_id: companyId,
            event_type: "billing.webhook_payment_captured",
            entity_type: "company",
            entity_id: companyId,
            actor: "system.razorpay_webhook",
            payload: {
              paymentId,
              orderId,
              planId,
              amount,
            },
          });
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const err = error as Error;
    return NextResponse.json({ error: err.message || "Webhook processing error" }, { status: 500 });
  }
}
