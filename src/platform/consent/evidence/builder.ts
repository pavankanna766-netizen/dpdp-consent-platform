import type {
  ConsentEvidencePolicy,
} from "../evidence-policy";

import { sha256 } from "@/platform/security";

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

  bannerVersion?: string;

  policyVersion?: number;
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
  const metadata: Record<
    string,
    unknown
  > = {};

  const proof: Record<
    string,
    unknown
  > = {};

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