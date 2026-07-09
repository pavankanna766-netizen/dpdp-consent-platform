import { supabaseAdmin } from "@/lib/supabase/admin";

import type { CompanySettings } from "@/platform/settings/types";

export async function getCompanySettings(
  companyId: string
) {
  return supabaseAdmin
    .from("company_settings")
    .select("*")
    .eq("company_id", companyId)
    .maybeSingle();
}

export async function createCompanySettings(
  companyId: string,
  settings: CompanySettings
) {
  return supabaseAdmin
    .from("company_settings")
    .insert({
      company_id: companyId,
      settings,
    })
    .select()
    .single();
}

export async function updateCompanySettings(
  companyId: string,
  settings: CompanySettings
) {
  return supabaseAdmin
    .from("company_settings")
    .update({
      settings,
      updated_at: new Date().toISOString(),
    })
    .eq("company_id", companyId)
    .select()
    .single();
}