import { auth } from "@clerk/nextjs/server";

import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { ConsentsTable } from "@/components/consents/consents-table";

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
        <div className="rounded-xl border border-gray-100 bg-white p-12 text-center text-gray-500 shadow-sm">
          No consents have been collected yet.
        </div>
      ) : (
        <ConsentsTable consents={consents} />
      )}
    </div>
  );
}