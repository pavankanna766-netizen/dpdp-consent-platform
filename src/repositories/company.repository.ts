import { supabaseAdmin } from "@/lib/supabase/admin";

export async function findCompanyByClerkUserId(clerkUserId: string) {
  return supabaseAdmin
    .from("company_members")
    .select(
      `
      role,
      companies (
        id,
        company_name,
        industry,
        company_size,
        website,
        country,
        timezone,
        is_onboarded,
        created_at,
        updated_at
      )
    `
    )
    .eq("clerk_user_id", clerkUserId)
    .maybeSingle();
}

export async function createCompany(
  clerkUserId: string,
  companyName: string
) {
  // 1. Create company
  const { data: company, error } = await supabaseAdmin
    .from("companies")
    .insert({
      company_name: companyName,
    })
    .select()
    .single();

  if (error || !company) {
    return { data: null, error };
  }

  // 2. Add owner
  const { error: memberError } = await supabaseAdmin
    .from("company_members")
    .insert({
      company_id: company.id,
      clerk_user_id: clerkUserId,
      role: "owner",
    });

  if (memberError) {
    return { data: null, error: memberError };
  }

  return { data: company, error: null };
}
export async function findCompanyById(companyId: string) {
  return supabaseAdmin
    .from("companies")
    .select("*")
    .eq("id", companyId)
    .single();
}

export async function updateCompany(
  companyId: string,
  values: {
    company_name: string;
    industry: string;
    company_size: string;
    website: string | null;
    country: string;
    timezone: string;
    is_onboarded: boolean;
  }
) {
  return supabaseAdmin
    .from("companies")
    .update(values)
    .eq("id", companyId)
    .select()
    .single();
}
export async function completeCompanyOnboarding(values: {
  company_id: string;
  company_name: string;
  industry: string;
  company_size: string;
  website: string | null;
  country: string;
  timezone: string;
  useCases: string[];
}) {
  return supabaseAdmin.rpc("complete_company_onboarding", {
    p_company_id: values.company_id,
    p_company_name: values.company_name,
    p_industry: values.industry,
    p_company_size: values.company_size,
    p_website: values.website,
    p_country: values.country,
    p_timezone: values.timezone,
    p_use_cases: values.useCases,
  });
}