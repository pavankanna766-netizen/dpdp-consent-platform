import { notFound } from "next/navigation";

import {
  getCompanyBySlug,
} from "@/repositories/company-slug.repository";

import {
  getPublishedPrivacyPolicy,
} from "@/repositories/privacy-policy.repository";

import {
  DocumentPreview,
} from "@/components/documents/document-preview";

export default async function PublicPrivacyPolicyPage({
  params,
}: {
  params: Promise<{
    company: string;
  }>;
}) {
  const { company } =
    await params;

  const {
    data: companyData,
    error: companyError,
  } =
    await getCompanyBySlug(
      company
    );

  if (
    companyError ||
    !companyData
  ) {
    notFound();
  }

  const {
    data: policy,
    error: policyError,
  } =
    await getPublishedPrivacyPolicy(
      companyData.id
    );

  if (
    policyError ||
    !policy
  ) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-5xl p-10">
      <DocumentPreview
        html={
          policy.html_content
        }
      />
    </main>
  );
}