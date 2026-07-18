import {
  createPrivacyPolicy,
  getLatestPrivacyPolicy,
  updatePrivacyPolicy,
  archivePrivacyPolicy,
  getPrivacyPolicyById,
  listPolicyVersions,
} from "@/repositories/privacy-policy.repository";

import {
  privacyPolicyService,
} from "./privacy-policy.service";

import type {
  LegalProfile,
} from "../domain/legal-profile";



export class PrivacyDocumentService {
  create(
  companyId: string,
  html: string
) {
  return createPrivacyPolicy({
    company_id: companyId,

    html_content: html,
  });
}
  latest(
    companyId: string
  ) {
    return getLatestPrivacyPolicy(
      companyId
    );
  }

  versions(
  companyId: string
) {
  return listPolicyVersions(
    companyId
  );
}

archive(
  id: string
) {
  return archivePrivacyPolicy(
    id
  );
}

async restore(
  companyId: string,
  id: string
) {
  const {
    data,
    error,
  } =
    await getPrivacyPolicyById(
      id
    );

  if (
    error ||
    !data ||
    data.company_id !== companyId
  ) {
    throw error ??
      new Error(
        "Policy not found or unauthorized"
      );
  }

  return updatePrivacyPolicy(
    id,
    {
      archived: false,
      status: "published",
      published_at:
        new Date().toISOString(),
    }
  );
}

  async publish(
    companyId: string,
    id: string
  ) {
    const { data, error } = await getPrivacyPolicyById(id);
    if (error || !data || data.company_id !== companyId) {
      throw new Error("Policy not found or unauthorized");
    }

    if (!data.reviewed_by_counsel) {
      throw new Error("Policy cannot be published without legal counsel review approval (reviewed_by_counsel must be true)");
    }

    return updatePrivacyPolicy(
      id,
      {
        status: "published",
        published_at:
          new Date().toISOString(),
      }
    );
  }

  async generate(
  companyId: string,
  profile: LegalProfile
) {
  const policy =
    privacyPolicyService.generate(
      profile
    );

  const html =
    policy.sections
      .map(
        (section) => `
<h2>${section.title}</h2>
<p>${section.content}</p>
`
      )
      .join("\n");


  return this.create(
    companyId,
    html
  );
}
}

export const privacyDocumentService =
  new PrivacyDocumentService();