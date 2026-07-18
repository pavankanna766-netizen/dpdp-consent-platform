import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ensureCompany } from "@/services/company.service";
import { listInventoryItems } from "@/repositories/inventory.repository";
import { InventoryClient } from "./inventory-client";

export default async function InventoryPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const company = await ensureCompany(userId, "My Company");
  const { data: items = [] } = await listInventoryItems(company.id);

  return (
    <main className="space-y-6 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">🗂️ Data Inventory (System of Record)</h1>
        <p className="text-sm text-gray-500 max-w-3xl">
          Maintain an ongoing, audit-ready inventory of all personal data categories, purposes of processing, data principal subjects,
          and shared third-party processors under **Section 8 of the DPDP Act 2023**.
        </p>
      </div>

      <InventoryClient initialItems={items || []} />
    </main>
  );
}
