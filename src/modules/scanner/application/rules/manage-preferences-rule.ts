import type {
  ComplianceRule,
} from "../../domain/compliance-rule";

export const managePreferencesRule: ComplianceRule =
{
  id: "manage-preferences",

  name:
    "Manage Preferences",

  description:
    "Visitors should be able to customize their cookie preferences.",

  evaluate(input) {
    if (
      input.pageSignals.hasConsentBanner &&
      !input.pageSignals.hasManagePreferences
    ) {
      return {
        id: "manage-preferences",

        severity: "low",

        title:
          "Manage Preferences option not detected",

        recommendation:
          "Provide a settings dialog so visitors can control analytics and marketing cookies.",
      };
    }

    return null;
  },
};