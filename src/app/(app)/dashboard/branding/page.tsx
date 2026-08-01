import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ensureCompany } from "@/services/company.service";
import { brandingService } from "@/services/branding.service";
import { BrandingClient } from "@/components/branding/branding-client";

export default async function BrandingPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const company = await ensureCompany(userId, "My Company");
  const branding = await brandingService.getBranding(company.id);

  return (
    <BrandingClient
      initialBranding={branding}
      companyName={company.company_name}
    />
  );
}
