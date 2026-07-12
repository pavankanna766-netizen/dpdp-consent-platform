import type {
  ComplianceRule,
} from "../../domain/compliance-rule";

export const privacyPolicyRule: ComplianceRule =
{
  id: "privacy-policy",

  name:
    "Privacy Policy",

  description:
    "A publicly accessible Privacy Policy should be available.",

  evaluate(input) {
    if (
      !input.pageSignals.hasPrivacyPolicy
    ) {
      return {
        id: "privacy-policy",

        severity: "medium",

        title:
          "Privacy Policy not detected",

        recommendation:
          "Provide an easily accessible Privacy Policy page and link it from your website footer or navigation.",
      };
    }

    return null;
  },
};