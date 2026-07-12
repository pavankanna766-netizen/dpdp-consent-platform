import type {
  TrackerDefinition,
} from "../../../domain/tracker";

export const paymentTrackers: TrackerDefinition[] = [
  {
    id: "stripe",

    provider: "Stripe",

    category: "necessary",

    requiresConsent: false,

    cookies: [
      "__stripe_mid",
      "__stripe_sid",
    ],

    scripts: [
      "js.stripe.com",
    ],

    domains: [
      "stripe.com",
    ],

    description:
      "Payment processing platform.",
  },

  {
    id: "razorpay",

    provider: "Razorpay",

    category: "necessary",

    requiresConsent: false,

    cookies: [],

    scripts: [
      "checkout.razorpay.com",
    ],

    domains: [
      "razorpay.com",
    ],

    description:
      "Indian payment gateway.",
  },

  {
    id: "paddle",

    provider: "Paddle",

    category: "necessary",

    requiresConsent: false,

    cookies: [],

    scripts: [
      "cdn.paddle.com",
    ],

    domains: [
      "paddle.com",
    ],

    description:
      "Merchant of record payment platform.",
  },
];