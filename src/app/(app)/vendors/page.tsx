import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ensureCompany } from "@/services/company.service";
import { listVendors } from "@/repositories/vendor.repository";
import { VendorRegistryClient } from "./vendors-client";

export default async function VendorsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const company = await ensureCompany(userId, "My Company");
  const { data: vendors = [] } = await listVendors(company.id);

  return (
    <main className="space-y-6 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">🛡️ Vendor Compliance Registry</h1>
        <p className="text-sm text-gray-500 max-w-3xl">
          Track processors under **Section 8 of the DPDP Act 2023**. Fiduciaries are fully liable for security breaches
          caused by third-party processors. Contracts must explicitly meet the statutory security-safeguard bar.
        </p>
      </div>

      <VendorRegistryClient initialVendors={vendors || []} />
    </main>
  );
}
