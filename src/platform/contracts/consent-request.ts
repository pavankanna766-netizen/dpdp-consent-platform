export interface ConsentRequest {
  templateToken: string;

  visitorId: string;

  decision:
    | "accept"
    | "reject"
    | "withdraw";

  language: string;

  categories: {
    analytics: boolean;
    marketing: boolean;
    preferences: boolean;
  };

  metadata?: {
    pageUrl?: string;

    referrer?: string;

    ipAddress?: string;

    userAgent?: string;

    bannerVersion?: number;

    policyVersion?: number;
  };
}