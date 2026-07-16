import {
  summaryService,
} from "./summary.service";

import {
  mapScanReport,
} from "./report.mapper";

export class ReportService {
  async generate(
    companyId: string,
    scanId: string
  ) {
    const summary =
      await summaryService.get(
        companyId,
        scanId
      );

    return mapScanReport(
      summary
    );
  }
}

export const reportService =
  new ReportService();