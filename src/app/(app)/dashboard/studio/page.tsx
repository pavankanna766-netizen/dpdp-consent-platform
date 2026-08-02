import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ensureCompany } from "@/services/company.service";
import { legalDocumentService } from "@/services/legal-document.service";
import { LegalDocumentEditor } from "@/components/legal-studio/legal-editor";

export default async function LegalStudioPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const company = await ensureCompany(userId, "My Company");
  const params = await searchParams;
  const docType = (params.type || "privacy_policy") as Parameters<typeof legalDocumentService.getLatest>[1];

  let latestRes = await legalDocumentService.getLatest(company.id, docType);
  if (!latestRes.data) {
    await legalDocumentService.generateAutoDocument(company.id, docType);
    latestRes = await legalDocumentService.getLatest(company.id, docType);
  }

  const versionsRes = await legalDocumentService.listVersions(company.id, docType);

  return (
    <LegalDocumentEditor
      initialDocument={latestRes.data!}
      versions={versionsRes.data || []}
      companyName={company.company_name}
    />
  );
}
