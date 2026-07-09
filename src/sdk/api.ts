export interface SubmitConsentRequest {
  templateToken: string;

  visitorId: string;

  decision: "accept" | "reject";

  language: string;

  categories: {
    analytics: boolean;
    marketing: boolean;
    preferences: boolean;
  };

  metadata?: Record<string, unknown>;
}

export class ApiClient {
  constructor(
    private readonly baseUrl: string
  ) {}

  async post<TResponse>(
    path: string,
    body: unknown
  ): Promise<TResponse> {
    const response = await fetch(
      `${this.baseUrl}${path}`,
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      const text =
        await response.text();

      throw new Error(
        `HTTP ${response.status}: ${text}`
      );
    }

    return response.json();
  }

  async get<TResponse>(
    path: string
  ): Promise<TResponse> {
    const response = await fetch(
      `${this.baseUrl}${path}`
    );

    if (!response.ok) {
      const text =
        await response.text();

      throw new Error(
        `HTTP ${response.status}: ${text}`
      );
    }

    return response.json();
  }

  async submitConsent(
    body: SubmitConsentRequest
  ) {
    return this.post(
      "/consent",
      body
    );
  }
}