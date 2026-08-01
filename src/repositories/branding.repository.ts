import { supabaseAdmin } from "@/lib/supabase/admin";
import { cache } from "react";

export type BuiltInTheme =
  | "Professional"
  | "Modern"
  | "Corporate"
  | "Minimal"
  | "Government"
  | "Startup"
  | "Enterprise"
  | "Healthcare"
  | "FinTech"
  | "EdTech"
  | "Custom";

export interface CompanyBrandingRecord {
  id: string;
  company_id: string;
  theme_name: BuiltInTheme;
  logo_url: string | null;
  dark_logo_url: string | null;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  font_family: string;
  document_width: string;
  document_margin: string;
  header_enabled: boolean;
  header_config: {
    showLogo: boolean;
    showVersion: boolean;
    showConfidential: boolean;
  };
  footer_enabled: boolean;
  footer_config: {
    showPageNumbers: boolean;
    showGeneratedDate: boolean;
  };
  watermark_enabled: boolean;
  watermark_config: {
    text: string;
    opacity: number;
    rotation: number;
  };
  cover_page_enabled: boolean;
  cover_page_config: {
    showTagline: boolean;
    showPreparedFor: boolean;
  };
  address: string | null;
  support_email: string | null;
  privacy_contact: string | null;
  dpo_name: string | null;
  phone_number: string | null;
  created_at: string;
  updated_at: string;
}

export const getCompanyBranding = cache(async function (companyId: string) {
  const { data } = await supabaseAdmin
    .from("company_branding")
    .select("*")
    .eq("company_id", companyId)
    .maybeSingle();

  if (data) return { data, error: null };

  // Lazy-provision default branding if not present
  return supabaseAdmin
    .from("company_branding")
    .insert({
      company_id: companyId,
      theme_name: "Professional",
      primary_color: "#4f46e5",
      secondary_color: "#0f172a",
      accent_color: "#10b981",
      font_family: "Inter",
    })
    .select()
    .single();
});

export async function updateCompanyBranding(
  companyId: string,
  values: Partial<{
    theme_name: BuiltInTheme;
    logo_url: string | null;
    dark_logo_url: string | null;
    primary_color: string;
    secondary_color: string;
    accent_color: string;
    font_family: string;
    document_width: string;
    document_margin: string;
    header_enabled: boolean;
    header_config: Record<string, unknown>;
    footer_enabled: boolean;
    footer_config: Record<string, unknown>;
    watermark_enabled: boolean;
    watermark_config: Record<string, unknown>;
    cover_page_enabled: boolean;
    cover_page_config: Record<string, unknown>;
    address: string | null;
    support_email: string | null;
    privacy_contact: string | null;
    dpo_name: string | null;
    phone_number: string | null;
  }>
) {
  return supabaseAdmin
    .from("company_branding")
    .update(values)
    .eq("company_id", companyId)
    .select()
    .single();
}

export async function resetCompanyBranding(companyId: string) {
  return updateCompanyBranding(companyId, {
    theme_name: "Professional",
    logo_url: null,
    dark_logo_url: null,
    primary_color: "#4f46e5",
    secondary_color: "#0f172a",
    accent_color: "#10b981",
    font_family: "Inter",
    document_width: "800px",
    document_margin: "24px",
    header_enabled: true,
    footer_enabled: true,
    watermark_enabled: false,
    cover_page_enabled: false,
  });
}
