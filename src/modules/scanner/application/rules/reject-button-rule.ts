import type {
  ComplianceRule,
} from "../../domain/compliance-rule";

export const rejectButtonRule: ComplianceRule =
{
  id: "reject-button",

  name:
    "Reject Option",

  description:
    "Visitors should be able to reject non-essential cookies as easily as they can accept them.",

  evaluate(input) {
    if (
      input.pageSignals.hasConsentBanner &&
      !input.pageSignals.hasRejectButton
    ) {
      return {
        id: "reject-button",

        severity: "medium",

        title:
          "Reject option not detected",

        recommendation:
          "Provide a visible 'Reject All' option alongside the accept action.",
      };
    }

    return null;
  },
};