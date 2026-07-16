import { supabaseAdmin } from "@/lib/supabase/admin";

export async function createBanner(values: {
  company_id: string;
  name: string;
}) {
  return supabaseAdmin
    .from("cookie_banners")
    .insert(values)
    .select()
    .single();
}

export async function getBanner(
  companyId: string,
  id: string
) {
  return supabaseAdmin
    .from("cookie_banners")
    .select("*")
    .eq("company_id", companyId)
    .eq("id", id)
    .single();
}

export async function listCompanyBanners(
  companyId: string
) {
  return supabaseAdmin
    .from("cookie_banners")
    .select("*")
    .eq("company_id", companyId)
    .order("updated_at", {
      ascending: false,
    });
}

export async function updateBanner(
  companyId: string,
  id: string,
  values: Record<
    string,
    unknown
  >
) {
  return supabaseAdmin
    .from("cookie_banners")
    .update({
      ...values,
      updated_at:
        new Date().toISOString(),
    })
    .eq("company_id", companyId)
    .eq("id", id)
    .select()
    .single();
}

export async function getBannerByEmbedToken(
  token: string
) {
  return supabaseAdmin
    .from("cookie_banners")
    .select("*")
    .eq("embed_token", token)
    .eq("status", "published")
    .maybeSingle();
}

export async function getCompanyBanner(companyId: string, id: string) {
  return supabaseAdmin
    .from("cookie_banners")
    .select("*")
    .eq("company_id", companyId)
    .eq("id", id)
    .maybeSingle();
}
