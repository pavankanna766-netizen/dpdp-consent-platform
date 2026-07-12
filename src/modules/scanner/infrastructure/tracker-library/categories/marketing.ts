import type {
  TrackerDefinition,
} from "../../../domain/tracker";

export const marketingTrackers: TrackerDefinition[] = [
  {
    id: "meta-pixel",
    provider: "Meta Pixel",
    category: "marketing",
    requiresConsent: true,
    cookies: [
      "_fbp",
      "_fbc",
    ],
    scripts: [
      "connect.facebook.net",
      "fbevents.js",
    ],
    domains: [
      "facebook.com/tr",
      "connect.facebook.net",
    ],
    description:
      "Facebook advertising conversion tracking.",
  },

  {
    id: "bing-uet",
    provider: "Microsoft Bing UET",
    category: "marketing",
    requiresConsent: true,
    cookies: [
      "_uetvid",
      "_uetsid",
    ],
    scripts: [
      "bat.bing.com",
    ],
    domains: [
      "bat.bing.com",
    ],
    description:
      "Microsoft Ads conversion tracking.",
  },

  {
    id: "linkedin-insight",
    provider: "LinkedIn Insight",
    category: "marketing",
    requiresConsent: true,
    cookies: [
      "li_gc",
      "li_sugr",
      "UserMatchHistory",
    ],
    scripts: [
      "snap.licdn.com",
    ],
    domains: [
      "px.ads.linkedin.com",
      "snap.licdn.com",
    ],
    description:
      "LinkedIn conversion tracking.",
  },

  {
    id: "tiktok-pixel",
    provider: "TikTok Pixel",
    category: "marketing",
    requiresConsent: true,
    cookies: [
      "_ttp",
    ],
    scripts: [
      "analytics.tiktok.com",
    ],
    domains: [
      "analytics.tiktok.com",
      "business-api.tiktok.com",
    ],
    description:
      "TikTok advertising attribution.",
  },

  {
    id: "twitter-pixel",
    provider: "Twitter Pixel",
    category: "marketing",
    requiresConsent: true,
    cookies: [
      "personalization_id",
    ],
    scripts: [
      "static.ads-twitter.com",
    ],
    domains: [
      "ads-twitter.com",
      "analytics.twitter.com",
    ],
    description:
      "X (Twitter) advertising tracker.",
  },

  {
    id: "pinterest-tag",
    provider: "Pinterest Tag",
    category: "marketing",
    requiresConsent: true,
    cookies: [
      "_pin_unauth",
      "_pinterest_ct",
    ],
    scripts: [
      "s.pinimg.com",
    ],
    domains: [
      "ct.pinterest.com",
    ],
    description:
      "Pinterest conversion tracking.",
  },

  {
    id: "snapchat-pixel",
    provider: "Snap Pixel",
    category: "marketing",
    requiresConsent: true,
    cookies: [
      "_scid",
    ],
    scripts: [
      "sc-static.net",
    ],
    domains: [
      "tr.snapchat.com",
    ],
    description:
      "Snapchat advertising tracker.",
  },

  {
    id: "reddit-pixel",
    provider: "Reddit Pixel",
    category: "marketing",
    requiresConsent: true,
    cookies: [],
    scripts: [
      "pixel.redditmedia.com",
    ],
    domains: [
      "redditstatic.com",
      "redditmedia.com",
    ],
    description:
      "Reddit advertising conversion tracking.",
  },

  {
    id: "hubspot",
    provider: "HubSpot",
    category: "marketing",
    requiresConsent: true,
    cookies: [
      "__hstc",
      "hubspotutk",
    ],
    scripts: [
      "js.hs-scripts.com",
    ],
    domains: [
      "hs-scripts.com",
      "hubspot.com",
    ],
    description:
      "HubSpot marketing automation.",
  },

  {
    id: "mailchimp",
    provider: "Mailchimp",
    category: "marketing",
    requiresConsent: true,
    cookies: [
      "mc_*",
    ],
    scripts: [
      "list-manage.com",
    ],
    domains: [
      "list-manage.com",
      "mailchimp.com",
    ],
    description:
      "Mailchimp marketing platform.",
  },

{
  id: "google-ads",

  provider: "Google Ads",

  category: "marketing",

  requiresConsent: true,

  cookies: [
    "_gcl_au",
  ],

  scripts: [
    "googleadservices.com",
  ],

  domains: [
    "googleadservices.com",
  ],

  description:
    "Google Ads conversion tracking.",
},

{
  id: "bing-ads",

  provider: "Microsoft Advertising",

  category: "marketing",

  requiresConsent: true,

  cookies: [
    "_uetvid",
    "_uetsid",
  ],

  scripts: [
    "bat.bing.com",
  ],

  domains: [
    "bat.bing.com",
  ],

  description:
    "Microsoft Ads tracking.",
},

{
  id: "snapchat-pixel",

  provider: "Snapchat Pixel",

  category: "marketing",

  requiresConsent: true,

  cookies: [
    "_scid",
  ],

  scripts: [
    "sc-static.net",
  ],

  domains: [
    "tr.snapchat.com",
  ],

  description:
    "Snapchat advertising pixel.",
},

{
  id: "pinterest-tag",

  provider: "Pinterest Tag",

  category: "marketing",

  requiresConsent: true,

  cookies: [
    "_pin_unauth",
  ],

  scripts: [
    "ct.pinterest.com",
  ],

  domains: [
    "ct.pinterest.com",
  ],

  description:
    "Pinterest conversion tracking.",
},

{
  id: "reddit-pixel",

  provider: "Reddit Pixel",

  category: "marketing",

  requiresConsent: true,

  cookies: [
    "_rdt_uuid",
  ],

  scripts: [
    "pixel.redditmedia.com",
  ],

  domains: [
    "pixel.redditmedia.com",
  ],

  description:
    "Reddit advertising pixel.",
},

];