"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { UnauthorizedError } from "@/platform/errors";
import { ensureCompany } from "@/services/company.service";
import {
  saveOnboardingStep,
  finishOnboarding,
  testSdkConnection,
} from "@/services/onboarding.service";
import { createApiKey } from "@/repositories/api-key.repository";

export async function saveOnboardingStepAction(step: number) {
  const { userId } = await auth();
  if (!userId) throw new UnauthorizedError();

  const company = await ensureCompany(userId, "My Company");
  await saveOnboardingStep(company.id, step);
  revalidatePath("/onboarding");
  return { success: true };
}

export async function finishOnboardingAction() {
  const { userId } = await auth();
  if (!userId) throw new UnauthorizedError();

  const company = await ensureCompany(userId, "My Company");
  await finishOnboarding(company.id);
  revalidatePath("/onboarding");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function testSdkConnectionAction(apiKey: string) {
  const { userId } = await auth();
  if (!userId) throw new UnauthorizedError();

  const company = await ensureCompany(userId, "My Company");
  const result = await testSdkConnection(company.id, apiKey);
  revalidatePath("/onboarding");
  return result;
}

export async function generateApiKeyAction(keyName: string, environment: "production" | "development") {
  const { userId } = await auth();
  if (!userId) throw new UnauthorizedError();

  const company = await ensureCompany(userId, "My Company");
  const { data, error } = await createApiKey(company.id, keyName, environment);
  if (error) throw error;

  revalidatePath("/onboarding");
  return data;
}
