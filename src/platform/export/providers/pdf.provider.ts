import { BaseExportProvider } from "../base-provider";

import type { AuditReportRow } from "../templates/report-types";

import {
  ExportOptions,
  ExportResult,
} from "../types";

import { buildAuditReport } from "../templates/audit-report.template";

export class PdfProvider
  extends BaseExportProvider
{
  readonly id = "pdf";

  readonly name = "PDF";

  readonly extension = "pdf";

  readonly contentType =
    "application/pdf";

  async export<T>(
    rows: T[],
    options: ExportOptions
  ): Promise<ExportResult> {

    const reportRows: AuditReportRow[] =
  rows.map((row) => {
    const audit =
      row as Record<
        string,
        unknown
      >;

    return {
      time: new Date(
        String(
          audit.created_at ?? ""
        )
      ).toLocaleString(),

      event: String(
        audit.event_type ?? ""
      ),

      entity: String(
        audit.entity_type ?? ""
      ),

      actor: String(
        audit.actor ?? "System"
      ),
    };
  });

    const {
      pdf,
    } = await buildAuditReport({
  companyName: "My Company",
  generatedAt: new Date(),
  rows: reportRows,
});

    const bytes =
      await pdf.save();

    return this.createResult(
      Buffer.from(bytes),
      options
    );
  }
}

export const pdfProvider =
  new PdfProvider();