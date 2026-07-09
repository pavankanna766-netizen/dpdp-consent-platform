import { z } from "zod";

export const PublicTemplateResponseSchema =
  z.object({
    title: z.string(),

    consentText: z.string(),

    version: z.number(),

    language: z.string(),

    purposes: z.array(z.string()),

    required: z.boolean(),
  });

export type PublicTemplateResponse =
  z.infer<
    typeof PublicTemplateResponseSchema
  >;