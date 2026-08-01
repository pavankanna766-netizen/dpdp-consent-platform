import { supabaseAdmin } from "@/lib/supabase/admin";
import { stripHtml, sanitizeIdentifier } from "@/platform/security";

export async function createRequest(values: {
  company_id: string;
  subject_identifier: string;
  request_type: string;
  description: string | null;
}) {
  const sanitizedValues = {
    ...values,
    subject_identifier: sanitizeIdentifier(values.subject_identifier),
    description: values.description ? stripHtml(values.description) : null,
  };

  const slaDueDate = new Date();
  slaDueDate.setDate(slaDueDate.getDate() + 30); // 30-day compliance SLA window

  return supabaseAdmin
    .from("dsar_requests")
    .insert({
      ...sanitizedValues,
      status: "pending",
      sla_due_date: slaDueDate.toISOString(),
    })
    .select()
    .single();
}

export async function listRequests(
  companyId: string
) {
  return supabaseAdmin
    .from("dsar_requests")
    .select("*")
    .eq("company_id", companyId)
    .order("created_at", {
      ascending: false,
    });
}

export async function getRequestById(
  companyId: string,
  id: string
) {
  return supabaseAdmin
    .from("dsar_requests")
    .select("*")
    .eq("id", id)
    .eq("company_id", companyId)
    .single();
}

export async function updateRequestStatus(
  companyId: string,
  id: string,
  status: string
) {
  const values: {
    status: string;
    updated_at: string;
    completed_at?: string;
  } = {
    status,
    updated_at: new Date().toISOString(),
  };

  if (status === "completed") {
    values.completed_at =
      new Date().toISOString();
  }

  return supabaseAdmin
    .from("dsar_requests")
    .update(values)
    .eq("id", id)
    .eq("company_id", companyId)
    .select()
    .single();
}