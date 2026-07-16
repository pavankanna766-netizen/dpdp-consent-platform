import { findCompanyById } from "@/repositories/company.repository";
import { trustCenterService } from "./trust-center.service";
import { privacyDocumentService, cookiePolicyDocumentService } from "@/modules/policies";
import { latestSummaryService } from "@/modules/scanner";
import { bannerService } from "@/modules/banner";

export class DashboardAggregationService {
  async getAggregatedData(companyId: string) {
    const [
      companyResult,
      trustCenter,
      latestSummary,
      privacy,
      cookies,
      banners
    ] = await Promise.all([
      findCompanyById(companyId),
      trustCenterService.ensure(companyId),
      latestSummaryService.get(companyId),
      privacyDocumentService.latest(companyId),
      cookiePolicyDocumentService.latest(companyId),
      bannerService.list(companyId)
    ]);

    const company = companyResult.data;
    if (!company) {
      throw new Error("Company not found");
    }

    const privacyScore = latestSummary?.dashboard?.score ?? 100;
    const banner = banners.data && banners.data.length > 0 ? banners.data[0] : null;

    const publicLinks = {
      privacyPolicy: company.slug ? `/p/${company.slug}/privacy` : null,
      cookiePolicy: company.slug ? `/p/${company.slug}/cookies` : null,
      trustCenter: company.slug ? `/p/${company.slug}/trust` : null,
    };

    return {
      company: {
        id: company.id,
        company_name: company.company_name,
        website: company.website,
        slug: company.slug,
        industry: company.industry,
        company_size: company.company_size,
        country: company.country,
        timezone: company.timezone,
        is_onboarded: company.is_onboarded,
      },
      trustCenter: {
        headline: trustCenter.headline,
        description: trustCenter.description,
      },
      latestSummary,
      privacyScore,
      privacy: privacy.data,
      cookies: cookies.data,
      banner,
      publicLinks,
    };
  }
}

export const dashboardAggregationService = new DashboardAggregationService();
