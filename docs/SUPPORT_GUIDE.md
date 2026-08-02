# PrivyStack Customer Support & Operational Guide

## Overview
This guide equips Customer Support, Technical Account Managers, and Tier-2 Engineers to troubleshoot tenant issues, manage SDK connections, and resolve billing or consent delivery inquiries.

---

## Common Support Scenarios

### 1. Customer Report: "SDK Banner Not Showing on Website"
**Troubleshooting Steps**:
1. Check banner status in `cookie_banners` table (must be `published`).
2. Verify embed script tag token matches `embed_token` in `cookie_banners`.
3. Check browser console for Content Security Policy (CSP) blocking or ad-blocker suppression.
4. Verify domain is added to allowed origins in `company_settings`.

### 2. Customer Report: "Razorpay Webhook Failed / Plan Not Upgraded"
**Troubleshooting Steps**:
1. Inspect webhook logs in `notification_logs` or `webhook_deliveries`.
2. Check `billing_transactions` for `razorpay_order_id` record.
3. Verify signature headers in Webhook logs (invalid signatures return 401).
4. If payment succeeded in Razorpay dashboard, manually update subscription via `updateSubscriptionPlan(companyId, planId)`.

### 3. Audit Log Verification Inquiry
To verify that audit records have not been tampered with:
- Execute `verifyAuditIntegrity(companyId)` via backend console.
- Confirm `tampered_count === 0`.
