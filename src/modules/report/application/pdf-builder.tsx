import {
  renderToBuffer,
} from "@react-pdf/renderer";

import type {
  ScanReport,
} from "@/modules/scanner/domain/report";

import {
  PrivacyDocument,
} from "../components/privacy-document";

export async function buildPdf(
  report: ScanReport
): Promise<Buffer> {
  return renderToBuffer(
    <PrivacyDocument
      report={report}
    />
  );
}