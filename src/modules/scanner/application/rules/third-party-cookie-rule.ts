import type {
  ComplianceRule,
} from "../../domain/compliance-rule";

export const thirdPartyCookieRule: ComplianceRule = {
  id: "third-party-cookie",

  name: "Third-party Cookies",

  description:
    "Third-party cookies should only be used with appropriate consent.",

  evaluate(input) {
    const siteHost = input.pageSignals.siteHost;

    if (!siteHost) {
      return null;
    }

    const cookie = input.cookies.find((candidate) => {
      const cookieHost = candidate.domain
        .replace(/^\./, "")
        .toLowerCase();

      return (
        cookieHost !== siteHost &&
        !siteHost.endsWith(`.${cookieHost}`)
      );
    });

    if (!cookie) {
      return null;
    }

    return {
      id: "third-party-cookie",

      kind: "observation",

      severity: "info",

      title:
        "Third-party cookie observed",

      recommendation:
        "Review third-party cookies and ensure users provide appropriate consent before they are set.",
    };
  },
};
