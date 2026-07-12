import {
  summaryService,
} from "./summary.service";

export class DashboardService {
  async load(
    scanId: string
  ) {
    return summaryService.get(
      scanId
    );
  }
}

export const dashboardService =
  new DashboardService();