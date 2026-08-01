import { findCompanyById } from "@/repositories/company.repository";
import { listInventoryItems } from "@/repositories/inventory.repository";
import { listVendors } from "@/repositories/vendor.repository";
import { getPublishedPrivacyPolicy } from "@/repositories/privacy-policy.repository";
import { getPublishedCookiePolicy } from "@/repositories/cookie-policy.repository";
import { getLatestScan } from "@/repositories/scanner.repository";
import { getConsentStatsFromDb } from "@/repositories/consent.repository";
import { getTrustCenterByCompanyId } from "@/repositories/trust-center.repository";

export interface ComplianceNode {
  id: string;
  type: "company" | "inventory" | "vendor" | "policy" | "scanner" | "consent" | "trust_center";
  label: string;
  status: "healthy" | "warning" | "error";
  details: Record<string, unknown>;
}

export interface ComplianceEdge {
  source: string;
  target: string;
  label: string;
}

export interface ComplianceGraphResponse {
  companyId: string;
  companyName: string;
  overallHealthScore: number;
  nodes: ComplianceNode[];
  edges: ComplianceEdge[];
  unresolvedGaps: string[];
  summary: {
    inventoryCount: number;
    vendorCount: number;
    privacyPolicyPublished: boolean;
    cookiePolicyPublished: boolean;
    latestScanScore: number | null;
    activeConsentsCount: number;
    trustCenterActive: boolean;
  };
}

