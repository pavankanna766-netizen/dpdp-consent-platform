# PrivyStack Project Progress Ledger

This document tracks all features, schema migrations, and bug fixes applied to PrivyStack to reach launch readiness.

---

## 📅 July 18, 2026

### 1. E2E Test Suite & Chain Mocks
*   **What changed:** Refactored the mock client in `src/tests/run-tests.ts` to support chainable `.eq()` filters and intercepted database `.rpc()` calls (like `get_audit_stats` and `get_consent_stats`).
*   **Why:** Harding updates to isolate by `company_id` broke the mock client return chain, causing E2E test suite runtime crashes.
*   **Assumptions:** Mock clients should mimic PostgREST fluent interfaces without introducing complex external mocking libraries.

### 2. Supabase Row Level Security (RLS)
*   **What changed:** Created SQL migrations enabling RLS across all 18 tables, with access rules scoped using JWT sub claims mapped through helper functions (`is_company_member` and `current_user_clerk_id`).
*   **Why:** Satisfying the P0 non-delegable multi-tenancy requirements to ensure a bug in application code cannot leak cross-tenant records.

### 3. Serverless Rate Limiting
*   **What changed:** Switched from `MemoryRateLimitStore` to `SupabaseRateLimitStore` executing the concurrency-safe `consume_rate_limit_token` function inside Postgres using row-level locking (`FOR UPDATE`).
*   **Why:** Serverless hosting (Vercel) resets memory contexts per execution. Shifting rate checks to DB tokens ensures horizontal scaling.

### 4. Public Consent Idempotency
*   **What changed:** Wired `idempotencyEngine` into the public POST `/api/public/consent` endpoint, recording keys in `idempotency_keys` table.
*   **Why:** Prevents duplicate consent records from being created due to browser page double-clicks.

### 5. Database Counts Optimization
*   **What changed:** Swapped in-memory array evaluations with database aggregate RPC procedures (`get_audit_stats` and `get_consent_stats`).
*   **Why:** Pulling entire history logs to count records causes timeouts at scale. Offloading calculations to indexing nodes scales to millions.

### 6. Hindi Dictionary & Presets
*   **What changed:** Created the Hindi language mapping `hi.ts` and registered it in the localization engine. Added a preset dropdown to `TemplateForm` containing English/Hindi notices, minor consent forms (Section 9), and marketing agreements.
*   **Why:** Bilingual consent flows are a core India-first compliance mandate.

### 7. Automated Registries Scanner Sync
*   **What changed:** Configured Playwright scans to automatically populate new `vendor_registry` and `data_inventory` tables with detected scripts, flagging them as `unconfirmed: true` until manually audited in the UI.
*   **Why:** Differentiates PrivyStack from manual entry boards by auto-discovering active data flows.

### 8. Legal Safety Gate
*   **What changed:** Added `reviewed_by_counsel` column to policies and blocked publishing inside policy services if the check is `false`.
*   **Why:** Restricts published policy versions to human-approved legal audits.

### 9. Cryptographic Audit Log Hash Chaining
*   **What changed:** Updated `createAuditLog` in `audit.repository.ts` to compute a cryptographic SHA-256 chain. Each row contains the previous log's `entry_hash` and generates its own hash based on all fields, making the append-only ledger tamper-evident.
*   **Why:** Strict auditing compliance to safeguard the system from history mutations.

### 10. Incident Responses, Billing, & Docs
*   **What changed:** Integrated twin regulatory clocks (6h CERT-In vs 72h DPBI) on breach incidents, built a Razorpay subscription overlay simulator, and added the Developer SDK API guides.
*   **Why:** Completes the launch readiness loop.

### 11. Relational Hardening & DB Integrity
*   **What changed:** 
    1. Created the `data_inventory_vendors` join table to link inventory items and vendors relationally, replacing flat text references to eliminate naming drift risks.
    2. Enforced legal safety gates at the database schema level by adding `CHECK` constraints on `privacy_policies` and `cookie_policies` tables (`status <> 'published' or reviewed_by_counsel = true`).
    3. Revamped the breach incident dashboard with a persistent schema mapping dual deadline clocks (`certin_deadline` and `dpbi_deadline`) and notified timestamps.
    4. Auto-calculated the 30-day compliance SLA deadline (`sla_due_date`) inside the `createRequest` DSAR repository workflow.
*   **Why:** Secures the compliance ledger from data desynchronization and guarantees legal counsel approvals at the system level.

### 12. Production Build Compiler Verification
*   **What changed:** Audited the entire codebase using Turbopack production compilation (`npm run build`). Corrected all TypeScript type signatures, passed missing parameters on database queries, escaped raw HTML tags in JS text contexts, and created the missing `Textarea` UI component.
*   **Why:** Guarantees compile-time health and absolute stability for public hosting environments (e.g. Vercel).

### 13. Live Razorpay Billing Integration
*   **What changed:**
    1. Replaced the simulated modal with the **standard Razorpay Checkout SDK** inside the `/billing` page, loading dynamically.
    2. Implemented the POST `/api/billing/checkout` endpoint to dynamically verify plans and call Razorpay's `orders.create` API using environment credentials.
    3. Implemented the POST `/api/billing/verify` endpoint performing cryptographic signature verification (HMAC SHA-256) and handling idempotency checks via unique Postgres constraints on `razorpay_payment_id` logs.
    4. Implemented the POST `/api/billing/webhook` endpoint with HMAC signature checking to automatically sync subscription plans asynchronously on callback receipts.
    5. Configured pricing tiers: Free Sandbox (₹0), Startup Plan (₹3,500/month), Growing Business Plan (₹8,500/month), and quote-based Enterprise Plan.
*   **Why:** Replaces all mock elements with a production-ready, highly secure checkout workflow for public deployment.



