import {
  createCompany,
  findCompanyByClerkUserId,
} from "@/repositories/company.repository";

export async function ensureCompany(
  clerkUserId: string,
  companyName: string
) {
  const { data: company, error } =
    await findCompanyByClerkUserId(clerkUserId);

  if (error) {
    throw error;
  }

  if (company) {
    return company;
  }

  const { data: newCompany, error: insertError } =
    await createCompany(clerkUserId, companyName);

  if (insertError) {
    throw insertError;
  }

  return newCompany;
}