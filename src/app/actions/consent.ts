"use server";

import { auth } from "@clerk/nextjs/server";

import { UnauthorizedError } from "@/platform/errors";

import { ensureWorkspace } from "@/services/workspace.service";
import { grantConsent } from "@/services/consent.service";

export async function acceptConsentAction(
  visitorId: string
) {
  const { userId } = await auth();

  if (!userId) {
    throw new UnauthorizedError();
  }

  const workspace =
    await ensureWorkspace(
      userId,
      "My Company"
    );

  return grantConsent({
    company_id:
      workspace.company.id,

    template_id:
      workspace.template.id,

    subject_identifier:
      visitorId,

    version:
      workspace.template.version,

    consent_text:
      workspace.template.consent_text,

    language: "en",
  });
}