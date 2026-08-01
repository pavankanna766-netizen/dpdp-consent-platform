import { supabaseAdmin } from "@/lib/supabase/admin";
import { cache } from "react";

export type ExportFormat = "pdf" | "docx" | "html" | "markdown" | "odt" | "rtf";

export interface DocumentExportRecord {
  id: string;
  company_id: string;
  document_id: string;
  export_format: ExportFormat;
  filename: string;
  version: number;
  document_hash: string;
  exported_by: string;
  ip_address: string;
  created_at: string;
}

export async function createDocumentExportLog(values: {
  company_id: string;
  document_id: string;
  export_format: ExportFormat;
  filename: string;
  version: number;
  document_hash: string;
  exported_by?: string;
  ip_address?: string;
}) {
  return supabaseAdmin
    .from("document_exports")
    .insert({
      company_id: values.company_id,
      document_id: values.document_id,
      export_format: values.export_format,
      filename: values.filename,
      version: values.version,
      document_hash: values.document_hash,
      exported_by: values.exported_by || "System User",
      ip_address: values.ip_address || "127.0.0.1",
    })
    .select()
    .single();
}

export const listExportHistoryByDocument = cache(async function (
  companyId: string,
  documentId: string
) {
  return supabaseAdmin
    .from("document_exports")
    .select("*")
    .eq("company_id", companyId)
    .eq("document_id", documentId)
    .order("created_at", { ascending: false });
});

export const listCompanyExportHistory = cache(async function (
  companyId: string
) {
  return supabaseAdmin
    .from("document_exports")
    .select("*")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });
});
