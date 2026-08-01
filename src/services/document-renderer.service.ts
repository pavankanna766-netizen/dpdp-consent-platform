import { getLegalDocumentById } from "@/repositories/legal-document.repository";
import { getCompanyBranding } from "@/repositories/branding.repository";
import { createDocumentExportLog, type ExportFormat } from "@/repositories/export.repository";
import { variableService } from "./variable.service";
import { htmlExportService } from "./exporters/html-exporter";
import { markdownExportService } from "./exporters/markdown-exporter";
import { docxExportService } from "./exporters/docx-exporter";
import { hashService } from "./hash.service";

export interface RenderExportResult {
  filename: string;
  mimeType: string;
  content: string;
  documentHash: string;
}

export class DocumentRendererService {
  async renderAndExport(
    companyId: string,
    documentId: string,
    format: ExportFormat,
    userInfo: { name?: string; ipAddress?: string } = {}
  ): Promise<RenderExportResult> {
    const [docRes, brandingRes] = await Promise.all([
      getLegalDocumentById(companyId, documentId),
      getCompanyBranding(companyId),
    ]);

    if (!docRes.data) throw new Error("Document not found");

    const doc = docRes.data;
    const branding = brandingRes.data!;

    // 1. Resolve Dynamic Variables
    const resolvedHtml = await variableService.resolveDocumentTemplate(companyId, doc.html_content);
    const documentHash = hashService.computeDocumentHash(resolvedHtml);

    // 2. Generate Professional Filename
    const cleanCompany = (branding.privacy_contact ? "company" : "entity").toLowerCase();
    const cleanSlug = doc.slug || doc.document_type.replace(/_/g, "-");
    const dateStr = new Date().toISOString().split("T")[0];
    const filename = `${cleanSlug}-${cleanCompany}-v${doc.version}-${dateStr}.${format}`;

    let content = "";
    let mimeType = "text/html";

    if (format === "html") {
      content = htmlExportService.exportHtml({
        companyName: "Company",
        documentTitle: doc.title,
        documentVersion: doc.version,
        resolvedHtml,
        branding,
        publishedAt: doc.published_at,
      });
      mimeType = "text/html";
    } else if (format === "markdown") {
      content = markdownExportService.exportMarkdown({
        companyName: "Company",
        documentTitle: doc.title,
        documentVersion: doc.version,
        resolvedHtml,
        publishedAt: doc.published_at,
      });
      mimeType = "text/markdown";
    } else if (format === "docx") {
      content = docxExportService.exportDocxEnvelope({
        companyName: "Company",
        documentTitle: doc.title,
        documentVersion: doc.version,
        resolvedHtml,
        branding,
        publishedAt: doc.published_at,
      });
      mimeType = "application/msword";
    } else {
      // PDF fallback / HTML print envelope
      content = htmlExportService.exportHtml({
        companyName: "Company",
        documentTitle: doc.title,
        documentVersion: doc.version,
        resolvedHtml,
        branding,
        publishedAt: doc.published_at,
      });
      mimeType = "text/html";
    }

    // 3. Log Audit Download History
    await createDocumentExportLog({
      company_id: companyId,
      document_id: documentId,
      export_format: format,
      filename,
      version: doc.version,
      document_hash: documentHash,
      exported_by: userInfo.name || "System User",
      ip_address: userInfo.ipAddress || "127.0.0.1",
    });

    return {
      filename,
      mimeType,
      content,
      documentHash,
    };
  }
}

export const documentRendererService = new DocumentRendererService();
