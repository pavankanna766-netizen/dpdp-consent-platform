import type {
  ComplianceRule,
} from "../../domain/compliance-rule";

export const cookieCategoryRule: ComplianceRule = {
  id: "cookie-categories",

  name: "Cookie Categories",

  description:
    "Cookies should be classified into clear categories.",

  evaluate(input) {
    const unknown =
      input.cookies.some(
        (cookie) =>
          cookie.category ===
          "unknown"
      );

    if (!unknown) {
      return null;
    }

    return {
      id: "cookie-categories",

      severity: "low",

      title:
        "Unclassified cookies detected",

      recommendation:
        "Classify every cookie into a documented category such as necessary, analytics, marketing, or preferences.",
    };
  },
};