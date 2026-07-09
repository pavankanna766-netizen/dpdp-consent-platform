import { grantConsent } from "./consent.service";

import { getPublishedTemplate } from "./consent-template.service";

import type { ConsentRequest } from "@/platform/contracts";

export async function submitPublicConsent(
  request: ConsentRequest
) {
  const template =
    await getPublishedTemplate(
      request.templateToken
    );

  if (!template) {
    throw new Error(
      "Published template not found."
    );
  }

  return grantConsent({
    company_id: template.company_id,

    template_id: template.id,

    subject_identifier:
      request.visitorId,

    version: template.version,

    consent_text:
      template.consent_text,

    language: request.language,

    metadata: request.metadata,
  });
}