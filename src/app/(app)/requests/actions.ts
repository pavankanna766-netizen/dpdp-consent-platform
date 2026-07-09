"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { auth } from "@clerk/nextjs/server";

import { ensureCompany } from "@/services/company.service";

import { createDsarRequest } from "@/services/dsar.service";

import type { RequestValues } from "./schema";

import { withPlatform } from "@/platform/action";

export async function createRequestAction(
  values: RequestValues
) {
  return withPlatform(async () => {
    const { userId } = await auth();

    if (!userId) {
      throw new Error("Unauthorized");
    }

    const company =
      await ensureCompany(
        userId,
        "My Company"
      );

    await createDsarRequest({
      company_id: company.id,
      ...values,
    });

    revalidatePath("/requests");
    redirect("/requests");
  });
}