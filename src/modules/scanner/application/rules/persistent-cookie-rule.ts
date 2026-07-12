import type {
  ComplianceRule,
} from "../../domain/compliance-rule";

const DAYS = 365;

export const persistentCookieRule: ComplianceRule = {
  id: "persistent-cookie",

  name: "Persistent Cookies",

  description:
    "Persistent cookies should have justified retention periods.",

  evaluate(input) {
    const now =
      Date.now() / 1000;

    const cookie =
      input.cookies.find(
        (cookie) =>
          cookie.expires &&
          cookie.expires >
            now +
              DAYS *
                24 *
                60 *
                60
      );

    if (!cookie) {
      return null;
    }

    return {
      id: "persistent-cookie",

      severity: "medium",

      title:
        "Persistent cookie detected",

      recommendation:
        "Review whether long-lived cookies are required and reduce their lifetime if possible.",
    };
  },
};