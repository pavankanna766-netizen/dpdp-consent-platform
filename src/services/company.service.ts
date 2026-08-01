import { cache } from "react";
import {
  createCompany,
  findCompanyByClerkUserId,
  completeCompanyOnboarding,
} from "@/repositories/company.repository";
import { ForbiddenError } from "@/platform/errors";
import { checkPermission, type Permission, type OrgRole } from "@/platform/permissions";

export const ensureCompany = cache(async function ensureCompany(
  clerkUserId: string,
  companyName: string
) {
  const { data, error } = await findCompanyByClerkUserId(clerkUserId);

  if (error) throw error;

  if (data?.companies) {
    return data.companies;
  }

  const { data: company, error: createError } = await createCompany(
    clerkUserId,
    companyName
  );

  if (createError) throw createError;

  return company;
});

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

export const ensureCompanyOwner = cache(async function ensureCompanyOwner(
  clerkUserId: string,
  companyName: string
) {
  const { data, error } = await findCompanyByClerkUserId(clerkUserId);
  if (error) throw error;

  if (!data?.companies) {
    return ensureCompany(clerkUserId, companyName);
  }

  if (data.role !== "owner") {
    throw new ForbiddenError();
  }

  return data.companies;
});

export const ensureCompanyWithRole = cache(async function ensureCompanyWithRole(
  clerkUserId: string,
  companyName: string,
  requiredPermission: Permission
) {
  const { data, error } = await findCompanyByClerkUserId(clerkUserId);
  if (error) throw error;

  if (!data?.companies) {
    // Auto-create with owner role for new users
    const { data: company, error: createError } = await createCompany(
      clerkUserId,
      companyName
    );
    if (createError) throw createError;
    return { company, role: "owner" as OrgRole };
  }

  const role = (data.role || "viewer") as OrgRole;
  if (!checkPermission(role, requiredPermission)) {
    throw new ForbiddenError();
  }

  return { company: data.companies, role };
});
