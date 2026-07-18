import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { ensureCompany } from "@/services/company.service";
import { createBillingTransaction, updateCompanySubscription } from "@/repositories/billing.repository";
import { createAuditLog } from "@/repositories/audit.repository";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, planId } = await req.json();
    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature || !planId) {
      return NextResponse.json({ error: "Missing signature components" }, { status: 400 });
    }

    const company = await ensureCompany(userId, "My Company");

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      return NextResponse.json({ error: "Razorpay Key Secret is not configured." }, { status: 500 });
    }

    // 1. Cryptographically verify signature
    const generated = crypto
      .createHmac("sha256", keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generated !== razorpay_signature) {
      return NextResponse.json({ error: "Signature verification failed. Invalid payment." }, { status: 400 });
    }

    // 2. Insert transaction - handling unique constraint for Idempotency
    const amount = planId === "starter" ? 350000 : 999900;
    const { error: txError } = await createBillingTransaction({
      company_id: company.id,
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      amount,
      currency: "INR",
      status: "captured",
    });

    if (txError) {
      // Unique constraint violation (code 23505): payment already processed
      if (txError.code === "23505") {
        return NextResponse.json({ success: true, duplicated: true });
      }
      return NextResponse.json({ error: "Failed to record transaction" }, { status: 500 });
    }

    // 3. Update subscription parameters on company
    const periodEnd = new Date();
    periodEnd.setDate(periodEnd.getDate() + 30); // 30 days active

    await updateCompanySubscription(company.id, {
      billing_status: "premium",
      plan_id: planId,
      current_period_end: periodEnd.toISOString(),
    });

    // 4. Log audit log
    await createAuditLog({
      company_id: company.id,
      event_type: "billing.payment_verified",
      entity_type: "company",
      entity_id: company.id,
      actor: userId,
      payload: {
        paymentId: razorpay_payment_id,
        planId,
        amount,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to verify signature" }, { status: 500 });
  }
}
