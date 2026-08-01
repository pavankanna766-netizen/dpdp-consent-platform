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
    id: "google-ads",
    provider: "Google Ads",
    category: "marketing",
    requiresConsent: true,
    cookies: [
      "_gcl_au",
      "_gcl_aw",
      "_gcl_dc",
    ],
    scripts: [
      "googleadservices.com",
      "pagead2.googlesyndication.com",
    ],
    domains: [
      "googleadservices.com",
      "google.com/pagead",
      "doubleclick.net",
    ],
    description:
      "Google Ads conversion and remarketing tracking.",
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
      "bcookie",
      "bscookie",
    ],
    scripts: [
      "snap.licdn.com",
    ],
    domains: [
      "px.ads.linkedin.com",
      "snap.licdn.com",
      "linkedin.com",
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
      "ct.pinterest.com",
    ],
    domains: [
      "ct.pinterest.com",
    ],
    description:
      "Pinterest conversion tracking.",
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
      "Snapchat advertising tracker.",
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
      "redditstatic.com",
      "redditmedia.com",
      "pixel.redditmedia.com",
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
      "__hssrc",
      "__hssc",
    ],
    scripts: [
      "js.hs-scripts.com",
      "js.hs-analytics.net",
    ],
    domains: [
      "hs-scripts.com",
      "hubspot.com",
      "hs-analytics.net",
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
];