import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import {
  ensureCompany,
} from "@/services/company.service";

import {
  bannerQueryService,
} from "@/modules/banner";

import {
  BannerList,
  CreateBannerDialog,
} from "@/components/banner";

export default async function BannerPage() {
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

  const banners =
    await bannerQueryService.listForCompany(
      company.id
    );

  return (
    <main className="space-y-8 p-8">
      <CreateBannerDialog />

      <BannerList
        banners={banners}
      />
    </main>
  );
}