"use server";

import { withPlatform } from "@/platform/action";
import { auth } from "@clerk/nextjs/server";
import { UnauthorizedError } from "@/platform/errors";
import { ensureCompany } from "@/services/company.service";
import {
  createVendor,
  updateVendor,
  deleteVendor,
  linkVendorToInventory,
} from "@/repositories/vendor.repository";

export async function createVendorAction(values: {
  name: string;
  category?: string;
  purpose: string;
  data_categories: string[];
  data_received?: string[];
  dpa_uploaded?: boolean;
  dpa_url?: string;
  dpa_expiry?: string;
  country?: string;
  scc_required?: boolean;
  security_rating?: "A+" | "A" | "B" | "C" | "F";
  status?: "active" | "under_review" | "expired" | "terminated";
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
    category: string;
    purpose: string;
    data_categories: string[];
    data_received: string[];
    dpa_uploaded: boolean;
    dpa_url: string | null;
    dpa_expiry: string | null;
    country: string;
    scc_required: boolean;
    security_rating: "A+" | "A" | "B" | "C" | "F";
    last_review_at: string;
    status: "active" | "under_review" | "expired" | "terminated";
    unconfirmed?: boolean;
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

export async function linkVendorToInventoryAction(vendorId: string, dataInventoryId: string) {
  return withPlatform(async () => {
    const { userId } = await auth();
    if (!userId) throw new UnauthorizedError();
    await linkVendorToInventory(vendorId, dataInventoryId);
    return { success: true };
  });
}
