import type {
  ComplianceRule,
} from "../../domain/compliance-rule";

export const sameSiteSecureRule: ComplianceRule = {
  id: "same-site-none-secure",

  name:
    "SameSite=None Requires Secure",

  description:
    "Cookies using SameSite=None must also use Secure.",

  evaluate(input) {
    const cookie =
      input.cookies.find(
        (cookie) =>
          cookie.sameSite ===
            "None" &&
          !cookie.secure
      );

    if (!cookie) {
      return null;
    }

    return {
      id: "same-site-none-secure",

      severity: "high",

      title:
        "SameSite=None cookie missing Secure flag",

      recommendation:
        "Cookies using SameSite=None must always include the Secure attribute.",
    };
  },
};