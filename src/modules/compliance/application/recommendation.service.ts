import type {
  ComplianceStatus,
} from "../domain/compliance-status";

import type {
  ComplianceRecommendation,
} from "../domain/recommendation";

export class RecommendationService {
  getNext(
    items: ComplianceStatus[]
  ): ComplianceRecommendation | null {
    const next =
      items.find(
        (item) =>
          !item.completed
      );

    if (!next) {
      return null;
    }

    return {
      module: next.module,

      title: this.label(
        next.module
      ),

      description:
        "Complete this module to improve your DPDP compliance.",

      estimatedMinutes: 5,

      impact: "high",
    };
  }

  private label(
    module: string
  ) {
    return module
      .split("-")
      .map(
        (word) =>
          word.charAt(0).toUpperCase() +
          word.slice(1)
      )
      .join(" ");
  }
}

export const recommendationService =
  new RecommendationService();