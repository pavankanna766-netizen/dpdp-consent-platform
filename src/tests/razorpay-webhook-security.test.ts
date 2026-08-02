import assert from "node:assert";
import crypto from "node:crypto";
import { billingPlatformService } from "@/services/billing-platform.service";

const TEST_WEBHOOK_SECRET = "test_rzp_webhook_secret_9988776655";

function generateTestSignature(payload: string, secret: string = TEST_WEBHOOK_SECRET): string {
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

async function testUnsignedRequest() {
  const payload = JSON.stringify({ event: "payment.captured", payload: {} });
  const missingSignature = "";

  const isValid = billingPlatformService.verifyRazorpayWebhookSignature(
    payload,
    missingSignature,
    TEST_WEBHOOK_SECRET
  );

  assert.strictEqual(isValid, false, "Unsigned request without signature header must be rejected");
  console.log("  🟢 Passed: Unsigned Request Rejected");
}

async function testWrongSignature() {
  const payload = JSON.stringify({ event: "payment.captured", payload: {} });
  const invalidSignature = "invalid_fake_signature_hex_string_1234567890abcdef1234567890abcdef";

  const isValid = billingPlatformService.verifyRazorpayWebhookSignature(
    payload,
    invalidSignature,
    TEST_WEBHOOK_SECRET
  );

  assert.strictEqual(isValid, false, "Request with wrong signature must be rejected");
  console.log("  🟢 Passed: Wrong Signature Rejected");
}

async function testModifiedPayload() {
  const originalPayload = JSON.stringify({ event: "payment.captured", amount: 1000 });
  const validSignature = generateTestSignature(originalPayload, TEST_WEBHOOK_SECRET);

  const modifiedPayload = JSON.stringify({ event: "payment.captured", amount: 99999 });

  const isValid = billingPlatformService.verifyRazorpayWebhookSignature(
    modifiedPayload,
    validSignature,
    TEST_WEBHOOK_SECRET
  );

  assert.strictEqual(isValid, false, "Request with modified payload must fail HMAC verification");
  console.log("  🟢 Passed: Tampered/Modified Payload Rejected");
}

async function testValidWebhook() {
  const validPayload = JSON.stringify({
    event: "payment.captured",
    event_id: "evt_valid_123",
    payload: {
      payment: {
        entity: {
          id: "pay_123456",
          amount: 1199900,
          notes: { companyId: "comp_orga", planId: "professional" },
        },
      },
    },
  });

  const validSignature = generateTestSignature(validPayload, TEST_WEBHOOK_SECRET);

  const isValid = billingPlatformService.verifyRazorpayWebhookSignature(
    validPayload,
    validSignature,
    TEST_WEBHOOK_SECRET
  );

  assert.strictEqual(isValid, true, "Valid HMAC signed webhook payload must pass verification");
  console.log("  🟢 Passed: Valid Webhook Signature Verified");
}

async function testDuplicateWebhookIdempotency() {
  const eventId = "evt_duplicate_test_999";

  const isFirstAttemptDuplicate = billingPlatformService.isDuplicateEvent(eventId);
  assert.strictEqual(isFirstAttemptDuplicate, false, "First delivery of event ID must not be flagged as duplicate");

  const isSecondAttemptDuplicate = billingPlatformService.isDuplicateEvent(eventId);
  assert.strictEqual(isSecondAttemptDuplicate, true, "Subsequent delivery of same event ID must be flagged as duplicate");

  console.log("  🟢 Passed: Duplicate Webhook Idempotency Detection");
}

async function testUnknownEventHandling() {
  const unknownPayload = JSON.stringify({ event: "refund.created", payload: {} });
  const validSignature = generateTestSignature(unknownPayload, TEST_WEBHOOK_SECRET);

  const isValid = billingPlatformService.verifyRazorpayWebhookSignature(
    unknownPayload,
    validSignature,
    TEST_WEBHOOK_SECRET
  );

  assert.strictEqual(isValid, true, "Signature for unknown event payload should still verify correctly");
  console.log("  🟢 Passed: Unknown Event Payload Verification Safe");
}

async function main() {
  console.log("==================================================");
  console.log("🔒 Razorpay Webhook Security Integration Test Suite");
  console.log("==================================================");

  try {
    console.log("▶ Testing Unsigned Request...");
    await testUnsignedRequest();

    console.log("▶ Testing Wrong Signature...");
    await testWrongSignature();

    console.log("▶ Testing Modified Payload...");
    await testModifiedPayload();

    console.log("▶ Testing Valid Webhook...");
    await testValidWebhook();

    console.log("▶ Testing Duplicate Webhook Idempotency...");
    await testDuplicateWebhookIdempotency();

    console.log("▶ Testing Unknown Event Handling...");
    await testUnknownEventHandling();

    console.log("\n🎉 All Razorpay Webhook Security Tests Passed Successfully!");
  } catch (error) {
    console.error("\n🔴 Razorpay Webhook Security Test Failed:", error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
