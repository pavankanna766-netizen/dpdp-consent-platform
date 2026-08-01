"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { UnauthorizedError } from "@/platform/errors";
import { ensureCompany } from "@/services/company.service";
import { approvalService } from "@/services/approval.service";
import type { SignatureType } from "@/repositories/signature.repository";

export async function submitForReviewAction(documentId: string) {
  const { userId } = await auth();
  if (!userId) throw new UnauthorizedError();

  const company = await ensureCompany(userId, "My Company");
  const data = await approvalService.submitForReview(company.id, documentId);

  revalidatePath("/dashboard/studio");
  return data;
}

export async function addSignatureAction(
  documentId: string,
  signer: {
    name: string;
    email: string;
    role: string;
    signatureType: SignatureType;
    signatureData: string;
    notes?: string;
  }
) {
  const { userId } = await auth();
  if (!userId) throw new UnauthorizedError();

  const company = await ensureCompany(userId, "My Company");
  const data = await approvalService.addSignature(company.id, documentId, signer);

  revalidatePath("/dashboard/studio");
  return data;
}

export async function publishApprovedDocumentAction(documentId: string) {
  const { userId } = await auth();
  if (!userId) throw new UnauthorizedError();

  const company = await ensureCompany(userId, "My Company");
  const data = await approvalService.publishDocumentWithApproval(company.id, documentId);

  revalidatePath("/dashboard/studio");
  return data;
}
