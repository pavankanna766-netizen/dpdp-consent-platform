import type {
  ComplianceFinding,
} from "../domain/compliance-rule";

import {
  scoreBreakdownEngine,
} from "./score-breakdown-engine";

export class ScoreEngine {
  calculate(
    findings: ComplianceFinding[]
  ): number {
    let score = 100;

    for (const finding of findings) {
      switch (finding.severity) {
        case "critical":
          score -= 30;
          break;

        case "high":
          score -= 20;
          break;

        case "medium":
          score -= 10;
          break;

        case "low":
          score -= 5;
          break;
      }
    }

    return Math.max(score, 0);
  }
  breakdown(
  findings: ComplianceFinding[]
) {
  return scoreBreakdownEngine.calculate(
    findings
  );
}
}

export const scoreEngine =
  new ScoreEngine();