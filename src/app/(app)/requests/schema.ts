import { z } from "zod";

export const requestSchema = z.object({
  subject_identifier: z
    .string()
    .min(3),

  request_type: z.enum([
    "access",
    "delete",
    "correction",
  ]),

  description: z
    .string()
    .nullable(),
});

export type RequestValues =
  z.infer<typeof requestSchema>;