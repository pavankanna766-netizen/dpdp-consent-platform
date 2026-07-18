import { notFound, redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { ensureCompany } from "@/services/company.service";

import { PageHeader } from "@/components/dashboard/page-header";
import { RequestStatusBadge } from "@/components/requests/request-status-badge";
import { CompleteRequestButton } from "@/components/requests/complete-request-button";

import { getRequest } from "@/services/dsar.service";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function RequestDetailsPage({
  params,
}: Props) {
  const { id } = await params;
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const company = await ensureCompany(userId, "My Company");
  let request;

  try {
    request = await getRequest(company.id, id);
  } catch {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="DSAR Request"
        description="Request details"
      />

      <div className="rounded-xl border bg-white p-8 space-y-6">
        <div>
          <h2 className="text-sm text-gray-500">
            Subject
          </h2>
          <p>{request.subject_identifier}</p>
        </div>

        <div>
          <h2 className="text-sm text-gray-500">
            Request Type
          </h2>
          <p>{request.request_type}</p>
        </div>

        <div>
          <h2 className="text-sm text-gray-500">
            Status
          </h2>

          <RequestStatusBadge
            status={request.status}
          />
        </div>

        <div>
          <h2 className="text-sm text-gray-500">
            Description
          </h2>

          <p>
            {request.description ??
              "No description provided."}
          </p>
        </div>

        <div>
          <h2 className="text-sm text-gray-500">
            Created
          </h2>

          <p>
            {new Date(
              request.created_at
            ).toLocaleString()}
          </p>
        </div>

        {request.status === "pending" && (
          <CompleteRequestButton
            requestId={request.id}
          />
        )}
      </div>
    </div>
  );
}