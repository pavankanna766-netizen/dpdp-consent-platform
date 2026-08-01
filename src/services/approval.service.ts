import {
  createDocumentApproval,
  getApprovalByDocumentId,
  updateApprovalStatus,
  type ApprovalStatus,
} from "@/repositories/approval.repository";
import {
  createDocumentSignature,
  listSignaturesByApprovalId,
  type SignatureType,
} from "@/repositories/signature.repository";
import { getLegalDocumentById, updateLegalDocument } from "@/repositories/legal-document.repository";
import { hashService } from "./hash.service";
import { createAuditLog } from "@/repositories/audit.repository";

export class ApprovalService {
  async submitForReview(companyId: string, documentId: string) {
    const docRes = await getLegalDocumentById(companyId, documentId);
    if (!docRes.data) throw new Error("Document not found");

    const doc = docRes.data;
    const documentHash = hashService.computeDocumentHash(doc.html_content);

    let approvalRes = await getApprovalByDocumentId(companyId, documentId);
    if (!approvalRes.data) {
      await createDocumentApproval({
        company_id: companyId,
        document_id: documentId,
        status: "ready_for_review",
        document_hash: documentHash,
      });
      approvalRes = await getApprovalByDocumentId(companyId, documentId);
    } else {
      await updateApprovalStatus(companyId, approvalRes.data.id, "ready_for_review");
    }

    await createAuditLog({
      company_id: companyId,
      event_type: "LEGAL_APPROVAL_SUBMITTED",
      entity_type: "legal_documents",
      entity_id: documentId,
      actor: "System / Legal Counsel",
      payload: { documentHash, status: "ready_for_review" },
    });

    return approvalRes.data;
  }

  async addSignature(
    companyId: string,
    documentId: string,
    signer: {
      name: string;
      email: string;
      role: string;
      signatureType: SignatureType;
      signatureData: string;
      notes?: string;
      ipAddress?: string;
      userAgent?: string;
    }
  ) {
    const docRes = await getLegalDocumentById(companyId, documentId);
    if (!docRes.data) throw new Error("Document not found");

    const doc = docRes.data;
    const currentHash = hashService.computeDocumentHash(doc.html_content);

    let approvalRes = await getApprovalByDocumentId(companyId, documentId);
    if (!approvalRes.data) {
      await this.submitForReview(companyId, documentId);
      approvalRes = await getApprovalByDocumentId(companyId, documentId);
    }

    const approval = approvalRes.data!;

    const sigRes = await createDocumentSignature({
      company_id: companyId,
      approval_id: approval.id,
      signer_name: signer.name,
      signer_email: signer.email,
      signer_role: signer.role,
      signature_type: signer.signatureType,
      signature_data: signer.signatureData,
      ip_address: signer.ipAddress || "127.0.0.1",
      user_agent: signer.userAgent || "PrivyStack Core Engine",
      approval_notes: signer.notes,
      document_hash_at_signing: currentHash,
    });

    await updateApprovalStatus(companyId, approval.id, "signed");

    await createAuditLog({
      company_id: companyId,
      event_type: "LEGAL_SIGNATURE_ADDED",
      entity_type: "document_signatures",
      entity_id: sigRes.data.id,
      actor: signer.name,
      payload: { signerRole: signer.role, signatureType: signer.signatureType, documentHash: currentHash },
    });

    return sigRes.data;
  }

  async publishDocumentWithApproval(companyId: string, documentId: string) {
    const docRes = await getLegalDocumentById(companyId, documentId);
    if (!docRes.data) throw new Error("Document not found");

    let approvalRes = await getApprovalByDocumentId(companyId, documentId);
    if (approvalRes.data) {
      await updateApprovalStatus(companyId, approvalRes.data.id, "published");
    }

    await updateLegalDocument(companyId, documentId, {
      status: "published",
      published_at: new Date().toISOString(),
      archived: false,
    });

    await createAuditLog({
      company_id: companyId,
      event_type: "LEGAL_DOCUMENT_PUBLISHED",
      entity_type: "legal_documents",
      entity_id: documentId,
      actor: "System / Admin",
      payload: { status: "published" },
    });

    return { success: true };
  }

  async getApprovalDetails(companyId: string, documentId: string) {
    const approvalRes = await getApprovalByDocumentId(companyId, documentId);
    if (!approvalRes.data) return { approval: null, signatures: [] };

    const signaturesRes = await listSignaturesByApprovalId(approvalRes.data.id);
    return {
      approval: approvalRes.data,
      signatures: signaturesRes.data || [],
    };
  }
}

export const approvalService = new ApprovalService();
