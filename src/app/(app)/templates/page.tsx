import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { TemplateCard } from "@/components/templates/template-card";

import { ensureCompany } from "@/services/company.service";
import { listTemplates } from "@/services/consent-template.service";

import { CreateTemplateDialog } from "@/components/templates/create-template-dialog";

export default async function TemplatesPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const company = await ensureCompany(
    userId,
    "My Company"
  );

  const templates = await listTemplates(company.id);

  return (
    <main className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">
            Consent Templates
          </h1>

          <p className="mt-2 text-gray-500">
            Manage reusable consent forms.
          </p>
        </div>

        <CreateTemplateDialog />
      </div>

      {templates.length === 0 ? (
        <div className="rounded-xl border bg-white p-10 text-center">
          <h2 className="text-2xl font-semibold">
            No Templates Yet
          </h2>

          <p className="mt-3 text-gray-500">
            Create your first consent template to begin collecting consent.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
  {templates.map((template) => (
    <TemplateCard
      key={template.id}
      template={template}
    />
  ))}
</div>
      )}
    </main>
  );
}