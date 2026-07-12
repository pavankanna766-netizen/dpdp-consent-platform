import type {
  ComplianceRule,
} from "../../domain/compliance-rule";

export const thirdPartyCookieRule: ComplianceRule = {
  id: "third-party-cookie",

  name: "Third-party Cookies",

  description:
    "Third-party cookies should only be used with appropriate consent.",

  evaluate(input) {
    const cookie =
      input.cookies.find(
        (cookie) =>
          cookie.domain.startsWith(".")
      );

    if (!cookie) {
      return null;
    }

    return {
      id: "third-party-cookie",

      severity: "medium",

      title:
        "Third-party cookie detected",

      recommendation:
        "Review third-party cookies and ensure users provide appropriate consent before they are set.",
    };
  },
};