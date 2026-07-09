import { ApiClient } from "./api";

export class ConsentService {
  constructor(
    private readonly api: ApiClient
  ) {}

  private normalizeVisitorId(
    visitorId: string
  ) {
    return visitorId.startsWith("ps_v_")
      ? visitorId
      : `ps_v_${visitorId}`;
  }

  async accept(
    templateToken: string,
    visitorId: string
  ) {
    return this.api.submitConsent({
      templateToken,

      visitorId:
        this.normalizeVisitorId(
          visitorId
        ),

      decision: "accept",

      language: "en",

      categories: {
        analytics: true,
        marketing: true,
        preferences: true,
      },
    });
  }

  async reject(
    templateToken: string,
    visitorId: string
  ) {
    return this.api.submitConsent({
      templateToken,

      visitorId:
        this.normalizeVisitorId(
          visitorId
        ),

      decision: "reject",

      language: "en",

      categories: {
        analytics: false,
        marketing: false,
        preferences: false,
      },
    });
  }
}