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
    const [brandingRes, scanRes, inventoryRes, vendorRes] = await Promise.all([
      getCompanyBranding(companyId),
      getLatestScan(companyId),
      listInventoryItems(companyId),
      listVendors(companyId),
    ]);

    const branding = brandingRes.data;
    const scan = scanRes.data;
    const inventoryItems = inventoryRes.data || [];
    const vendors = vendorRes.data || [];

    const companyCtx: Record<string, string> = {
      company_name: escapeHtml(branding?.legal_entity_name || "Company Entity"),
      legal_entity_name: escapeHtml(branding?.legal_entity_name || "Company Entity"),
      website: escapeHtml(branding?.official_website || "https://example.com"),
      country: escapeHtml(branding?.country || "India"),
      timezone: escapeHtml(branding?.timezone || "Asia/Kolkata"),
      dpo_name: escapeHtml(branding?.dpo_name || "Data Protection Officer"),
      dpo_email: escapeHtml(branding?.dpo_email || "dpo@company.com"),
      privacy_contact: escapeHtml(branding?.privacy_contact || "privacy@company.com"),
      address: escapeHtml(branding?.address || "Headquarters"),
      logo_url: escapeHtml(branding?.logo_url || ""),
    };

    const scannerCtx: Record<string, string> = {
      audit_score: String(scan?.overall_score ?? 100),
      cookies_count: String(scan?.cookies_found ?? 0),
      trackers_count: String(scan?.trackers_found ?? 0),
      last_audit_date: scan?.completed_at ? new Date(scan.completed_at).toLocaleDateString("en-IN") : "Recent",
    };

    const inventoryCtx: Record<string, string> = {
      categories_count: String(inventoryItems.length),
      purposes_list: Array.from(new Set(inventoryItems.map((i) => i.purpose))).join(", ") || "Analytics & Operation",
    };

    const vendorsCtx: Record<string, string> = {
      subprocessors_count: String(vendors.length),
      subprocessors_list: vendors.map((v) => v.name).join(", ") || "Internal Processors",
    };

    const policyCtx: Record<string, string> = {
      publication_date: new Date().toLocaleDateString("en-IN"),
      effective_date: new Date().toLocaleDateString("en-IN"),
      jurisdiction: "Digital Personal Data Protection Act 2023 (DPDP, India)",
    };

    const customCtx: Record<string, string> = {};
    if (branding?.custom_variables && typeof branding.custom_variables === "object") {
      Object.entries(branding.custom_variables as Record<string, string>).forEach(([k, v]) => {
        customCtx[k] = escapeHtml(String(v));
      });
    }

    return {
      company: companyCtx,
      scanner: scannerCtx,
      inventory: inventoryCtx,
      vendors: vendorsCtx,
      policy: policyCtx,
      custom: customCtx,
      rawVendorsList: vendors.map((v) => ({ name: v.name, category: v.category, country: v.country })),
      rawInventoryList: inventoryItems.map((i) => ({ name: i.name, category: i.data_category, retention: i.retention_period })),
    };
  }

  resolveTemplate(templateHtml: string, context: ResolvedContext): string {
    let result = templateHtml;
    const allVars = {
      ...context.company,
      ...context.scanner,
      ...context.inventory,
      ...context.vendors,
      ...context.policy,
      ...context.custom,
    };
    Object.entries(allVars).forEach(([k, v]) => {
      const reg = new RegExp(`\\{\\{\\s*${k}\\s*\\}\\}`, "g");
      result = result.replace(reg, v);
    });
    return result;
  }
}

export const resolverService = new ResolverService();
