# PrivyStack Enterprise Notification Platform

Production-grade, queue-aware, provider-agnostic notification engine powered by Resend as the primary provider with automated SMTP fallback.

---

## 1. Required Environment Variables

Add the following environment variables to your `.env.local` / production secrets store:

```bash
# Primary Provider: Resend
RESEND_API_KEY=re_123456789_abcdefghijklmnopqrstuvwxyz
RESEND_FROM_EMAIL="PrivyStack Notifications <notifications@privystack.com>"

# Fallback Provider: Enterprise SMTP (Optional)
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=SG.xxxxxx
SMTP_FROM=notifications@privystack.com
SMTP_RELAY_URL=https://smtp.privystack.com/v1/send
```

---

## 2. Architecture & Design Principles

```
  ┌─────────────────────────────────────────────────────────────┐
  │                   Application Event Dispatch                 │
  └──────────────────────────────┬──────────────────────────────┘
                                 │
                                 ▼
  ┌─────────────────────────────────────────────────────────────┐
  │          NotificationService (Asynchronous Enqueue)         │
  └──────────────────────────────┬──────────────────────────────┘
                                 │
                                 ▼
  ┌─────────────────────────────────────────────────────────────┐
  │            Supabase Background Job Queue (job_queue)         │
  └──────────────────────────────┬──────────────────────────────┘
                                 │
                                 ▼
  ┌─────────────────────────────────────────────────────────────┐
  │                 TriggerJobOrchestrator Worker               │
  └──────────────────────────────┬──────────────────────────────┘
                                 │
       ┌─────────────────────────┴─────────────────────────┐
       ▼                                                   ▼
┌───────────────┐                                   ┌───────────────┐
│ Primary Resend│  ──(Failure / Fallback Switch)──> │  SMTP Relay   │
└───────┬───────┘                                   └───────┬───────┘
        │                                                   │
        └────────────────────────┬──────────────────────────┘
                                 │
                                 ▼
  ┌─────────────────────────────────────────────────────────────┐
  │    Metadata Audit Logging & Notification Preference Checks  │
  └─────────────────────────────────────────────────────────────┘
```

- **Zero API Blocking**: Email dispatches are enqueued as `NOTIFICATION_EMAIL` background jobs. API HTTP handlers return immediately.
- **Provider Agnostic**: Standardized `NotificationProvider` interface. Easily swap or add AWS SES, Postmark, SendGrid, or custom SMTP without changing business logic.
- **Privacy First (Metadata Only)**: Email bodies are rendered ephemerally at runtime. Only delivery metadata (`recipient`, `template`, `status`, `provider`, `provider_message_id`, `timestamps`) is stored in `notification_logs`.
- **Automatic Retries & Dead Letter Queue (DLQ)**: Failing dispatches automatically retry up to `max_attempts` (default: 3). Unrecoverable failures move to `job_dead_letter_queue` for operator inspection.

---

## 3. Local Development Setup

1. **Set Environment Variables**:
   Update `.env.local` with your Resend API Key:
   ```bash
   RESEND_API_KEY="re_test_key"
   ```

2. **Triggering Notifications in Code**:
   ```typescript
   import { notificationService } from "@/services/notification.service";

   // Trigger welcome email asynchronously
   await notificationService.sendWelcome(
     companyId,
     "user@company.com",
     "Jane Doe",
     "https://app.privystack.com/login"
   );
   ```

3. **Processing Background Jobs Locally**:
   Call the background queue worker endpoint:
   ```bash
   curl -X POST http://localhost:3000/api/jobs/process
   ```

---

## 4. Production Deployment & Monitoring

- Ensure `RESEND_API_KEY` is configured in Vercel / Docker secrets.
- Verify `notification_preferences` checks allow users to manage opt-out settings for marketing and non-critical security alerts.
- Monitor failed deliveries in Sentry or via `/api/notifications/logs`.
