import type {
  ComplianceRule,
} from "../../domain/compliance-rule";

export const cookiePolicyRule: ComplianceRule = {
  id: "cookie-policy",
  name: "Cookie Policy",
  description: "A publicly accessible Cookie Policy should be available.",
  evaluate(input) {
    if (!input.pageSignals.hasCookiePolicy) {
      return {
        id: "cookie-policy",
        kind: "issue",
        severity: "medium",
        title: "Cookie Policy not detected",
        recommendation: "Provide a dedicated Cookie Policy page explaining what cookies are set and how users can manage them.",
      };
    }
    return null;
  },
};
