# PrivyStack Incident Response & Emergency Procedures

## Severity Levels

| Severity Level | Definition | Target Resolution SLA | Escalation Path |
|---|---|---|---|
| **SEV-1 (Critical)** | Complete service outage, data corruption, or active security breach | < 30 Minutes | On-Call Lead → CTO |
| **SEV-2 (Major)** | Major component outage (e.g. Website Scanner or Billing checkout failing) | < 2 Hours | Senior SRE → Tech Lead |
| **SEV-3 (Minor)** | Minor UI bug or non-critical background task delay | < 24 Hours | Product Engineering Team |

---

## Emergency Triage Flow

### 1. Verification & Diagnostics
1. Inspect live health status at `GET /api/health` and `GET /api/observability/stats`.
2. Inspect centralized Sentry exception telemetry for unhandled errors.
3. Check Better Stack log ingestion stream for structured JSON error logs.

### 2. Upstash Redis Outage Fallback
If Upstash Redis encounters connectivity issues:
- `UpstashRedisClient` automatically transitions to **Degraded Mode**.
- Rate limiting seamlessly cascades to Supabase RPC (`consume_rate_limit_token`).
- Application endpoints continue operating without user-facing disruption.

### 3. Database Outage / Failover
If Supabase primary database becomes unreachable:
- Sentry captures DB failure context.
- System emits HTTP 503 Service Unavailable with structured JSON message.
- SRE team verifies Supabase status dashboard and triggers Point-in-Time Recovery (PITR) if required.
