import type {
  ComplianceRule,
} from "../../domain/compliance-rule";

export const insecureCookieRule: ComplianceRule = {
  id: "insecure-cookie",

  name: "Secure Cookies",

  description:
    "Cookies should use the Secure attribute.",

  evaluate(input) {
    const insecure =
      input.cookies.find(
        (cookie) => !cookie.secure
      );

    if (!insecure) {
      return null;
    }

    return {
      id: "insecure-cookie",

      severity: "medium",

      title:
        "Cookie transmitted without Secure flag",

      recommendation:
        "Enable the Secure attribute so cookies are only sent over HTTPS.",
    };
  },
};