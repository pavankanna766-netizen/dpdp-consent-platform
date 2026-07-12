import type {
  TrackerDefinition,
} from "../../../domain/tracker";

export const sessionRecordingTrackers: TrackerDefinition[] = [
  {
    id: "fullstory",

    provider: "FullStory",

    category: "session-recording",

    requiresConsent: true,

    cookies: [],

    scripts: [
      "fullstory.com",
    ],

    domains: [
      "fullstory.com",
    ],

    description:
      "Session replay platform.",
  },

  {
    id: "smartlook",

    provider: "Smartlook",

    category: "session-recording",

    requiresConsent: true,

    cookies: [],

    scripts: [
      "smartlook.com",
    ],

    domains: [
      "smartlook.com",
    ],

    description:
      "Visitor recordings and heatmaps.",
  },

  {
    id: "mouseflow",

    provider: "Mouseflow",

    category: "session-recording",

    requiresConsent: true,

    cookies: [],

    scripts: [
      "mouseflow.com",
    ],

    domains: [
      "mouseflow.com",
    ],

    description:
      "Session replay software.",
  },
];