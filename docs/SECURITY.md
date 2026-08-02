# PrivyStack Enterprise Security & Hardening Model

## Security Architecture

PrivyStack enforces a multi-layered security architecture designed for compliance with DPDP Act (India), GDPR, and SOC 2 Type II controls.

---

## 1. Authentication & Session Management
- **Primary Auth**: Managed via Clerk Enterprise Authentication with mandatory Multi-Factor Authentication (MFA).
- **Session Tokens**: Short-lived JWTs (15-minute expiration) with automatic rotation.

---

## 2. Multi-Tenant Data Isolation
- **Row Level Security (RLS)**: Enforced across all 26 Supabase PostgreSQL database tables.
- **Server-Side Tenant Derivation**: Every route handler derives `company_id` using `auth() → ensureCompany()`. Client-supplied IDs are never trusted.
- **Automated Test Coverage**: 18-domain cross-tenant isolation test suite (`npm run test:isolation`) verifies strict data separation.

---

## 3. Cryptographic Proof & Secret Masking
- **Consent Proof**: Consent receipts generate SHA-256 digests combining timestamp, IP, User-Agent, and consent text.
- **Secret Masking**: All API key logs and telemetry streams automatically redact secret parameters.
