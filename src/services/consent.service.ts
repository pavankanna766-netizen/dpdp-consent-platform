import {
  createConsent,
  withdrawConsent,
  getConsentById,
  listConsents,
  findActiveConsent,
} from "@/repositories/consent.repository";

import {
  publishEvent,
  PlatformEvents,
} from "@/platform";

import { ensureCompanySettings } from "./company-settings.service";

import { buildEvidence } from "@/platform/consent/evidence/builder";

export async function grantConsent(values: {
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
}) {
    const existing =
  await findActiveConsent(
    values.company_id,
    values.template_id,
    values.subject_identifier
  );

if (existing.data) {
  return existing.data;
}

const settings =
  await ensureCompanySettings(
    values.company_id
  );

const evidence =
  buildEvidence(
    {
      ipAddress: values.ip_address,
      userAgent: values.user_agent,
      language: values.language,
    },
    settings.settings.consent
  );

    const { data, error } =
  await createConsent({
    ...values,

    ip_address:
      evidence.ipAddress,

    user_agent:
      evidence.userAgent,

    language:
      evidence.language,

    metadata:
      evidence.metadata,

    proof:
      evidence.proof,
  });

  if (error) throw error;

  await publishEvent(
    PlatformEvents.CONSENT_ACCEPTED,
    {
      consentId: data.id,
      companyId: data.company_id,
      templateId: data.template_id,
      subject: data.subject_identifier,
    }
  );

  return data;
}

export async function revokeConsent(
  consentId: string
) {
  const { data, error } =
    await withdrawConsent(consentId);

  if (error) throw error;

  await publishEvent(
    PlatformEvents.CONSENT_WITHDRAWN,
    {
      consentId: data.id,
      companyId: data.company_id,
      templateId: data.template_id,
      subject: data.subject_identifier,
    }
  );

  return data;
}

export async function getConsent(
  id: string
) {
  const { data, error } =
    await getConsentById(id);

  if (error) throw error;

  return data;
}

export async function getCompanyConsents(
  companyId: string
) {
  const { data, error } =
    await listConsents(companyId);

  if (error) throw error;

  return data;
}

export async function getConsentStatistics(
  companyId: string
) {
  const consents =
    await getCompanyConsents(companyId);

  return {
    total: consents.length,

    granted: consents.filter(
      (c) => c.status === "granted"
    ).length,

    withdrawn: consents.filter(
      (c) => c.status === "withdrawn"
    ).length,
  };
}