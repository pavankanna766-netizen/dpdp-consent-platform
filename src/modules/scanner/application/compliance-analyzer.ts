import type {
  DetectionResult,
} from "../domain/detection";

import type {
  RiskFinding,
} from "../domain/risk";

export class ComplianceAnalyzer {
  analyze(
    detections: DetectionResult[]
  ): RiskFinding[] {
    return detections.map(
      (tracker) => ({
        tracker,

        level:
          tracker.tracker.requiresConsent
            ? "high"
            : "low",

        title:
          tracker.tracker.requiresConsent
            ? "Consent Required"
            : "No Consent Required",

        recommendation:
          tracker.tracker.requiresConsent
            ? "Load this tracker only after obtaining user consent."
            : "No action required.",
      })
    );
  }
}

export const complianceAnalyzer =
  new ComplianceAnalyzer();