import { findCompanyById } from "@/repositories/company.repository";
import { listInventoryItems } from "@/repositories/inventory.repository";
import { listVendors } from "@/repositories/vendor.repository";
import { getLatestScan } from "@/repositories/scanner.repository";
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
    const [companyRes, inventoryRes, vendorRes, latestScanRes] = await Promise.all([
      findCompanyById(companyId),
      listInventoryItems(companyId),
      listVendors(companyId),
      getLatestScan(companyId),
    ]);

    const company = companyRes.data;
    if (!company) throw new Error("Company not found");

    const inventory = inventoryRes.data || [];
    const vendors = vendorRes.data || [];
    const scan = latestScanRes.data;

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

    const retentionTableHtml = inventory.length
      ? `<table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
          <thead>
            <tr style="background-color: #f8fafc;">
              <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Data Category</th>
              <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Processing Purpose</th>
              <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Legal Basis</th>
              <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Retention Window</th>
            </tr>
          </thead>
          <tbody>${retentionRows}</tbody>
        </table>`
      : `<p>Personal data is retained only as long as necessary to fulfill the processing purposes or statutory obligations.</p>`;

    // 2. Third-Party Disclosures & Vendor Table
    const vendorRows = vendors
      .map(
        (v) =>
          `<tr>
            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">${v.name}</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${v.category || "Data Processor"}</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${v.country || "United States"}</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${v.dpa_uploaded ? "Executed DPA" : "Standard Contract"}</td>
          </tr>`
      )
      .join("");

    const vendorTableHtml = vendors.length
      ? `<table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
          <thead>
            <tr style="background-color: #f8fafc;">
              <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Processor Name</th>
              <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Category</th>
              <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Jurisdiction</th>
              <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Safeguard Status</th>
            </tr>
          </thead>
          <tbody>${vendorRows}</tbody>
        </table>`
      : `<p>We do not sell personal data to third parties. Data is shared strictly with authorized service providers for core operations.</p>`;

    // 3. Children Clause (DPDP Act Section 9)
    const childrenClauseHtml = `
      <h3>Protection of Children's Personal Data (DPDP Section 9)</h3>
      <p>
        ${companyName} does not knowingly process personal data of minors under 18 years of age without verifiable parental consent.
        If we discover that a child has provided personal data without parental authorization, we will immediately purge the data from our active systems.
      </p>
    `;

    // 4. International Data Transfers (DPDP Act Section 16)
    const crossBorderItems = inventory.filter((i) => i.cross_border_transfer);
    const internationalTransfersHtml = `
      <h3>International Data Transfers (DPDP Section 16)</h3>
      <p>
        Personal data processed by ${companyName} is stored primarily in ${country} (AWS ap-south-1 Mumbai).
        ${
          crossBorderItems.length > 0
            ? `Where cross-border transfers occur to third-party processors, we enforce Standard Contractual Clauses (SCCs) and statutory safeguards.`
            : `We do not transfer personal data outside restricted jurisdictions prohibited by Central Government notifications.`
        }
      </p>
    `;

    const htmlContent = `
      <div style="font-family: sans-serif; line-height: 1.6; color: #1e293b; max-w: 800px; margin: 0 auto; padding: 24px;">
        <h1 style="color: #0f172a;">Privacy Policy & Statutory Notice</h1>
        <p><strong>Effective Date:</strong> ${new Date().toLocaleDateString()} | <strong>Organization:</strong> ${companyName} (${website})</p>
        
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />

        <h3>1. Introduction & Statutory Notice (DPDP Act 2023)</h3>
        <p>
          This Privacy Notice outlines how <strong>${companyName}</strong> ("we", "us", or "our") collects, processes, stores, and protects your personal data in accordance with the Digital Personal Data Protection (DPDP) Act 2023 of India.
        </p>

        <h3>2. Personal Data Categories & Retention Windows</h3>
        ${retentionTableHtml}

        <h3>3. Authorized Third-Party Processors & Disclosures</h3>
        ${vendorTableHtml}

        ${childrenClauseHtml}

        ${internationalTransfersHtml}

        <h3>6. Data Principal Rights</h3>
        <p>Under the DPDP Act 2023, you have the right to:</p>
        <ul>
          <li>Request a summary of personal data processed by ${companyName}.</li>
          <li>Request correction, completion, or updating of inaccurate data.</li>
          <li>Withdraw consent at any time without affecting past lawful processing.</li>
          <li>Nominate an individual to exercise rights in the event of incapacity.</li>
        </ul>

        <h3>7. Grievance Officer & Enquiries</h3>
        <p>
          For privacy inquiries or grievance redressal, contact our Data Protection Officer at:
          <br /><strong>Email:</strong> privacy@${new URL(website).hostname.replace(/^www\./, "")}
        </p>
      </div>
    `;

    // Persist new draft version
    const existingPublished = await getPublishedPrivacyPolicy(companyId);
    const nextVersion = existingPublished.data ? existingPublished.data.version + 1 : 1;

    await createPrivacyPolicy({
      company_id: companyId,
      version: nextVersion,
      status: "draft",
      html_content: htmlContent,
      sections: [
        { title: "Introduction", content: "DPDP Act 2023 Notice" },
        { title: "Data Categories", content: JSON.stringify(inventory) },
        { title: "Third Parties", content: JSON.stringify(vendors) },
      ],
      reviewed_by_counsel: false,
    });

    return htmlContent;
  }

  async generateCookiePolicy(companyId: string): Promise<string> {
    const [companyRes, latestScanRes] = await Promise.all([
      findCompanyById(companyId),
      getLatestScan(companyId),
    ]);

    const company = companyRes.data;
    if (!company) throw new Error("Company not found");

    const companyName = company.company_name;
    const website = company.website || "https://example.com";
    const scan = latestScanRes.data;

    const cookiesFound = scan?.cookies_found ?? 0;
    const trackersFound = scan?.trackers_found ?? 0;

    const htmlContent = `
      <div style="font-family: sans-serif; line-height: 1.6; color: #1e293b; max-w: 800px; margin: 0 auto; padding: 24px;">
        <h1 style="color: #0f172a;">Cookie Policy & Tracking Disclosure</h1>
        <p><strong>Last Audit Date:</strong> ${new Date().toLocaleDateString()} | <strong>Target Domain:</strong> ${website}</p>
        
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />

        <h3>1. What Are Cookies?</h3>
        <p>
          Cookies are small text files placed on your device by <strong>${companyName}</strong> to store preferences, maintain session state, and deliver personalized functionality.
        </p>

        <h3>2. Audit Summary</h3>
        <p>
          Our latest domain audit detected <strong>${cookiesFound} cookies</strong> and <strong>${trackersFound} active third-party trackers</strong> on ${website}.
        </p>

        <h3>3. Cookie Categories</h3>
        <ul>
          <li><strong>Strictly Necessary:</strong> Essential for core website navigation and security.</li>
          <li><strong>Analytics & Telemetry:</strong> Measures visitor traffic and page performance.</li>
          <li><strong>Functional Preferences:</strong> Remembers your language and UI choices.</li>
          <li><strong>Marketing & Advertising:</strong> Used by advertising networks to deliver tailored ads.</li>
        </ul>

        <h3>4. Managing Cookie Preferences</h3>
        <p>
          You can adjust your cookie consent settings at any time using our floating Consent Preferences widget or via your browser settings.
        </p>
      </div>
    `;

    const existingPublished = await getPublishedCookiePolicy(companyId);
    const nextVersion = existingPublished.data ? existingPublished.data.version + 1 : 1;

    await createCookiePolicy({
      company_id: companyId,
      version: nextVersion,
      status: "draft",
      html_content: htmlContent,
      categories: [
        { name: "Necessary", description: "Essential cookies", cookies: [] },
        { name: "Analytics", description: "Traffic measurement", cookies: [] },
      ],
      reviewed_by_counsel: false,
    });

    return htmlContent;
  }
}

export const unifiedPolicyComposerService = new UnifiedPolicyComposerService();