export async function getComplianceGraph(
  companyId: string
): Promise<ComplianceGraphResponse> {
  const [
    companyRes,
    inventoryRes,
    vendorRes,
    privacyRes,
    cookieRes,
    latestScanRes,
    consentStatsRes,
    trustCenterRes,
  ] = await Promise.all([
    findCompanyById(companyId),
    listInventoryItems(companyId),
    listVendors(companyId),
    getPublishedPrivacyPolicy(companyId),
    getPublishedCookiePolicy(companyId),
    getLatestScan(companyId),
    getConsentStatsFromDb(companyId),
    getTrustCenterByCompanyId(companyId),
  ]);

  const company = companyRes.data;
  if (!company) {
    throw new Error("Company not found");
  }

  const inventoryItems = inventoryRes.data || [];
  const vendors = vendorRes.data || [];
  const privacyPolicy = privacyRes.data;
  const cookiePolicy = cookieRes.data;
  const latestScan = latestScanRes.data;
  const consentStats = consentStatsRes.data;
  const trustCenter = trustCenterRes.data;

  const nodes: ComplianceNode[] = [];
  const edges: ComplianceEdge[] = [];
  const unresolvedGaps: string[] = [];

  // Node 1: Company
  const companyNodeId = `company-${company.id}`;
  nodes.push({
    id: companyNodeId,
    type: "company",
    label: company.company_name,
    status: company.is_onboarded ? "healthy" : "warning",
    details: { website: company.website, industry: company.industry },
  });

  // Node 2: Data Inventory
  const inventoryNodeId = `inventory-${company.id}`;
  const unconfirmedInventory = inventoryItems.filter((i) => i.unconfirmed).length;
  nodes.push({
    id: inventoryNodeId,
    type: "inventory",
    label: `Data Inventory (${inventoryItems.length} items)`,
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
  const vendorNodeId = `vendor-${company.id}`;
  const unconfirmedVendors = vendors.filter((v) => v.unconfirmed).length;
  const missingDpaVendors = vendors.filter((v) => !v.dpa_uploaded).length;
  nodes.push({
    id: vendorNodeId,
    type: "vendor",
    label: `Vendor Registry (${vendors.length} processors)`,
    status: missingDpaVendors > 0 ? "warning" : "healthy",
    details: { count: vendors.length, missingDpa: missingDpaVendors },
  });
  edges.push({
    source: inventoryNodeId,
    target: vendorNodeId,
    label: "shares data with processors",
  });

  if (missingDpaVendors > 0) {
    unresolvedGaps.push(`${missingDpaVendors} vendors are missing executed Data Protection Agreements (DPAs).`);
  }

  // Node 4: Disclosures & Statutory Policies
  const policyNodeId = `policy-${company.id}`;
  const policiesHealthy = Boolean(privacyPolicy && cookiePolicy);
  nodes.push({
    id: policyNodeId,
    type: "policy",
    label: "Disclosures & Statutory Policies",
    status: policiesHealthy ? "healthy" : "error",
    details: {
      privacyPublished: Boolean(privacyPolicy),
      cookiePublished: Boolean(cookiePolicy),
    },
  });
  edges.push({
    source: vendorNodeId,
    target: policyNodeId,
    label: "disclosed in privacy notices",
  });

  if (!privacyPolicy) {
    unresolvedGaps.push("Privacy Policy is not published.");
  }
  if (!cookiePolicy) {
    unresolvedGaps.push("Cookie Policy is not published.");
  }

  // Node 5: Scanner Engine
  const scannerNodeId = `scanner-${company.id}`;
  const scanScore = latestScan?.overall_score ?? null;
  nodes.push({
    id: scannerNodeId,
    type: "scanner",
    label: scanScore !== null ? `Scanner Score: ${scanScore}/100` : "Scanner Audit Pending",
    status: scanScore === null ? "warning" : scanScore >= 80 ? "healthy" : "error",
    details: { latestScore: scanScore, lastScanAt: latestScan?.completed_at },
  });
  edges.push({
    source: policyNodeId,
    target: scannerNodeId,
    label: "audits public disclosures",
  });

  if (scanScore === null) {
    unresolvedGaps.push("No compliance scan has been completed for your primary domain.");
  } else if (scanScore < 80) {
    unresolvedGaps.push(`Latest compliance scan score (${scanScore}/100) is below target standard (80+).`);
  }

  // Node 6: Consent Management
  const consentNodeId = `consent-${company.id}`;
  const activeConsents = consentStats?.total_granted ?? 0;
  nodes.push({
    id: consentNodeId,
    type: "consent",
    label: `Consent Engine (${activeConsents} active receipts)`,
    status: activeConsents > 0 ? "healthy" : "warning",
    details: { activeConsents, totalRecords: consentStats?.total_records ?? 0 },
  });
  edges.push({
    source: scannerNodeId,
    target: consentNodeId,
    label: "enforces consent preferences",
  });

  // Node 7: Public Trust Center
  const trustNodeId = `trust-${company.id}`;
  nodes.push({
    id: trustNodeId,
    type: "trust_center",
    label: "Public Trust Center",
    status: trustCenter ? "healthy" : "warning",
    details: { headline: trustCenter?.headline || "Trust Portal" },
  });
  edges.push({
    source: consentNodeId,
    target: trustNodeId,
    label: "publishes live compliance metrics",
  });

  // Overall Health Score Calculation (Weighted 0-100)
  let healthScore = 0;
  if (company.is_onboarded) healthScore += 15;
  if (inventoryItems.length > 0 && unconfirmedInventory === 0) healthScore += 15;
  if (vendors.length > 0 && missingDpaVendors === 0) healthScore += 15;
  if (privacyPolicy) healthScore += 15;
  if (cookiePolicy) healthScore += 15;
  if (scanScore !== null) healthScore += Math.round((scanScore / 100) * 15);
  if (trustCenter) healthScore += 10;

  return {
    companyId: company.id,
    companyName: company.company_name,
    overallHealthScore: healthScore,
    nodes,
    edges,
    unresolvedGaps,
    summary: {
      inventoryCount: inventoryItems.length,
      vendorCount: vendors.length,
      privacyPolicyPublished: Boolean(privacyPolicy),
      cookiePolicyPublished: Boolean(cookiePolicy),
      latestScanScore: scanScore,
      activeConsentsCount: activeConsents,
      trustCenterActive: Boolean(trustCenter),
    },
  };
}
