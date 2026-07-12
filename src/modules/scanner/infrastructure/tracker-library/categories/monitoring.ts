import type {
  TrackerDefinition,
} from "../../../domain/tracker";

export const monitoringTrackers: TrackerDefinition[] =
  [
    {
      id: "sentry",

      provider: "Sentry",

      category: "monitoring",

      requiresConsent: false,

      cookies: [],

      scripts: [
        "browser.sentry-cdn.com",
        "sentry.io",
      ],

      domains: [
        "sentry.io",
        "ingest.sentry.io",
      ],

      description:
        "Application monitoring and error tracking.",
    },

    {
      id: "datadog-rum",

      provider:
        "Datadog RUM",

      category:
        "monitoring",

      requiresConsent: false,

      cookies: [
        "_dd_s",
      ],

      scripts: [
        "datadoghq-browser-agent",
      ],

      domains: [
        "browser-intake-datadoghq.com",
      ],

      description:
        "Real User Monitoring.",
    },

    {
      id: "new-relic-browser",

      provider:
        "New Relic Browser",

      category:
        "monitoring",

      requiresConsent: false,

      cookies: [
        "JSESSIONID",
      ],

      scripts: [
        "js-agent.newrelic.com",
      ],

      domains: [
        "bam.nr-data.net",
      ],

      description:
        "Browser performance monitoring.",
    },

    {
      id: "logrocket",

      provider:
        "LogRocket",

      category:
        "monitoring",

      requiresConsent: false,

      cookies: [],

      scripts: [
        "cdn.lr-ingest.com",
      ],

      domains: [
        "lr-ingest.io",
      ],

      description:
        "Frontend replay and diagnostics.",
    },

    {
      id: "raygun",

      provider:
        "Raygun",

      category:
        "monitoring",

      requiresConsent: false,

      cookies: [],

      scripts: [
        "raygun.io",
      ],

      domains: [
        "api.raygun.io",
      ],

      description:
        "Crash reporting platform.",
    },

    {
      id: "bugsnag",

      provider:
        "Bugsnag",

      category:
        "monitoring",

      requiresConsent: false,

      cookies: [],

      scripts: [
        "bugsnag.com",
      ],

      domains: [
        "notify.bugsnag.com",
      ],

      description:
        "Application stability monitoring.",
    },

    {
  id: "bugsnag",

  provider: "Bugsnag",

  category: "monitoring",

  requiresConsent: false,

  cookies: [],

  scripts: [
    "bugsnag.com",
  ],

  domains: [
    "bugsnag.com",
  ],

  description:
    "Application crash reporting.",
},

{
  id: "rollbar",

  provider: "Rollbar",

  category: "monitoring",

  requiresConsent: false,

  cookies: [],

  scripts: [
    "rollbar.com",
  ],

  domains: [
    "rollbar.com",
  ],

  description:
    "Error monitoring platform.",
},

{
  id: "honeybadger",

  provider: "Honeybadger",

  category: "monitoring",

  requiresConsent: false,

  cookies: [],

  scripts: [
    "honeybadger.io",
  ],

  domains: [
    "honeybadger.io",
  ],

  description:
    "Application monitoring.",
},

  ];