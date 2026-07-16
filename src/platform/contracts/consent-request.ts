import type { ConsentCategories } from "./consent-record";

export interface ConsentRequest {
  templateToken: string;

  visitorId: string;

  decision:
    | "accept"
    | "reject"
    | "withdraw";

  language: string;

  categories: ConsentCategories;

  metadata?: {
    pageUrl?: string;

    referrer?: string;

    bannerVersion?: number;

    policyVersion?: number;
  };
}
