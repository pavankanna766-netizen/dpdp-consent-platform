# PrivyStack Enterprise Deployment Guide

Production deployment workflow, environment configuration, containerization, and DNS setup for PrivyStack.

---

## 1. Architecture Overview

- **Web & API Framework**: Next.js 16 App Router (Turbopack, Server Actions, Dynamic Edge Runtime)
- **Authentication & IAM**: Clerk Enterprise SSO & RBAC
- **Primary Database**: Supabase PostgreSQL with RLS (Row Level Security)
- **Cache & Rate Limiter**: Upstash Redis REST API
- **Background Queue & Workers**: Supabase Job Queue + `TriggerJobOrchestrator`
- **Transactional Notifications**: Resend Primary + SMTP Fallback
- **Observability Stack**: Sentry (Error/Performance), PostHog (Product Analytics), Better Stack (Centralized Logs & Uptime)

---

## 2. Environment Setup & Deployment Order

1. **Database Provisioning**: Supabase PostgreSQL instance. Run idempotent migrations.
2. **Authentication Setup**: Provision Clerk Application & configure OAuth providers.
3. **Cache & Queue Setup**: Upstash Redis Database instance.
4. **Environment Variables**: Configure all secrets in Vercel / Docker secrets.
5. **Container/Vercel Deployment**: Build Next.js 16 production image (`npm run build`).
6. **DNS & SSL Provisioning**: Point custom domains and configure CNAME records.
7. **Uptime Probe Activation**: Activate Better Uptime probes on `/api/ready` and `/api/live`.

---

## 3. Production Deployment Checklist

- [x] Configure production environment variables in `.env.local` or Vercel.
- [x] Run `npm run build` locally to verify 0 build or TypeScript compilation errors.
- [x] Verify Supabase Row Level Security (RLS) policies across all multi-tenant tables.
- [x] Verify SSL / TLS certificates on custom CNAME domains.
- [x] Activate Sentry error tracking and Better Stack log ingestion.
