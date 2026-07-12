import type {
  CMPDefinition,
} from "../../domain/cmp";

export const cmpLibrary: CMPDefinition[] =
  [
    {
      id: "onetrust",

      provider: "OneTrust",

      scripts: [
        "cookielaw.org",
        "otSDKStub.js",
      ],

      domains: [
        "cookielaw.org",
      ],

      description:
        "OneTrust Consent Management Platform.",
    },

    {
      id: "cookiebot",

      provider: "Cookiebot",

      scripts: [
        "consent.cookiebot.com",
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
      ],

      domains: [
        "didomi.io",
      ],

      description:
        "Didomi CMP.",
    },

    {
      id: "usercentrics",

      provider:
        "Usercentrics",

      scripts: [
        "app.usercentrics.eu",
      ],

      domains: [
        "usercentrics.eu",
      ],

      description:
        "Usercentrics CMP.",
    },

    {
      id: "trustarc",

      provider:
        "TrustArc",

      scripts: [
        "trustarc.com",
      ],

      domains: [
        "trustarc.com",
      ],

      description:
        "TrustArc CMP.",
    },

    {
      id: "osano",

      provider: "Osano",

      scripts: [
        "cmp.osano.com",
      ],

      domains: [
        "osano.com",
      ],

      description:
        "Osano CMP.",
    },

    {
      id: "quantcast",

      provider:
        "Quantcast Choice",

      scripts: [
        "choice.js",
      ],

      domains: [
        "quantcast.mgr.consensu.org",
      ],

      description:
        "Quantcast Choice CMP.",
    },

    {
      id: "civic",

      provider:
        "Civic Cookie Control",

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

      provider:
        "Iubenda",

      scripts: [
        "iubenda",
      ],

      domains: [
        "iubenda.com",
      ],

      description:
        "Iubenda CMP.",
    },
  ];