import { supabaseAdmin } from "@/lib/supabase/admin";

export interface DataInventoryRecord {
  id: string;
  company_id: string;
  category: string;
  processing_activity: string;
  data_subject: string;
  purpose: string;
  data_types: string[];
  shared_with_processor: string | null;
  legal_basis: string;
  retention_period: string;
  storage_location: string;
  cross_border_transfer: boolean;
  transfer_countries: string[];
  encryption_status: string;
  owner_email: string | null;
  status: "active" | "archived" | "review_required";
  ai_classification_confidence: number | null;
  unconfirmed: boolean;
  created_at: string;
  updated_at: string;
}

export async function createInventoryItem(values: {
  company_id: string;
  category: string;
  processing_activity?: string;
  data_subject: string;
  purpose: string;
  data_types: string[];
  shared_with_processor?: string;
  legal_basis: string;
  retention_period: string;
  storage_location?: string;
  cross_border_transfer?: boolean;
  transfer_countries?: string[];
  encryption_status?: string;
  owner_email?: string;
  status?: "active" | "archived" | "review_required";
  ai_classification_confidence?: number;
  unconfirmed?: boolean;
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
    processing_activity: string;
    data_subject: string;
    purpose: string;
    data_types: string[];
    shared_with_processor?: string | null;
    legal_basis: string;
    retention_period: string;
    storage_location: string;
    cross_border_transfer: boolean;
    transfer_countries: string[];
    encryption_status: string;
    owner_email: string | null;
    status: "active" | "archived" | "review_required";
    ai_classification_confidence: number;
    unconfirmed: boolean;
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

export async function linkInventoryToVendor(dataInventoryId: string, vendorId: string) {
  return supabaseAdmin
    .from("data_inventory_vendors")
    .insert({
      data_inventory_id: dataInventoryId,
      vendor_id: vendorId,
    })
    .select()
    .maybeSingle();
}
