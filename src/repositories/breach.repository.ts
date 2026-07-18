import { supabaseAdmin } from "@/lib/supabase/admin";

export async function createBreachIncident(values: {
  company_id: string;
  breach_type: string;
  affected_users: number;
  data_categories: string;
  description: string;
  certin_deadline: string;
  dpbi_deadline: string;
}) {
  return supabaseAdmin
    .from("breach_incidents")
    .insert(values)
    .select()
    .single();
}

export async function listBreachIncidents(companyId: string) {
  return supabaseAdmin
    .from("breach_incidents")
    .select("*")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });
}

export async function updateBreachIncidentNotification(
  companyId: string,
  id: string,
  values: Partial<{
    certin_notified_at: string | null;
    dpbi_notified_at: string | null;
  }>
) {
  return supabaseAdmin
    .from("breach_incidents")
    .update(values)
    .eq("company_id", companyId)
    .eq("id", id)
    .select()
    .single();
}
