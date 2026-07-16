import type {
  DetectionInput,
  DetectionResult,
  DetectionEvidence,
} from "../../domain/detection";

import type {
  TrackerDefinition,
} from "../../domain/tracker";

function matchesPattern(
  value: string,
  pattern: string,
  isSubstringMatch = false
) {
  const val = value.toLowerCase();
  const pat = pattern.toLowerCase();

  if (isSubstringMatch) {
    if (!pat.includes("*")) {
      return val.includes(pat);
    }
    const regex = new RegExp(pat.replace(/\*/g, ".*"), "i");
    return regex.test(val);
  } else {
    if (!pat.includes("*")) {
      return val === pat;
    }
    const regex = new RegExp("^" + pat.replace(/\*/g, ".*") + "$", "i");
    return regex.test(val);
  }
}

export function matchTracker(
  tracker: TrackerDefinition,
  input: DetectionInput
): DetectionResult | null {
  const matchedBy: (
    | "cookie"
    | "script"
    | "request"
  )[] = [];

  const evidence: DetectionEvidence[] =
    [];

  let confidence = 0;

  // Cookie evidence
  const matchedCookie =
    input.cookies.find((cookie) =>
      tracker.cookies.some((pattern) =>
        matchesPattern(
          cookie,
          pattern,
          false
        )
      )
    );

  if (matchedCookie) {
    matchedBy.push("cookie");

    evidence.push({
      type: "cookie",

      value: matchedCookie,

      pattern:
        tracker.cookies.find((pattern) =>
          matchesPattern(
            matchedCookie,
            pattern,
            false
          )
        )!,

      strategy:
        tracker.cookies.find((pattern) =>
          pattern.includes("*")
        )
          ? "wildcard"
          : "exact",

      weight: 45,
    });
    confidence += 45;
  }

  // Script evidence
  const matchedScript =
    input.scripts.find((url) =>
      tracker.scripts.some((pattern) =>
        matchesPattern(url, pattern, true)
      )
    );

  if (matchedScript) {
    matchedBy.push("script");

    evidence.push({
      type: "script",

      value: matchedScript,

      pattern:
        tracker.scripts.find((pattern) =>
          matchesPattern(
            matchedScript,
            pattern,
            true
          )
        )!,

      strategy: "contains",

      weight: 30,
    });

    confidence += 30;
  }

  // Network evidence
  const matchedRequest =
    input.requests.find((url) =>
      tracker.domains.some((pattern) =>
        matchesPattern(url, pattern, true)
      )
    );

  if (matchedRequest) {
    matchedBy.push("request");

    evidence.push({
      type: "request",

      value: matchedRequest,

      pattern:
        tracker.domains.find((pattern) =>
          matchesPattern(
            matchedRequest,
            pattern,
            true
          )
        )!,

      strategy: "contains",

      weight: 25,
    });
    confidence += 25;
  }

  if (matchedBy.length === 0) {
    return null;
  }

  return {
    tracker,

    confidence: Math.min(
      confidence,
      100
    ),

    matchedBy,

    evidence,
  };
}