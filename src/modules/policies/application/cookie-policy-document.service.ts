import {
  createCookiePolicy,
  latestCookiePolicy,
  updateCookiePolicy,
  listCookiePolicyVersions,
  getPublishedCookiePolicy,
  getCookiePolicyById,
} from "@/repositories/cookie-policy.repository";

import {
  cookiePolicyGeneratorService,
} from "./cookie-policy-generator.service";

export class CookiePolicyDocumentService {
  async generate(
    scanId: string,
    company: {
      id: string;
      name: string;
      website: string;
    }
  ) {
    const policy =
      await cookiePolicyGeneratorService.generate(
        company.id,
        scanId,
        {
          name: company.name,
          website: company.website,
        }
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

    return createCookiePolicy({
      company_id: company.id,
      html_content: html,
    });
  }

  latest(
    companyId: string
  ) {
    return latestCookiePolicy(
      companyId
    );
  }

  async publish(
    companyId: string,
    id: string
  ) {
    const { data, error } = await getCookiePolicyById(id);
    if (error || !data || data.company_id !== companyId) {
      throw new Error("Policy not found or unauthorized");
    }

    return updateCookiePolicy(
      id,
      {
        status: "published",
        published_at:
          new Date().toISOString(),
      }
    );
  }

versions(
  companyId: string
) {
  return listCookiePolicyVersions(
    companyId
  );
}

published(
  companyId: string
) {
  return getPublishedCookiePolicy(
    companyId
  );
}

}

export const cookiePolicyDocumentService =
  new CookiePolicyDocumentService();