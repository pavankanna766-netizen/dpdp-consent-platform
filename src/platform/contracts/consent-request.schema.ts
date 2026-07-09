import { z } from "zod";

export const ConsentRequestSchema = z.object({
  templateToken: z.string().min(1),

  visitorId: z
    .string()
    .startsWith("ps_v_"),

  decision: z.enum([
    "accept",
    "reject",
    "withdraw",
  ]),

  language: z.string().min(2),

  categories: z.object({
    analytics: z.boolean(),
    marketing: z.boolean(),
    preferences: z.boolean(),
  }),

  metadata: z
    .object({
      pageUrl: z.string().optional(),
      referrer: z.string().optional(),
      ipAddress: z.string().optional(),
      userAgent: z.string().optional(),
      bannerVersion: z.number().optional(),
      policyVersion: z.number().optional(),
    })
    .optional(),
});