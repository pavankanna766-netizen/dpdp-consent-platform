# PrivyStack Webhooks Integration & Security Guide

## Overview
PrivyStack Webhooks deliver real-time notifications when events occur in your account (e.g. consent granted, DSAR request submitted, compliance score updated, vendor added).

---

## 1. Webhook Signature Verification

Every HTTP POST payload includes the `X-Razorpay-Signature` or `X-Privy-Signature` header calculated using HMAC SHA-256 with your endpoint secret:

$$\text{Signature} = \text{HMAC-SHA256}(\text{Raw Body Payload}, \text{Secret})$$

### Verification Code Example (Node.js):
```typescript
import crypto from "crypto";

export function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");

  const sigBuffer = Buffer.from(signature, "hex");
  const expectedBuffer = Buffer.from(expectedSignature, "hex");

  if (sigBuffer.length !== expectedBuffer.length) return false;
  return crypto.timingSafeEqual(sigBuffer, expectedBuffer);
}
```

---

## 2. Retry Policy & Exponential Backoff
- **Attempt 1**: Immediate on event trigger.
- **Attempt 2**: Retried in 60 seconds.
- **Attempt 3**: Retried in 300 seconds (5 minutes).
- **Attempt 4**: Retried in 1800 seconds (30 minutes).
- **Dead-Letter Queue (DLQ)**: Failed deliveries after 5 attempts transition to `status = 'dlq'`.
