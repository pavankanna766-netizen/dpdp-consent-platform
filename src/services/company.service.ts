import {
  createCompany,
  findCompanyByClerkUserId,
  completeCompanyOnboarding,
} from "@/repositories/company.repository";

export async function ensureCompany(
  clerkUserId: string,
  companyName: string
) {
  const { data, error } =
    await findCompanyByClerkUserId(clerkUserId);

  if (error) throw error;

  if (data?.companies) {
    return data.companies;
  }

  const { data: company, error: createError } =
    await createCompany(clerkUserId, companyName);

  if (createError) throw createError;

  return company;
}

export async function completeOnboarding(
  companyId: string,
  values: {
    company_name: string;
    industry: string;
    company_size: string;
    website: string | null;
    country: string;
    timezone: string;
    useCases: string[];
  }
) {
  const { error } = await completeCompanyOnboarding({
    company_id: companyId,
    ...values,
  });

  if (error) {
    throw error;
  }
}