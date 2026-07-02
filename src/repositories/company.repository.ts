import { supabaseAdmin } from "@/lib/supabase/admin";

export async function findCompanyByClerkUserId(clerkUserId: string) {
  return supabaseAdmin
    .from("companies")
    .select("*")
    .eq("clerk_user_id", clerkUserId)
    .maybeSingle();
}

export async function createCompany(
  clerkUserId: string,
  companyName: string
) {
  return supabaseAdmin
    .from("companies")
    .insert({
      clerk_user_id: clerkUserId,
      company_name: companyName,
    })
    .select()
    .single();
}