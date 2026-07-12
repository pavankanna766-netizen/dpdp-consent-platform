import type {
  ComplianceRule,
} from "../../domain/compliance-rule";

const LIMIT = 50;

export const excessiveCookieRule: ComplianceRule = {
  id: "too-many-cookies",

  name:
    "Cookie Count",

  description:
    "Large numbers of cookies increase privacy and maintenance risks.",

  evaluate(input) {
    if (
      input.cookies.length <=
      LIMIT
    ) {
      return null;
    }

    return {
      id: "too-many-cookies",

      severity: "medium",

      title:
        "Large number of cookies detected",

      recommendation:
        "Review unnecessary cookies and remove obsolete ones.",
    };
  },
};