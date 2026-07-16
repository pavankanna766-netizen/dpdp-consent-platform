import {
  getLatestScan,
} from "@/repositories/scanner.repository";

import {
  summaryService,
} from "./summary.service";

export class LatestSummaryService {
  async get(
    companyId: string
  ) {
    const {
      data: latestScan,
      error,
    } =
      await getLatestScan(
        companyId
      );

    if (
      error ||
      !latestScan
    ) {
      return null;
    }

    return summaryService.get(
      companyId,
      latestScan.id
    );
  }
}

export const latestSummaryService =
  new LatestSummaryService();
