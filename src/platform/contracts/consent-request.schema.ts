import { z } from "zod";

import { ConsentCategoriesSchema } from "./consent-record";

export const ConsentRequestSchema = z.object({
  templateToken: z.string().min(1).max(128),

  visitorId: z
    .string()
    .startsWith("ps_v_")
    .max(128),

  decision: z.enum([
    "accept",
    "reject",
    "withdraw",
  ]),

  language: z.string().min(2).max(16),

  categories: ConsentCategoriesSchema,

  metadata: z
    .object({
      pageUrl: z.string().url().max(2_048).optional(),
      referrer: z.string().url().max(2_048).optional(),
      bannerVersion: z.number().int().positive().optional(),
      policyVersion: z.number().int().positive().optional(),
    })
    .optional(),
});
