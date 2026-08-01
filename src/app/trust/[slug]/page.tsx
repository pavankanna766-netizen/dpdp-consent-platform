import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCompanyBySlug } from "@/repositories/company-slug.repository";
import { getTrustCenterByCompanyId } from "@/repositories/trust-center.repository";
import { getPublishedPrivacyPolicy } from "@/repositories/privacy-policy.repository";
import { getPublishedCookiePolicy } from "@/repositories/cookie-policy.repository";
import { listVendors } from "@/repositories/vendor.repository";
import { listInventoryItems } from "@/repositories/inventory.repository";
import { getLatestScan } from "@/repositories/scanner.repository";
import { getConsentStatsFromDb } from "@/repositories/consent.repository";
import { seoService } from "@/services/seo.service";
import { EnterpriseTrustPortal } from "@/components/trust-center/enterprise-trust-portal";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const companyRes = await getCompanyBySlug(slug);
  if (!companyRes.data) return { title: "Company Not Found | PrivyStack" };

  const company = companyRes.data;
  const trustCenterRes = await getTrustCenterByCompanyId(company.id);
  const trustCenter = trustCenterRes.data;

  return seoService.generateTrustCenterMetadata({
    companyName: company.company_name,
    slug,
    description: trustCenter?.description || `Statutory DPDP Act 2023 compliance portal for ${company.company_name}.`,
    brandColor: trustCenter?.brand_color || "#4f46e5",
    logoUrl: trustCenter?.logo_url,
  });
}

export default async function PublicTrustPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const companyRes = await getCompanyBySlug(slug);
  if (!companyRes.data) notFound();

  const company = companyRes.data;
  const companyId = company.id;

  const [
    trustCenterRes,
    privacyRes,
    cookieRes,
    vendorsRes,
    inventoryRes,
    latestScanRes,
    consentStatsRes,
  ] = await Promise.all([
    getTrustCenterByCompanyId(companyId),
    getPublishedPrivacyPolicy(companyId),
    getPublishedCookiePolicy(companyId),
    listVendors(companyId),
    listInventoryItems(companyId),
    getLatestScan(companyId),
    getConsentStatsFromDb(companyId),
  ]);

  const trustCenter = trustCenterRes.data;
  if (!trustCenter) notFound();

  const vendors = (vendorsRes.data || []).map((v) => ({
    name: v.name,
    category: v.category || "Data Processor",
    country: v.country || "United States",
    dpaStatus: v.dpa_uploaded ? "Executed DPA" : "Standard Agreement",
    sccEnforced: v.scc_required,
  }));

  const inventory = (inventoryRes.data || []).map((i) => ({
    name: i.name,
    data_category: i.data_category,
    purpose: i.purpose,
    retention_period: i.retention_period,
    legal_basis: i.legal_basis,
  }));

  const scan = latestScanRes.data;
  const consentStats = consentStatsRes.data;

  return (
    <EnterpriseTrustPortal
      company={{
        company_name: company.company_name,
        website: company.website,
        slug,
      }}
      trustPortal={{
        headline: trustCenter.headline,
        description: trustCenter.description,
        brandColor: trustCenter.brand_color,
        logoUrl: trustCenter.logo_url,
        securityEmail: trustCenter.security_email,
        dpoName: trustCenter.dpo_name,
        dpoEmail: trustCenter.dpo_email,
        certifications: trustCenter.security_certifications || [],
        systemStatus: trustCenter.system_status,
        showVendors: trustCenter.show_vendors,
        showInventory: trustCenter.show_inventory,
        securityTxtContent: trustCenter.security_txt_content,
        faqItems: trustCenter.faq_items || [],
      }}
      metrics={{
        privacyScore: scan?.overall_score ?? 100,
        activeConsents: consentStats?.total_granted ?? 0,
        completedScans: scan ? 1 : 0,
        lastAuditDate: scan?.completed_at || scan?.created_at || new Date().toISOString(),
      }}
      disclosures={{
        privacyPolicy: privacyRes.data
          ? { version: privacyRes.data.version, publishedAt: privacyRes.data.published_at, url: `/p/${slug}/privacy` }
          : null,
        cookiePolicy: cookieRes.data
          ? { version: cookieRes.data.version, publishedAt: cookieRes.data.published_at, url: `/p/${slug}/cookies` }
          : null,
      }}
      subprocessors={vendors}
      inventory={inventory}
    />
  );
}
