import { auth } from "@clerk/nextjs/server";
import Link from "next/link";

import { DataTable } from "@/components/table";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { ConsentStatusBadge } from "@/components/consents/consent-status-badge";

import { ensureCompany } from "@/services/company.service";
import {
  getCompanyConsents,
  getConsentStatistics,
} from "@/services/consent.service";

export default async function ConsentsPage() {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  const company = await ensureCompany(
    userId,
    "My Company"
  );

  const consents = await getCompanyConsents(
    company.id
  );

  const stats = await getConsentStatistics(
    company.id
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Consent Management"
        description="View and manage customer consents."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Total Consents"
          value={stats.total}
          description="All consent records"
          icon={<span>📊</span>}
        />

        <StatCard
          title="Granted"
          value={stats.granted}
          description="Currently active"
          icon={<span>🟢</span>}
        />

        <StatCard
          title="Withdrawn"
          value={stats.withdrawn}
          description="Consent revoked"
          icon={<span>🔴</span>}
        />
      </div>

      {consents.length === 0 ? (
        <div className="rounded-xl border bg-white p-10 text-center text-gray-500">
          No consents have been collected yet.
        </div>
      ) : (
        <DataTable
          headers={[
            "Subject",
            "Status",
            "Granted",
            "Version",
            "Action",
          ]}
        >
          {consents.map((consent) => (
            <tr
              key={consent.id}
              className="border-b"
            >
              <td className="px-6 py-4">
                {consent.subject_identifier}
              </td>

              <td className="px-6 py-4">
                <ConsentStatusBadge
                  status={consent.status}
                />
              </td>

              <td className="px-6 py-4">
                {new Date(
                  consent.granted_at
                ).toLocaleString()}
              </td>

              <td className="px-6 py-4">
                {consent.version}
              </td>

              <td className="px-6 py-4">
                <Link
                  href={`/consents/${consent.id}`}
                  className="font-medium text-blue-600 hover:underline"
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