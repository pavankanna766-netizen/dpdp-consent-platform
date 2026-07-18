import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { ensureCompany } from "@/services/company.service";
import Razorpay from "razorpay";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { planId } = await req.json();
    if (!planId || !["starter", "growth"].includes(planId)) {
      return NextResponse.json({ error: "Invalid plan ID" }, { status: 400 });
    }

    const company = await ensureCompany(userId, "My Company");

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return NextResponse.json(
        { error: "Razorpay credentials are not configured in system environment variables (RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET)" },
        { status: 500 }
      );
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const amount = planId === "starter" ? 350000 : 999900; // in paise

    const order = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt: company.id,
      notes: {
        companyId: company.id,
        planId,
      },
    });

    return NextResponse.json({
      key: keyId,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      companyName: company.company_name,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create checkout" }, { status: 500 });
  }
}
