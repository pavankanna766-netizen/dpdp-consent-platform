import type {
  ComplianceRule,
} from "../../domain/compliance-rule";

export const privacyContactRule: ComplianceRule = {
  id: "privacy-contact",

  name:
    "Privacy Contact",

  description:
    "Users should have a way to contact the organization regarding privacy matters.",

  evaluate(input) {
    if (
      input.pageSignals.hasPrivacyPolicy
    ) {
      return null;
    }

    return {
      id: "privacy-contact",

      severity: "low",

      title:
        "Privacy contact information not detected",

      recommendation:
        "Provide clear contact details for privacy-related requests within the privacy policy.",
    };
  },
};