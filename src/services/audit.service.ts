import {
  createAuditLog,
  listAuditLogs,
  getAuditLogById,
  getAuditStatsFromDb,
} from "@/repositories/audit.repository";

import { exportData } from "./export.service";

import type { ExportFormat } from "@/platform/export";

export async function recordAuditLog(values: {
  company_id: string;
  event_type: string;
  entity_type: string;
  entity_id: string;
  actor: string;
  payload: Record<string, unknown>;
}) {
  const { data, error } =
    await createAuditLog(values);

  if (error) throw error;

  return data;
}

export async function getAuditLogs(
  companyId: string,
  options?: {
    search?: string;
    eventType?: string;
    from?: string;
    to?: string;
    page?: number;
    pageSize?: number;
  }
) {
  const { data, error, count } =
  await listAuditLogs(companyId, options);

if (error) throw error;

return {
  logs: data,
  total: count ?? 0,
};
}

export async function getAuditLog(
  companyId: string,
  id: string
) {
  const { data, error } =
    await getAuditLogById(companyId, id);

  if (error) throw error;

  return data;
}

export async function getAuditStatistics(
  companyId: string
) {
  const { data, error } = await getAuditStatsFromDb(companyId);
  if (error) throw error;
  return data as { total: number; today: number; eventTypes: number };
}

export async function exportAuditLogs(
  companyId: string,
  format: ExportFormat = "csv"
) {
  const { logs } =
    await getAuditLogs(companyId, {
      page: 1,
      pageSize: 10000,
    });

  return exportData(
    format,
    logs,
    {
      filename: "audit-logs",
    }
  );
}