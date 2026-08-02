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
} from "@/repositories/legal-document.repository";
import { sanitizeHtml, stripHtml } from "@/platform/security/sanitize";
import { unifiedPolicyComposerService } from "@/modules/policies/application/unified-policy-composer.service";

export class LegalDocumentService {
  async createDocument(
    companyId: string,
    values: {
      type: LegalDocumentType;
      title: string;
      content_html: string;
      metadata?: Record<string, unknown>;
    }
  ) {
    const cleanTitle = stripHtml(values.title);
    const cleanContent = sanitizeHtml(values.content_html);

    const latestRes = await getLatestLegalDocument(companyId, values.type);
    const nextVersion = (latestRes.data?.version || 0) + 1;
    const slug = values.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "document";

    return createLegalDocument({
      company_id: companyId,
      document_type: values.type,
      title: cleanTitle,
      slug,
      html_content: cleanContent,
      version: nextVersion,
      metadata: values.metadata || {},
    });
  }

  async generateAutoDocument(companyId: string, type: LegalDocumentType) {
    let generatedHtml = "";

    if (type === "privacy_policy") {
      generatedHtml = await unifiedPolicyComposerService.generatePrivacyPolicy(companyId);
    } else if (type === "cookie_policy") {
      generatedHtml = await unifiedPolicyComposerService.generateCookiePolicy(companyId);
    } else {
      generatedHtml = `<h1>${type.replace(/_/g, " ").toUpperCase()}</h1><p>Statutory legal document draft created for tenant.</p>`;
    }

    const titleMap: Record<LegalDocumentType, string> = {
      privacy_policy: "Statutory Privacy Policy",
      cookie_policy: "Statutory Cookie Policy",
      terms_of_service: "Terms of Service",
      vendor_agreement: "Vendor Agreement",
      dpa: "Data Processing Agreement (DPA)",
      data_processing_agreement: "Data Processing Agreement",
      breach_report: "Statutory Breach Report",
      custom: "Custom Legal Document",
    };

    return this.createDocument(companyId, {
      type,
      title: titleMap[type] || "Legal Document",
      content_html: generatedHtml,
    });
  }

  async updateContent(companyId: string, id: string, title: string, contentHtml: string) {
    const cleanTitle = stripHtml(title);
    const cleanContent = sanitizeHtml(contentHtml);

    return updateLegalDocument(companyId, id, {
      title: cleanTitle,
      html_content: cleanContent,
    });
  }

  async markCounselSignoff(companyId: string, id: string, reviewed: boolean, counselName?: string) {
    return updateLegalDocument(companyId, id, {
      reviewed_by_counsel: reviewed,
      reviewed_by: counselName || null,
      reviewed_at: reviewed ? new Date().toISOString() : null,
    });
  }

  async publishDocument(companyId: string, id: string) {
    const docRes = await getLegalDocumentById(companyId, id);
    if (!docRes.data) throw new Error("Legal document not found");

    if (!docRes.data.reviewed_by_counsel) {
      throw new Error("Legal Counsel sign-off approval is required before publishing.");
    }

    return updateLegalDocument(companyId, id, {
      status: "published",
      published_at: new Date().toISOString(),
    });
  }

  getDocument(companyId: string, id: string) {
    return getLegalDocumentById(companyId, id);
  }

  getLatest(companyId: string, type: LegalDocumentType) {
    return getLatestLegalDocument(companyId, type);
  }

  getPublished(companyId: string, type: LegalDocumentType) {
    return getPublishedLegalDocument(companyId, type);
  }

  listVersions(companyId: string, type: LegalDocumentType) {
    return listLegalDocumentVersions(companyId, type);
  }

  listDocuments(companyId: string) {
    return listCompanyLegalDocuments(companyId);
  }

  archive(companyId: string, id: string) {
    return archiveLegalDocument(companyId, id);
  }
}

export const legalDocumentService = new LegalDocumentService();
