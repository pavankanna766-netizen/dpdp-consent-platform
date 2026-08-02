# PrivyStack Secrets & Environment Variable Registry

Complete inventory of required and optional environment variables across environments.

---

## 1. Core Secrets Inventory

| Environment Variable | Description | Production Required? | Exposure |
|---|---|---|---|
| `NEXT_PUBLIC_APP_URL` | Base application URL | Yes | Client + Server |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase API endpoint | Yes | Client + Server |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon public key | Yes | Client + Server |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase admin key | Yes | Server ONLY |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key | Yes | Client + Server |
| `CLERK_SECRET_KEY` | Clerk private secret | Yes | Server ONLY |
| `RESEND_API_KEY` | Primary Email API key | Recommended | Server ONLY |
| `UPSTASH_REDIS_REST_URL` | Redis REST URL | Recommended | Server ONLY |
| `UPSTASH_REDIS_REST_TOKEN` | Redis REST token | Recommended | Server ONLY |
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry Error DSN | Recommended | Client + Server |
| `BETTERSTACK_SOURCE_TOKEN` | Better Stack Log token | Recommended | Server ONLY |
| `NEXT_PUBLIC_POSTHOG_KEY` | PostHog API key | Recommended | Client + Server |
| `RAZORPAY_KEY_ID` | Razorpay Key ID | Optional | Server ONLY |
| `RAZORPAY_KEY_SECRET` | Razorpay Key Secret | Optional | Server ONLY |

---

## 2. Secret Rotation Policy

1. **Supabase Service Role Key**: Rotate annually via Supabase API settings.
2. **Clerk Secret Key**: Rotate immediately upon developer offboarding or compromise.
3. **Resend / Upstash Tokens**: Regenerate via provider dashboards with 0 downtime using zero-downtime dual key rotation.
