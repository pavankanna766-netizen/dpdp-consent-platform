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
    ],
    scripts: [
      "google-analytics.com",
      "googletagmanager.com",
      "gtag/js",
    ],
    domains: [
      "google-analytics.com",
      "googletagmanager.com",
    ],
    description:
      "Google Analytics website analytics.",
  },

  {
    id: "google-analytics-4",
    provider: "Google Analytics 4",
    category: "analytics",
    requiresConsent: true,
    cookies: [
      "_ga",
      "_ga_*",
    ],
    scripts: [
      "gtag/js",
    ],
    domains: [
      "google-analytics.com",
    ],
    description:
      "Google Analytics 4 measurement.",
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
      "AMCV_*",
    ],
    scripts: [
      "omniture",
      "appmeasurement",
    ],
    domains: [
      "2o7.net",
      "omtrdc.net",
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
      "matomo",
      "piwik",
    ],
    description:
      "Matomo self-hosted analytics.",
  },

  {
    id: "plausible",
    provider: "Plausible",
    category: "analytics",
    requiresConsent: true,
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
    requiresConsent: true,
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
    ],
    description:
      "Product analytics.",
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
    ],
    description:
      "Amplitude analytics.",
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
    ],
    description:
      "PostHog analytics.",
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
    ],
    scripts: [
      "static.hotjar.com",
    ],
    domains: [
      "hotjar.com",
    ],
    description:
      "Hotjar heatmaps and recordings.",
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
  ],

  scripts: [
    "omtrdc.net",
    "adobedtm.com",
  ],

  domains: [
    "omtrdc.net",
    "adobedtm.com",
  ],

  description:
    "Adobe Analytics measurement platform.",
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
  ],

  description:
    "Behavior analytics platform.",
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
  ],

  description:
    "Open-source product analytics.",
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
    "Privacy-focused analytics.",
},

{
  id: "matomo",

  provider: "Matomo",

  category: "analytics",

  requiresConsent: true,

  cookies: [
    "_pk_id*",
    "_pk_ses*",
  ],

  scripts: [
    "matomo.js",
  ],

  domains: [
    "matomo",
  ],

  description:
    "Self-hosted web analytics.",
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
];