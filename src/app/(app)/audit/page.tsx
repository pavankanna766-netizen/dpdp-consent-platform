import { auth } from "@clerk/nextjs/server";

import { EventBadge } from "@/components/audit/event-badge";

import { ensureCompany } from "@/services/company.service";

import { AuditToolbar } from "@/components/audit/audit-toolbar";

import { ExportButton } from "@/components/audit/export-button";

import {
  getAuditLogs,
  getAuditStatistics,
} from "@/services/audit.service";

import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { DataTable } from "@/components/table";

import Link from "next/link";

import { Pagination } from "@/components/table/pagination";

import { DEFAULT_AUDIT_PAGE_SIZE } from "@/config/pagination";

type Props = {
  searchParams: Promise<{
  search?: string;
  eventType?: string;
  from?: string;
  to?: string;
  page?: string;
}>;
};

export default async function AuditLogsPage({
  searchParams,
}: Props) {

  const params = await searchParams;

const search =
  params.search ?? "";

const eventType =
  params.eventType;

const page = Math.max(
  1,
  Number(params.page ?? "1") || 1
);

  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  const company = await ensureCompany(
    userId,
    "My Company"
  );

  const {
  logs,
  total,
} = await getAuditLogs(company.id, {
  search,
  eventType,
  from: params.from,
  to: params.to,
  page,
  pageSize: DEFAULT_AUDIT_PAGE_SIZE,
});

 const hasNext =
  page * DEFAULT_AUDIT_PAGE_SIZE < total;

  const stats =
    await getAuditStatistics(company.id);

  return (
    <div className="space-y-6">
      <PageHeader
  title="Audit Logs"
  description="Immutable history of all privacy events."
  actions={<ExportButton />}
/>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Total Events"
          value={stats.total.toString()}
          description="All recorded audit events"
          icon={<span>📜</span>}
        />

        <StatCard
          title="Today's Events"
          value={stats.today.toString()}
          description="Events recorded today"
          icon={<span>📅</span>}
        />

        <StatCard
          title="Event Types"
          value={stats.eventTypes.toString()}
          description="Unique event categories"
          icon={<span>⚡</span>}
        />
      </div>

<AuditToolbar
  search={search}
  eventType={eventType}
  from={params.from}
  to={params.to}
/>

<DataTable
  headers={[
    "Time",
    "Event",
    "Entity",
    "Actor",
  ]}
>
  {logs.map((log) => (
    <tr
  key={log.id}
  className="border-b transition hover:bg-slate-50"
>
      <td className="px-6 py-4">
        <Link
    href={`/audit/${log.id}`}
    className="block"
  >
    {new Date(
      log.created_at
    ).toLocaleString()}
  </Link>
      </td>

      <td className="px-6 py-4">
       <Link
    href={`/audit/${log.id}`}
    className="block"
  >
    <EventBadge
      event={log.event_type}
    />
  </Link>
</td>

      <td className="px-6 py-4">
         <Link
    href={`/audit/${log.id}`}
    className="block"
  >
    {log.entity_type}
  </Link>
      </td>

      <td className="px-6 py-4">
        <Link
    href={`/audit/${log.id}`}
    className="block"
  >
    {log.actor}
  </Link>
      </td>
    </tr>
  ))}
</DataTable>

{logs.length > 0 && (
  <Pagination
    page={page}
    hasNext={hasNext}
  />
)}

      {logs.length === 0 && (
        <div className="rounded-xl border bg-white p-10 text-center text-gray-500">
          No audit events have been recorded yet.
        </div>
      )}
    </div>
  );
}