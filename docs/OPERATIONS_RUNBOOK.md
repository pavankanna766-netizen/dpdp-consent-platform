# PrivyStack SRE & Operations Runbook

## 1. System Overview & Health Endpoints
- **Liveness Probe**: `GET /api/live` (HTTP 200)
- **Readiness Probe**: `GET /api/ready` (HTTP 200 when DB, Redis, and Worker Queues are active)
- **Observability Metrics**: `GET /api/observability/stats` (Queue depth, latency, active consents)

---

## 2. Recovery Objectives (SLA / SLO)
- **Recovery Time Objective (RTO)**: `< 15 Minutes`
- **Recovery Point Objective (RPO)**: `< 5 Minutes`

---

## 3. Incident Response Playbooks

### A. High Database Latency / Supabase Outage
1. Inspect `/api/ready` probe output for database connectivity status.
2. Verify connection pooler limit settings in Supabase Dashboard.
3. Fallback: Enable read-only mode by routing traffic to cached Redis replicas.

### B. Background Worker Queue Backlog
1. Check `/api/observability/stats` queue stats (`pending`, `failed`, `dlq`).
2. If `dlq` count increases, inspect `public.job_dead_letter_queue` for failure reasons.
3. Trigger worker drain: `POST /api/jobs/process` with `Authorization: Bearer <JOB_WORKER_SECRET>`.

### C. Webhook Signature Verification Failures
1. Check Sentry logs for `webhook_dispatch` span failures.
2. Confirm subscriber secret mismatch in `public.webhook_subscriptions`.

---

## 4. Disaster Recovery & Database Backup Strategy
1. **Automated Daily Backups**: Managed Supabase Point-in-Time Recovery (PITR) enabled with 30-day retention.
2. **Database Restore**:
   - Navigate to Supabase Project Settings $\rightarrow$ Backups.
   - Select point-in-time snapshot prior to incident timestamp.
   - Execute `ANALYZE` after restoration to rebuild index statistics.
