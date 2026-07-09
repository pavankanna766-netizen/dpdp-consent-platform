import { z } from "zod";

export const companySchema = z.object({
  company_name: z.string().min(2, "Company name is required"),

  industry: z.string().min(1, "Select an industry"),

  company_size: z.string().min(1, "Select company size"),

  website: z
    .string()
    .url("Enter a valid website")
    .or(z.literal(""))
});

export const organizationSchema = z.object({
  country: z
    .string()
    .min(1, "Select a country"),

  timezone: z
    .string()
    .min(1, "Select a timezone"),
});

export type OrganizationValues =
  z.infer<typeof organizationSchema>;

export const useCasesSchema = z.object({
  useCases: z
    .array(z.string())
    .min(1, "Select at least one use case"),
});

export type UseCasesValues =
  z.infer<typeof useCasesSchema>;

export type CompanyValues = z.infer<typeof companySchema>;