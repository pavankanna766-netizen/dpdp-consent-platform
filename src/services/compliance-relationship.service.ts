import { findCompanyById } from "@/repositories/company.repository";
import { getLatestScan } from "@/repositories/scanner.repository";
import { listInventoryItems } from "@/repositories/inventory.repository";
import { listVendors } from "@/repositories/vendor.repository";
import { getPublishedPrivacyPolicy } from "@/repositories/privacy-policy.repository";
import { getPublishedCookiePolicy } from "@/repositories/cookie-policy.repository";
import { cache } from "react";

export interface ComplianceNode {
  id: string;
  type: "company" | "scanner" | "inventory" | "vendor" | "policy" | "dsar";
  label: string;
  status: "healthy" | "warning" | "error";
  details?: Record<string, unknown>;
}

export interface ComplianceEdge {
  source: string;
  target: string;
  label?: string;
}

export interface ComplianceGraph {
  nodes: ComplianceNode[];
  edges: ComplianceEdge[];
  unresolvedGaps: string[];
}

export class ComplianceRelationshipService {
  getGraph = cache(async (companyId: string): Promise<ComplianceGraph> => {
    const [
      companyRes,
      latestScanRes,
      inventoryRes,
      vendorRes,
      privacyRes,
      cookieRes,
    ] = await Promise.all([
      findCompanyById(companyId),
      getLatestScan(companyId),
      listInventoryItems(companyId),
      listVendors(companyId),
      getPublishedPrivacyPolicy(companyId),
      getPublishedCookiePolicy(companyId),
    ]);

    const company = companyRes.data;
    if (!company) {
      throw new Error(`Company not found: ${companyId}`);
    }

    const nodes: ComplianceNode[] = [];
    const edges: ComplianceEdge[] = [];
    const unresolvedGaps: string[] = [];

    // Node 1: Root Company Node
    const companyNodeId = `company-${company.id}`;
    nodes.push({
      id: companyNodeId,
      type: "company",
      label: company.company_name,
      status: company.is_onboarded ? "healthy" : "warning",
      details: {
        industry: company.industry,
        country: company.country,
        website: company.website,
      },
    });

    // Node 2: Data Inventory
    const inventoryItems = inventoryRes.data || [];
    const inventoryNodeId = `inventory-${company.id}`;
    const unconfirmedInventory = inventoryItems.filter((i) => !i.purpose).length;

    nodes.push({
      id: inventoryNodeId,
      type: "inventory",
      label: `Data Inventory (${inventoryItems.length} categories)`,
      status: unconfirmedInventory > 0 ? "warning" : "healthy",
      details: { count: inventoryItems.length, unconfirmed: unconfirmedInventory },
    });
    edges.push({
      source: companyNodeId,
      target: inventoryNodeId,
      label: "tracks personal data",
    });

    if (inventoryItems.length === 0) {
      unresolvedGaps.push("Data Inventory is empty. Run a scanner audit or add data categories.");
    }

    // Node 3: Vendor Registry
    const vendors = vendorRes.data || [];
    const vendorNodeId = `vendor-${company.id}`;
    const unconfirmedVendors = vendors.filter((v) => v.unconfirmed).length;
    const missingDpaVendors = vendors.filter((v) => !v.dpa_uploaded).length;
    nodes.push({
      id: vendorNodeId,
      type: "vendor",
      label: `Vendor Registry (${vendors.length} processors)`,
      status: missingDpaVendors > 0 ? "warning" : "healthy",
      details: { count: vendors.length, missingDpa: missingDpaVendors, unconfirmed: unconfirmedVendors },
    });
    edges.push({
      source: inventoryNodeId,
      target: vendorNodeId,
      label: "shares data with subprocessors",
    });

    if (missingDpaVendors > 0) {
      unresolvedGaps.push(`${missingDpaVendors} vendors are missing executed Data Processing Agreements (DPAs).`);
    }

    // Node 4: Scanner Audit Engine
    const scan = latestScanRes.data;
    const scanNodeId = `scan-${company.id}`;
    const score = scan?.overall_score ?? 100;
    nodes.push({
      id: scanNodeId,
      type: "scanner",
      label: `Privacy Scanner (Score: ${score}/100)`,
      status: score >= 90 ? "healthy" : score >= 70 ? "warning" : "error",
      details: {
        score,
        cookiesFound: scan?.cookies_found ?? 0,
        trackersFound: scan?.trackers_found ?? 0,
        lastScan: scan?.completed_at || scan?.created_at,
      },
    });
    edges.push({
      source: companyNodeId,
      target: scanNodeId,
      label: "scans domain telemetry",
    });

    if (score < 80) {
      unresolvedGaps.push(`Privacy score is low (${score}/100). Resolve active scanner findings.`);
    }

    // Node 5: Statutory Privacy Policy
    const privacyPolicy = privacyRes.data;
    const privacyNodeId = `policy-privacy-${company.id}`;
    nodes.push({
      id: privacyNodeId,
      type: "policy",
      label: `Privacy Policy (v${privacyPolicy?.version ?? 0})`,
      status: privacyPolicy ? "healthy" : "error",
      details: {
        version: privacyPolicy?.version ?? 0,
        publishedAt: privacyPolicy?.published_at,
        reviewedByCounsel: privacyPolicy?.reviewed_by_counsel ?? false,
      },
    });
    edges.push({
      source: inventoryNodeId,
      target: privacyNodeId,
      label: "discloses inventory in notice",
    });
    edges.push({
      source: vendorNodeId,
      target: privacyNodeId,
      label: "discloses subprocessors in notice",
    });

    if (!privacyPolicy) {
      unresolvedGaps.push("No published Privacy Policy found. Generate and publish a DPDP statutory notice.");
    } else if (!privacyPolicy.reviewed_by_counsel) {
      unresolvedGaps.push("Privacy Policy lacks legal counsel sign-off approval.");
    }

    // Node 6: Statutory Cookie Policy
    const cookiePolicy = cookieRes.data;
    const cookieNodeId = `policy-cookie-${company.id}`;
    nodes.push({
      id: cookieNodeId,
      type: "policy",
      label: `Cookie Policy (v${cookiePolicy?.version ?? 0})`,
      status: cookiePolicy ? "healthy" : "warning",
      details: {
        version: cookiePolicy?.version ?? 0,
        publishedAt: cookiePolicy?.published_at,
      },
    });
    edges.push({
      source: scanNodeId,
      target: cookieNodeId,
      label: "populates cookie table from scan",
    });

    if (!cookiePolicy) {
      unresolvedGaps.push("No published Cookie Policy found. Generate cookie disclosure policy.");
    }

    return {
      nodes,
      edges,
      unresolvedGaps,
    };
  });
}

export const complianceRelationshipService = new ComplianceRelationshipService();
