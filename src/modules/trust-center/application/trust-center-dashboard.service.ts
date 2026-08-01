import {
  dashboardAggregationService,
} from "./dashboard-aggregation.service";

import type {
  TrustCenterDashboard,
} from "../domain/trust-center-dashboard";

export class TrustCenterDashboardService {
  async get(
    companyId: string
  ): Promise<TrustCenterDashboard> {
    return dashboardAggregationService.getAggregatedData(companyId);
  }
}

export const trustCenterDashboardService =
  new TrustCenterDashboardService();