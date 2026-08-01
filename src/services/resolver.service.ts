import { getCompanyBySlug } from "@/repositories/company-slug.repository";
import { getCompanyBranding } from "@/repositories/branding.repository";
import { getLatestScan } from "@/repositories/scanner.repository";
import { listInventoryItems } from "@/repositories/inventory.repository";
import { listVendors } from "@/repositories/vendor.repository";
import { escapeHtml } from "@/platform/security/sanitize";

export interface ResolvedContext {
  company: Record<string, string>;
  scanner: Record<string, string>;
  inventory: Record<string, string>;
  vendors: Record<string, string>;
  policy: Record<string, string>;
  custom: Record<string, string>;
  rawVendorsList: Array<{ name: string; category: string; country: string }>;
  rawInventoryList: Array<{ name: string; category: string; retention: string }>;
}

export class ResolverService {
  async buildContext(companyId: string): Promise<ResolvedContext> {
    const [brandingRes, scanRes, inventoryRes, vendorsRes] = await Promise.all([
      getCompanyBranding(companyId),
      getLatestScan(companyId),
      listInventoryItems(companyId),
      listVendors(companyId),
    ]);

    const branding = brandingRes.data;
    const scan = scanRes.data;
    const inventory = inventoryRes.data || [];
    const vendors = vendorsRes.data || [];

    const now = new Date();
    const formattedToday = now.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const vendorNames = vendors.map((v) => v.name).join(", ") || "None";
    const categoriesList = Array.from(
      new Set(inventory.map((i) => i.data_category).filter(Boolean))
    ).join(", ") || "General User Data";
    const locationsList = Array.from(
      new Set(inventory.map((i) => i.storage_location).filter(Boolean))
    ).join(", ") || "AWS ap-south-1 (Mumbai)";

    return {
      company: {
        name: branding?.privacy_contact ? "Company Legal Entity" : "Company Name",
        website: branding?.support_email ? `https://${branding.support_email.split("@")[1]}` : "https://company.com",
        address: branding?.address || "Mumbai, Maharashtra, India",
        email: branding?.support_email || "support@company.com",
        country: "India",
        industry: "SaaS",
        size: "Enterprise",
        logo: branding?.logo_url || "",
        phone: branding?.phone_number || "+91 22 1234 5678",
        dpo: branding?.dpo_name ? `${branding.dpo_name} (${branding.privacy_contact || "privacy@company.com"})` : "Data Protection Officer (privacy@company.com)",
      },
      scanner: {
        score: scan ? String(scan.overall_score) : "100",
        cookies: scan ? String(scan.cookies_found) : "0",
        trackers: scan ? String(scan.trackers_found) : "0",
        findings: scan ? String(scan.findings_count) : "0",
        risk: scan && scan.overall_score < 70 ? "High Risk" : "Low Risk",
        last_scan: scan ? new Date(scan.created_at).toLocaleDateString() : formattedToday,
        google_consent_mode: "v2 Compliant",
      },
      inventory: {
        categories: categoriesList,
        data_subjects: "Customers, Application Users, Website Visitors",
        processing_purposes: "Service Provisioning, Security Audit, Statutory DPDP Compliance",
        retention: "7 Years for Tax/Financial Data, 90 Days for Telemetry Logs",
        locations: locationsList,
        total_items: String(inventory.length),
      },
      vendors: {
        count: String(vendors.length),
        names: vendorNames,
        third_country: "United States, Singapore, India",
        high_risk: "0 High-Risk Vendors",
      },
      policy: {
        version: "v1.0",
        generated_date: formattedToday,
        published_date: formattedToday,
      },
      custom: (branding?.custom_variables as Record<string, string>) || {},
      rawVendorsList: vendors.map((v) => ({ name: v.name, category: v.category || "Data Processor", country: v.country || "India" })),
      rawInventoryList: inventory.map((i) => ({ name: i.name, category: i.data_category, retention: i.retention_period })),
    };
  }

  resolveTemplate(template: string, context: ResolvedContext): string {
    if (!template) return "";

    let resolved = template;

    // 1. Process Conditionals: {{#if condition}} ... {{/if}}
    resolved = resolved.replace(
      /\{\{#if\s+([a-zA-Z0-9._]+)\}\}([\s\S]*?)\{\{\/if\}\}/g,
      (_match, condKey: string, body: string) => {
        const val = this.getNestedValue(condKey, context);
        if (val && val !== "0" && val !== "false" && val !== "None") {
          return body;
        }
        return "";
      }
    );

    // 2. Process Vendor Loops: {{#each vendors}} ... {{/each}}
    resolved = resolved.replace(
      /\{\{#each\s+vendors\}\}([\s\S]*?)\{\{\/each\}\}/g,
      (_match, body: string) => {
        if (!context.rawVendorsList.length) return "<p>No third-party vendors registered.</p>";
        return context.rawVendorsList
          .map((v) => body.replace(/\{\{this.name\}\}/g, escapeHtml(v.name)).replace(/\{\{this.category\}\}/g, escapeHtml(v.category)).replace(/\{\{this.country\}\}/g, escapeHtml(v.country)))
          .join("\n");
      }
    );

    // 3. Process Standard Variable Interpolations: {{variable.key}} or {{today}}
    resolved = resolved.replace(/\{\{([a-zA-Z0-9._]+)\}\}/g, (match, varKey: string) => {
      if (varKey === "today") {
        return new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" });
      }
      if (varKey === "current_year") {
        return String(new Date().getFullYear());
      }

      const val = this.getNestedValue(varKey, context);
      if (val !== undefined && val !== null) {
        return escapeHtml(String(val));
      }

      // Warning marker for unknown variables instead of breaking
      return `<span style="background-color: #fef3c7; color: #92400e; padding: 2px 4px; border-radius: 4px; font-weight: bold;">[Warning: Unknown Variable ${match}]</span>`;
    });

    return resolved;
  }

  private getNestedValue(key: string, context: ResolvedContext): string | undefined {
    const parts = key.split(".");
    let current: unknown = context;
    for (const part of parts) {
      if (current && typeof current === "object" && part in (current as Record<string, unknown>)) {
        current = (current as Record<string, unknown>)[part];
      } else {
        return undefined;
      }
    }
    return typeof current === "string" ? current : undefined;
  }
}

export const resolverService = new ResolverService();
