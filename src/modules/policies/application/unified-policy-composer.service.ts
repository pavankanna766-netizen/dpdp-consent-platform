import { findCompanyById } from "@/repositories/company.repository";
import { listInventoryItems } from "@/repositories/inventory.repository";
import { listVendors } from "@/repositories/vendor.repository";
import {
  createPrivacyPolicy,
  getPublishedPrivacyPolicy,
} from "@/repositories/privacy-policy.repository";
import {
  createCookiePolicy,
  getPublishedCookiePolicy,
} from "@/repositories/cookie-policy.repository";

export class UnifiedPolicyComposerService {
  async generatePrivacyPolicy(companyId: string): Promise<string> {
    const [companyRes, inventoryRes, vendorRes] = await Promise.all([
      findCompanyById(companyId),
      listInventoryItems(companyId),
      listVendors(companyId),
    ]);

    const company = companyRes.data;
    if (!company) throw new Error("Company not found");

    const inventory = inventoryRes.data || [];
    const vendors = vendorRes.data || [];

    const companyName = company.company_name;
    const website = company.website || "https://example.com";
    const country = company.country || "India";

    // 1. Retention Clause Table
    const retentionRows = inventory
      .map(
        (i) =>
          `<tr>
            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">${i.category}</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${i.purpose}</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${i.legal_basis}</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${i.retention_period}</td>
          </tr>`
      )
      .join("");

    // 2. Vendor Table
    const vendorRows = vendors
      .map(
        (v) =>
          `<tr>
            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">${v.name}</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${v.category}</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${v.country}</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${v.scc_required ? "SCC Enforced" : "DPA Signed"}</td>
          </tr>`
      )
      .join("");

    const policyHtml = `
      <div style="font-family: sans-serif; line-height: 1.6; color: #333;">
        <h1>Statutory Privacy Policy — DPDP Act 2023</h1>
        <p><strong>Entity Name:</strong> ${companyName}</p>
        <p><strong>Website:</strong> <a href="${website}">${website}</a></p>
        <p><strong>Jurisdiction:</strong> ${country}</p>
        
        <h2>1. Scope & DPDP Compliance</h2>
        <p>This Privacy Policy outlines our data processing activities in compliance with the Digital Personal Data Protection (DPDP) Act 2023 of India.</p>
        
        <h2>2. Data Inventory & Legal Grounds</h2>
        <p>The following personal data categories are collected and processed under statutory legal grounds:</p>
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
          <thead>
            <tr style="background: #f4f4f4;">
              <th style="padding: 8px; border: 1px solid #ddd;">Data Category</th>
              <th style="padding: 8px; border: 1px solid #ddd;">Purpose of Processing</th>
              <th style="padding: 8px; border: 1px solid #ddd;">Legal Ground</th>
              <th style="padding: 8px; border: 1px solid #ddd;">Retention Period</th>
            </tr>
          </thead>
          <tbody>
            ${retentionRows || "<tr><td colspan='4' style='padding: 8px;'>Standard account & analytics telemetry.</td></tr>"}
          </tbody>
        </table>

        <h2>3. Third-Party Subprocessors & Cross-Border Transfers</h2>
        <p>We engage authorized data processors under Data Processing Agreements (DPAs):</p>
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
          <thead>
            <tr style="background: #f4f4f4;">
              <th style="padding: 8px; border: 1px solid #ddd;">Subprocessor</th>
              <th style="padding: 8px; border: 1px solid #ddd;">Category</th>
              <th style="padding: 8px; border: 1px solid #ddd;">Country</th>
              <th style="padding: 8px; border: 1px solid #ddd;">Safeguards</th>
            </tr>
          </thead>
          <tbody>
            ${vendorRows || "<tr><td colspan='4' style='padding: 8px;'>No external subprocessors engaged.</td></tr>"}
          </tbody>
        </table>

        <h2>4. Data Principal Rights & DPO Contact</h2>
        <p>Under Section 11-14 of the DPDP Act 2023, you have the right to access, correct, erase, and nominate representatives. Contact our Data Protection Officer at <strong>dpo@${website.replace(/^https?:\/\//, "")}</strong>.</p>
      </div>
    `.trim();

    const currentRes = await getPublishedPrivacyPolicy(companyId);
    const newVersion = (currentRes.data?.version || 0) + 1;

    await createPrivacyPolicy({
      company_id: companyId,
      html_content: policyHtml,
      version: newVersion,
    });

    return policyHtml;
  }

  async generateCookiePolicy(companyId: string): Promise<string> {
    const companyRes = await findCompanyById(companyId);
    const company = companyRes.data;

    const companyName = company?.company_name || "Company Entity";

    const cookieHtml = `
      <div style="font-family: sans-serif; line-height: 1.6; color: #333;">
        <h1>Statutory Cookie Policy — ${companyName}</h1>
        <p>This Cookie Policy explains how ${companyName} uses cookies and tracking technologies.</p>
        
        <h2>1. Strictly Necessary Cookies</h2>
        <p>Essential for site functionality, security, and authentication.</p>
        
        <h2>2. Analytics & Performance Cookies</h2>
        <p>Used to measure visitor interactions and optimize platform latency.</p>

        <h2>3. Consent Preferences</h2>
        <p>You can withdraw or update your cookie consent choices at any time via the consent banner link on our site.</p>
      </div>
    `.trim();

    const currentRes = await getPublishedCookiePolicy(companyId);
    const newVersion = (currentRes.data?.version || 0) + 1;

    await createCookiePolicy({
      company_id: companyId,
      html_content: cookieHtml,
      version: newVersion,
    });

    return cookieHtml;
  }
}

export const unifiedPolicyComposerService = new UnifiedPolicyComposerService();
