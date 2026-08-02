# PrivyStack Backup Strategy & PITR Verification Guide

## 1. Supabase Backup Architecture
PrivyStack relies on Supabase Enterprise Automated Backups & Point-in-Time Recovery (PITR) for PostgreSQL database backup and recovery.

- **Point-in-Time Recovery (PITR)**: Enabled with 7-day or 30-day continuous WAL archiving. Allows restoring database state to any exact second.
- **Daily Physical Backups**: Automated daily full snapshots retained in geo-redundant storage.

---

## 2. Backup Verification Procedure (Quarterly Runbook)

### Step 1: Create Staging Restoration Project
1. Log into Supabase Dashboard.
2. Select **Database** → **Backups** → **Point in Time Analysis**.
3. Select target restoration timestamp `T_target` (e.g. 2 hours prior).
4. Trigger restoration to a isolated staging database project `privystack-staging-restore`.

### Step 2: Data Integrity Verification Script
Run the automated schema & tenant data verification suite against restored staging DB:
```bash
# Verify all domain tables present
npx tsx --env-file=.env.staging src/tests/cross-tenant-isolation.test.ts
```

### Step 3: Audit Log & Proof Validation
1. Verify `consents` table row count matches primary database snapshot.
2. Verify `audit_logs` cryptographic hash chain integrity (`verifyAuditIntegrity`).
3. Teardown temporary staging restoration instance upon signoff.
