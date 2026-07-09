"use server";

import { grantConsent } from "@/services/consent.service";
import { getPublishedTemplate } from "@/services/consent-template.service";

import { withPlatform } from "@/platform/action";

export async function acceptConsentAction(
  token: string
) {
  return withPlatform(async () => {
    const template =
      await getPublishedTemplate(token);

    if (!template) {
      throw new Error("Template not found");
    }

    await grantConsent({
      company_id: template.company_id,
      template_id: template.id,

      subject_identifier:
        "anonymous",

      version:
        template.version,

      consent_text:
        template.consent_text,

      language: "en",

      metadata: {},

      proof: {},
    });

    return {
      success: true,
    };
  });
}