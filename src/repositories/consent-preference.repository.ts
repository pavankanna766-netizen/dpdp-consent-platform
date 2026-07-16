import { supabaseAdmin } from "@/lib/supabase/admin";

const preferenceFields = [
  "id", "consent_id", "subject_identifier", "decision", "categories",
  "banner_version", "privacy_policy_version", "cookie_policy_version",
  "expires_at", "created_at",
].join(",");

export type ConsentPreferenceInsert = {
  company_id: string;
  banner_id: string;
  consent_id: string | null;
  subject_identifier: string;
  decision: "accepted" | "rejected" | "saved" | "withdrawn";
  categories: Record<string, boolean>;
  banner_version: number;
  privacy_policy_version: number | null;
  cookie_policy_version: number | null;
  expires_at: string | null;
  metadata: Record<string, unknown>;
};

export function createConsentPreference(values: ConsentPreferenceInsert) {
  return supabaseAdmin
    .from("consent_preferences")
    .insert(values)
    .select()
    .single();
}

export function getLatestConsentPreference(
  companyId: string,
  bannerId: string,
  subjectIdentifier: string
) {
  return supabaseAdmin
    .from("consent_preferences")
    .select(preferenceFields)
    .eq("company_id", companyId)
    .eq("banner_id", bannerId)
    .eq("subject_identifier", subjectIdentifier)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
}

export function listConsentPreferences(
  companyId: string,
  bannerId: string,
  subjectIdentifier: string
) {
  return supabaseAdmin
    .from("consent_preferences")
    .select(preferenceFields)
    .eq("company_id", companyId)
    .eq("banner_id", bannerId)
    .eq("subject_identifier", subjectIdentifier)
    .order("created_at", { ascending: false });
}
