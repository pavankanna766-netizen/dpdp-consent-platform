import { supabaseAdmin } from "@/lib/supabase/admin";

export interface VendorRecord {
  id: string;
  company_id: string;
  name: string;
  category: string;
  purpose: string;
  data_categories: string[];
  data_received: string[];
  dpa_uploaded: boolean;
  dpa_url: string | null;
  dpa_expiry: string | null;
  country: string;
  scc_required: boolean;
  security_rating: "A+" | "A" | "B" | "C" | "F";
  last_review_at: string;
  status: "active" | "under_review" | "expired" | "terminated";
  scanner_discovered: boolean;
  unconfirmed: boolean;
  created_at: string;
  updated_at: string;
}

export async function createVendor(values: {
  company_id: string;
  name: string;
  category?: string;
  purpose: string;
  data_categories: string[];
  data_received?: string[];
  dpa_uploaded?: boolean;
  dpa_url?: string;
  dpa_expiry?: string;
  country?: string;
  scc_required?: boolean;
  security_rating?: "A+" | "A" | "B" | "C" | "F";
  last_review_at?: string;
  status?: "active" | "under_review" | "expired" | "terminated";
  scanner_discovered?: boolean;
  unconfirmed?: boolean;
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
    category: string;
    purpose: string;
    data_categories: string[];
    data_received: string[];
    dpa_uploaded: boolean;
    dpa_url: string | null;
    dpa_expiry: string | null;
    country: string;
    scc_required: boolean;
    security_rating: "A+" | "A" | "B" | "C" | "F";
    last_review_at: string;
    status: "active" | "under_review" | "expired" | "terminated";
    scanner_discovered: boolean;
    unconfirmed: boolean;
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

export async function confirmVendor(companyId: string, id: string) {
  return updateVendor(companyId, id, { unconfirmed: false });
}

export async function deleteVendor(companyId: string, id: string) {
  return supabaseAdmin
    .from("vendor_registry")
    .delete()
    .eq("company_id", companyId)
    .eq("id", id);
}

export async function autoCreateVendorFromScanner(
  companyId: string,
  vendorName: string,
  category: string,
  detectedDataTypes: string[]
) {
  // Check if vendor already exists
  const existing = await supabaseAdmin
    .from("vendor_registry")
    .select("id")
    .eq("company_id", companyId)
    .ilike("name", vendorName)
    .maybeSingle();

  if (existing.data) {
    return existing.data;
  }

  const { data } = await createVendor({
    company_id: companyId,
    name: vendorName,
    category: category || "Analytics & Marketing",
    purpose: "Third-party web tracking & audience analytics",
    data_categories: ["Technical Data", "Browsing Activity"],
    data_received: detectedDataTypes.length > 0 ? detectedDataTypes : ["IP Address", "User Agent"],
    dpa_uploaded: false,
    country: "United States",
    scc_required: true,
    security_rating: "B",
    status: "under_review",
    scanner_discovered: true,
    unconfirmed: true,
  });

  return data;
}
