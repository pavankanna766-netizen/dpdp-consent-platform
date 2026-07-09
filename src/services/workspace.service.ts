import { ensureCompany } from "./company.service";
import { ensureCompanySettings } from "./company-settings.service";
import { ensureDefaultConsentTemplate } from "./consent-template.service";

export async function ensureWorkspace(
  clerkUserId: string,
  companyName: string
) {
  const company = await ensureCompany(
    clerkUserId,
    companyName
  );

  const settings =
    await ensureCompanySettings(
      company.id
    );

  const template =
    await ensureDefaultConsentTemplate(
      company.id
    );

  return {
    company,
    settings,
    template,
  };
}