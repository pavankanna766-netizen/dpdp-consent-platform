import { supabaseAdmin } from "@/lib/supabase/admin";
import { cache } from "react";

export async function createPrivacyPolicy(
  values: {
    company_id: string;
    html_content: string;
  }
) {
  return supabaseAdmin
    .from("privacy_policies")
    .insert({
      company_id: values.company_id,

      html_content: values.html_content,

    })
    .select()
    .single();
}

export const getLatestPrivacyPolicy = cache(async function (
  companyId: string
) {
  return supabaseAdmin
    .from("privacy_policies")
    .select("*")
    .eq("company_id", companyId)
    .order("version", {
      ascending: false,
    })
    .limit(1)
    .maybeSingle();
});

export async function updatePrivacyPolicy(
  id: string,
  values: Record<
    string,
    unknown
  >
) {
  return supabaseAdmin
    .from("privacy_policies")
    .update({
      ...values,
      updated_at:
        new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();
}

export const getPublishedPrivacyPolicy = cache(async function (
  companyId: string
) {
  return supabaseAdmin
    .from("privacy_policies")
    .select("*")
    .eq("company_id", companyId)
    .eq("status", "published")
    .eq("archived", false)
    .single();
});

export const listPolicyVersions = cache(async function (
  companyId: string
) {
  return supabaseAdmin
    .from("privacy_policies")
    .select("*")
    .eq("company_id", companyId)
    .order("version", {
      ascending: false,
    });
});

export const getPrivacyPolicyById = cache(async function (
  id: string
) {
  return supabaseAdmin
    .from("privacy_policies")
    .select("*")
    .eq("id", id)
    .single();
});

export async function archivePrivacyPolicy(
  id: string
) {
  return supabaseAdmin
    .from("privacy_policies")
    .update({
      archived: true,
      status: "archived",
      updated_at:
        new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();
}