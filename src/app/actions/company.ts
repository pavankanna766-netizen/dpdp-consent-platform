"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { UnauthorizedError } from "@/platform/errors";
import { ensureCompany } from "@/services/company.service";
import { updateCompany } from "@/repositories/company.repository";

export async function updateCompanyAction(values: {
  company_name: string;
  website: string | null;
  industry: string;
  company_size: string;
  country: string;
  timezone: string;
  is_onboarded: boolean;
}) {
  const { userId } = await auth();

  if (!userId) {
    throw new UnauthorizedError();
  }

  const company = await ensureCompany(userId, "My Company");

  const result = await updateCompany(company.id, values);

  if (result.error) {
    throw result.error;
  }

  revalidatePath("/dashboard/trust");
  if (result.data?.slug) {
    revalidatePath(`/p/${result.data.slug}/trust`);
  }
  return result.data;
}
