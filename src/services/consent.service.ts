import {
  createConsent,
  findActiveConsent,
  findLatestActiveConsent,
  getConsentById,
  listConsentHistory,
  listConsents,
  withdrawConsent,
  getConsentStatsFromDb,
} from "@/repositories/consent.repository";
import { publishEvent, PlatformEvents } from "@/platform";
import { buildEvidence } from "@/platform/consent/evidence/builder";
import { generateId } from "@/platform/core";
import { ConflictError, NotFoundError } from "@/platform/errors";
import {
  ConsentRecordSchema,
  createConsentReceipt,
} from "@/platform/contracts";
import type {
  ConsentCategories,
  ConsentReceipt,
  ConsentRecord,
} from "@/platform/contracts";

import { ensureCompanySettings } from "./company-settings.service";

type ConsentEvidenceContext = {
  pageUrl?: string;
  referrer?: string;
  bannerVersion?: number;
  policyVersion?: number;
};

type GrantConsentInput = {
  company_id: string;
  template_id: string;
  subject_identifier: string;
  version: number;
  consent_text: string;
  ip_address?: string;
  user_agent?: string;
  language?: string;
  metadata?: Record<string, unknown>;
  proof?: Record<string, unknown>;
  purpose?: string;
  categories?: ConsentCategories;
  evidence?: ConsentEvidenceContext;
  decision?: "accept" | "reject" | "preferences";
  forceNew?: boolean;
  emitEvent?: boolean;
};

function parseConsent(data: unknown): ConsentRecord {
  return ConsentRecordSchema.parse(data);
}

function parseConsentList(data: unknown): ConsentRecord[] {
  if (!Array.isArray(data)) {
    return [];
  }

  return data.map((consent) => parseConsent(consent));
}

export async function grantConsent(
  values: GrantConsentInput
) {
  const existing = await findActiveConsent(
    values.company_id,
    values.template_id,
    values.subject_identifier,
    values.version
  );

  if (existing.data && !values.forceNew) {
    return parseConsent(existing.data);
  }

  if (existing.error) {
    throw existing.error;
  }

  if (existing.data && values.forceNew) {
    await revokeConsent(values.company_id, existing.data.id);
  }

  const settings = await ensureCompanySettings(values.company_id);
  const evidence = buildEvidence(
    {
      ipAddress: values.ip_address,
      userAgent: values.user_agent,
      language: values.language,
      pageUrl: values.evidence?.pageUrl,
      referrer: values.evidence?.referrer,
      bannerVersion: values.evidence?.bannerVersion,
      policyVersion: values.evidence?.policyVersion,
      purpose: values.purpose,
      categories: values.categories,
    },
    settings.settings.consent
  );

  const recordedAt = new Date().toISOString();
  const { data, error } = await createConsent({
    company_id: values.company_id,
    template_id: values.template_id,
    subject_identifier: values.subject_identifier,
    version: values.version,
    consent_text: values.consent_text,
    ip_address: evidence.ipAddress,
    user_agent: evidence.userAgent,
    language: evidence.language,
    metadata: {
      ...evidence.metadata,
      ...values.metadata,
    },
    proof: {
      ...evidence.proof,
      ...values.proof,
      receiptId: generateId(),
      recordedAt,
      decision: values.decision ?? "accept",
    },
  });

  if (error) {
    throw error;
  }

  const consent = parseConsent(data);
  const receipt = createConsentReceipt(consent);

  if (values.emitEvent !== false) {
    const eventType = values.decision === "reject"
      ? PlatformEvents.CONSENT_REJECTED
      : values.decision === "preferences"
        ? PlatformEvents.CONSENT_PREFERENCE_CHANGED
        : PlatformEvents.CONSENT_ACCEPTED;
    await publishEvent(eventType, {
      consentId: consent.id,
      companyId: consent.company_id,
      templateId: consent.template_id,
      subject: consent.subject_identifier,
      version: consent.version,
      receiptId: receipt.receiptId,
    });
  }

  return consent;
}

export async function revokeConsent(
  companyId: string,
  consentId: string
) {
  const current = await getCompanyConsent(companyId, consentId);

  if (current.status !== "granted") {
    throw new ConflictError(
      "Consent has already been withdrawn."
    );
  }

  const { data, error } = await withdrawConsent(companyId, consentId);

  if (error) {
    throw error;
  }

  const consent = parseConsent(data);
  const receipt = createConsentReceipt(consent);

  await publishEvent(PlatformEvents.CONSENT_WITHDRAWN, {
    consentId: consent.id,
    companyId: consent.company_id,
    templateId: consent.template_id,
    subject: consent.subject_identifier,
    version: consent.version,
    receiptId: receipt.receiptId,
  });

  return consent;
}

export async function getCompanyConsent(
  companyId: string,
  id: string
) {
  const { data, error } = await getConsentById(companyId, id);

  if (error || !data) {
    throw new NotFoundError("Consent");
  }

  return parseConsent(data);
}

export async function getCompanyConsents(companyId: string) {
  const { data, error } = await listConsents(companyId);

  if (error) {
    throw error;
  }

  return parseConsentList(data);
}

export async function getConsentHistory(
  companyId: string,
  subjectIdentifier: string
) {
  const { data, error } = await listConsentHistory(
    companyId,
    subjectIdentifier
  );

  if (error) {
    throw error;
  }

  return parseConsentList(data);
}

export async function getLatestActiveConsent(
  companyId: string,
  templateId: string,
  subjectIdentifier: string
) {
  const { data, error } = await findLatestActiveConsent(
    companyId,
    templateId,
    subjectIdentifier
  );

  if (error) {
    throw error;
  }

  return data ? parseConsent(data) : null;
}

export function getConsentReceipt(
  consent: ConsentRecord
): ConsentReceipt {
  return createConsentReceipt(consent);
}

export async function getConsentStatistics(companyId: string) {
  const { data, error } = await getConsentStatsFromDb(companyId);
  if (error) throw error;
  return data as { total: number; granted: number; withdrawn: number };
}
