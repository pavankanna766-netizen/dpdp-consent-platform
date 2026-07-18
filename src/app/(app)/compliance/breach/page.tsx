import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ensureCompany } from "@/services/company.service";
import { listBreachIncidents } from "@/repositories/breach.repository";
import { BreachIncidentClient } from "./breach-client";

export default async function BreachReportingPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const company = await ensureCompany(userId, "My Company");
  const { data: incidents = [] } = await listBreachIncidents(company.id);

  return (
    <main className="space-y-6 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">🚨 Indian Regulatory Breach Incident Response</h1>
        <p className="text-sm text-gray-500 max-w-3xl">
          Fiduciaries bear non-delegable liability for data leaks under the **DPDP Act 2023**. Suspected incidents must be reported
          to the **DPBI within 72 hours** (Section 8(6)) and cybersecurity incidents to **CERT-In within 6 hours**.
        </p>
      </div>

      <BreachIncidentClient initialIncidents={incidents || []} />
    </main>
  );
}
