import { rendererService } from "./renderer.service";
import type { CompanyBrandingRecord } from "@/repositories/branding.repository";

export class PreviewService {
  generateLivePreview(
    companyName: string,
    documentTitle: string,
    htmlContent: string,
    branding: CompanyBrandingRecord
  ): string {
    return rendererService.renderBrandedDocument({
      companyName,
      documentTitle,
      documentVersion: 1,
      htmlContent: htmlContent || `<h2>Statutory Notice Preview</h2><p>This is a live preview of your branded document layout.</p>`,
      branding,
    });
  }
}

export const previewService = new PreviewService();
