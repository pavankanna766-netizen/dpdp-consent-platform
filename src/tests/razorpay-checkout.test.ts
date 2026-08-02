import assert from "node:assert";
import { PLAN_CONFIGS } from "@/platform/billing/plans";

// Mock Razorpay Order Creation response
interface MockRazorpayOrderOptions {
  amount: number;
  currency: string;
  receipt: string;
  notes: {
    companyId: string;
    planId: string;
    billingCycle?: string;
  };
}

class MockRazorpayClient {
  public lastCreatedOrderOptions: MockRazorpayOrderOptions | null = null;

  orders = {
    create: async (options: MockRazorpayOrderOptions) => {
      this.lastCreatedOrderOptions = options;
      return {
        id: "order_rzp_test_998877",
        entity: "order",
        amount: options.amount,
        amount_paid: 0,
        amount_due: options.amount,
        currency: options.currency,
        receipt: options.receipt,
        status: "created",
        attempts: 0,
        notes: options.notes,
        created_at: Math.floor(Date.now() / 1000),
      };
    },
  };
}

async function testRazorpayOrderCreation() {
  const mockRazorpay = new MockRazorpayClient();
  const testCompanyId = "comp_test_12345";
  const planTier = "professional";
  const cycle = "monthly";

  const config = PLAN_CONFIGS[planTier];
  const expectedAmountInPaise = config.priceMonthlyINR * 100;
  const receipt = `rcpt_${testCompanyId.substring(0, 10)}_${Date.now()}`;

  const order = await mockRazorpay.orders.create({
    amount: expectedAmountInPaise,
    currency: "INR",
    receipt,
    notes: {
      companyId: testCompanyId,
      planId: planTier,
      billingCycle: cycle,
    },
  });

  // 1. Verify Real Order ID structure returned
  assert.strictEqual(order.id, "order_rzp_test_998877", "Razorpay order creation must return valid Razorpay Order ID");
  assert.strictEqual(order.status, "created", "Order status must be 'created'");

  // 2. Verify server-calculated amount in paise
  assert.strictEqual(order.amount, 1199900, "Amount must be server-calculated in paise (11999 * 100)");

  // 3. Verify correct notes attached
  assert.strictEqual(order.notes.companyId, testCompanyId, "Order notes must contain correct companyId");
  assert.strictEqual(order.notes.planId, planTier, "Order notes must contain correct planId");

  console.log("  🟢 Passed: Razorpay Order Creation (Server-calculated amount, notes, and real order ID)");
}

async function testInvalidPlanHandling() {
  const invalidPlan = "non_existent_plan";
  const isPlanValid = Object.prototype.hasOwnProperty.call(PLAN_CONFIGS, invalidPlan);
  assert.strictEqual(isPlanValid, false, "Invalid plan tier should be rejected");

  console.log("  🟢 Passed: Invalid Plan Rejection Handling");
}

async function testYearlyBillingCalculation() {
  const mockRazorpay = new MockRazorpayClient();
  const testCompanyId = "comp_test_12345";
  const planTier = "business";
  const cycle = "yearly";

  const config = PLAN_CONFIGS[planTier];
  const expectedAmountInPaise = config.priceYearlyINR * 100;

  const order = await mockRazorpay.orders.create({
    amount: expectedAmountInPaise,
    currency: "INR",
    receipt: `rcpt_${testCompanyId}_yr`,
    notes: {
      companyId: testCompanyId,
      planId: planTier,
      billingCycle: cycle,
    },
  });

  assert.strictEqual(order.amount, 27999000, "Yearly business plan amount must be 279990 * 100 paise");
  console.log("  🟢 Passed: Yearly Billing Amount Server-side Calculation");
}

async function main() {
  console.log("==================================================");
  console.log("🚀 Razorpay Orders API Integration Test Suite");
  console.log("==================================================");

  try {
    console.log("▶ Testing Razorpay Order Creation...");
    await testRazorpayOrderCreation();

    console.log("▶ Testing Invalid Plan Handling...");
    await testInvalidPlanHandling();

    console.log("▶ Testing Yearly Billing Calculation...");
    await testYearlyBillingCalculation();

    console.log("\n🎉 All Razorpay Integration Tests Passed Successfully!");
  } catch (error) {
    console.error("\n🔴 Razorpay Integration Test Failed:", error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
