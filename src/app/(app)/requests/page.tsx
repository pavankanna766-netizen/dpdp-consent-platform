import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { ensureCompany } from "@/services/company.service";
import { getCompanyRequests, getRequestStatistics } from "@/services/dsar.service";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { RequestsTable } from "@/components/requests/requests-table";

export default async function RequestsPage() {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  const company = await ensureCompany(userId, "My Company");
  const requests = await getCompanyRequests(company.id);
  const stats = await getRequestStatistics(company.id);

  return (
    <div className="space-y-6">
      <PageHeader
        title="DSAR Requests"
        description="Manage Data Subject Access Requests under Section 11 of the DPDP Act 2023."
        actions={
          <Link
            href="/requests/new"
            className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
          >
            New Request
          </Link>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="Total Requests" value={stats.total} description="All submitted DSAR requests" />
        <StatCard title="Pending Review" value={stats.pending} description="Awaiting data fiduciary action" />
        <StatCard title="Completed" value={stats.completed} description="Fully resolved requests" />
      </div>

      <RequestsTable requests={requests} />
    </div>
  );
}