import type {
  ComplianceRule,
} from "../../domain/compliance-rule";

const MAX_DAYS = 400;

export const longLivedCookieRule: ComplianceRule = {
  id: "long-lived-cookie",

  name:
    "Cookie Lifetime",

  description:
    "Cookies should not have excessively long lifetimes.",

  evaluate(input) {
    const now =
      Date.now() / 1000;

    const cookie =
      input.cookies.find(
        (cookie) =>
          cookie.expires &&
          cookie.expires >
            now +
              MAX_DAYS *
                24 *
                60 *
                60
      );

    if (!cookie) {
      return null;
    }

    return {
      id: "long-lived-cookie",

      severity: "low",

      title:
        "Cookie has a very long lifetime",

      recommendation:
        "Reduce cookie expiration where appropriate.",
    };
  },
};