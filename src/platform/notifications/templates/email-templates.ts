import { stripHtml } from "@/platform/security/sanitize";

export interface EmailBranding {
  companyName: string;
  logoUrl?: string | null;
  primaryColor?: string;
}

export interface RenderedTemplate {
  subject: string;
  html: string;
  text: string;
}

export function renderBaseEmailLayout(options: {
  branding: EmailBranding;
  title: string;
  categoryBadge: string;
  bodyContentHtml: string;
  actionButton?: { label: string; url: string };
}): RenderedTemplate {
  const { branding, title, categoryBadge, bodyContentHtml, actionButton } = options;
  const brandColor = branding.primaryColor || "#4f46e5";
  const companyName = branding.companyName || "PrivyStack Tenant";
  const subject = `[${companyName}] ${title}`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    @media (prefers-color-scheme: dark) {
      body { background-color: #090d16 !important; color: #f1f5f9 !important; }
      .card { background-color: #1e293b !important; border-color: #334155 !important; }
      .meta-box { background-color: #0f172a !important; border-color: #334155 !important; color: #cbd5e1 !important; }
      .footer { color: #64748b !important; }
      .text-slate-600 { color: #94a3b8 !important; }
    }
    body { font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; margin: 0; padding: 32px 16px; color: #0f172a; }
    .card { max-width: 580px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
    .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid ${brandColor}; padding-bottom: 16px; margin-bottom: 24px; }
    .logo { height: 32px; max-width: 160px; object-fit: contain; }
    .company { font-size: 18px; font-weight: 800; color: ${brandColor}; }
    .badge { font-size: 11px; font-weight: 700; text-transform: uppercase; padding: 4px 10px; border-radius: 6px; background: #f1f5f9; color: #475569; letter-spacing: 0.5px; }
    .content h2 { color: #0f172a; font-size: 20px; font-weight: 800; margin-top: 0; margin-bottom: 12px; }
    .content p { font-size: 14px; line-height: 1.6; color: #334155; margin-bottom: 16px; }
    .btn { display: inline-block; background-color: ${brandColor}; color: #ffffff !important; font-weight: 700; font-size: 14px; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin: 16px 0; text-align: center; }
    .meta-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 20px 0; font-size: 13px; color: #475569; }
    .footer { border-top: 1px solid #e2e8f0; margin-top: 32px; padding-top: 20px; font-size: 12px; color: #94a3b8; text-align: center; line-height: 1.5; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      ${branding.logoUrl ? `<img src="${branding.logoUrl}" class="logo" alt="${companyName}" />` : `<span class="company">${companyName}</span>`}
      <span class="badge">${categoryBadge}</span>
    </div>

    <div class="content">
      <h2>${title}</h2>
      ${bodyContentHtml}
      ${actionButton ? `<div style="text-align: center;"><a href="${actionButton.url}" class="btn" target="_blank">${actionButton.label}</a></div>` : ""}
    </div>

    <div class="footer">
      ${companyName} • Statutory DPDP Compliance Platform<br />
      This is an automated notification. Managed by PrivyStack Enterprise IAM.
    </div>
  </div>
</body>
</html>
  `.trim();

  const text = `${subject}\n\n${stripHtml(bodyContentHtml)}\n\n${actionButton ? `${actionButton.label}: ${actionButton.url}\n\n` : ""}---\n${companyName} • Statutory DPDP Compliance Platform`;

  return { subject, html, text };
}

// 1. Welcome Email
export function renderWelcomeEmail(branding: EmailBranding, userName: string, loginUrl: string): RenderedTemplate {
  return renderBaseEmailLayout({
    branding,
    title: "Welcome to PrivyStack Privacy Platform",
    categoryBadge: "Onboarding",
    bodyContentHtml: `
      <p>Hello <strong>${userName}</strong>,</p>
      <p>Welcome to <strong>${branding.companyName}</strong>'s statutory privacy management workspace. Your account has been provisioned with full DPDP Act 2023 compliance controls.</p>
      <p>You can now run website privacy audits, generate statutory privacy and cookie policies, manage data principal requests, and configure your public Trust Center.</p>
    `,
    actionButton: { label: "Go to Dashboard", url: loginUrl },
  });
}

// 2. Team Invitation
export function renderTeamInvitationEmail(branding: EmailBranding, inviterName: string, roleName: string, acceptUrl: string): RenderedTemplate {
  return renderBaseEmailLayout({
    branding,
    title: `Invitation to Join ${branding.companyName}`,
    categoryBadge: "Team Management",
    bodyContentHtml: `
      <p>Hello,</p>
      <p><strong>${inviterName}</strong> has invited you to join <strong>${branding.companyName}</strong> as a <strong>${roleName}</strong>.</p>
      <p>As part of the compliance team, you will collaborate on DPDP statutory notices, subprocessor vendor registry audits, and Data Principal (DSAR) SLA requests.</p>
    `,
    actionButton: { label: "Accept Invitation", url: acceptUrl },
  });
}

// 3. Consent Granted
export function renderConsentGrantedEmail(branding: EmailBranding, recipientEmail: string, receiptId: string): RenderedTemplate {
  return renderBaseEmailLayout({
    branding,
    title: "Statutory Consent Receipt Recorded",
    categoryBadge: "Consent Platform",
    bodyContentHtml: `
      <p>Dear Data Principal,</p>
      <p>Your consent choices for <strong>${branding.companyName}</strong> have been recorded in compliance with Section 6 of the DPDP Act 2023.</p>
      <div class="meta-box">
        <strong>Consent Receipt ID:</strong> ${receiptId}<br />
        <strong>Subject:</strong> ${recipientEmail}<br />
        <strong>Timestamp:</strong> ${new Date().toUTCString()}
      </div>
      <p>You may update or withdraw your consent preferences at any time via the consent banner link on our website.</p>
    `,
  });
}

// 4. Consent Withdrawn
export function renderConsentWithdrawnEmail(branding: EmailBranding, recipientEmail: string): RenderedTemplate {
  return renderBaseEmailLayout({
    branding,
    title: "Consent Withdrawal Confirmation",
    categoryBadge: "Consent Platform",
    bodyContentHtml: `
      <p>Dear Data Principal,</p>
      <p>We have processed your request to <strong>withdraw consent</strong> for non-essential data processing at <strong>${branding.companyName}</strong>.</p>
      <div class="meta-box">
        <strong>Subject:</strong> ${recipientEmail}<br />
        <strong>Timestamp:</strong> ${new Date().toUTCString()}
      </div>
      <p>Our telemetry and subprocessor data streams have been updated accordingly in compliance with Section 6(4) of the DPDP Act 2023.</p>
    `,
  });
}

// 5. DSAR Submitted
export function renderDsarSubmittedEmail(branding: EmailBranding, requestId: string, slaDays: number): RenderedTemplate {
  return renderBaseEmailLayout({
    branding,
    title: "Data Principal Request Received",
    categoryBadge: "DSAR Operations",
    bodyContentHtml: `
      <p>Dear Data Principal,</p>
      <p>Your Data Principal Access/Erasure request to <strong>${branding.companyName}</strong> has been logged.</p>
      <div class="meta-box">
        <strong>Request Reference:</strong> ${requestId}<br />
        <strong>Compliance SLA Window:</strong> ${slaDays} Days (Section 11-14 DPDP Act 2023)
      </div>
      <p>Our Data Protection Officer will review your identity proof and fulfill the request within the statutory timeframe.</p>
    `,
  });
}

// 6. DSAR Completed
export function renderDsarCompletedEmail(branding: EmailBranding, requestId: string, downloadUrl?: string): RenderedTemplate {
  return renderBaseEmailLayout({
    branding,
    title: "Data Principal Request Fulfilled",
    categoryBadge: "DSAR Operations",
    bodyContentHtml: `
      <p>Dear Data Principal,</p>
      <p>Your Data Principal request (Ref: <strong>${requestId}</strong>) has been processed and fulfilled by <strong>${branding.companyName}</strong>.</p>
      ${downloadUrl ? `<p>You may securely download your compiled personal data archive below.</p>` : "<p>Your requested data modifications or erasures have been applied across our inventory.</p>"}
    `,
    actionButton: downloadUrl ? { label: "Download Data Archive", url: downloadUrl } : undefined,
  });
}

// 7. Scanner Completed
export function renderScannerCompletedEmail(branding: EmailBranding, targetUrl: string, score: number, findingsCount: number): RenderedTemplate {
  return renderBaseEmailLayout({
    branding,
    title: `Privacy Audit Completed: ${score}/100`,
    categoryBadge: "Scanner Engine",
    bodyContentHtml: `
      <p>The automated privacy scanner has completed auditing <strong>${targetUrl}</strong>.</p>
      <div class="meta-box">
        <strong>Domain Score:</strong> ${score}/100<br />
        <strong>Total Findings:</strong> ${findingsCount} Active Items<br />
        <strong>Scan Date:</strong> ${new Date().toUTCString()}
      </div>
      <p>Log in to your PrivyStack dashboard to review unclassified cookies, third-party trackers, and automated remediation steps.</p>
    `,
  });
}

// 8. Policy Published
export function renderPolicyPublishedEmail(branding: EmailBranding, policyType: string, version: number, publicUrl: string): RenderedTemplate {
  return renderBaseEmailLayout({
    branding,
    title: `Statutory ${policyType} Published (v${version}.0)`,
    categoryBadge: "Legal Studio",
    bodyContentHtml: `
      <p>A new version of <strong>${branding.companyName}</strong>'s <strong>${policyType}</strong> (Version ${version}.0) has passed legal counsel sign-off and is now published.</p>
      <p>The live document is accessible on your public Trust Center domain.</p>
    `,
    actionButton: { label: "View Live Document", url: publicUrl },
  });
}

// 9. Vendor Review Reminder
export function renderVendorReviewReminderEmail(branding: EmailBranding, vendorName: string, daysRemaining: number): RenderedTemplate {
  return renderBaseEmailLayout({
    branding,
    title: `Vendor DPA Renewal Notice: ${vendorName}`,
    categoryBadge: "Vendor Registry",
    bodyContentHtml: `
      <p>The Data Processing Agreement (DPA) for subprocessor <strong>${vendorName}</strong> will expire in <strong>${daysRemaining} days</strong>.</p>
      <p>Please review executed Standard Contractual Clauses (SCCs) and upload an updated agreement to maintain DPDP compliance.</p>
    `,
  });
}

// 10. Billing Notification
export function renderBillingNotificationEmail(branding: EmailBranding, status: "success" | "failure", planName: string, amount: string, invoiceUrl?: string): RenderedTemplate {
  const isSuccess = status === "success";
  return renderBaseEmailLayout({
    branding,
    title: isSuccess ? `Payment Received — ${planName}` : `Payment Action Required — ${planName}`,
    categoryBadge: "Billing & Subscriptions",
    bodyContentHtml: `
      <p>${isSuccess ? `Thank you for your payment to <strong>${branding.companyName}</strong>.` : `We were unable to process your payment for <strong>${planName}</strong>.`}</p>
      <div class="meta-box">
        <strong>Plan Tier:</strong> ${planName}<br />
        <strong>Amount:</strong> ${amount}<br />
        <strong>Status:</strong> ${isSuccess ? "Paid Successfully" : "Payment Failed / Past Due"}
      </div>
    `,
    actionButton: invoiceUrl ? { label: isSuccess ? "View Invoice" : "Update Payment Method", url: invoiceUrl } : undefined,
  });
}
