import {
  PDFDocument,
  StandardFonts,
} from "pdf-lib";

import { PdfCanvas } from "../pdf/pdf-canvas";

import type { AuditReportData } from "./types";

export async function buildAuditReport(
  data: AuditReportData
) {
  const pdf =
    await PDFDocument.create();

  const page =
    pdf.addPage();

  const font =
    await pdf.embedFont(
      StandardFonts.Helvetica
    );

  const boldFont =
    await pdf.embedFont(
      StandardFonts.HelveticaBold
    );

    const canvas =
  new PdfCanvas(
    page,
    font,
    boldFont
  );
  
canvas.heading(
  "PrivyStack"
);

canvas.subHeading(
  "AUDIT REPORT"
);

canvas.divider();

canvas.labelValue(
  "Generated",
  data.generatedAt.toLocaleString()
);

canvas.labelValue(
  "Total Events",
  data.rows.length.toString()
);

canvas.labelValue(
  "Report Version",
  "1.0"
);

canvas.divider();

canvas.table(
  data.rows
);

  return {
  pdf,
};

}