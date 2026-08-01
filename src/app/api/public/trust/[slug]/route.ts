import { NextResponse } from "next/server";
import { getCompanyBySlug } from "@/repositories/company-slug.repository";
import { getTrustCenterByCompanyId } from "@/repositories/trust-center.repository";
import { getPublishedPrivacyPolicy } from "@/repositories/privacy-policy.repository";
import { getPublishedCookiePolicy } from "@/repositories/cookie-policy.repository";
import { listVendors } from "@/repositories/vendor.repository";
import { getLatestScan } from "@/repositories/scanner.repository";
import { getConsentStatsFromDb } from "@/repositories/consent.repository";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const companyRes = await getCompanyBySlug(slug);
    if (!companyRes.data) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    const company = companyRes.data;
    const companyId = company.id;

    const [
      trustCenterRes,
      privacyRes,
      cookieRes,
      vendorsRes,
      latestScanRes,
      consentStatsRes,
    ] = await Promise.all([
      getTrustCenterByCompanyId(companyId),
      getPublishedPrivacyPolicy(companyId),
      getPublishedCookiePolicy(companyId),
      listVendors(companyId),
      getLatestScan(companyId),
      getConsentStatsFromDb(companyId),
    ]);

    const trustCenter = trustCenterRes.data;
    if (!trustCenter) {
      return NextResponse.json({ error: "Trust Center is private or disabled" }, { status: 404 });
    }

    const vendors = (vendorsRes.data || []).map((v) => ({
      name: v.name,
      category: v.category || "Data Processor",
      country: v.country || "United States",
      dpaStatus: v.dpa_uploaded ? "Executed DPA" : "Standard Agreement",
      sccEnforced: v.scc_required,
    }));

    const scan = latestScanRes.data;
    const consentStats = consentStatsRes.data;

    return NextResponse.json({
      company: {
        name: company.company_name,
        website: company.website,
        industry: company.industry,
        country: company.country,
      },
      trustPortal: {
        headline: trustCenter.headline,
        description: trustCenter.description,
        brandColor: trustCenter.brand_color,
        logoUrl: trustCenter.logo_url,
        securityEmail: trustCenter.security_email,
        dpoName: trustCenter.dpo_name,
        dpoEmail: trustCenter.dpo_email,
        certifications: trustCenter.security_certifications || [],
        systemStatus: trustCenter.system_status,
      },
      metrics: {
        privacyScore: scan?.overall_score ?? 100,
        activeConsents: consentStats?.total_granted ?? 0,
        completedScans: scan ? 1 : 0,
        lastAuditDate: scan?.completed_at || scan?.created_at || new Date().toISOString(),
      },
      disclosures: {
        privacyPolicy: privacyRes.data
          ? { version: privacyRes.data.version, publishedAt: privacyRes.data.published_at, url: `/p/${slug}/privacy` }
          : null,
        cookiePolicy: cookieRes.data
          ? { version: cookieRes.data.version, publishedAt: cookieRes.data.published_at, url: `/p/${slug}/cookies` }
          : null,
      },
      subprocessors: vendors,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
