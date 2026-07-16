export type DocumentType =
  | "privacy"
  | "cookie"
  | "terms"
  | "refund"
  | "shipping"
  | "security";

export type DocumentStatus =
  | "draft"
  | "published"
  | "archived";

export interface ManagedDocument {
  id: string;

  companyId: string;

  type: DocumentType;

  title: string;

  version: number;

  status: DocumentStatus;

  htmlContent: string;

  publishedAt: string | null;

  updatedAt: string;
}