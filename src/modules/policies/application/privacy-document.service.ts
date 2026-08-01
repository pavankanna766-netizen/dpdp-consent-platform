import {
  createPrivacyPolicy,
  getLatestPrivacyPolicy,
  updatePrivacyPolicy,
  archivePrivacyPolicy,
  getPrivacyPolicyById,
  listPolicyVersions,
  getPublishedPrivacyPolicy,
} from "@/repositories/privacy-policy.repository";

import { unifiedPolicyComposerService } from "./unified-policy-composer.service";
import type { LegalProfile } from "../domain/legal-profile";

export class PrivacyDocumentService {
  create(companyId: string, html: string) {
    return createPrivacyPolicy({
      company_id: companyId,
      html_content: html,
    });
  }

  latest(companyId: string) {
    return getLatestPrivacyPolicy(companyId);
  }

  published(companyId: string) {
    return getPublishedPrivacyPolicy(companyId);
  }

  versions(companyId: string) {
    return listPolicyVersions(companyId);
  }

  archive(companyId: string, id: string) {
    return archivePrivacyPolicy(companyId, id);
  }

  async restore(companyId: string, id: string) {
    const { data, error } = await getPrivacyPolicyById(companyId, id);

    if (error || !data || data.company_id !== companyId) {
      throw error ?? new Error("Policy not found or unauthorized");
    }

    return updatePrivacyPolicy(companyId, id, {
      archived: false,
      status: "published",
      published_at: new Date().toISOString(),
    });
  }

  async publish(companyId: string, id: string) {
    const { data, error } = await getPrivacyPolicyById(companyId, id);
    if (error || !data || data.company_id !== companyId) {
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

  async generate(companyId: string, _profile?: LegalProfile) {
    const html = await unifiedPolicyComposerService.generatePrivacyPolicy(companyId);
    return getLatestPrivacyPolicy(companyId);
  }
}

export const privacyDocumentService = new PrivacyDocumentService();