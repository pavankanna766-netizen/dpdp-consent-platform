import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { ConsentEvidenceCard } from "@/components/settings/consent-evidence-card";

import { ensureCompanySettings } from "@/services/company-settings.service";

import { ensureCompany } from "@/services/company.service";

export default async function CompanySettingsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const company = await ensureCompany(
    userId,
    "My Company"
  );

  const settings =
  await ensureCompanySettings(
    company.id
  );

  return (
    <main className="mx-auto max-w-5xl p-8">
  <div className="mb-8">
    <h1 className="text-3xl font-bold">
      Company Settings
    </h1>

    <p className="mt-2 text-gray-500">
      Configure how PrivyStack
      collects and stores consent
      evidence for your company.
    </p>
  </div>

  <div className="grid gap-6">
    <ConsentEvidenceCard
      settings={settings.settings}
    />
  </div>
</main>
  );
}