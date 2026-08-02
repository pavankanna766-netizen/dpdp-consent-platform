"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { UnauthorizedError } from "@/platform/errors";
import { ensureCompany } from "@/services/company.service";
import { approvalService } from "@/services/approval.service";
import { legalDocumentService } from "@/services/legal-document.service";
import type { SignatureType } from "@/repositories/signature.repository";

export async function submitForReviewAction(documentId: string) {
  const { userId } = await auth();
  if (!userId) throw new UnauthorizedError();

  const company = await ensureCompany(userId, "My Company");
  const data = await approvalService.initializeApprovalWorkflow(company.id, documentId, userId);

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
  const data = await approvalService.signDocument({
    companyId: company.id,
    documentId,
    signerName: signer.name,
    signerEmail: signer.email,
    signerRole: signer.role,
    signatureType: signer.signatureType,
  });

  revalidatePath("/dashboard/studio");
  return data;
}

export async function publishApprovedDocumentAction(documentId: string) {
  const { userId } = await auth();
  if (!userId) throw new UnauthorizedError();

  const company = await ensureCompany(userId, "My Company");
  const data = await legalDocumentService.publishDocument(company.id, documentId);

  revalidatePath("/dashboard/studio");
  return data;
}
