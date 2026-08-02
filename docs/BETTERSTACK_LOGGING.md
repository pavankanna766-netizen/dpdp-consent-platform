# PrivyStack Centralized Logging & Better Stack Incident Management

Production-grade structured JSON logging, uptime monitoring, and incident alert readiness powered by Better Stack (Logtail + Better Uptime).

---

## 1. Environment Variables Configuration

Configure the following environment variables in your deployment environment (`.env.local` / Vercel Secrets / Docker):

```bash
# Better Stack (Logtail) Log Ingestion
BETTERSTACK_SOURCE_TOKEN=your_betterstack_source_token_here
BETTERSTACK_ENDPOINT=https://in.logs.betterstack.com

# Log Level Configuration (debug | info | warn | error)
LOG_LEVEL=info
```

---

## 2. Structured JSON Schema

Every log emitted across API route handlers, server actions, background workers, and email notifications uses the following structured schema:

```json
{
  "dt": "2026-08-02T15:59:24.123Z",
  "timestamp": "2026-08-02T15:59:24.123Z",
  "level": "info",
  "message": "[RateLimit] Using Redis-backed rate limiting (Upstash).",
  "environment": "production",
  "request_id": "req_8a9f2b1c4e7d",
  "company_id": "org_tenant_alpha",
  "user_id": "user_2a3b4c",
  "module": "rate_limiter",
  "event": "token_consumed",
  "duration": 14,
  "status": 200,
  "context": {
    "key": "rl:banner:tenant_alpha",
    "limit": 120
  }
}
```

### Automatic PII & Secret Redaction
The logging platform automatically scrubs: `password`, `token`, `secret`, `authorization`, `credit_card`, `ssn`, `consent_text`, `bearer`.

---

## 3. Better Uptime Endpoints

Better Stack Uptime monitors must point to the following production probes:

| Target Endpoint | Purpose | SLA / Threshold | Expected Status |
|---|---|---|---|
| `/` | Web Front-End Availability | $< 2,000\text{ms}$ | `200 OK` |
| `/api/live` | Kubernetes Liveness Probe | $< 200\text{ms}$ | `200 OK` (`"status": "live"`) |
| `/api/ready` | Supabase & Redis Readiness | $< 500\text{ms}$ | `200 OK` (`"status": "ready"`) |
| `/api/health` | Database RPC Ping | $< 1,000\text{ms}$ | `200 OK` (`"status": "healthy"`) |
| `/p/[company]/trust` | Public Trust Center SLA | $< 1,500\text{ms}$ | `200 OK` |
| `/api/banner/runtime/[token]` | CDN Cookie Banner Embed | $< 300\text{ms}$ | `200 OK` |

---

## 4. Incident Readiness & Alert Rules

Configure the following alert rules in Better Stack Incident Manager:

1. **Service Downtime**: Alert immediately if `/api/ready` returns non-200 status for > 1 minute.
2. **Database Failure**: Alert if `/api/health` returns `"db": "disconnected"`.
3. **Queue Backlog Spike**: Alert if `job_dead_letter_queue` count increases by $> 5$ items in 15 minutes.
4. **High Error Rate**: Alert if `level: "error"` log frequency exceeds 20 events per minute.

---

## 5. Log Search & Troubleshooting Examples

Search queries in Better Stack Telemetry Console:

- **Trace a specific user request**: `request_id:"req_8a9f2b1c4e7d"`
- **Filter organization errors**: `company_id:"org_alpha" AND level:"error"`
- **Monitor background worker failures**: `module:"job_orchestrator" AND level:"error"`
- **Audit email dispatch failures**: `event:"EMAIL_NOTIFICATION_SENT" AND status:"failed"`
