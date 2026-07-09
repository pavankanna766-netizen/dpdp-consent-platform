import type { AuditReportRow } from "./report-types";

export type AuditReportData = {
  companyName: string;
  generatedAt: Date;
  rows: AuditReportRow[];
};