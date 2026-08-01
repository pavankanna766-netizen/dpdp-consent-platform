import { supabaseAdmin } from "@/lib/supabase/admin";
import { cache } from "react";

export type ApprovalStatus =
  | "draft"
  | "ready_for_review"
  | "reviewed"
  | "approved"
  | "signed"
  | "published"
  | "archived";

export interface DocumentApprovalRecord {
  id: string;
  company_id: string;
  document_id: string;
  status: ApprovalStatus;
  document_hash: string;
  created_at: string;
  updated_at: string;
}

export async function createDocumentApproval(values: {
  company_id: string;
  document_id: string;
  status?: ApprovalStatus;
  document_hash: string;
}) {
  return supabaseAdmin
    .from("document_approvals")
    .insert({
      company_id: values.company_id,
      document_id: values.document_id,
      status: values.status || "ready_for_review",
      document_hash: values.document_hash,
    })
    .select()
    .single();
}

export const getApprovalByDocumentId = cache(async function (
  companyId: string,
  documentId: string
) {
  return supabaseAdmin
    .from("document_approvals")
    .select("*")
    .eq("company_id", companyId)
    .eq("document_id", documentId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
});

export async function updateApprovalStatus(
  companyId: string,
  approvalId: string,
  status: ApprovalStatus
) {
  return supabaseAdmin
    .from("document_approvals")
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("company_id", companyId)
    .eq("id", approvalId)
    .select()
    .single();
}
