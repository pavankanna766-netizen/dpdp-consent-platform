import { supabaseAdmin } from "@/lib/supabase/admin";

export async function updateCompanySlug(
  companyId: string,
  slug: string
) {
  return supabaseAdmin
    .from("companies")
    .update({
      slug,
    })
    .eq("id", companyId)
    .select()
    .single();
}

export async function getCompanyBySlug(
  slug: string
) {
  return supabaseAdmin
    .from("companies")
    .select("*")
    .eq("slug", slug)
    .single();
}