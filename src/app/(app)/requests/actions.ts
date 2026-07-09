"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { auth } from "@clerk/nextjs/server";

import { UnauthorizedError } from "@/platform/errors";
import { withPlatform } from "@/platform/action";

import { ensureCompany } from "@/services/company.service";
import { createDsarRequest } from "@/services/dsar.service";

import type { RequestValues } from "./schema";

export async function createRequestAction(
  values: RequestValues
) {
  return withPlatform(async () => {
    const { userId } = await auth();

    if (!userId) {
      throw new UnauthorizedError();
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