# PrivyStack Platform Changelog

## [1.0.0-Enterprise] - 2026-08-02

### Added
- **Enterprise SSO & SCIM Architecture**: Generic SAML 2.0, Microsoft Entra ID (Azure AD), and SCIM 2.0 user provisioning readiness abstractions.
- **Enterprise Compliance Exporter**: Multi-format compliance reporting for Audit Logs, Vendor Registry, Data Inventory, DSAR Requests, and Breach Incidents in JSON and CSV formats.
- **Razorpay Orders Integration**: Production-grade Razorpay Orders API integration with HMAC SHA-256 signature verification and timing-safe digest comparisons.
- **Production Redis & Sentry Observability**: Upstash Redis REST client with degraded mode fallback and enterprise Sentry context enrichment.
- **Centralized Better Stack Logging**: Structured JSON log streaming with request correlation ID tracing (`x-request-id`).
- **PostgreSQL Database Schema Hardening**: Column-guarded zero-downtime PL/pgSQL migration with composite indexes, JSONB GIN indexes, CHECK constraints, and automated `updated_at` triggers.
- **18-Domain Cross-Tenant Data Isolation Test Suite**: Comprehensive automated multi-tenant isolation testing across all 18 core domain repositories.
