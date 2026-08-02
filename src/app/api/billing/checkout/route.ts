import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { ensureCompany } from "@/services/company.service";
import { PLAN_CONFIGS, type PlanTier } from "@/platform/billing/plans";

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const company = await ensureCompany(userId, "My Company");
    const body = await request.json();

    const planTier: PlanTier = body.planTier || "professional";
    const cycle: "monthly" | "yearly" = body.cycle === "yearly" ? "yearly" : "monthly";

    const config = PLAN_CONFIGS[planTier];
    const amount = cycle === "yearly" ? config.priceYearlyINR : config.priceMonthlyINR;

    // Mock/Production Razorpay Order Creation
    const order = {
      orderId: `order_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      amount: amount * 100, // Amount in paise
      currency: "INR",
      companyId: company.id,
      planTier,
      billingCycle: cycle,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_mockkey123",
    };

    return NextResponse.json({ order });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
