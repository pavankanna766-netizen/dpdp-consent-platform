import type {
  CookieDefinition,
} from "../../domain/cookie-definition";

export const infrastructureCookies: CookieDefinition[] = [
  {
    pattern: "__cf_bm",
    provider: "Cloudflare",
    category: "necessary",
    purpose: "Bot management.",
    typicalDuration: "30 minutes",
    consentRequired: false,
    party: "first-party",
  },
  {
    pattern: "__cflb",
    provider: "Cloudflare",
    category: "necessary",
    purpose: "Load balancing.",
    typicalDuration: "24 hours",
    consentRequired: false,
    party: "first-party",
  },
  {
    pattern: "__stripe_mid",
    provider: "Stripe",
    category: "necessary",
    purpose: "Fraud prevention.",
    typicalDuration: "1 year",
    consentRequired: false,
    party: "first-party",
  },
  {
    pattern: "__stripe_sid",
    provider: "Stripe",
    category: "necessary",
    purpose: "Payment session.",
    typicalDuration: "30 minutes",
    consentRequired: false,
    party: "first-party",
  },
];