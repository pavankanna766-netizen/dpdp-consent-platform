# PrivyStack Production Launch Readiness Checklist

Pre-flight operational readiness checklist for enterprise SaaS launch.

---

## 1. Domain & DNS Configuration

| Subdomain | Target Service | Record Type | TTL |
|---|---|---|---|
| `app.privystack.com` | Next.js Web App | `CNAME` / `A` | 300s |
| `api.privystack.com` | API Platform Gateway | `CNAME` | 300s |
| `cdn.privystack.com` | Upstash CDN / Runtime Banners | `CNAME` | 300s |
| `trust.privystack.com` | Public Enterprise Trust Portals | `CNAME` | 300s |

---

## 2. Webhook Endpoints Configuration

- **Clerk Auth Webhooks**: `https://app.privystack.com/api/webhooks/clerk` (`user.created`, `organization.created`)
- **Razorpay Payment Webhooks**: `https://app.privystack.com/api/billing/webhook` (`payment.captured`, `subscription.charged`)
- **Third-Party Integrations**: `https://app.privystack.com/api/v1/webhooks/test`

---

## 3. Mandatory Security Verification

- [x] Strict Content Security Policy (CSP) headers enabled in `next.config.ts`.
- [x] HTTP Strict Transport Security (HSTS) with `max-age=63072000`.
- [x] Zero hardcoded secrets in repository.
- [x] Multi-tenant isolation unit tests passing (`src/tests/cross-tenant-isolation.test.ts`).
- [x] Input sanitization (`stripHtml`, `sanitizeIdentifier`) enforced on all user inputs.
