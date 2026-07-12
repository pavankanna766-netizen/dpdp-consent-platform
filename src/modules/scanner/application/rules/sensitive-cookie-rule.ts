import type {
  ComplianceRule,
} from "../../domain/compliance-rule";

const SENSITIVE_NAMES = [
  "token",
  "auth",
  "jwt",
  "session",
  "access",
  "refresh",
];

export const sensitiveCookieRule: ComplianceRule = {
  id: "sensitive-cookie",

  name: "Sensitive Cookie Names",

  description:
    "Sensitive cookies require strong protection mechanisms.",

  evaluate(input) {
    const cookie =
      input.cookies.find(
        (cookie) =>
          SENSITIVE_NAMES.some(
            (value) =>
              cookie.name
                .toLowerCase()
                .includes(value)
          )
      );

    if (!cookie) {
      return null;
    }

    return {
      id: "sensitive-cookie",

      severity: "high",

      title:
        "Sensitive cookie detected",

      recommendation:
        "Ensure sensitive cookies use Secure, HttpOnly, and appropriate SameSite attributes.",
    };
  },
};