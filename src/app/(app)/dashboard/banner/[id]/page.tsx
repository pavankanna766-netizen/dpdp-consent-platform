import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

import {
  bannerService,
} from "@/modules/banner";

import {
  BannerEditor,
} from "@/components/banner";
import { ensureCompany } from "@/services/company.service";
import type { CookieBanner } from "@/modules/banner";

function toCookieBanner(data: Record<string, unknown>): CookieBanner {
  return {
    id: String(data.id), companyId: String(data.company_id), name: String(data.name),
    status: data.status === "published" ? "published" : "draft", version: Number(data.version),
    position: data.position as CookieBanner["position"], theme: data.theme as CookieBanner["theme"],
    layout: data.layout as CookieBanner["layout"], primaryColor: String(data.primary_color),
    language: String(data.language), showLogo: Boolean(data.show_logo), showReject: Boolean(data.show_reject),
    showPreferences: Boolean(data.show_preferences), consentExpiryDays: Number(data.consent_expiry_days),
    embedToken: typeof data.embed_token === "string" ? data.embed_token : null,
  };
}


export default async function BannerEditorPage({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}) {
  const { id } =
    await params;

  const { userId } = await auth();
  if (!userId) notFound();
  const company = await ensureCompany(userId, "My Company");

  const { data } =
    await bannerService.getForCompany(company.id, id);

  if (!data) {
    notFound();
  }

  return (
    <main className="p-8">

  <BannerEditor
    banner={toCookieBanner(data)}
  />

</main>
  );
}
