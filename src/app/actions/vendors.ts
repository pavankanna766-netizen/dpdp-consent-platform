"use server";

import { createVendor, deleteVendor, confirmVendor } from "@/repositories/vendor.repository";
import { ensureCompany } from "@/services/company.service";
import { auth } from "@clerk/nextjs/server";

export async function createVendorRecordAction(values: {
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
}) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const company = await ensureCompany(userId, "My Company");

  return createVendor({
    company_id: company.id,
    name: values.name,
    category: values.category || "General Subprocessor",
    purpose: values.purpose,
    data_categories: values.data_categories,
    data_received: values.data_received || [],
    dpa_uploaded: values.dpa_uploaded || false,
    dpa_url: values.dpa_url,
    dpa_expiry: values.dpa_expiry,
    country: values.country || "India",
    scc_required: values.scc_required || false,
  });
}

export async function deleteVendorRecordAction(vendorId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const company = await ensureCompany(userId, "My Company");
  return deleteVendor(company.id, vendorId);
}

export async function confirmVendorAction(vendorId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const company = await ensureCompany(userId, "My Company");
  return confirmVendor(company.id, vendorId);
}
