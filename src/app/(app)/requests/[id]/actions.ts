"use server";

import { withPlatform } from "@/platform/action";

import { auth } from "@clerk/nextjs/server";
import { UnauthorizedError } from "@/platform/errors";
import { ensureCompany } from "@/services/company.service";
import { completeRequest } from "@/services/dsar.service";

export async function completeRequestAction(
  id: string
) {
  return withPlatform(async () => {
    const { userId } = await auth();
    if (!userId) throw new UnauthorizedError();

    const company = await ensureCompany(userId, "My Company");
    await completeRequest(company.id, id);

    return {
      success: true,
    };
  });
}