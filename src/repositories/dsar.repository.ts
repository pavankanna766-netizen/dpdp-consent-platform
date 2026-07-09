import { supabaseAdmin } from "@/lib/supabase/admin";

export async function createRequest(values: {
  company_id: string;
  subject_identifier: string;
  request_type: string;
  description: string | null;
}) {
  return supabaseAdmin
    .from("dsar_requests")
    .insert({
      ...values,
      status: "pending",
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
  id: string
) {
  return supabaseAdmin
    .from("dsar_requests")
    .select("*")
    .eq("id", id)
    .single();
}

export async function updateRequestStatus(
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
    .select()
    .single();
}