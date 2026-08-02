import {
  getLatestPrivacyPolicy,
  updatePrivacyPolicy,
  listPolicyVersions,
  getPublishedPrivacyPolicy,
  getPrivacyPolicyById,
} from "@/repositories/privacy-policy.repository";

import { unifiedPolicyComposerService } from "./unified-policy-composer.service";

export class PrivacyDocumentService {
  latest(companyId: string) {
    return getLatestPrivacyPolicy(companyId);
  }

  versions(companyId: string) {
    return listPolicyVersions(companyId);
  }

  getPublished(companyId: string) {
    return getPublishedPrivacyPolicy(companyId);
  }

  async restoreVersion(companyId: string, versionId: string) {
    const { data, error } = await getPrivacyPolicyById(companyId, versionId);

    if (error || !data) {
      return { data: null, error };
    }

    return updatePrivacyPolicy(companyId, versionId, {
      status: "published",
      published_at: new Date().toISOString(),
    });
  }

  async publish(companyId: string, id: string) {
    const { data, error } = await getPrivacyPolicyById(companyId, id);

    if (error || !data) {
      throw new Error("Policy not found or unauthorized");
    }

    if (!data.reviewed_by_counsel) {
      throw new Error(
        "Policy cannot be published without legal counsel review approval (reviewed_by_counsel must be true)"
      );
    }

    return updatePrivacyPolicy(companyId, id, {
      status: "published",
      published_at: new Date().toISOString(),
    });
  }

  async generate(companyId: string) {
    await unifiedPolicyComposerService.generatePrivacyPolicy(companyId);
    return getLatestPrivacyPolicy(companyId);
  }
}

export const privacyDocumentService = new PrivacyDocumentService();