# PrivyStack Production Operations Runbook

## Overview
This runbook guides SRE, DevOps, and Platform Engineers through day-to-day production operations, job queue management, observability diagnostics, and service scaling for PrivyStack.

---

## 1. Job Queue Operations

### 1.1 Queue Status & Monitoring
Background jobs are queued in the `job_queue` table and dispatched asynchronously.
- **Pending / Queued Jobs**: Status `pending` (or `queued`) with `run_at <= NOW()`.
- **Processing Jobs**: Status `processing`.
- **Completed Jobs**: Status `completed`.
- **Failed Jobs**: Status `failed` (`attempts < max_attempts`).
- **Dead-Letter Queue (DLQ)**: Status `dlq` (`attempts >= max_attempts`).

### 1.2 Retrying Failed & DLQ Jobs
To requeue a dead-letter job from admin operations:
```sql
UPDATE job_queue 
SET status = 'pending', attempts = 0, last_error = NULL, run_at = NOW() 
WHERE id = '<JOB_ID>' AND status = 'dlq';
```

### 1.3 Cancelling Stuck / Long-Running Jobs
```sql
UPDATE job_queue 
SET status = 'cancelled', cancelled_at = NOW() 
WHERE id = '<JOB_ID>' AND status IN ('pending', 'processing');
```

---

## 2. Centralized Observability & Health Diagnostics

### 2.1 Diagnostics Endpoint
Access runtime health diagnostics at `/api/observability/stats` or `/api/health`:
- **API Health**: Returns HTTP 200 `status: "healthy"`.
- **Database Latency**: Evaluates ping duration against Supabase PostgreSQL.
- **Redis Health**: Checks Upstash REST connection status and falls back to Supabase RPC rate limiting when unavailable.
- **Sentry Observability**: Displays active release tag (`RELEASE_TAG`) and environment details.

---

## 3. Quotas & Usage Management

### 3.1 Warning Thresholds
- **Warning State (80%)**: When a company consumes 80% of API calls, scans, or exports, the `getCompanyQuotaStatus` helper flags `is_warning = true`.
- **Exceeded State (100%)**: When usage reaches 100%, requests return HTTP 429 Rate Limit / Quota Exceeded.

---

## 4. Environment & Secrets Validation
Production boot environment validation is enforced by `src/platform/config/env.ts`.
- Required Secrets: `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`.
- Startup Behavior: Application fails fast on missing production secrets.
