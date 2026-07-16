import {
  cookieInventoryService,
} from "@/modules/scanner";

import {
  cookiePolicyService,
} from "./cookie-policy.service";

export class CookiePolicyGeneratorService {
  async generate(
    scanId: string,
    company: {
      name: string;
      website: string;
    }
  ) {
    const cookies =
  await cookieInventoryService.get(
    scanId
  );

    return cookiePolicyService.generate(
      {
        companyName:
          company.name,

        website:
          company.website,

        cookies,
      }
    );
  }
}

export const cookiePolicyGeneratorService =
  new CookiePolicyGeneratorService();