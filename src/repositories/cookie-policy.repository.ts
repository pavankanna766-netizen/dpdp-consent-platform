import { supabaseAdmin } from "@/lib/supabase/admin";
import { cache } from "react";

export function createCookiePolicy(
  values: {
    company_id: string;
    html_content: string;
  }
) {
  return supabaseAdmin
    .from("cookie_policies")
    .insert(values)
    .select()
    .single();
}

export const latestCookiePolicy = cache(async function (
  companyId: string
) {
  return supabaseAdmin
    .from("cookie_policies")
    .select("*")
    .eq("company_id", companyId)
    .order("version", {
      ascending: false,
    })
    .limit(1)
    .maybeSingle();
});

export function updateCookiePolicy(
  id: string,
  values: Record<string, unknown>
) {
  return supabaseAdmin
    .from("cookie_policies")
    .update({
      ...values,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();
}

export const listCookiePolicyVersions = cache(async function (
  companyId: string
) {
  return supabaseAdmin
    .from("cookie_policies")
    .select("*")
    .eq("company_id", companyId)
    .order("version", {
      ascending: false,
    });
});

export const getPublishedCookiePolicy = cache(async function (
  companyId: string
) {
  return supabaseAdmin
    .from("cookie_policies")
    .select("*")
    .eq("company_id", companyId)
    .eq("status", "published")
    .single();
});

export const getCookiePolicyById = cache(async function (
  id: string
) {
  return supabaseAdmin
    .from("cookie_policies")
    .select("*")
    .eq("id", id)
    .single();
});