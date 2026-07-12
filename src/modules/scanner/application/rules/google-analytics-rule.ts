import type {
  ComplianceRule,
} from "../../domain/compliance-rule";

export const googleAnalyticsRule: ComplianceRule =
{
  id: "ga-consent",

  name:
    "Google Analytics Consent",

  description:
    "Google Analytics requires consent before activation.",

  evaluate(input) {
    const analytics =
      input.detections.find(
        (d) =>
          d.tracker.id ===
          "google-analytics"
      );

    if (
      analytics &&
      !input.pageSignals.hasConsentBanner
    ) {
      return {
        id: "ga-consent",

        severity: "high",

        title:
          "Google Analytics detected before consent",

        recommendation:
          "Delay loading Google Analytics until the visitor has granted consent.",
      };
    }

    return null;
  },
};