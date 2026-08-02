# PrivyStack PostHog Product Analytics & Conversion Funnels

Production-grade, tenant-safe product analytics platform powered by PostHog REST API with zero PII exposure and privacy opt-out compliance.

---

## 1. Environment Variables Configuration

Add the following environment variables to your `.env.local` / production environment:

```bash
# PostHog Product Analytics
NEXT_PUBLIC_POSTHOG_KEY=phc_1234567890abcdefghijklmnopqrstuvwxyz
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

---

## 2. Tracked Business Events

| Event Name | Category | Trigger / Context |
|---|---|---|
| `company_created` | Onboarding | Tenant provisioned via Clerk auth |
| `onboarding_started` | Onboarding | Wizard step 1 initial interaction |
| `onboarding_completed` | Onboarding | Domain setup & initial scan configured |
| `sdk_generated` | Developer | Embed token generated for banner SDK |
| `sdk_connected` | Telemetry | Live banner ping received from client domain |
| `first_scan_started` | Scanner | Automatic or manual site scan initiated |
| `first_scan_completed` | Scanner | Cookie & tracker audit findings compiled |
| `vendor_added` | Vendor Registry | New subprocessor record added |
| `data_inventory_created` | Inventory | PII category mapped in RoPA |
| `consent_template_published` | Consent | Banner notice design approved |
| `cookie_banner_published` | Banner | Live script tag published |
| `trust_center_published` | Trust Center | Custom slug domain published |
| `legal_document_generated` | Legal Studio | Statutory Privacy/Cookie Policy auto-drafted |
| `dsar_submitted` | Rights Portal | Data Principal request received |
| `dsar_completed` | Rights Portal | Request fulfilled by DPO |
| `team_member_invited` | IAM | Admin invitation email dispatched |
| `api_key_created` | Developer | Enterprise API secret key generated |
| `billing_subscription_started` | Monetization | Trial started or plan subscribed |
| `billing_upgraded` | Monetization | Tier upgraded (e.g. Free $\rightarrow$ Pro/Enterprise) |
| `billing_cancelled` | Monetization | Subscription cancelled |

---

## 3. Recommended Conversion Funnels in PostHog

1. **Activation Funnel**: `company_created` $\rightarrow$ `onboarding_completed` $\rightarrow$ `sdk_generated` $\rightarrow$ `first_scan_started` $\rightarrow$ `first_scan_completed`.
2. **Value Conversion Funnel**: `first_scan_completed` $\rightarrow$ `cookie_banner_published` $\rightarrow$ `trust_center_published`.
3. **Monetization Funnel**: `company_created` $\rightarrow$ `billing_subscription_started` $\rightarrow$ `billing_upgraded`.

---

## 4. Privacy & Tenant Safety

- **No PII Collection**: Email addresses, passwords, IP addresses, and personal details are stripped.
- **Tenant Isolation**: Every event carries `company_id`. PostHog dashboards filter by `company_id` to prevent cross-tenant telemetry leaks.
- **Data Principal Opt-Out**: Users can call `analyticsService.setOptOut(true)` or toggle the preference in client settings to halt telemetry collection in accordance with DPDP principles.
- **Graceful Degradation**: If PostHog API is unreachable or `NEXT_PUBLIC_POSTHOG_KEY` is omitted, events fall back silently to server logs — application features never crash.
