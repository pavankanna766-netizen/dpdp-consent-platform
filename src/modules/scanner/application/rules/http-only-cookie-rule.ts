import type {
  ComplianceRule,
} from "../../domain/compliance-rule";

export const httpOnlyCookieRule: ComplianceRule = {
  id: "missing-http-only",

  name: "HttpOnly Cookies",

  description:
    "Sensitive cookies should use the HttpOnly attribute.",

  evaluate(input) {
    const cookie =
      input.cookies.find(
        (cookie) => !cookie.httpOnly
      );

    if (!cookie) {
      return null;
    }

    return {
      id: "missing-http-only",

      severity: "medium",

      title:
        "Cookie missing HttpOnly flag",

      recommendation:
        "Enable the HttpOnly attribute to reduce the risk of client-side script access.",
    };
  },
};