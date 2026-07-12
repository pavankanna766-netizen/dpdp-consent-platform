import type {
  ComplianceRule,
} from "../../domain/compliance-rule";

export const dataRetentionRule: ComplianceRule = {
  id: "data-retention",

  name:
    "Data Retention",

  description:
    "Privacy notices should describe data retention practices.",

  evaluate(input) {
    if (
      input.pageSignals.hasPrivacyPolicy
    ) {
      return null;
    }

    return {
      id: "data-retention",

      severity: "low",

      title:
        "Data retention information not identified",

      recommendation:
        "Include information about how long personal data is retained in the privacy notice.",
    };
  },
};