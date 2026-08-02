import crypto from "crypto";
import { ApiClient } from "./api";

export interface PrivyStackClientOptions {
  apiKey?: string;
  token?: string;
  baseUrl?: string;
}

export class PrivyStackClient {
  private apiKey: string;
  private token: string;
  private baseUrl: string;
  private api: ApiClient;

  constructor(options: PrivyStackClientOptions) {
    this.apiKey = options.apiKey || options.token || "";
    this.token = options.token || options.apiKey || "";
    this.baseUrl = options.baseUrl || "https://privystack.com/api/v1";
    this.api = new ApiClient(this.baseUrl);
  }

  async init() {
    return this;
  }

  getApi() {
    return this.api;
  }

  getConfig() {
    return {
      apiKey: this.apiKey,
      token: this.token,
      baseUrl: this.baseUrl,
    };
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
        ...options.headers,
      },
    });

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(`PrivyStack API Error (${res.status}): ${errBody.error || res.statusText}`);
    }

    return res.json() as Promise<T>;
  }

  async getLatestScan() {
    return this.request<{ scan: unknown }>("/scanner/latest");
  }

  async getPublishedPolicies() {
    return this.request<{ policies: unknown }>("/policies");
  }

  static verifyWebhookSignature(payloadString: string, signatureHeader: string, secret: string): boolean {
    try {
      const parts = signatureHeader.split(",");
      const timestampPart = parts.find((p) => p.startsWith("t="));
      const sigPart = parts.find((p) => p.startsWith("v1="));

      if (!timestampPart || !sigPart) return false;

      const timestamp = parseInt(timestampPart.replace("t=", ""), 10);
      const signature = sigPart.replace("v1=", "");

      const expectedSig = crypto
        .createHmac("sha256", secret)
        .update(`${timestamp}.${payloadString}`)
        .digest("hex");

      return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig));
    } catch {
      return false;
    }
  }
}