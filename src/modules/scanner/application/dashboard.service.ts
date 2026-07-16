import {
  summaryService,
} from "./summary.service";

export class DashboardService {
  async load(
    companyId: string,
    scanId: string
  ) {
    return summaryService.get(
      companyId,
      scanId
    );
  }
}

export const dashboardService =
  new DashboardService();