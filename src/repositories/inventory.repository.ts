import { supabaseAdmin } from "@/lib/supabase/admin";

export async function createInventoryItem(values: {
  company_id: string;
  category: string;
  data_subject: string;
  purpose: string;
  data_types: string[];
  shared_with_processor?: string;
  legal_basis: string;
  retention_period: string;
}) {
  return supabaseAdmin
    .from("data_inventory")
    .insert(values)
    .select()
    .single();
}

export async function listInventoryItems(companyId: string) {
  return supabaseAdmin
    .from("data_inventory")
    .select("*")
    .eq("company_id", companyId)
    .order("category", { ascending: true });
}

export async function updateInventoryItem(
  companyId: string,
  id: string,
  values: Partial<{
    category: string;
    data_subject: string;
    purpose: string;
    data_types: string[];
    shared_with_processor?: string;
    legal_basis: string;
    retention_period: string;
  }>
) {
  return supabaseAdmin
    .from("data_inventory")
    .update(values)
    .eq("company_id", companyId)
    .eq("id", id)
    .select()
    .single();
}

export async function deleteInventoryItem(companyId: string, id: string) {
  return supabaseAdmin
    .from("data_inventory")
    .delete()
    .eq("company_id", companyId)
    .eq("id", id);
}
