import {
  summaryService,
} from "./summary.service";

import type {
  CookieInventoryItem,
} from "../domain/cookie-inventory";

export class CookieInventoryService {
  async get(
    companyId: string,
    scanId: string
  ): Promise<
    CookieInventoryItem[]
  > {
    const summary =
      await summaryService.get(
        companyId,
        scanId
      );

    return summary.detections.map(
      (item) => ({
        name:
          item.name,

        provider:
          item.provider,

        category:
          item.category,

        purpose:
          item.purpose ??
          "Website functionality",

        duration:
          item.duration ??
          "Unknown",

        firstParty:
          item.provider ===
          "First Party",
      })
    );
  }
}

export const cookieInventoryService =
  new CookieInventoryService();