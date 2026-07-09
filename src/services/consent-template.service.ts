import {
  createConsentTemplate,
  getTemplates,
  getTemplateById,
  updateTemplate,
  publishTemplate,
  deleteTemplate,
} from "@/repositories/consent-template.repository";

import {
  publishEvent,
  PlatformEvents,
} from "@/platform";

import {
  getTemplateByToken,
} from "@/repositories/consent-template.repository";

import { findDefaultTemplate } from "@/repositories/consent-template.repository";

export async function createTemplate(values: {
  company_id: string;
  title: string;
  description: string | null;
  purpose: string;
  legal_basis: string;
  retention_period: string;
  consent_text: string;
  is_required: boolean;
}) {
  const { data, error } =
    await createConsentTemplate(values);

  if (error) throw error;

  await publishEvent(
    PlatformEvents.TEMPLATE_CREATED,
    {
      templateId: data.id,
      companyId: data.company_id,
      title: data.title,
    }
  );

  return data;
}

export async function listTemplates(
  companyId: string
) {
  const { data, error } =
    await getTemplates(companyId);

  if (error) throw error;

  return data;
}

export async function getTemplate(
  id: string
) {
  const { data, error } =
    await getTemplateById(id);

  if (error) throw error;

  return data;
}

export async function editTemplate(
  id: string,
  values: {
    title: string;
    description: string | null;
    purpose: string;
    legal_basis: string;
    retention_period: string;
    consent_text: string;
    is_required: boolean;
  }
) {
  const { data, error } =
    await updateTemplate(id, values);

  if (error) throw error;

  await publishEvent(
    PlatformEvents.TEMPLATE_UPDATED,
    {
      templateId: data.id,
      companyId: data.company_id,
      title: data.title,
    }
  );

  return data;
}

import { generatePublicToken } from "@/platform/core";

export async function publishTemplateService(
  id: string
) {
  const template = await getTemplate(id);

  if (!template) {
    throw new Error("Template not found");
  }

  const publicToken =
    template.public_token ??
    generatePublicToken();

  const { data, error } =
    await publishTemplate(
      id,
      publicToken
    );

  if (error) throw error;

  await publishEvent(
    PlatformEvents.TEMPLATE_PUBLISHED,
    {
      templateId: data.id,
      companyId: data.company_id,
      title: data.title,
      publicToken,
    }
  );

  return data;
}

export async function removeTemplate(
  id: string
) {
  const { error } =
    await deleteTemplate(id);

  if (error) throw error;

  await publishEvent(
    PlatformEvents.TEMPLATE_DELETED,
    {
      templateId: id,
    }
  );
}

export async function getPublishedTemplate(
  token: string
) {
  const { data, error } =
    await getTemplateByToken(token);

  if (error) {
    return null;
  }

  return data;
}

export async function ensureDefaultConsentTemplate(
  companyId: string
) {
  const { data, error } =
    await findDefaultTemplate(
      companyId
    );

  if (error) {
    throw error;
  }

  if (data) {
    return data;
  }

  return createTemplate({
    company_id: companyId,

    title: "Default Cookie Consent",

    description:
      "Default consent template created automatically by PrivyStack.",

    purpose:
      "Website Analytics & Personalization",

    legal_basis:
      "Consent",

    retention_period:
      "Until withdrawn",

    consent_text:
      "We use cookies and similar technologies to improve your experience, analyze website traffic, and personalize content. You can withdraw your consent at any time.",

    is_required: false,
  });
}