import { supabaseAdmin } from "@/lib/supabase/admin";
import { cache } from "react";

export type LegalDocumentType =
  | "privacy_policy"
  | "cookie_policy"
  | "dpa"
  | "terms_of_service"
  | "vendor_agreement"
  | "breach_report"
  | "data_processing_agreement"
  | "custom";

export type LegalDocumentStatus = "draft" | "published" | "archived";

export interface LegalDocumentRecord {
  id: string;
  company_id: string;
  document_type: LegalDocumentType;
  title: string;
  slug: string;
  version: number;
  status: LegalDocumentStatus;
  html_content: string;
  plaintext_content: string | null;
  sections: Array<{ id?: string; title: string; content: string; order?: number }>;
  metadata: Record<string, unknown>;
  reviewed_by_counsel: boolean;
  reviewed_at: string | null;
  reviewed_by: string | null;
  published_at: string | null;
  archived: boolean;
  created_at: string;
  updated_at: string;
}

export async function createLegalDocument(values: {
  company_id: string;
  document_type: LegalDocumentType;
  title: string;
  slug: string;
  version?: number;
  status?: LegalDocumentStatus;
  html_content: string;
  plaintext_content?: string;
  sections?: Array<{ id?: string; title: string; content: string; order?: number }>;
  metadata?: Record<string, unknown>;
  reviewed_by_counsel?: boolean;
  reviewed_by?: string;
}) {
  return supabaseAdmin
    .from("legal_documents")
    .insert({
      company_id: values.company_id,
      document_type: values.document_type,
      title: values.title,
      slug: values.slug,
      version: values.version ?? 1,
      status: values.status ?? "draft",
      html_content: values.html_content,
      plaintext_content: values.plaintext_content ?? null,
      sections: values.sections ?? [],
      metadata: values.metadata ?? {},
      reviewed_by_counsel: values.reviewed_by_counsel ?? false,
      reviewed_by: values.reviewed_by ?? null,
    })
    .select()
    .single();
}

export const getLegalDocumentById = cache(async function (
  companyId: string,
  id: string
) {
  return supabaseAdmin
    .from("legal_documents")
    .select("*")
    .eq("company_id", companyId)
    .eq("id", id)
    .single();
});

export const getLatestLegalDocument = cache(async function (
  companyId: string,
  documentType: LegalDocumentType
) {
  return supabaseAdmin
    .from("legal_documents")
    .select("*")
    .eq("company_id", companyId)
    .eq("document_type", documentType)
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();
});

export const getPublishedLegalDocument = cache(async function (
  companyId: string,
  documentType: LegalDocumentType
) {
  return supabaseAdmin
    .from("legal_documents")
    .select("*")
    .eq("company_id", companyId)
    .eq("document_type", documentType)
    .eq("status", "published")
    .eq("archived", false)
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();
});

export const listLegalDocumentVersions = cache(async function (
  companyId: string,
  documentType: LegalDocumentType
) {
  return supabaseAdmin
    .from("legal_documents")
    .select("*")
    .eq("company_id", companyId)
    .eq("document_type", documentType)
    .order("version", { ascending: false });
});

export const listCompanyLegalDocuments = cache(async function (
  companyId: string
) {
  return supabaseAdmin
    .from("legal_documents")
    .select("*")
    .eq("company_id", companyId)
    .order("updated_at", { ascending: false });
});

export async function updateLegalDocument(
  companyId: string,
  id: string,
  values: Partial<{
    title: string;
    slug: string;
    status: LegalDocumentStatus;
    html_content: string;
    plaintext_content: string | null;
    sections: Array<{ id?: string; title: string; content: string; order?: number }>;
    metadata: Record<string, unknown>;
    reviewed_by_counsel: boolean;
    reviewed_at: string | null;
    reviewed_by: string | null;
    published_at: string | null;
    archived: boolean;
  }>
) {
  return supabaseAdmin
    .from("legal_documents")
    .update(values)
    .eq("company_id", companyId)
    .eq("id", id)
    .select()
    .single();
}

export async function archiveLegalDocument(companyId: string, id: string) {
  return supabaseAdmin
    .from("legal_documents")
    .update({
      archived: true,
      status: "archived",
    })
    .eq("company_id", companyId)
    .eq("id", id)
    .select()
    .single();
}

export async function deleteLegalDocument(companyId: string, id: string) {
  return supabaseAdmin
    .from("legal_documents")
    .delete()
    .eq("company_id", companyId)
    .eq("id", id);
}
