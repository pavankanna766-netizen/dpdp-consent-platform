import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { ensureCompany } from "@/services/company.service";
import { PLAN_CONFIGS, type PlanTier } from "@/platform/billing/plans";
import { razorpay } from "@/platform/payments/razorpay";
import { logger } from "@/platform/logger";

export async function POST(request: Request) {
  const startTime = performance.now();

  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const company = await ensureCompany(userId, "My Company");
    const body = await request.json();

    const planTier = body.planTier as PlanTier;
    const cycle: "monthly" | "yearly" = body.cycle === "yearly" ? "yearly" : "monthly";

    if (!planTier || !PLAN_CONFIGS[planTier]) {
      return NextResponse.json({ error: "Invalid or unsupported plan tier selected" }, { status: 400 });
    }

    const config = PLAN_CONFIGS[planTier];
    const basePriceINR = cycle === "yearly" ? config.priceYearlyINR : config.priceMonthlyINR;
    
    // Calculate amount server-side in paise (1 INR = 100 paise). Never trust amount from client.
    const amountInPaise = Math.round(basePriceINR * 100);
    const receipt = `rcpt_${company.id.replace(/[^a-zA-Z0-9]/g, "").substring(0, 12)}_${Date.now().toString().slice(-6)}`;

    // Create real order using official Razorpay Node SDK
    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt,
      notes: {
        companyId: company.id,
        planId: planTier,
        billingCycle: cycle,
      },
    });

    const latency = Math.round(performance.now() - startTime);

    logger.info("[RAZORPAY ORDER CREATED]", {
      companyId: company.id,
      planId: planTier,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      status: order.status,
      latency,
    });

    const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "";

    return NextResponse.json({
      order: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        companyId: company.id,
        planTier,
        billingCycle: cycle,
        keyId,
        status: order.status,
      },
    });
  } catch (error: unknown) {
    const latency = Math.round(performance.now() - startTime);
    const msg = error instanceof Error ? error.message : "Internal Razorpay checkout error";

    logger.error("[RAZORPAY CHECKOUT ERROR]", {
      error: msg,
      latency,
    });

    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
