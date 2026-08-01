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
  identifier: string
) {
  const isUuid =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      identifier
    );

  if (isUuid) {
    const byId = await supabaseAdmin
      .from("companies")
      .select("*")
      .eq("id", identifier)
      .maybeSingle();

    if (byId.data) return byId;
  }

  return supabaseAdmin
    .from("companies")
    .select("*")
    .eq("slug", identifier)
    .maybeSingle();
}