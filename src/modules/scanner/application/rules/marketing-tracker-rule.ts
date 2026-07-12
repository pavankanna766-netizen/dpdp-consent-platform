import type {
  ComplianceRule,
} from "../../domain/compliance-rule";

export const marketingTrackerRule: ComplianceRule =
{
  id: "marketing-trackers",

  name:
    "Marketing & Analytics Consent",

  description:
    "Trackers that require consent should not be active before user consent.",

  evaluate(input) {
    if (
      input.pageSignals.hasConsentBanner
    ) {
      return null;
    }

    const trackers =
      input.detections.filter(
        (d) =>
          d.tracker.requiresConsent
      );

    if (trackers.length === 0) {
      return null;
    }

    const providers =
      trackers
        .map(
          (t) =>
            t.tracker.provider
        )
        .join(", ");

    return {
      id: "marketing-trackers",

      severity: "high",

      title:
        "Consent-required trackers detected",

      recommendation:
        `Obtain consent before loading: ${providers}.`,
    };
  },
};