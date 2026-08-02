# PrivyStack Enterprise Sentry Observability & SRE Guide

Production-grade error tracking, performance tracing, release tracking, and alert readiness using Sentry.

---

## 1. Environment Variables Configuration

Configure the following environment variables in your deployment environment (`.env.local` / Vercel Secrets / Docker):

```bash
# Sentry DSN & Environment
NEXT_PUBLIC_SENTRY_DSN=https://your-dsn-key@o12345.ingest.sentry.io/67890
SENTRY_DSN=https://your-dsn-key@o12345.ingest.sentry.io/67890
SENTRY_ENVIRONMENT=production
SENTRY_RELEASE=v1.0.0

# Optional Auth Token for Source Map Uploads
SENTRY_AUTH_TOKEN=sntrys_1234567890_abcdefghijklmnopqrstuvwxyz

# App Version & Git Metadata
NEXT_PUBLIC_APP_VERSION=1.0.0
NEXT_PUBLIC_GIT_SHA=ee4c7b2
```

---

## 2. Observability Architecture & Context Enrichment

Every captured exception and performance trace automatically redacts PII/secrets (`password`, `secret`, `token`, `authorization`, `credit_card`) and enriches events with:

- `company_id` (Tenant Organization ID)
- `user_id` (Clerk Authenticated User ID)
- `endpoint` (API / Server Action Route)
- `request_id` (Correlation ID)
- `release` (`version`, `environment`, `commitSha`, `buildTimestamp`)

---

## 3. Performance Tracing Spans

Tracing is active for:
- API Route Handlers (`/api/*`)
- Database query execution
- Background Queue Workers (`TriggerJobOrchestrator`)
- Privacy & Cookie Policy Generators
- Document PDF Renderer
- Webhook dispatches & Notification engine

---

## 4. Alert Rules & Incident Management Recommendations

Set up the following Alert Rules in Sentry Dashboard:

1. **Queue Execution Failure**: Filter `job_type` failures exceeding 3 retries.
2. **High API Error Rate**: Trigger when 5xx response rate exceeds 1% over 5 minutes.
3. **Slow Transaction Warning**: Trigger when span duration exceeds 1,000ms.
4. **Redis / DB Degradation**: Alert on `[RateLimit]` or `[Redis]` fallback warnings.

---

## 5. Graceful Degradation Strategy

If Sentry is unconfigured or experiences network timeouts:
- The application **never crashes or blocks HTTP responses**.
- Exceptions are logged to the structured server console via `logger.error` with PII redaction.
- Observability endpoints (`/api/ready`, `/api/observability/stats`) report Sentry status as `sentryConnected: false`.
