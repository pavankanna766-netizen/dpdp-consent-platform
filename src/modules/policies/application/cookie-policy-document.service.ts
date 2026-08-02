import {
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
    await unifiedPolicyComposerService.generateCookiePolicy(company.id);
    return latestCookiePolicy(company.id);
  }

  latest(companyId: string) {
    return latestCookiePolicy(companyId);
  }

  async publish(companyId: string, id: string) {
    const { data, error } = await getCookiePolicyById(companyId, id);

    if (error || !data) {
      return { data: null, error };
    }

    return updateCookiePolicy(companyId, id, {
      status: "published",
      published_at: new Date().toISOString(),
    });
  }

  versions(companyId: string) {
    return listCookiePolicyVersions(companyId);
  }

  getPublished(companyId: string) {
    return getPublishedCookiePolicy(companyId);
  }
}

export const cookiePolicyDocumentService = new CookiePolicyDocumentService();