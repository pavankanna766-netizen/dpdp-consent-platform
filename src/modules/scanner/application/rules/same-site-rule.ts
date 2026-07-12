import type {
  ComplianceRule,
} from "../../domain/compliance-rule";

export const sameSiteRule: ComplianceRule = {
  id: "missing-same-site",

  name: "SameSite Cookies",

  description:
    "Cookies should specify the SameSite attribute.",

  evaluate(input) {
    const cookie =
      input.cookies.find(
        (cookie) => !cookie.sameSite
      );

    if (!cookie) {
      return null;
    }

    return {
      id: "missing-same-site",

      severity: "medium",

      title:
        "Cookie missing SameSite attribute",

      recommendation:
        "Specify SameSite=Lax or SameSite=Strict wherever possible.",
    };
  },
};