import type {
  ComplianceRule,
} from "../../domain/compliance-rule";

export const duplicateCookieRule: ComplianceRule = {
  id: "duplicate-cookie",

  name: "Duplicate Cookies",

  description:
    "Duplicate cookie names may indicate configuration issues.",

  evaluate(input) {
    const names =
      input.cookies.map(
        (cookie) =>
          cookie.name
      );

    const duplicate =
      names.find(
        (name, index) =>
          names.indexOf(name) !==
          index
      );

    if (!duplicate) {
      return null;
    }

    return {
      id: "duplicate-cookie",

      severity: "low",

      title:
        "Duplicate cookie names detected",

      recommendation:
        "Review duplicate cookie names and remove redundant cookies where possible.",
    };
  },
};