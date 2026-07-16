import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import {
  ensureCompany,
} from "@/services/company.service";

import {
  PolicyHeader,
} from "@/components/policies";

import {
  cookiePolicyDocumentService,
} from "@/modules/policies";

import {
  GenerateCookiePolicyButton,
  PublishCookiePolicyButton,
  CopyPolicyLink,
} from "@/components/policies";

import {
  VersionHistory,
} from "@/components/documents/version-history";

import {
    DocumentPreview
}  from "@/components/documents/document-preview";

export default async function CookiePolicyPage() {
  const { userId } =
    await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const company =
    await ensureCompany(
      userId,
      "My Company"
    );

  const {
    data,
  } =
    await cookiePolicyDocumentService.latest(
      company.id
    );

    const {
  data: versions,
} = await cookiePolicyDocumentService.versions(
  company.id
);

  return (
    <main className="space-y-6 p-8">

  <PolicyHeader
  policy={data}
  companySlug={company.slug}
  actions={
    <>
      <GenerateCookiePolicyButton />

      {data && (
        <>
          <PublishCookiePolicyButton
            id={data.id}
          />

          <CopyPolicyLink
            companySlug={company.slug}
          />
        </>
      )}
    </>
  }
/>

  <div className="grid grid-cols-12 gap-6">

    <div className="col-span-8">

      {data ? (
        <DocumentPreview
          html={data.html_content}
        />
      ) : (
        <div className="rounded-xl border p-10 text-center">
          Generate your first
          Cookie Policy.
        </div>
      )}

    </div>

    <div className="col-span-4">

      <VersionHistory
  versions={versions ?? []}
/>

    </div>

  </div>

</main>
  );
}