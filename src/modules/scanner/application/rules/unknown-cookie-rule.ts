import type {
  ComplianceRule,
} from "../../domain/compliance-rule";

export const unknownCookieRule: ComplianceRule = {
  id: "unknown-cookie",

  name:
    "Unknown Cookie Category",

  description:
    "Cookies should be classified into known categories.",

  evaluate(input) {
    const cookie =
      input.cookies.find(
        (cookie) =>
          cookie.category ===
          "unknown"
      );

    if (!cookie) {
      return null;
    }

    return {
      id: "unknown-cookie",

      severity: "low",

      title:
        "Unknown cookie category detected",

      recommendation:
        "Classify unknown cookies and document their purpose.",
    };
  },
};