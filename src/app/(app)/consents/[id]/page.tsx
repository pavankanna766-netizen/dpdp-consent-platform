import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";

import { ConsentHistory } from "@/components/consents/consent-history";
import { ConsentReceiptCard } from "@/components/consents/consent-receipt-card";
import { ConsentStatusBadge } from "@/components/consents/consent-status-badge";
import { WithdrawButton } from "@/components/consents/withdraw-button";
import { PageHeader } from "@/components/dashboard/page-header";
import { ensureCompany } from "@/services/company.service";
import {
  getCompanyConsent,
  getConsentHistory,
} from "@/services/consent.service";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function ConsentDetailsPage({ params }: Props) {
  const { id } = await params;
  const { userId } = await auth();

  if (!userId) {
    notFound();
  }

  const company = await ensureCompany(userId, "My Company");

  let consent;

  try {
    consent = await getCompanyConsent(company.id, id);
  } catch {
    notFound();
  }

  const history = await getConsentHistory(
    company.id,
    consent.subject_identifier
  );
  const purpose = consent.metadata?.purpose;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Consent details"
        description="A tenant-scoped, audit-ready consent record."
      />

      <section className="space-y-6 rounded-xl border bg-card p-6 sm:p-8">
        <div className="grid gap-6 sm:grid-cols-2">
          <Detail label="Subject" value={consent.subject_identifier} />
          <div>
            <p className="text-sm text-muted-foreground">Status</p>
            <div className="mt-1">
              <ConsentStatusBadge status={consent.status} />
            </div>
          </div>
          <Detail label="Template version" value={`v${consent.version}`} />
          <Detail
            label="Granted"
            value={new Date(consent.granted_at).toLocaleString()}
          />
          <Detail
            label="Purpose"
            value={typeof purpose === "string" ? purpose : "Not recorded"}
          />
          {consent.withdrawn_at && (
            <Detail
              label="Withdrawn"
              value={new Date(consent.withdrawn_at).toLocaleString()}
            />
          )}
        </div>

        <div>
          <p className="text-sm text-muted-foreground">Consent text snapshot</p>
          <div className="mt-2 whitespace-pre-wrap rounded-lg border bg-muted/30 p-4 text-sm">
            {consent.consent_text}
          </div>
        </div>

        <div className="border-t pt-6">
          {consent.status === "granted" ? (
            <WithdrawButton consentId={consent.id} />
          ) : (
            <p className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
              This consent has been withdrawn and cannot be withdrawn again.
            </p>
          )}
        </div>
      </section>

      <ConsentReceiptCard consent={consent} />
      <ConsentHistory history={history} currentConsentId={consent.id} />
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 break-words font-medium">{value}</p>
    </div>
  );
}
