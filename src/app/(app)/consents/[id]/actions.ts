"use server";

import { withPlatform } from "@/platform/action";

import { revokeConsent } from "@/services/consent.service";

export async function withdrawConsentAction(
  id: string
) {
  return withPlatform(async () => {
    await revokeConsent(id);

    return {
      success: true,
    };
  });
}