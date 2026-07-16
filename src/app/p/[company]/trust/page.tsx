import { notFound } from "next/navigation";

import {
  getCompanyBySlug,
} from "@/repositories/company-slug.repository";

import {
  getTrustCenterByCompanyId,
} from "@/repositories/trust-center.repository";

import {
  trustCenterDashboardService,
} from "@/modules/trust-center";

import {
  TrustCenterPublic,
} from "@/components/trust-center";

export default async function PublicTrustCenterPage({
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
  } =
    await getCompanyBySlug(
      company
    );

  if (!companyData) {
    notFound();
  }

  const {
    data: trustCenter,
  } =
    await getTrustCenterByCompanyId(
      companyData.id
    );

  if (!trustCenter) {
    notFound();
  }

  const dashboard =
    await trustCenterDashboardService.get(
      companyData.id
    );

  return (
    <TrustCenterPublic
      company={companyData}
      dashboard={dashboard}
    />
  );
}