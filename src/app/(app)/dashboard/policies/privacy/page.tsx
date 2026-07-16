import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import {
  ensureCompany,
} from "@/services/company.service";

import {
  PolicyHeader,
} from "@/components/policies";

import {
  privacyDocumentService,
} from "@/modules/policies";

import {
  VersionHistory,
} from "@/components/documents/version-history";

import {
    DocumentPreview
}  from "@/components/documents/document-preview";

import {
  GeneratePolicyButton,
  PublishPolicyButton,
  CopyPolicyLink,
} from "@/components/policies";

export default async function PrivacyPolicyPage() {
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
    await privacyDocumentService.latest(
      company.id
    );

    const {
  data: versions,
} = await privacyDocumentService.versions(
  company.id
);

  return (
    <main className="space-y-6 p-8">

  <PolicyHeader
  policy={data}
  companySlug={company.slug}
  actions={
    <>
      <GeneratePolicyButton />

      {data && (
        <>
          <PublishPolicyButton
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
          Privacy Policy.
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