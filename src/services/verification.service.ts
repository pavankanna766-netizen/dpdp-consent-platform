import { getApprovalByDocumentId } from "@/repositories/approval.repository";
import { listSignaturesByApprovalId } from "@/repositories/signature.repository";
import { getLegalDocumentById } from "@/repositories/legal-document.repository";
import { hashService } from "./hash.service";

export interface VerificationResult {
  isAuthentic: boolean;
  currentHash: string;
  expectedHash: string;
  status: string;
  signatureCount: number;
  signatures: Array<{
    signerName: string;
    signerRole: string;
    signatureType: string;
    timestamp: string;
    hashMatch: boolean;
  }>;
  verificationMessage: string;
}

export class VerificationService {
  async verifyDocumentIntegrity(companyId: string, documentId: string): Promise<VerificationResult> {
    const docRes = await getLegalDocumentById(companyId, documentId);
    if (!docRes.data) {
      throw new Error("Document not found");
    }

    const doc = docRes.data;
    const currentHash = hashService.computeDocumentHash(doc.html_content);

    const approvalRes = await getApprovalByDocumentId(companyId, documentId);
    if (!approvalRes.data) {
      return {
        isAuthentic: true,
        currentHash,
        expectedHash: currentHash,
        status: "draft",
        signatureCount: 0,
        signatures: [],
        verificationMessage: "Draft document — Not yet submitted for legal approval.",
      };
    }

    const approval = approvalRes.data;
    const signaturesRes = await listSignaturesByApprovalId(approval.id);
    const signatures = signaturesRes.data || [];

    const isHashValid = currentHash === approval.document_hash;

    const signatureDetails = signatures.map((s) => ({
      signerName: s.signer_name,
      signerRole: s.signer_role,
      signatureType: s.signature_type,
      timestamp: s.created_at,
      hashMatch: s.document_hash_at_signing === currentHash,
    }));

    return {
      isAuthentic: isHashValid,
      currentHash,
      expectedHash: approval.document_hash,
      status: approval.status,
      signatureCount: signatures.length,
      signatures: signatureDetails,
      verificationMessage: isHashValid
        ? "✅ Cryptographic Verification Passed: SHA-256 hash matches immutable record."
        : "❌ Cryptographic Verification Failed: Document content has been modified after approval.",
    };
  }
}

export const verificationService = new VerificationService();
