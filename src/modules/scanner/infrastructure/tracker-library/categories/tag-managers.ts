import type {
  TrackerDefinition,
} from "../../../domain/tracker";

export const tagManagerTrackers: TrackerDefinition[] = [
  {
    id: "google-tag-manager",

    provider: "Google Tag Manager",

    category: "tag-manager",

    requiresConsent: true,

    cookies: [],

    scripts: [
      "googletagmanager.com",
      "gtm.js",
    ],

    domains: [
      "googletagmanager.com",
    ],

    description:
      "Loads and manages third-party tracking tags.",
  },

  {
    id: "segment",

    provider: "Segment",

    category: "tag-manager",

    requiresConsent: true,

    cookies: [
      "ajs_anonymous_id",
      "ajs_user_id",
    ],

    scripts: [
      "cdn.segment.com",
      "analytics.min.js",
    ],

    domains: [
      "api.segment.io",
      "cdn.segment.com",
    ],

    description:
      "Customer data platform for analytics and integrations.",
  },

  {
    id: "cloudflare-zaraz",

    provider: "Cloudflare Zaraz",

    category: "tag-manager",

    requiresConsent: true,

    cookies: [],

    scripts: [
      "/cdn-cgi/zaraz",
    ],

    domains: [
      "/cdn-cgi/zaraz",
    ],

    description:
      "Cloudflare tag management platform.",
  },
];