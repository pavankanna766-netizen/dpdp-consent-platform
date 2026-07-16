import {
  reportService,
} from "@/modules/scanner";

import {
  buildPdf,
} from "./pdf-builder";

export class PdfService {
  async generate(
    companyId: string,
    scanId: string
  ) {
    const report =
      await reportService.generate(
        companyId,
        scanId
      );

    return buildPdf(
      report
    );
  }
}

export const pdfService =
  new PdfService();