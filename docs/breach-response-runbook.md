## Overview
This runbook outlines the internal process for responding to a suspected data breach affecting PrivyStack or its customers' data. India's DPDP Act and CERT-In rules require strict notification timelines.

## Regulatory Deadlines
| Regulator | Deadline | Requirement |
|---|---|---|
| **CERT-In** | **6 hours** from discovery | Report the incident via cert-in.org.in portal |
| **Data Protection Board of India (DPBI)** | **72 hours** from awareness | Notify the Board and affected Data Principals |

## Incident Severity Classification
| Level | Description | Example |
|---|---|---|
| **P0 — Critical** | Confirmed unauthorized access to personal data | DB credentials leaked, cross-tenant data exposure |
| **P1 — High** | Suspected access, evidence unclear | Anomalous query patterns, suspicious login activity |
| **P2 — Medium** | Vulnerability discovered, no evidence of exploitation | Unpatched dependency, misconfigured RLS |
| **P3 — Low** | Security event, no data risk | Failed brute-force attempt, rate limit triggers |

## Response Steps

### 1. Discovery & Triage (0–30 minutes)
- [ ] **Identify**: Who discovered the incident? How?
- [ ] **Contain**: Immediately revoke compromised credentials (Supabase service-role key, Clerk API keys, Razorpay keys)
- [ ] **Classify**: Assign severity level (P0–P3)
- [ ] **Notify internally**: Alert the incident response team (founders, CTO, legal counsel)
- [ ] **Start the clock**: Record discovery timestamp in the breach_incidents table via admin API

### 2. Investigation (30 minutes – 4 hours)
- [ ] **Scope**: Which tables/data were accessed? Which tenants affected?
- [ ] **Evidence**: Pull audit_logs for the affected company_id(s) — verify hash chain integrity using `verify_audit_chain()` SQL function
- [ ] **Root cause**: How did the breach occur? Application bug? Credential leak? Social engineering?
- [ ] **Impact assessment**: Number of affected Data Principals, categories of data exposed

### 3. CERT-In Notification (within 6 hours)
- [ ] Submit incident report at https://cert-in.org.in
- [ ] Include: type of incident, affected systems, initial assessment
- [ ] Record `certin_notified_at` timestamp in breach_incidents table
- [ ] Retain confirmation/reference number

### 4. Containment & Remediation (parallel to notifications)
- [ ] Patch the vulnerability
- [ ] Rotate ALL affected credentials
- [ ] If cross-tenant: audit every tenant's data for unauthorized access
- [ ] Deploy fix to production
- [ ] Verify fix with targeted tests

### 5. DPBI & Data Principal Notification (within 72 hours)
- [ ] Prepare formal notification to Data Protection Board of India
- [ ] Prepare notifications to affected Data Principals (per Section 8 of DPDP Act)
- [ ] Include: nature of breach, data categories affected, remedial actions taken, contact for queries
- [ ] Record `dpbi_notified_at` timestamp in breach_incidents table

### 6. Post-Incident Review (within 7 days)
- [ ] Conduct post-mortem
- [ ] Document lessons learned
- [ ] Update security controls to prevent recurrence
- [ ] Update this runbook if gaps were found

## Key Contacts
| Role | Name | Contact |
|---|---|---|
| Incident Commander | TBD | |
| Technical Lead | TBD | |
| Legal Counsel | TBD | |
| CERT-In Portal | — | https://cert-in.org.in |
| DPBI Portal | — | https://dpbi.gov.in (when operational) |

## Tools & Access Required
- Supabase Dashboard (direct DB access for emergency queries)
- Clerk Dashboard (user/session management)
- Vercel Dashboard (deployment logs, environment variables)
- PrivyStack audit_logs table (hash-chain verification)
- breach_incidents table (incident tracking)
