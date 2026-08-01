import type {
  TrackerDefinition,
} from "../../../domain/tracker";

export const analyticsTrackers: TrackerDefinition[] = [
  {
    id: "google-analytics",
    provider: "Google Analytics",
    category: "analytics",
    requiresConsent: true,
    cookies: [
      "_ga",
      "_gid",
      "_gat",
      "_ga_*",
      "AMP_TOKEN",
    ],
    scripts: [
      "google-analytics.com",
      "gtag/js",
      "ga.js",
      "analytics.js",
    ],
    domains: [
      "google-analytics.com",
      "region1.google-analytics.com",
      "analytics.google.com",
    ],
    description:
      "Google Analytics measurement platform.",
  },

  {
    id: "google-optimize",
    provider: "Google Optimize",
    category: "analytics",
    requiresConsent: true,
    cookies: [
      "_gaexp",
      "_opt_*",
    ],
    scripts: [
      "optimize.js",
    ],
    domains: [
      "googleoptimize.com",
    ],
    description:
      "Google Optimize A/B testing.",
  },

  {
    id: "adobe-analytics",
    provider: "Adobe Analytics",
    category: "analytics",
    requiresConsent: true,
    cookies: [
      "s_cc",
      "s_sq",
      "s_vi",
      "AMCV_*",
    ],
    scripts: [
      "omniture",
      "appmeasurement",
      "omtrdc.net",
      "adobedtm.com",
    ],
    domains: [
      "2o7.net",
      "omtrdc.net",
      "adobedtm.com",
    ],
    description:
      "Adobe Analytics platform.",
  },

  {
    id: "matomo",
    provider: "Matomo",
    category: "analytics",
    requiresConsent: true,
    cookies: [
      "_pk_*",
    ],
    scripts: [
      "matomo.js",
      "piwik.js",
    ],
    domains: [
      "matomo.php",
      "piwik.php",
    ],
    description:
      "Matomo self-hosted analytics.",
  },

  {
    id: "plausible",
    provider: "Plausible",
    category: "analytics",
    requiresConsent: false,
    cookies: [],
    scripts: [
      "plausible.io/js",
    ],
    domains: [
      "plausible.io",
    ],
    description:
      "Privacy-friendly analytics.",
  },

  {
    id: "fathom",
    provider: "Fathom",
    category: "analytics",
    requiresConsent: false,
    cookies: [],
    scripts: [
      "cdn.usefathom.com",
    ],
    domains: [
      "usefathom.com",
    ],
    description:
      "Fathom Analytics.",
  },

  {
    id: "mixpanel",
    provider: "Mixpanel",
    category: "analytics",
    requiresConsent: true,
    cookies: [
      "mp_*",
    ],
    scripts: [
      "cdn.mxpnl.com",
    ],
    domains: [
      "mixpanel.com",
      "api.mixpanel.com",
    ],
    description:
      "Product analytics platform.",
  },

  {
    id: "amplitude",
    provider: "Amplitude",
    category: "analytics",
    requiresConsent: true,
    cookies: [
      "amp_*",
    ],
    scripts: [
      "cdn.amplitude.com",
    ],
    domains: [
      "amplitude.com",
      "api.amplitude.com",
    ],
    description:
      "Behavior analytics platform.",
  },

  {
    id: "segment",
    provider: "Segment",
    category: "analytics",
    requiresConsent: true,
    cookies: [
      "ajs_*",
    ],
    scripts: [
      "cdn.segment.com",
    ],
    domains: [
      "segment.io",
      "api.segment.io",
    ],
    description:
      "Segment customer data platform.",
  },

  {
    id: "heap",
    provider: "Heap",
    category: "analytics",
    requiresConsent: true,
    cookies: [
      "_hp2_*",
    ],
    scripts: [
      "heapanalytics.com",
    ],
    domains: [
      "heapanalytics.com",
    ],
    description:
      "Heap analytics.",
  },

  {
    id: "posthog",
    provider: "PostHog",
    category: "analytics",
    requiresConsent: true,
    cookies: [
      "ph_*",
    ],
    scripts: [
      "posthog.js",
    ],
    domains: [
      "posthog.com",
      "app.posthog.com",
    ],
    description:
      "Open-source product analytics.",
  },

  {
    id: "microsoft-clarity",
    provider: "Microsoft Clarity",
    category: "analytics",
    requiresConsent: true,
    cookies: [
      "_clck",
      "_clsk",
    ],
    scripts: [
      "clarity.ms",
    ],
    domains: [
      "clarity.ms",
      "c.clarity.ms",
    ],
    description:
      "Microsoft Clarity session analytics.",
  },

  {
    id: "hotjar",
    provider: "Hotjar",
    category: "analytics",
    requiresConsent: true,
    cookies: [
      "_hjSessionUser_*",
      "_hjFirstSeen",
      "_hjIncludedInSessionSample_*",
      "_hj*",
    ],
    scripts: [
      "static.hotjar.com",
    ],
    domains: [
      "hotjar.com",
      "script.hotjar.com",
    ],
    description:
      "Hotjar heatmaps and recordings.",
  },

  {
    id: "crazy-egg",
    provider: "Crazy Egg",
    category: "analytics",
    requiresConsent: true,
    cookies: [
      "_ce.clock_data",
      "_ce.s",
    ],
    scripts: [
      "script.crazyegg.com",
    ],
    domains: [
      "crazyegg.com",
    ],
    description:
      "Crazy Egg analytics.",
  },

  {
    id: "cloudflare-insights",
    provider: "Cloudflare Web Analytics",
    category: "analytics",
    requiresConsent: false,
    cookies: [],
    scripts: [
      "static.cloudflareinsights.com",
    ],
    domains: [
      "cloudflareinsights.com",
    ],
    description:
      "Privacy-first Cloudflare web analytics.",
  },
];