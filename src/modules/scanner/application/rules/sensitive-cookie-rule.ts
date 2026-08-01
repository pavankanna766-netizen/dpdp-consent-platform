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

const EXCLUDED_TELEMETRY = [
  "hj",           // Hotjar
  "clarity",      // Clarity
  "ai_session",   // Azure App Insights
  "_clsk",        // Clarity session
  "ajs_",         // Segment
  "amplitude",    // Amplitude
  "mixpanel",     // Mixpanel
  "ga_",          // Google Analytics
  "gid",          // Google Analytics
  "fbp",          // Meta
  "fbc",          // Meta
  "gcl",          // Google Ads
  "uet",          // Microsoft Bing
  "pin",          // Pinterest
  "scid",         // Snapchat
  "rdt",          // Reddit
  "hstc",         // HubSpot
  "hubspot",      // HubSpot
  "intercom",     // Intercom
  "zendesk",      // Zendesk
  "crisp",        // Crisp
  "tawk",         // Tawk
  "stripe",       // Stripe
  "razorpay",     // Razorpay
  "paddle",       // Paddle
  "cf_",          // Cloudflare
  "__cf",         // Cloudflare
  "google_",      // Google
];

export const sensitiveCookieRule: ComplianceRule = {
  id: "sensitive-cookie",

  name: "Sensitive Cookie Names",

  description:
    "Sensitive cookies require strong protection mechanisms.",

  evaluate(input) {
    const cookie = input.cookies.find(
      (candidate) => {
        const name = candidate.name.toLowerCase();

        // Skip known telemetry/analytics/tracker cookies that are client-side set
        const isTelemetry = EXCLUDED_TELEMETRY.some((kw) => name.includes(kw));
        if (isTelemetry) return false;

        // Skip other common false positives
        if (
          name.includes("hjsession") ||
          name.includes("sessionuser") ||
          name.includes("absoluteinprogress") ||
          name.includes("analytics") ||
          name.includes("telemetry")
        ) {
          return false;
        }

        const hasKeyword = SENSITIVE_NAMES.some((value) =>
          name.includes(value)
        );

        return hasKeyword && (!candidate.secure || !candidate.httpOnly);
      }
    );

    if (!cookie) {
      return null;
    }

    return {
      id: "sensitive-cookie",

      kind: "issue",

      severity: "high",

      title:
        "Sensitive cookie lacks required protections",

      recommendation:
        "Ensure sensitive cookies use Secure, HttpOnly, and appropriate SameSite attributes.",

      evidence: {
        cookie: cookie.name,
        secure: cookie.secure,
        httpOnly: cookie.httpOnly,
        sameSite: cookie.sameSite,
      },
    };
  },
};
