import type {
  ComplianceFinding,
} from "../domain/compliance-rule";

import type {
  ScoreBreakdown,
} from "../domain/score";

export class ScoreBreakdownEngine {
  calculate(
    findings: ComplianceFinding[]
  ): ScoreBreakdown {
    let score = 100;

    const items = [];

    for (const finding of findings) {
      let impact = 0;

      switch (
        finding.severity
      ) {
        case "critical":
          impact = 30;
          break;

        case "high":
          impact = 20;
          break;

        case "medium":
          impact = 10;
          break;

        case "low":
          impact = 5;
          break;
      }

      score -= impact;

      items.push({
        id: finding.id,

        title: finding.title,

        impact,

        type: "penalty" as const,
      });
    }

    return {
      score: Math.max(score, 0),

      items,
    };
  }
}

export const scoreBreakdownEngine =
  new ScoreBreakdownEngine();