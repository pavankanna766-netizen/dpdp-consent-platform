import { auth } from "@clerk/nextjs/server";
import Link from "next/link";

import { RequestStatusBadge } from "@/components/requests/request-status-badge";

import { ensureCompany } from "@/services/company.service";
import {
  getCompanyRequests,
  getRequestStatistics,
} from "@/services/dsar.service";

import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { DataTable } from "@/components/table";

export default async function RequestsPage() {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  const company = await ensureCompany(
    userId,
    "My Company"
  );

  const requests =
    await getCompanyRequests(company.id);

  const stats =
    await getRequestStatistics(
      company.id
    );

  return (
    <div className="space-y-6">
      <PageHeader
  title="DSAR Requests"
  description="Manage privacy requests."
  actions={
  <Link
    href="/requests/new"
    className="rounded-lg bg-black px-4 py-2 text-white"
  >
    New Request
  </Link>
}
/>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Total"
          value={stats.total}
          description="All requests"
        />

        <StatCard
          title="Pending"
          value={stats.pending}
          description="Awaiting action"
        />

        <StatCard
          title="Completed"
          value={stats.completed}
          description="Resolved"
        />
      </div>

      {requests.length === 0 ? (
        <div className="rounded-xl border bg-white p-10 text-center text-gray-500">
          No requests yet.
        </div>
      ) : (
        <DataTable
          headers={[
            "Subject",
            "Type",
            "Status",
            "Created",
            "Action",
          ]}
        >
          {requests.map((request) => (
            <tr
              key={request.id}
              className="border-b"
            >
              <td className="px-6 py-4">
                {request.subject_identifier}
              </td>

              <td className="px-6 py-4">
                {request.request_type}
              </td>

              <td className="px-6 py-4">
  <RequestStatusBadge
    status={request.status}
  />
</td>

              <td className="px-6 py-4">
                {new Date(
                  request.created_at
                ).toLocaleString()}
              </td>

              <td className="px-6 py-4">
                <Link
                  href={`/requests/${request.id}`}
                  className="text-blue-600 hover:underline"
                >
                  View
                </Link>
              </td>
            </tr>
          ))}
        </DataTable>
      )}
    </div>
  );
}