import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ensureCompany } from "@/services/company.service";
import { getOnboardingState } from "@/services/onboarding.service";
import { OnboardingWizard } from "@/components/onboarding/wizard";

export default async function OnboardingPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const company = await ensureCompany(userId, "My Company");
  const onboardingState = await getOnboardingState(company.id);

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6 md:p-12">
      <div className="w-full max-w-4xl">
        <OnboardingWizard initialState={onboardingState} />
      </div>
    </main>
  );
}