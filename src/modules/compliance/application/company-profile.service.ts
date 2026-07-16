import type {
  CompanyComplianceProfile,
} from "../domain/company-profile";

import type {
  ComplianceBlueprint,
} from "../domain/compliance-blueprint";

import {
  complianceEngine,
} from "./compliance-engine";

import {
  progressService,
} from "./progress.service";

export class CompanyProfileService {
  build(
    companyId: string,
    blueprint: ComplianceBlueprint,
    lastScanScore: number | null = null
  ): CompanyComplianceProfile {
    const items =
      complianceEngine.build(
        blueprint
      );

    return {
      companyId,

      blueprint,

      items,

      progress:
        progressService.calculate(
          items
        ),

      lastScanScore,
    };
  }
}

export const companyProfileService =
  new CompanyProfileService();