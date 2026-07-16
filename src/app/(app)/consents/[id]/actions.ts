"use server";

import { auth } from "@clerk/nextjs/server";

import { withPlatform } from "@/platform/action";
import { ConsentIdSchema } from "@/platform/contracts";
import { UnauthorizedError } from "@/platform/errors";

import { revokeConsent } from "@/services/consent.service";
import { ensureCompany } from "@/services/company.service";

export async function withdrawConsentAction(
  id: string
) {
  return withPlatform(async () => {
    const { userId } = await auth();

    if (!userId) {
      throw new UnauthorizedError();
    }

    const consentId = ConsentIdSchema.parse(id);
    const company = await ensureCompany(userId, "My Company");

    await revokeConsent(company.id, consentId);

    return {
      success: true,
    };
  });
}
