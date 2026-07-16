import {
  trustCenterService,
} from "./trust-center.service";

import {
  privacyDocumentService,
  cookiePolicyDocumentService,
} from "@/modules/policies";

import {
  latestSummaryService,
} from "@/modules/scanner";

export class TrustCenterDashboardService {
  async get(
    companyId: string
  ) {
    const [
      trustCenter,
      latestSummary,
      privacy,
      cookies,
    ] =
      await Promise.all([
        trustCenterService.ensure(
          companyId
        ),

        latestSummaryService.get(
          companyId
        ),

        privacyDocumentService.latest(
          companyId
        ),

        cookiePolicyDocumentService.latest(
          companyId
        ),
      ]);

    return {
      trustCenter,

      latestSummary,

      privacy:
        privacy.data,

      cookies:
        cookies.data,
    };
  }
}

export const trustCenterDashboardService =
  new TrustCenterDashboardService();