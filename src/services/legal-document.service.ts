import {
  createLegalDocument,
  getLegalDocumentById,
  getLatestLegalDocument,
  getPublishedLegalDocument,
  listLegalDocumentVersions,
  listCompanyLegalDocuments,
  updateLegalDocument,
  archiveLegalDocument,
  type LegalDocumentType,
  type LegalDocumentRecord,
} from "@/repositories/legal-document.repository";
import { sanitizeHtml, stripHtml } from "@/platform/security/sanitize";
import { unifiedPolicyComposerService } from "@/modules/policies/application/unified-policy-composer.service";

export class LegalDocumentService {
  async createDocument(
    companyId: string,
    values: {
      type: LegalDocumentType;
      title: string;
      slug: string;
      htmlContent: string;
      sections?: Array<{ id?: string; title: string; content: string; order?: number }>;
      metadata?: Record<string, unknown>;
    }
  ) {
    const cleanHtml = sanitizeHtml(values.htmlContent);
    const plaintext = stripHtml(cleanHtml);

    const latest = await getLatestLegalDocument(companyId, values.type);
    const nextVersion = latest.data ? latest.data.version + 1 : 1;

    return createLegalDocument({
      company_id: companyId,
      document_type: values.type,
      title: values.title,
      slug: values.slug,
      version: nextVersion,
      status: "draft",
      html_content: cleanHtml,
      plaintext_content: plaintext,
      sections: values.sections || [],
      metadata: values.metadata || {},
      reviewed_by_counsel: false,
    });
  }

  async generateDocument(companyId: string, type: LegalDocumentType) {
    let htmlContent = "";
    let title = "Legal Document";
    let slug = type.replace(/_/g, "-");

    if (type === "privacy_policy") {
      title = "Statutory Privacy Policy";
      htmlContent = await unifiedPolicyComposerService.generatePrivacyPolicy(companyId);
    } else if (type === "cookie_policy") {
      title = "Statutory Cookie Policy";
      htmlContent = await unifiedPolicyComposerService.generateCookiePolicy(companyId);
    } else if (type === "dpa" || type === "data_processing_agreement") {
      title = "Data Processing Agreement (DPA)";
      htmlContent = `<h2>Data Processing Agreement (DPA)</h2><p>This DPA governs third-party processor safeguards under DPDP Act Section 8.</p>`;
    } else if (type === "terms_of_service") {
      title = "Terms of Service";
      htmlContent = `<h2>Terms of Service</h2><p>Terms governing access and usage of platform services.</p>`;
    } else if (type === "breach_report") {
      title = "Personal Data Breach Incident Report";
      htmlContent = `<h2>Breach Notification Report</h2><p>Statutory 6-hour CERT-In and DPBI breach notification record.</p>`;
    } else {
      title = "Custom Legal Disclosure";
      htmlContent = `<h2>Custom Legal Disclosure</h2><p>Custom legal disclosure document.</p>`;
    }

    return this.createDocument(companyId, {
      type,
      title,
      slug,
      htmlContent,
    });
  }

  async approveByCounsel(companyId: string, id: string, counselName: string) {
    const { data: doc, error } = await getLegalDocumentById(companyId, id);
    if (error || !doc || doc.company_id !== companyId) {
      throw new Error("Document not found or unauthorized");
    }

    return updateLegalDocument(companyId, id, {
      reviewed_by_counsel: true,
      reviewed_at: new Date().toISOString(),
      reviewed_by: counselName,
    });
  }

  async publishDocument(companyId: string, id: string) {
    const { data: doc, error } = await getLegalDocumentById(companyId, id);
    if (error || !doc || doc.company_id !== companyId) {
      throw new Error("Document not found or unauthorized");
    }

    return updateLegalDocument(companyId, id, {
      status: "published",
      published_at: new Date().toISOString(),
      archived: false,
    });
  }

  async restoreVersion(companyId: string, id: string) {
    const { data: doc, error } = await getLegalDocumentById(companyId, id);
    if (error || !doc || doc.company_id !== companyId) {
      throw new Error("Document not found or unauthorized");
    }

    return updateLegalDocument(companyId, id, {
      archived: false,
      status: "published",
      published_at: new Date().toISOString(),
    });
  }

  async archiveDocument(companyId: string, id: string) {
    return archiveLegalDocument(companyId, id);
  }

  async getLatest(companyId: string, type: LegalDocumentType) {
    return getLatestLegalDocument(companyId, type);
  }

  async getPublished(companyId: string, type: LegalDocumentType) {
    return getPublishedLegalDocument(companyId, type);
  }

  async listVersions(companyId: string, type: LegalDocumentType) {
    return listLegalDocumentVersions(companyId, type);
  }

  async listAll(companyId: string) {
    return listCompanyLegalDocuments(companyId);
  }
}

export const legalDocumentService = new LegalDocumentService();
