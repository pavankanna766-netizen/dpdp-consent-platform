import type {
  ComplianceFinding,
} from "../domain/compliance-rule";

import {
  scoreBreakdownEngine,
} from "./score-breakdown-engine";

import {
  FindingWeights,
} from "./finding-weight";

export class ScoreEngine {
  calculate(
    findings: ComplianceFinding[]
  ): number {
    const penalty = findings.reduce(
      (total, finding) =>
        finding.kind === "observation"
          ? total
          : total + FindingWeights[finding.severity],
      0
    );

    return Math.max(100 - penalty, 0);
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
