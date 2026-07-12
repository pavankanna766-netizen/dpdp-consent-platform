import type {
  TrackerDefinition,
} from "../../../domain/tracker";

export const supportTrackers: TrackerDefinition[] = [
  {
    id: "intercom",

    provider: "Intercom",

    category: "support",

    requiresConsent: true,

    cookies: [
      "intercom-*",
    ],

    scripts: [
      "widget.intercom.io",
    ],

    domains: [
      "intercom.io",
    ],

    description:
      "Customer messaging platform.",
  },

  {
    id: "zendesk",

    provider: "Zendesk",

    category: "support",

    requiresConsent: true,

    cookies: [
      "_zendesk_*",
    ],

    scripts: [
      "static.zdassets.com",
    ],

    domains: [
      "zendesk.com",
    ],

    description:
      "Customer support platform.",
  },

  {
    id: "crisp",

    provider: "Crisp",

    category: "support",

    requiresConsent: true,

    cookies: [
      "crisp-client*",
    ],

    scripts: [
      "client.crisp.chat",
    ],

    domains: [
      "crisp.chat",
    ],

    description:
      "Live chat platform.",
  },

  {
    id: "tawk",

    provider: "Tawk.to",

    category: "support",

    requiresConsent: true,

    cookies: [],

    scripts: [
      "embed.tawk.to",
    ],

    domains: [
      "tawk.to",
    ],

    description:
      "Customer support live chat.",
  },
];