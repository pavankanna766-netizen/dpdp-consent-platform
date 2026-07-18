"use server";

import { withPlatform } from "@/platform/action";
import { auth } from "@clerk/nextjs/server";
import { UnauthorizedError } from "@/platform/errors";
import { ensureCompany } from "@/services/company.service";
import { createVendor, updateVendor, deleteVendor } from "@/repositories/vendor.repository";

export async function createVendorAction(values: {
  name: string;
  data_categories: string[];
  purpose: string;
  agreement_clears_safeguard_bar: boolean;
  renewal_status: string;
  contract_expiry?: string;
}) {
  return withPlatform(async () => {
    const { userId } = await auth();
    if (!userId) throw new UnauthorizedError();
    const company = await ensureCompany(userId, "My Company");
    await createVendor({
      company_id: company.id,
      ...values,
    });
    return { success: true };
  });
}

export async function updateVendorAction(
  id: string,
  values: Partial<{
    name: string;
    data_categories: string[];
    purpose: string;
    agreement_clears_safeguard_bar: boolean;
    renewal_status: string;
    contract_expiry?: string;
  }>
) {
  return withPlatform(async () => {
    const { userId } = await auth();
    if (!userId) throw new UnauthorizedError();
    const company = await ensureCompany(userId, "My Company");
    await updateVendor(company.id, id, values);
    return { success: true };
  });
}

export async function deleteVendorAction(id: string) {
  return withPlatform(async () => {
    const { userId } = await auth();
    if (!userId) throw new UnauthorizedError();
    const company = await ensureCompany(userId, "My Company");
    await deleteVendor(company.id, id);
    return { success: true };
  });
}
