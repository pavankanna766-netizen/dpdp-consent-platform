import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ensureCompany } from "@/services/company.service";
import { logger } from "@/platform/logger";
import { StatCard } from "@/components/dashboard/stat-card";
import {
  ShieldCheck,
  Users,
  FileText,
  BadgeCheck,
} from "lucide-react";
import { ActivityItem } from "@/components/dashboard/activity-item";

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const user = await currentUser();

  if (!user) {
  redirect("/sign-in");
}

const company = await ensureCompany(
  userId,
  user.firstName
    ? `${user.firstName}'s Company`
    : "My Company"
);

logger.debug("Company object:", company);

if (!company.is_onboarded) {
  redirect("/onboarding");
}

  return (
  <main>
    <div className="mx-auto max-w-7xl space-y-8">

      <div>
        <h1 className="text-4xl font-bold">
          Welcome back, {user?.firstName} 👋
        </h1>

        <p className="mt-2 text-gray-500">
          {company.company_name}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

        <StatCard
  title="Compliance Score"
  value="98%"
  description="Excellent compliance"
  icon={<BadgeCheck className="h-5 w-5 text-green-600" />}
/>

<StatCard
  title="Active Consents"
  value="0"
  description="Waiting for first consent"
  icon={<ShieldCheck className="h-5 w-5 text-blue-600" />}
/>

<StatCard
  title="Templates"
  value="0"
  description="Create your first template"
  icon={<FileText className="h-5 w-5 text-purple-600" />}
/>

<StatCard
  title="Team"
  value="1"
  description="Only you for now"
  icon={<Users className="h-5 w-5 text-orange-600" />}
/>

      </div>

      <div className="grid gap-6 lg:grid-cols-2">

        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">
            Quick Actions
          </h2>

          <div className="mt-6 flex flex-col gap-3">

            <button className="rounded-lg border p-3 text-left hover:bg-slate-50">
              ➕ Create Consent Template
            </button>

            <button className="rounded-lg border p-3 text-left hover:bg-slate-50">
              👥 Invite Team Member
            </button>

            <button className="rounded-lg border p-3 text-left hover:bg-slate-50">
              📄 Generate Privacy Policy
            </button>

          </div>
        </div>

        <div className="rounded-xl border bg-white p-6 shadow-sm">

          <h2 className="text-xl font-semibold">
            Recent Activity
          </h2>

          <div className="mt-6 space-y-3">
  <ActivityItem
    title="Workspace created"
    description="Your PrivyStack organization is ready."
  />

  <ActivityItem
    title="Onboarding completed"
    description="Company information has been saved."
  />

  <ActivityItem
    title="Ready for your first consent template"
    description="Create a template to start collecting user consent."
  />
</div>

        </div>

      </div>

    </div>
  </main>
);
}