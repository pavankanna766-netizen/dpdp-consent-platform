import { z } from "zod";

export const BannerPreferenceCategoriesSchema = z.object({
  analytics: z.boolean(),
  marketing: z.boolean(),
  functional: z.boolean(),
  personalization: z.boolean(),
});

export type BannerPreferenceCategories = z.infer<
  typeof BannerPreferenceCategoriesSchema
>;

export const BannerConsentRequestSchema = z.object({
  bannerToken: z.string().uuid(),
  visitorId: z.string().startsWith("ps_v_").max(128),
  action: z.enum(["accept", "reject", "save", "withdraw"]),
  categories: BannerPreferenceCategoriesSchema,
  language: z.string().min(2).max(16).default("en"),
  pageUrl: z.string().url().max(2_048).optional(),
  referrer: z.string().url().max(2_048).optional(),
});

export type BannerConsentRequest = z.infer<typeof BannerConsentRequestSchema>;

export const COOKIE_CATEGORIES = [
  {
    key: "necessary",
    title: "Necessary",
    description: "Required to provide core website functionality and security.",
    required: true,
  },
  {
    key: "analytics",
    title: "Analytics",
    description: "Help us understand and improve website performance.",
    required: false,
  },
  {
    key: "marketing",
    title: "Marketing",
    description: "Support relevant marketing and advertising.",
    required: false,
  },
  {
    key: "functional",
    title: "Functional",
    description: "Enable enhanced functionality and remembered settings.",
    required: false,
  },
  {
    key: "personalization",
    title: "Personalization",
    description: "Tailor content and experiences to your preferences.",
    required: false,
  },
] as const;
