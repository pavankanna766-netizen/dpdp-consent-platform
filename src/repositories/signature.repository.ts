import { supabaseAdmin } from "@/lib/supabase/admin";
import { cache } from "react";

export type SignatureType =
  | "typed"
  | "uploaded_image"
  | "drawn_canvas"
  | "company_seal"
  | "legal_counsel_approval"
  | "digital_certificate";

export interface DocumentSignatureRecord {
  id: string;
  company_id: string;
  approval_id: string;
  signer_name: string;
  signer_email: string;
  signer_role: string;
  signature_type: SignatureType;
  signature_data: string;
  ip_address: string;
  user_agent: string;
  approval_notes: string | null;
  document_hash_at_signing: string;
  created_at: string;
}

export async function createDocumentSignature(values: {
  company_id: string;
  approval_id: string;
  signer_name: string;
  signer_email: string;
  signer_role: string;
  signature_type: SignatureType;
  signature_data: string;
  ip_address?: string;
  user_agent?: string;
  approval_notes?: string;
  document_hash_at_signing: string;
}) {
  return supabaseAdmin
    .from("document_signatures")
    .insert({
      company_id: values.company_id,
      approval_id: values.approval_id,
      signer_name: values.signer_name,
      signer_email: values.signer_email,
      signer_role: values.signer_role,
      signature_type: values.signature_type,
      signature_data: values.signature_data,
      ip_address: values.ip_address || "127.0.0.1",
      user_agent: values.user_agent || "PrivyStack Core Engine",
      approval_notes: values.approval_notes || null,
      document_hash_at_signing: values.document_hash_at_signing,
    })
    .select()
    .single();
}

export const listSignaturesByApprovalId = cache(async function (
  approvalId: string
) {
  return supabaseAdmin
    .from("document_signatures")
    .select("*")
    .eq("approval_id", approvalId)
    .order("created_at", { ascending: true });
});

export const listCompanySignatures = cache(async function (companyId: string) {
  return supabaseAdmin
    .from("document_signatures")
    .select("*")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });
});
