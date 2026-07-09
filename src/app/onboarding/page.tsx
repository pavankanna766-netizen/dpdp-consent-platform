import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ensureCompany } from "@/services/company.service";
import { OnboardingWizard } from "@/components/onboarding/wizard";

export default async function OnboardingPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const company = await ensureCompany(
    userId,
    "My Company"
  );

  if (company.is_onboarded) {
    redirect("/dashboard");
  }

  return (
  <main className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
    <div className="w-full max-w-xl rounded-xl border bg-white p-8 shadow-sm">
      <h1 className="text-3xl font-bold">
        Welcome to PrivyStack 👋
      </h1>

      <p className="mt-2 text-gray-600">
        Let&apos;s set up your organization.
      </p>

      <div className="mt-8">
        <OnboardingWizard />
      </div>
    </div>
  </main>
);
}