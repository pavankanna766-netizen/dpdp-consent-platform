import type {
  ComplianceFinding,
} from "../domain/compliance-rule";

import type {
  ScoreBreakdown,
} from "../domain/score";

import {
  FindingWeights,
} from "./finding-weight";

export class ScoreBreakdownEngine {
  calculate(
    findings: ComplianceFinding[]
  ): ScoreBreakdown {
    let score = 100;

    const items = [];

    for (const finding of findings) {
      const impact =
        finding.kind === "observation"
          ? 0
          : FindingWeights[finding.severity];

      score -= impact;

      items.push({
        id: finding.id,

        title: finding.title,

        impact,

        type:
          impact > 0
            ? "penalty" as const
            : "reward" as const,
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
