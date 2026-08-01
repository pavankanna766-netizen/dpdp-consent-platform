import { supabaseAdmin } from "@/lib/supabase/admin";

export interface TrustCenterRecord {
  company_id: string;
  headline: string;
  description: string;
  custom_domain: string | null;
  brand_color: string;
  logo_url: string | null;
  security_email: string;
  dpo_name: string;
  dpo_email: string;
  security_certifications: string[];
  system_status: "operational" | "degraded" | "maintenance";
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export function getTrustCenter(companyId: string) {
  return supabaseAdmin
    .from("trust_centers")
    .select("*")
    .eq("company_id", companyId)
    .maybeSingle();
}

export function createTrustCenter(companyId: string) {
  return supabaseAdmin
    .from("trust_centers")
    .insert({
      company_id: companyId,
      headline: "Privacy Trust Portal & Compliance Disclosures",
      description: "Live privacy audit score, statutory disclosures, subprocessor registry, and security commitments.",
      brand_color: "#4f46e5",
      security_email: "security@company.com",
      dpo_name: "Data Protection Officer",
      dpo_email: "privacy@company.com",
      security_certifications: ["DPDP Act 2023 Compliant", "ISO 27001 Certified", "SOC 2 Type II Compliant"],
      system_status: "operational",
      is_public: true,
    })
    .select()
    .single();
}

export function updateTrustCenter(
  companyId: string,
  values: Partial<{
    headline: string;
    description: string;
    custom_domain: string | null;
    brand_color: string;
    logo_url: string | null;
    security_email: string;
    dpo_name: string;
    dpo_email: string;
    security_certifications: string[];
    system_status: "operational" | "degraded" | "maintenance";
    is_public: boolean;
  }>
) {
  return supabaseAdmin
    .from("trust_centers")
    .update(values)
    .eq("company_id", companyId)
    .select()
    .single();
}

export function getTrustCenterByCompanyId(companyId: string) {
  return supabaseAdmin
    .from("trust_centers")
    .select("*")
    .eq("company_id", companyId)
    .eq("is_public", true)
    .maybeSingle();
}