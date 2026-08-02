"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { UnauthorizedError } from "@/platform/errors";
import { ensureCompany } from "@/services/company.service";
import { legalDocumentService } from "@/services/legal-document.service";
import { privacyDocumentService } from "@/modules/policies/application/privacy-document.service";
import type { LegalDocumentType } from "@/repositories/legal-document.repository";

export async function generateLegalDocumentAction(type: LegalDocumentType) {
  const { userId } = await auth();
  if (!userId) throw new UnauthorizedError();

  const company = await ensureCompany(userId, "My Company");
  const { data, error } = await legalDocumentService.generateAutoDocument(company.id, type);

  if (error) throw error;

  revalidatePath("/dashboard/policies/privacy");
  revalidatePath("/dashboard/policies/cookies");
  return data;
}

export async function publishLegalDocumentAction(documentId: string) {
  const { userId } = await auth();
  if (!userId) throw new UnauthorizedError();

  const company = await ensureCompany(userId, "My Company");
  const { data, error } = await legalDocumentService.publishDocument(company.id, documentId);

  if (error) throw error;

  revalidatePath("/dashboard/policies/privacy");
  revalidatePath("/dashboard/policies/cookies");
  return data;
}

export async function counselApproveLegalDocumentAction(documentId: string, counselName?: string) {
  const { userId } = await auth();
  if (!userId) throw new UnauthorizedError();

  const company = await ensureCompany(userId, "My Company");
  const { data, error } = await legalDocumentService.markCounselSignoff(company.id, documentId, true, counselName);

  if (error) throw error;

  revalidatePath("/dashboard/policies/privacy");
  revalidatePath("/dashboard/policies/cookies");
  return data;
}

export async function restoreLegalDocumentVersionAction(documentId: string) {
  const { userId } = await auth();
  if (!userId) throw new UnauthorizedError();

  const company = await ensureCompany(userId, "My Company");
  const { data, error } = await privacyDocumentService.restoreVersion(company.id, documentId);

  if (error) throw error;

  revalidatePath("/dashboard/policies/privacy");
  revalidatePath("/dashboard/policies/cookies");
  return data;
}
