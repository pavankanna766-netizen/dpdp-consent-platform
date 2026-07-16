import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import {
  ensureCompany,
} from "@/services/company.service";

import {
  dashboardAggregationService,
} from "@/modules/trust-center";

import {
  TrustCenterForm,
} from "@/components/trust-center";

export default async function TrustCenterPage() {
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

  const dashboard =
    await dashboardAggregationService.getAggregatedData(
        company.id
    );

  return (
    <main className="mx-auto max-w-5xl p-8">
      <TrustCenterForm
        company={dashboard.company}
        dashboard={dashboard}
      />
    </main>
  );
}