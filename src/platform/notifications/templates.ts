import type { DomainEventType } from "./event-bus";

export interface EmailTemplateRenderOptions {
  eventType: DomainEventType;
  companyName: string;
  recipientEmail: string;
  title: string;
  logoUrl?: string | null;
  primaryColor?: string;
  metadata?: Record<string, unknown>;
}

export class NotificationTemplateEngine {
  renderEmail(options: EmailTemplateRenderOptions): { subject: string; html: string } {
    const { eventType, companyName, title, logoUrl, primaryColor, metadata } = options;

    const brandColor = primaryColor || "#4f46e5";
    const subject = `[${companyName}] ${title}`;

    const bodyHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Inter, system-ui, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #0f172a; }
    .card { max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
    .header { display: flex; align-items: center; gap: 12px; border-bottom: 2px solid ${brandColor}; padding-bottom: 16px; margin-bottom: 24px; }
    .logo { height: 32px; object-fit: contain; }
    .company { font-size: 18px; font-weight: 800; color: ${brandColor}; }
    .badge { font-size: 11px; font-weight: 700; text-transform: uppercase; padding: 4px 8px; border-radius: 6px; background: #f1f5f9; color: #475569; }
    .content h2 { color: #0f172a; font-size: 20px; font-weight: 800; margin-top: 0; }
    .content p { font-size: 14px; line-height: 1.6; color: #334155; }
    .meta-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 20px 0; font-size: 12px; font-family: monospace; color: #475569; }
    .footer { border-top: 1px solid #e2e8f0; margin-top: 32px; padding-top: 16px; font-size: 12px; color: #94a3b8; text-align: center; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      ${logoUrl ? `<img src="${logoUrl}" class="logo" alt="${companyName}" />` : ""}
      <span class="company">${companyName}</span>
      <span class="badge" style="margin-left: auto;">${eventType.replace(/_/g, " ")}</span>
    </div>

    <div class="content">
      <h2>${title}</h2>
      <p>This is a statutory automated notification regarding your DPDP Act 2023 compliance operations for <strong>${companyName}</strong>.</p>
      
      ${metadata ? `<div class="meta-box"><pre>${JSON.stringify(metadata, null, 2)}</pre></div>` : ""}

      <p>If you have any questions or require support, please contact your Data Protection Officer.</p>
    </div>

    <div class="footer">
      ${companyName} • Statutory DPDP Compliance Notification System
    </div>
  </div>
</body>
</html>
    `.trim();

    return { subject, html: bodyHtml };
  }
}

export const notificationTemplateEngine = new NotificationTemplateEngine();
