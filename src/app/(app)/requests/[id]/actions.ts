"use server";

import { withPlatform } from "@/platform/action";

import { completeRequest } from "@/services/dsar.service";

export async function completeRequestAction(
  id: string
) {
  return withPlatform(async () => {
    await completeRequest(id);

    return {
      success: true,
    };
  });
}