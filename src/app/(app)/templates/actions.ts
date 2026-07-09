"use server";

import { withPlatform } from "@/platform/action";

import { auth } from "@clerk/nextjs/server";

import { ensureCompany } from "@/services/company.service";

import {
  createTemplate,
  editTemplate,
  removeTemplate,
  publishTemplateService,
} from "@/services/consent-template.service";

import type { TemplateValues } from "./schema";

export async function createTemplateAction(
  values: TemplateValues
) {
  return withPlatform(async () => {
    const { userId } = await auth();

    if (!userId) {
      throw new Error("Unauthorized");
    }

    const company = await ensureCompany(
      userId,
      "My Company"
    );

    await createTemplate({
      company_id: company.id,
      ...values,
    });

    return {
      success: true,
    };
  });
}

export async function deleteTemplateAction(
  templateId: string
) {
  return withPlatform(async () => {
    const { userId } = await auth();

    if (!userId) {
      throw new Error("Unauthorized");
    }

    await removeTemplate(templateId);

    return {
      success: true,
    };
  });
}

export async function publishTemplateAction(
  templateId: string
) {
  return withPlatform(async () => {
    const { userId } = await auth();

    if (!userId) {
      throw new Error("Unauthorized");
    }

    await publishTemplateService(templateId);

    return {
      success: true,
    };
  });
}

export async function updateTemplateAction(
  templateId: string,
  values: TemplateValues
) {
  return withPlatform(async () => {
    const { userId } = await auth();

    if (!userId) {
      throw new Error("Unauthorized");
    }

    await editTemplate(templateId, {
      ...values,
    });

    return {
      success: true,
    };
  });
}