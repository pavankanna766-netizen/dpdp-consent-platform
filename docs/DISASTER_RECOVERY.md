# PrivyStack Disaster Recovery Plan & Backup Strategy

SRE Disaster Recovery Guide for RTO/RPO targets and incident resolution.

---

## 1. Recovery Time & Point Objectives

- **Recovery Time Objective (RTO)**: $< 15\text{ minutes}$ for complete platform recovery.
- **Recovery Point Objective (RPO)**: $< 5\text{ minutes}$ for data loss threshold via Supabase Point-In-Time-Recovery (PITR).

---

## 2. Database Backup & Restoration Procedure

1. **Automated Backups**: Supabase WAL (Write-Ahead Logging) continuous archiving enabled.
2. **Point-In-Time Restoration**:
   - Access Supabase Dashboard $\rightarrow$ Database $\rightarrow$ Backups $\rightarrow$ PITR.
   - Select target timestamp (up to 7 days back).
   - Restore database to isolated staging instance for verification before promoting to production.
3. **Manual Schema Snapshot**:
   ```bash
   supabase db dump -f backup_snapshot.sql --clean
   ```

---

## 3. Incident Escalation Workflow

1. Better Uptime / Sentry triggers incident alert via PagerDuty / Slack.
2. SRE On-Call inspects `/api/ready` health output to identify failing component (Database, Redis, Worker, Email).
3. If Redis fails: Platform degrades gracefully to Supabase RPC rate limiting without crashing.
4. If Primary Region fails: Trigger DNS failover to secondary Vercel / Supabase replica region.
