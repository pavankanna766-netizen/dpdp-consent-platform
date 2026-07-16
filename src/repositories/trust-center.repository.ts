import { supabaseAdmin } from "@/lib/supabase/admin";

export function getTrustCenter(
  companyId: string
) {
  return supabaseAdmin
    .from("trust_centers")
    .select("*")
    .eq("company_id", companyId)
    .maybeSingle();
}

export function createTrustCenter(
  companyId: string
) {
  return supabaseAdmin
    .from("trust_centers")
    .insert({
      company_id: companyId,
    })
    .select()
    .single();
}

export function updateTrustCenter(
  companyId: string,
  values: Record<string, unknown>
) {
  return supabaseAdmin
    .from("trust_centers")
    .update(values)
    .eq("company_id", companyId)
    .select()
    .single();
}

export function getTrustCenterByCompanyId(
  companyId: string
) {
  return supabaseAdmin
    .from("trust_centers")
    .select("*")
    .eq("company_id", companyId)
    .eq("is_public", true)
    .single();
}