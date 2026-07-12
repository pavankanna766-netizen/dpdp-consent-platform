import type {
  ComplianceRule,
} from "../../domain/compliance-rule";

export const sessionCookieRule: ComplianceRule = {
  id: "session-cookie",

  name: "Session Cookies",

  description:
    "Session cookies should be documented and only used when necessary.",

  evaluate(input) {
    const cookie =
      input.cookies.find(
        (cookie) =>
          !cookie.expires ||
          cookie.expires <= 0
      );

    if (!cookie) {
      return null;
    }

    return {
      id: "session-cookie",

      severity: "low",

      title:
        "Session cookie detected",

      recommendation:
        "Document the purpose of session cookies and ensure they are essential where possible.",
    };
  },
};