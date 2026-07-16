import { publishEvent, PlatformEvents } from "@/platform";
import { generateId } from "@/platform/core";
import { NotFoundError } from "@/platform/errors";
import type {
  ConsentReceipt,
  ConsentRequest,
} from "@/platform/contracts";

import {
  getConsentReceipt,
  getLatestActiveConsent,
  grantConsent,
  revokeConsent,
} from "./consent.service";
import { getPublishedTemplate } from "./consent-template.service";

export type PublicConsentEvidence = {
  ipAddress?: string;
  userAgent?: string;
};

export type PublicConsentResult =
  | {
      decision: "accepted";
      consentId: string;
      receipt: ConsentReceipt;
    }
  | {
      decision: "rejected";
      consentId: null;
      receiptId: string;
      recordedAt: string;
    }
  | {
      decision: "withdrawn";
      consentId: string;
      receipt: ConsentReceipt;
    };

export async function submitPublicConsent(
  request: ConsentRequest,
  evidence: PublicConsentEvidence
): Promise<PublicConsentResult> {
  const template = await getPublishedTemplate(request.templateToken);

  if (!template) {
    throw new NotFoundError("Published template");
  }

  const evidenceContext = {
    pageUrl: request.metadata?.pageUrl,
    referrer: request.metadata?.referrer,
    bannerVersion: request.metadata?.bannerVersion,
    policyVersion: request.metadata?.policyVersion,
  };

  if (request.decision === "accept") {
    const consent = await grantConsent({
      company_id: template.company_id,
      template_id: template.id,
      subject_identifier: request.visitorId,
      version: template.version,
      consent_text: template.consent_text,
      language: request.language,
      ip_address: evidence.ipAddress,
      user_agent: evidence.userAgent,
      purpose: template.purpose,
      categories: request.categories,
      evidence: evidenceContext,
    });

    return {
      decision: "accepted",
      consentId: consent.id,
      receipt: getConsentReceipt(consent),
    };
  }

  if (request.decision === "withdraw") {
    const consent = await getLatestActiveConsent(
      template.company_id,
      template.id,
      request.visitorId
    );

    if (!consent) {
      throw new NotFoundError("Active consent");
    }

    const withdrawn = await revokeConsent(template.company_id, consent.id);

    return {
      decision: "withdrawn",
      consentId: withdrawn.id,
      receipt: getConsentReceipt(withdrawn),
    };
  }

  const receiptId = generateId();
  const recordedAt = new Date().toISOString();

  await publishEvent(PlatformEvents.CONSENT_REJECTED, {
    companyId: template.company_id,
    templateId: template.id,
    subject: request.visitorId,
    version: template.version,
    receiptId,
    categories: request.categories,
    recordedAt,
  });

  return {
    decision: "rejected",
    consentId: null,
    receiptId,
    recordedAt,
  };
}
