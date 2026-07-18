import { supabaseAdmin } from "@/lib/supabase/admin";

export async function createVendor(values: {
  company_id: string;
  name: string;
  data_categories: string[];
  purpose: string;
  agreement_clears_safeguard_bar: boolean;
  renewal_status: string;
  contract_expiry?: string;
}) {
  return supabaseAdmin
    .from("vendor_registry")
    .insert(values)
    .select()
    .single();
}

export async function listVendors(companyId: string) {
  return supabaseAdmin
    .from("vendor_registry")
    .select("*")
    .eq("company_id", companyId)
    .order("name", { ascending: true });
}

export async function updateVendor(
  companyId: string,
  id: string,
  values: Partial<{
    name: string;
    data_categories: string[];
    purpose: string;
    agreement_clears_safeguard_bar: boolean;
    renewal_status: string;
    contract_expiry?: string;
  }>
) {
  return supabaseAdmin
    .from("vendor_registry")
    .update(values)
    .eq("company_id", companyId)
    .eq("id", id)
    .select()
    .single();
}

export async function deleteVendor(companyId: string, id: string) {
  return supabaseAdmin
    .from("vendor_registry")
    .delete()
    .eq("company_id", companyId)
    .eq("id", id);
}
