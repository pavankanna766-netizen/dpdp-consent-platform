import {
  createDocumentApproval,
  getApprovalByDocumentId,
  updateApprovalStatus,
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
  async initializeApprovalWorkflow(companyId: string, documentId: string, actor: string) {
    const docRes = await getLegalDocumentById(companyId, documentId);
    if (docRes.error || !docRes.data) {
      throw new Error("Document not found");
    }

    const document = docRes.data;
    const documentHash = hashService.computeDocumentHash(document.content_html);

    const existingApproval = await getApprovalByDocumentId(companyId, documentId);
    if (existingApproval.data) {
      return existingApproval.data;
    }

    const approvalRes = await createDocumentApproval({
      company_id: companyId,
      document_id: documentId,
      document_hash: documentHash,
      status: "ready_for_review",
    });

    await createAuditLog({
      company_id: companyId,
      event_type: "APPROVAL_WORKFLOW_INITIALIZED",
      entity_type: "document_approvals",
      entity_id: approvalRes.data?.id || documentId,
      actor,
      payload: { documentId, documentHash },
    });

    return approvalRes.data;
  }

  async signDocument(values: {
    companyId: string;
    documentId: string;
    signerName: string;
    signerEmail: string;
    signerRole: string;
    signatureType: SignatureType;
    ipAddress?: string;
  }) {
    const docRes = await getLegalDocumentById(values.companyId, values.documentId);
    if (!docRes.data) throw new Error("Document not found");

    const currentHash = hashService.computeDocumentHash(docRes.data.content_html);

    const approvalRes = await this.initializeApprovalWorkflow(
      values.companyId,
      values.documentId,
      values.signerEmail
    );

    if (!approvalRes) throw new Error("Approval workflow not initialized");

    const signatureRes = await createDocumentSignature({
      company_id: values.companyId,
      approval_id: approvalRes.id,
      signer_name: values.signerName,
      signer_email: values.signerEmail,
      signer_role: values.signerRole,
      signature_type: values.signatureType,
      signature_data: `SIG_${Date.now()}_${values.signerEmail}`,
      document_hash_at_signing: currentHash,
      ip_address: values.ipAddress || "127.0.0.1",
    });

    // Check if both Counsel and Executive signed to mark Approved
    const signaturesRes = await listSignaturesByApprovalId(approvalRes.id);
    const signatures = signaturesRes.data || [];

    const hasCounsel = signatures.some((s) => s.signer_role.toLowerCase().includes("counsel"));
    const hasExecutive = signatures.some((s) => s.signer_role.toLowerCase().includes("ceo") || s.signer_role.toLowerCase().includes("executive") || s.signer_role.toLowerCase().includes("owner"));

    if (hasCounsel && hasExecutive) {
      await updateApprovalStatus(values.companyId, approvalRes.id, "approved");
      await updateLegalDocument(values.companyId, values.documentId, {
        status: "published",
        published_at: new Date().toISOString(),
      });
    }

    await createAuditLog({
      company_id: values.companyId,
      event_type: "DOCUMENT_SIGNED",
      entity_type: "document_signatures",
      entity_id: signatureRes.data?.id || approvalRes.id,
      actor: values.signerEmail,
      payload: { signerRole: values.signerRole, signatureType: values.signatureType, documentHash: currentHash },
    });

    return signatureRes.data;
  }

  async getWorkflowStatus(companyId: string, documentId: string) {
    const approvalRes = await getApprovalByDocumentId(companyId, documentId);
    if (!approvalRes.data) return null;

    const signaturesRes = await listSignaturesByApprovalId(approvalRes.data.id);

    return {
      approval: approvalRes.data,
      signatures: signaturesRes.data || [],
    };
  }
}

export const approvalService = new ApprovalService();
