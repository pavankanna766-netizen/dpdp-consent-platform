import { rendererService } from "../renderer.service";
import type { CompanyBrandingRecord } from "@/repositories/branding.repository";

export class HtmlExportService {
  exportHtml(options: {
    companyName: string;
    documentTitle: string;
    documentVersion: number;
    resolvedHtml: string;
    branding: CompanyBrandingRecord;
    publishedAt?: string | null;
  }): string {
    return rendererService.renderBrandedDocument({
      companyName: options.companyName,
      documentTitle: options.documentTitle,
      documentVersion: options.documentVersion,
      htmlContent: options.resolvedHtml,
      branding: options.branding,
      publishedAt: options.publishedAt,
    });
  }
}

export const htmlExportService = new HtmlExportService();
