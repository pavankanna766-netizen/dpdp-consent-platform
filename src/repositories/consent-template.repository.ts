import { supabaseAdmin } from "@/lib/supabase/admin";

export async function createConsentTemplate(values: {
  company_id: string;
  title: string;
  description: string | null;
  purpose: string;
  legal_basis: string;
  retention_period: string;
  consent_text: string;
  is_required: boolean;
}) {
  return supabaseAdmin
    .from("consent_templates")
    .insert({
      ...values,
      status: "draft",
      version: 1,
    })
    .select()
    .single();
}

export async function getTemplates(companyId: string) {
  return supabaseAdmin
    .from("consent_templates")
    .select("*")
    .eq("company_id", companyId)
    .order("created_at", {
      ascending: false,
    });
}

export async function getTemplateById(id: string) {
  return supabaseAdmin
    .from("consent_templates")
    .select("*")
    .eq("id", id)
    .single();
}

export async function updateTemplate(
  id: string,
  values: {
    title: string;
    description: string | null;
    purpose: string;
    legal_basis: string;
    retention_period: string;
    consent_text: string;
    is_required: boolean;
  }
) {
  return supabaseAdmin
    .from("consent_templates")
    .update({
      ...values,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();
}

export async function publishTemplate(
  id: string,
  publicToken: string
) {
  return supabaseAdmin
    .from("consent_templates")
    .update({
      status: "published",
      public_token: publicToken,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();
}

export async function deleteTemplate(id: string) {
  return supabaseAdmin
    .from("consent_templates")
    .delete()
    .eq("id", id);
}

export async function getTemplateByToken(
  token: string
) {
  return supabaseAdmin
    .from("consent_templates")
    .select("*")
    .eq("public_token", token)
    .eq("status", "published")
    .single();
}

export async function findDefaultTemplate(
  companyId: string
) {
  return supabaseAdmin
    .from("consent_templates")
    .select("*")
    .eq("company_id", companyId)
    .eq("title", "Default Cookie Consent")
    .maybeSingle();
}