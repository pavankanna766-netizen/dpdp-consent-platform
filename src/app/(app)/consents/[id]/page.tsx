import { notFound } from "next/navigation";

import { WithdrawButton } from "@/components/consents/withdraw-button";

import {
  getConsent,
} from "@/services/consent.service";

import {
  ConsentStatusBadge,
} from "@/components/consents/consent-status-badge";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ConsentDetailsPage({
  params,
}: Props) {
  const { id } = await params;

  let consent;

  try {
    consent = await getConsent(id);
  } catch {
    notFound();
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">
          Consent Details
        </h1>

        <p className="text-gray-500 mt-2">
          Complete consent record.
        </p>
      </div>

      <div className="rounded-xl border bg-white p-8 space-y-6">

        <div>
          <h2 className="text-sm text-gray-500">
            Subject
          </h2>

          <p className="font-medium">
            {consent.subject_identifier}
          </p>
        </div>

        <div>
          <h2 className="text-sm text-gray-500">
            Status
          </h2>

          <ConsentStatusBadge
            status={consent.status}
          />
        </div>

        <div>
          <h2 className="text-sm text-gray-500">
            Version
          </h2>

          <p>
            {consent.version}
          </p>
        </div>

        <div>
          <h2 className="text-sm text-gray-500">
            Granted At
          </h2>

          <p>
            {new Date(
              consent.granted_at
            ).toLocaleString()}
          </p>
        </div>

        <div>
          <h2 className="text-sm text-gray-500">
            Consent Text Snapshot
          </h2>

          <div className="mt-2 rounded-lg border p-4 whitespace-pre-wrap">
            {consent.consent_text}
          </div>
        </div>
      <div className="pt-6 border-t">
  {consent.status === "granted" ? (
    <WithdrawButton
      consentId={consent.id}
    />
  ) : (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4">
      <h3 className="font-medium text-red-700">
        Consent Withdrawn
      </h3>

      <p className="mt-2 text-sm text-red-600">
        This consent has already been withdrawn.
      </p>

      {consent.withdrawn_at && (
        <p className="mt-1 text-sm text-red-600">
          Withdrawn on{" "}
          {new Date(
            consent.withdrawn_at
          ).toLocaleString()}
        </p>
      )}
    </div>
  )}
</div>
      </div>
    </div>
  );
}