import { supabaseAdmin } from "@/lib/supabase/admin";

export async function createConsent(values: {
  company_id: string;
  template_id: string;
  subject_identifier: string;
  version: number;
  consent_text: string;
  ip_address?: string;
  user_agent?: string;
  language?: string;
  metadata?: Record<string, unknown>;
  proof?: Record<string, unknown>;
}) {
  return supabaseAdmin
    .from("consents")
    .insert({
      ...values,
      status: "granted",
    })
    .select()
    .single();
}

export async function withdrawConsent(
  companyId: string,
  id: string
) {
  return supabaseAdmin
    .from("consents")
    .update({
      status: "withdrawn",
      withdrawn_at: new Date().toISOString(),
    })
    .eq("company_id", companyId)
    .eq("id", id)
    .eq("status", "granted")
    .select()
    .single();
}

export async function getConsentById(
  companyId: string,
  id: string
) {
  return supabaseAdmin
    .from("consents")
    .select("*")
    .eq("company_id", companyId)
    .eq("id", id)
    .single();
}

export async function listConsents(
  companyId: string
) {
  return supabaseAdmin
    .from("consents")
    .select("*")
    .eq("company_id", companyId)
    .order("created_at", {
      ascending: false,
    });
}

export async function findActiveConsent(
  companyId: string,
  templateId: string,
  subjectIdentifier: string,
  version: number
) {
  return supabaseAdmin
    .from("consents")
    .select("*")
    .eq("company_id", companyId)
    .eq("template_id", templateId)
    .eq("subject_identifier", subjectIdentifier)
    .eq("version", version)
    .eq("status", "granted")
    .maybeSingle();
}

export async function findLatestActiveConsent(
  companyId: string,
  templateId: string,
  subjectIdentifier: string
) {
  return supabaseAdmin
    .from("consents")
    .select("*")
    .eq("company_id", companyId)
    .eq("template_id", templateId)
    .eq("subject_identifier", subjectIdentifier)
    .eq("status", "granted")
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();
}

export async function listConsentHistory(
  companyId: string,
  subjectIdentifier: string
) {
  return supabaseAdmin
    .from("consents")
    .select("*")
    .eq("company_id", companyId)
    .eq("subject_identifier", subjectIdentifier)
    .order("created_at", { ascending: false });
}

export async function updateConsent(
  companyId: string,
  id: string,
  values: {
    metadata?: Record<
      string,
      unknown
    >;

    proof?: Record<
      string,
      unknown
    >;

    language?: string;

    consent_text?: string;

    version?: number;
  }
) {
  return supabaseAdmin
    .from("consents")
    .update(values)
    .eq("company_id", companyId)
    .eq("id", id)
    .select()
    .single();
}
