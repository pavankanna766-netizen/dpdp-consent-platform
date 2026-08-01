import {
  createCookiePolicy,
  latestCookiePolicy,
  updateCookiePolicy,
  listCookiePolicyVersions,
  getPublishedCookiePolicy,
  getCookiePolicyById,
} from "@/repositories/cookie-policy.repository";

import { unifiedPolicyComposerService } from "./unified-policy-composer.service";

export class CookiePolicyDocumentService {
  async generate(
    _scanId: string,
    company: {
      id: string;
      name: string;
      website: string;
    }
  ) {
    const html = await unifiedPolicyComposerService.generateCookiePolicy(company.id);
    return latestCookiePolicy(company.id);
  }

  latest(companyId: string) {
    return latestCookiePolicy(companyId);
  }

  async publish(companyId: string, id: string) {
    const { data, error } = await getCookiePolicyById(companyId, id);
    if (error || !data || data.company_id !== companyId) {
      throw new Error("Policy not found or unauthorized");
    }

    if (!data.reviewed_by_counsel) {
      throw new Error(
        "Policy cannot be published without legal counsel review approval (reviewed_by_counsel must be true)"
      );
    }

    return updateCookiePolicy(companyId, id, {
      status: "published",
      published_at: new Date().toISOString(),
    });
  }

  versions(companyId: string) {
    return listCookiePolicyVersions(companyId);
  }

  published(companyId: string) {
    return getPublishedCookiePolicy(companyId);
  }
}

export const cookiePolicyDocumentService = new CookiePolicyDocumentService();