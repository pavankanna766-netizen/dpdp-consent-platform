"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { UnauthorizedError } from "@/platform/errors";
import { ensureCompany } from "@/services/company.service";
import { legalDocumentService } from "@/services/legal-document.service";
import type { LegalDocumentType } from "@/repositories/legal-document.repository";

export async function generateLegalDocumentAction(type: LegalDocumentType) {
  const { userId } = await auth();
  if (!userId) throw new UnauthorizedError();

  const company = await ensureCompany(userId, "My Company");
  const { data, error } = await legalDocumentService.generateDocument(company.id, type);

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

export async function counselApproveLegalDocumentAction(documentId: string, counselName: string) {
  const { userId } = await auth();
  if (!userId) throw new UnauthorizedError();

  const company = await ensureCompany(userId, "My Company");
  const { data, error } = await legalDocumentService.approveByCounsel(company.id, documentId, counselName);

  if (error) throw error;

  revalidatePath("/dashboard/policies/privacy");
  revalidatePath("/dashboard/policies/cookies");
  return data;
}

export async function restoreLegalDocumentVersionAction(documentId: string) {
  const { userId } = await auth();
  if (!userId) throw new UnauthorizedError();

  const company = await ensureCompany(userId, "My Company");
  const { data, error } = await legalDocumentService.restoreVersion(company.id, documentId);

  if (error) throw error;

  revalidatePath("/dashboard/policies/privacy");
  revalidatePath("/dashboard/policies/cookies");
  return data;
}
