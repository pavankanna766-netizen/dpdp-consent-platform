import type {
  CMPDefinition,
} from "../../domain/cmp";

export const cmpLibrary: CMPDefinition[] = [
  {
    id: "onetrust",
    provider: "OneTrust",
    scripts: [
      "cookielaw.org",
      "otSDKStub.js",
      "onetrust.com",
      "optanon.js",
    ],
    domains: [
      "cookielaw.org",
      "onetrust.com",
      "cdn.cookielaw.org",
    ],
    description:
      "OneTrust Consent Management Platform.",
  },

  {
    id: "cookiebot",
    provider: "Cookiebot",
    scripts: [
      "consent.cookiebot.com",
      "cookiebot.js",
    ],
    domains: [
      "cookiebot.com",
    ],
    description:
      "Cookiebot CMP.",
  },

  {
    id: "cookieyes",
    provider: "CookieYes",
    scripts: [
      "cdn-cookieyes.com",
      "script.cookieyes.com",
    ],
    domains: [
      "cookieyes.com",
    ],
    description:
      "CookieYes CMP.",
  },

  {
    id: "didomi",
    provider: "Didomi",
    scripts: [
      "sdk.privacy-center.org",
      "didomi.js",
    ],
    domains: [
      "didomi.io",
      "privacy-center.org",
    ],
    description:
      "Didomi CMP.",
  },

  {
    id: "usercentrics",
    provider: "Usercentrics",
    scripts: [
      "app.usercentrics.eu",
      "usercentrics.js",
    ],
    domains: [
      "usercentrics.eu",
    ],
    description:
      "Usercentrics CMP.",
  },

  {
    id: "trustarc",
    provider: "TrustArc",
    scripts: [
      "trustarc.com",
      "truste.com",
    ],
    domains: [
      "trustarc.com",
      "truste.com",
    ],
    description:
      "TrustArc CMP.",
  },

  {
    id: "osano",
    provider: "Osano",
    scripts: [
      "cmp.osano.com",
      "osano.js",
    ],
    domains: [
      "osano.com",
    ],
    description:
      "Osano CMP.",
  },

  {
    id: "quantcast",
    provider: "Quantcast Choice",
    scripts: [
      "choice.js",
      "quantcast.mgr.consensu.org",
    ],
    domains: [
      "quantcast.mgr.consensu.org",
    ],
    description:
      "Quantcast Choice CMP.",
  },

  {
    id: "civic",
    provider: "Civic Cookie Control",
    scripts: [
      "cookieControl",
    ],
    domains: [
      "civiccomputing.com",
    ],
    description:
      "Civic Cookie Control.",
  },

  {
    id: "iubenda",
    provider: "Iubenda",
    scripts: [
      "iubenda",
    ],
    domains: [
      "iubenda.com",
    ],
    description:
      "Iubenda CMP.",
  },

  {
    id: "sourcepoint",
    provider: "Sourcepoint",
    scripts: [
      "unified.sp-prod.net",
      "sourcepoint",
    ],
    domains: [
      "sp-prod.net",
    ],
    description:
      "Sourcepoint Dialogue CMP.",
  },

  {
    id: "cookiefirst",
    provider: "CookieFirst",
    scripts: [
      "consent.cookiefirst.com",
    ],
    domains: [
      "cookiefirst.com",
    ],
    description:
      "CookieFirst CMP.",
  },
];