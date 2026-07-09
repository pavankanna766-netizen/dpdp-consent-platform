"use server";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { withPlatform } from "@/platform/action";

import {
  ensureCompany,
  completeOnboarding,
} from "@/services/company.service";

type OnboardingPayload = {
  company_name: string;
  industry: string;
  company_size: string;
  website: string;
  country: string;
  timezone: string;
  useCases: string[];
};

export async function saveOnboarding(
  values: OnboardingPayload
) {
  return withPlatform(async () => {
    const { userId } = await auth();

    if (!userId) {
      throw new Error("Unauthorized");
    }

    const company = await ensureCompany(
      userId,
      values.company_name
    );

    await completeOnboarding(company.id, {
      company_name: values.company_name,
      industry: values.industry,
      company_size: values.company_size,
      website: values.website || null,
      country: values.country,
      timezone: values.timezone,
      useCases: values.useCases,
    });

    redirect("/dashboard");
  });
}