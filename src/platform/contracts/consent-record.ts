import { z } from "zod";

export const ConsentStatusSchema = z.enum([
  "granted",
  "withdrawn",
]);

export type ConsentStatus = z.infer<typeof ConsentStatusSchema>;

export const ConsentCategoriesSchema = z.object({
  analytics: z.boolean(),
  marketing: z.boolean(),
  functional: z.boolean().default(false),
  personalization: z.boolean().default(false),
});

export type ConsentCategories = z.infer<
  typeof ConsentCategoriesSchema
>;

export const ConsentRecordSchema = z.object({
  id: z.string(),
  company_id: z.string(),
  template_id: z.string(),
  subject_identifier: z.string(),
  version: z.number().int().positive(),
  consent_text: z.string(),
  status: ConsentStatusSchema,
  granted_at: z.string(),
  withdrawn_at: z.string().nullable().optional(),
  created_at: z.string(),
  language: z.string().nullable().optional(),
  metadata: z.record(z.string(), z.unknown()).nullable().optional(),
  proof: z.record(z.string(), z.unknown()).nullable().optional(),
});

export type ConsentRecord = z.infer<typeof ConsentRecordSchema>;

export const ConsentIdSchema = z.string().uuid();

export interface ConsentReceipt {
  receiptId: string;
  consentId: string;
  status: ConsentStatus;
  subjectIdentifier: string;
  version: number;
  recordedAt: string;
  purpose?: string;
  categories?: ConsentCategories;
}

function readCategories(
  value: unknown
): ConsentCategories | undefined {
  const parsed = ConsentCategoriesSchema.safeParse(value);

  return parsed.success ? parsed.data : undefined;
}

export function createConsentReceipt(
  consent: ConsentRecord
): ConsentReceipt {
  const proof = consent.proof ?? {};
  const metadata = consent.metadata ?? {};
  const receiptId = proof.receiptId;
  const recordedAt = proof.recordedAt;

  return {
    receiptId:
      typeof receiptId === "string"
        ? receiptId
        : consent.id,
    consentId: consent.id,
    status: consent.status,
    subjectIdentifier: consent.subject_identifier,
    version: consent.version,
    recordedAt:
      typeof recordedAt === "string"
        ? recordedAt
        : consent.created_at,
    purpose:
      typeof metadata.purpose === "string"
        ? metadata.purpose
        : undefined,
    categories: readCategories(metadata.categories),
  };
}
