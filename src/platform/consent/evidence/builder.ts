import type {
  ConsentEvidencePolicy,
} from "../evidence-policy";

import { sha256 } from "@/platform/security";
import type { ConsentCategories } from "@/platform/contracts";

function simplifyUserAgent(
  userAgent: string
) {
  if (
    userAgent.includes("Chrome")
  ) {
    return "Chrome";
  }

  if (
    userAgent.includes("Firefox")
  ) {
    return "Firefox";
  }

  if (
    userAgent.includes("Safari")
  ) {
    return "Safari";
  }

  if (
    userAgent.includes("Edge")
  ) {
    return "Edge";
  }

  return "Unknown";
}

export interface EvidenceInput {
  ipAddress?: string;

  userAgent?: string;

  language?: string;

  pageUrl?: string;

  referrer?: string;

  bannerVersion?: number;

  policyVersion?: number;

  purpose?: string;

  categories?: ConsentCategories;
}

export interface BuiltEvidence {
  ipAddress?: string;

  userAgent?: string;

  language?: string;

  metadata: Record<string, unknown>;

  proof: Record<string, unknown>;
}

export function buildEvidence(
  input: EvidenceInput,
  policy: ConsentEvidencePolicy
): BuiltEvidence {
  const metadata: Record<string, unknown> = {};

  const proof: Record<string, unknown> = {};

  if (input.purpose) {
    metadata.purpose = input.purpose;
  }

  if (input.categories) {
    metadata.categories = input.categories;
  }

  if (policy.storePageUrl && input.pageUrl) {
    metadata.pageUrl = input.pageUrl;
  }

  if (policy.storeReferrer && input.referrer) {
    metadata.referrer = input.referrer;
  }

  if (policy.storeBannerVersion && input.bannerVersion) {
    metadata.bannerVersion = input.bannerVersion;
  }

  if (policy.storePolicyVersion && input.policyVersion) {
    metadata.policyVersion = input.policyVersion;
  }

  return {
 ipAddress:
  policy.ipStorage === "raw"
    ? input.ipAddress
    : policy.ipStorage === "hashed"
      ? input.ipAddress
        ? sha256(input.ipAddress)
        : undefined
      : undefined,

  userAgent:
    policy.userAgentStorage === "full"
      ? input.userAgent
      : policy.userAgentStorage ===
          "browser"
        ? input.userAgent
          ? simplifyUserAgent(
              input.userAgent
            )
          : undefined
        : undefined,

  language:
    policy.storeLanguage
      ? input.language
      : undefined,

  metadata,

  proof,
};
}
