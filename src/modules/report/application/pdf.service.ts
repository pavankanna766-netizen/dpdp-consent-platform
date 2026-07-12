import {
  reportService,
} from "@/modules/scanner";

import {
  buildPdf,
} from "./pdf-builder";

export class PdfService {
  async generate(
    scanId: string
  ) {
    const report =
      await reportService.generate(
        scanId
      );

    return buildPdf(
      report
    );
  }
}

export const pdfService =
  new PdfService();