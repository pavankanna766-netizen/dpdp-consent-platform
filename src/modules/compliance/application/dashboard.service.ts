import type {
  ComplianceBlueprint,
} from "../domain/compliance-blueprint";

import type {
  ComplianceDashboard,
} from "../domain/dashboard";

import {
  complianceEngine,
} from "./compliance-engine";

import {
  progressService,
} from "./progress.service";

import {
  recommendationService,
} from "./recommendation.service";

export class ComplianceDashboardService {
  build(
    blueprint: ComplianceBlueprint
  ): ComplianceDashboard {
    const items =
      complianceEngine.build(
        blueprint
      );

    const progress =
      progressService.calculate(
        items
      );

    const next =
      items.find(
        (item) =>
          !item.completed
      );

   return {
  progress,

  items,

  recommendation:
    recommendationService.getNext(
      items
    ),
};
  }
}

export const complianceDashboardService =
  new ComplianceDashboardService();