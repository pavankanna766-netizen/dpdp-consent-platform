import type { CompanyBrandingRecord } from "@/repositories/branding.repository";

export interface RenderDocumentOptions {
  companyName: string;
  documentTitle: string;
  documentVersion: number;
  htmlContent: string;
  branding: CompanyBrandingRecord;
  publishedAt?: string | null;
}

export class RendererService {
  renderBrandedDocument(options: RenderDocumentOptions): string {
    const { companyName, documentTitle, documentVersion, htmlContent, branding, publishedAt } = options;

    const formattedDate = publishedAt
      ? new Date(publishedAt).toLocaleDateString("en-IN", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : new Date().toLocaleDateString("en-IN", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${companyName} - ${documentTitle}</title>
  <style>
    :root {
      --brand-primary: ${branding.primary_color};
      --brand-secondary: ${branding.secondary_color};
      --brand-accent: ${branding.accent_color};
      --brand-font: ${branding.font_family}, system-ui, -apple-system, sans-serif;
      --doc-width: ${branding.document_width};
      --doc-margin: ${branding.document_margin};
    }

    body {
      font-family: var(--brand-font);
      color: var(--brand-secondary);
      background-color: #ffffff;
      margin: 0;
      padding: var(--doc-margin);
      line-height: 1.6;
    }

    .doc-container {
      max-width: var(--doc-width);
      margin: 0 auto;
      position: relative;
    }

    ${branding.watermark_enabled ? `
    .doc-container::before {
      content: "${branding.watermark_config?.text || "CONFIDENTIAL"}";
      position: absolute;
      top: 40%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(${branding.watermark_config?.rotation || -45}deg);
      font-size: 6rem;
      font-weight: 900;
      color: var(--brand-primary);
      opacity: ${branding.watermark_config?.opacity || 0.15};
      pointer-events: none;
      z-index: 0;
      text-transform: uppercase;
      letter-spacing: 0.25em;
    }
    ` : ""}

    header.doc-header {
      border-bottom: 2px solid var(--brand-primary);
      padding-bottom: 1rem;
      margin-bottom: 2rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .doc-header .company-brand {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .doc-header img.logo {
      height: 36px;
      object-fit: contain;
    }

    .doc-header h1.brand-title {
      font-size: 1.25rem;
      font-weight: 800;
      color: var(--brand-primary);
      margin: 0;
    }

    .doc-header .meta-badge {
      font-size: 0.75rem;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    ${branding.cover_page_enabled ? `
    .cover-page {
      min-height: 80vh;
      display: flex;
      flex-col;
      justify-content: center;
      align-items: center;
      text-align: center;
      border-bottom: 1px solid #e2e8f0;
      margin-bottom: 3rem;
      padding-bottom: 3rem;
    }
    .cover-page h1 {
      font-size: 2.5rem;
      font-weight: 900;
      color: var(--brand-primary);
      margin-top: 1rem;
    }
    ` : ""}

    .doc-body h1, .doc-body h2, .doc-body h3 {
      color: var(--brand-primary);
      margin-top: 1.75rem;
      margin-bottom: 0.75rem;
    }

    .doc-body table {
      width: 100%;
      border-collapse: collapse;
      margin: 1.5rem 0;
    }

    .doc-body th {
      background-color: var(--brand-primary);
      color: #ffffff;
      text-align: left;
      padding: 0.75rem 1rem;
      font-size: 0.875rem;
    }

    .doc-body td {
      border-bottom: 1px solid #e2e8f0;
      padding: 0.75rem 1rem;
      font-size: 0.875rem;
    }

    footer.doc-footer {
      border-top: 1px solid #e2e8f0;
      margin-top: 3rem;
      padding-top: 1.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.75rem;
      color: #64748b;
    }
  </style>
</head>
<body>
  <div class="doc-container">
    ${branding.header_enabled ? `
    <header class="doc-header">
      <div class="company-brand">
        ${branding.logo_url ? `<img src="${branding.logo_url}" alt="${companyName}" class="logo" />` : ""}
        <h1 class="brand-title">${companyName}</h1>
      </div>
      <div class="meta-badge">
        ${documentTitle} (v${documentVersion}.0)
      </div>
    </header>
    ` : ""}

    ${branding.cover_page_enabled ? `
    <div class="cover-page">
      ${branding.logo_url ? `<img src="${branding.logo_url}" alt="${companyName}" style="height: 64px;" />` : ""}
      <h1>${documentTitle}</h1>
      <p style="color: #64748b; font-size: 1.125rem;">Prepared for ${companyName}</p>
      <p style="font-size: 0.875rem; font-weight: 600; color: var(--brand-primary);">Effective Date: ${formattedDate} | Version ${documentVersion}.0</p>
    </div>
    ` : ""}

    <main class="doc-body">
      ${htmlContent}
    </main>

    ${branding.footer_enabled ? `
    <footer class="doc-footer">
      <div>
        <strong>${companyName}</strong> ${branding.address ? `• ${branding.address}` : ""} ${branding.support_email ? `• ${branding.support_email}` : ""}
      </div>
      <div>
        Generated on ${formattedDate} • Statutory DPDP Compliance
      </div>
    </footer>
    ` : ""}
  </div>
</body>
</html>
    `.trim();
  }
}

export const rendererService = new RendererService();
