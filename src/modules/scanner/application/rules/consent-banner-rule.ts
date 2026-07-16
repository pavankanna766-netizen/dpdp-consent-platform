import type {
  ComplianceRule,
} from "../../domain/compliance-rule";

export const consentBannerRule: ComplianceRule =
{
  id: "consent-banner",

  name:
    "Consent Banner",

  description:
    "Visitors should be presented with a consent banner before non-essential trackers are activated.",

  evaluate(input) {
    const hasTrackers =
      input.detections.some(
        (d) =>
          d.tracker.requiresConsent
      );

    if (
      hasTrackers &&
      !input.pageSignals.hasConsentBanner
    ) {
      return {
        id: "consent-banner",

        kind: "issue",

        severity: "high",

        title:
          "Consent controls not detected",

        recommendation:
          "Display a consent banner before loading analytics or marketing technologies.",
      };
    }

    return null;
  },
};
