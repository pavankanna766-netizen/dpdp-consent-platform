import { z } from "zod";

export const templateSchema = z.object({
  title: z
    .string()
    .min(2, "Title is required"),

  description: z.string(),

  purpose: z
    .string()
    .min(2, "Purpose is required"),

  retention_period: z
    .string()
    .min(1, "Retention period is required"),

  legal_basis: z
    .string()
    .min(1, "Legal basis is required"),

  consent_text: z
    .string()
    .min(10, "Consent text is required"),

  is_required: z.boolean(),
});

export type TemplateValues =
  z.infer<typeof templateSchema>;