"use server";

import { auth } from "@clerk/nextjs/server";

import { UnauthorizedError } from "@/platform/errors";

import { ensureCompany } from "@/services/company.service";
import { saveCompanySettings } from "@/services/company-settings.service";

import type { CompanySettings } from "@/platform/settings/types";

export async function updateConsentSettings(
  settings: CompanySettings
) {
  const { userId } = await auth();

  if (!userId) {
    throw new UnauthorizedError();
  }

  const company = await ensureCompany(
    userId,
    "My Company"
  );

  return saveCompanySettings(
    company.id,
    settings
  );
}