import {
  summaryService,
} from "./summary.service";

import {
  mapScanReport,
} from "./report.mapper";

export class ReportService {
  async generate(
    scanId: string
  ) {
    const summary =
      await summaryService.get(
        scanId
      );

    return mapScanReport(
      summary
    );
  }
}

export const reportService =
  new ReportService();