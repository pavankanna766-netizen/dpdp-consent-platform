import type {
  ComplianceRule,
} from "../../domain/compliance-rule";

export const consentWithdrawalRule: ComplianceRule = {
  id: "consent-withdrawal",

  name: "Consent Withdrawal",

  description:
    "Users should be able to withdraw consent easily.",

  evaluate(input) {
    if (
      input.pageSignals.hasManagePreferences
    ) {
      return null;
    }

    return {
      id: "consent-withdrawal",

      severity: "medium",

      title:
        "Consent withdrawal mechanism not detected",

      recommendation:
        "Provide users with an accessible option to review and withdraw consent preferences.",
    };
  },
};