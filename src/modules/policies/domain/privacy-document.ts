export type PolicyStatus =
  | "draft"
  | "published"
  | "archived";

export interface PrivacyDocument {
  id: string;

  companyId: string;

  title: string;

  slug: string | null;

  version: number;

  status: PolicyStatus;

  htmlContent: string;

  summary: string | null;

  generatedBy: string;

  source: string;

  archived: boolean;

  publishedAt: string | null;

  createdAt?: string;

  updatedAt?: string;
}