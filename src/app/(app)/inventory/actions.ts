"use server";

import { withPlatform } from "@/platform/action";
import { auth } from "@clerk/nextjs/server";
import { UnauthorizedError } from "@/platform/errors";
import { ensureCompany } from "@/services/company.service";
import {
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
} from "@/repositories/inventory.repository";

export async function createInventoryItemAction(values: {
  category: string;
  processing_activity?: string;
  data_subject: string;
  purpose: string;
  data_types: string[];
  shared_with_processor?: string;
  legal_basis: string;
  retention_period: string;
  storage_location?: string;
  cross_border_transfer?: boolean;
  transfer_countries?: string[];
  encryption_status?: string;
  owner_email?: string;
  status?: "active" | "archived" | "review_required";
  ai_classification_confidence?: number;
}) {
  return withPlatform(async () => {
    const { userId } = await auth();
    if (!userId) throw new UnauthorizedError();
    const company = await ensureCompany(userId, "My Company");
    await createInventoryItem({
      company_id: company.id,
      ...values,
    });
    return { success: true };
  });
}

export async function updateInventoryItemAction(
  id: string,
  values: Partial<{
    category: string;
    processing_activity: string;
    data_subject: string;
    purpose: string;
    data_types: string[];
    shared_with_processor?: string | null;
    legal_basis: string;
    retention_period: string;
    storage_location: string;
    cross_border_transfer: boolean;
    transfer_countries: string[];
    encryption_status: string;
    owner_email: string | null;
    status: "active" | "archived" | "review_required";
    ai_classification_confidence: number;
    unconfirmed?: boolean;
  }>
) {
  return withPlatform(async () => {
    const { userId } = await auth();
    if (!userId) throw new UnauthorizedError();
    const company = await ensureCompany(userId, "My Company");
    await updateInventoryItem(company.id, id, values);
    return { success: true };
  });
}

export async function deleteInventoryItemAction(id: string) {
  return withPlatform(async () => {
    const { userId } = await auth();
    if (!userId) throw new UnauthorizedError();
    const company = await ensureCompany(userId, "My Company");
    await deleteInventoryItem(company.id, id);
    return { success: true };
  });
}
