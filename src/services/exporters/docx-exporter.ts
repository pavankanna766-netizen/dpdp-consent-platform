import { htmlExportService } from "./html-exporter";
import type { CompanyBrandingRecord } from "@/repositories/branding.repository";

export class DocxExportService {
  exportDocxEnvelope(options: {
    companyName: string;
    documentTitle: string;
    documentVersion: number;
    resolvedHtml: string;
    branding: CompanyBrandingRecord;
    publishedAt?: string | null;
  }): string {
    const htmlContent = htmlExportService.exportHtml(options);

    // Format as Word-compatible HTML envelope (.doc / .docx compatible)
    return `
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset="utf-8">
  <title>${options.documentTitle}</title>
  <!--[if gte mso 9]>
  <xml>
    <w:WordDocument>
      <w:View>Print</w:View>
      <w:Zoom>100</w:Zoom>
      <w:DoNotOptimizeForBrowser/>
    </w:WordDocument>
  </xml>
  <![endif]-->
</head>
<body>
  ${htmlContent}
</body>
</html>
    `.trim();
  }
}

export const docxExportService = new DocxExportService();
