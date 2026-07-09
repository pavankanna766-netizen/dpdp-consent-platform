import {
  createCompanySettings,
  getCompanySettings,
  updateCompanySettings,
} from "@/repositories/company-settings.repository";

import { DEFAULT_POLICY } from "@/platform/consent/evidence-policy";

import type { CompanySettings } from "@/platform/settings/types";

const DEFAULT_SETTINGS: CompanySettings = {
  consent: DEFAULT_POLICY,

  banner: {
    theme: "light",
    position: "bottom",
    defaultLanguage: "en",
  },

  branding: {
    primaryColor: "#2563eb",
    logo: null,
  },
};

export async function ensureCompanySettings(
  companyId: string
) {
  const {
    data,
    error,
  } = await getCompanySettings(
    companyId
  );

  if (error) {
    throw error;
  }

  if (data) {
    return data;
  }

  const created =
    await createCompanySettings(
      companyId,
      DEFAULT_SETTINGS
    );

  if (created.error) {
    throw created.error;
  }

  return created.data;
}

export async function saveCompanySettings(
  companyId: string,
  settings: CompanySettings
) {
  const result =
    await updateCompanySettings(
      companyId,
      settings
    );

  if (result.error) {
    throw result.error;
  }

  return result.data;
}