import {
  cmpLibrary,
} from "./library";

import type {
  CMPDetection,
} from "../../domain/cmp";

export function detectCMP(
  scripts: string[],
  requests: string[]
): CMPDetection | null {
  for (const cmp of cmpLibrary) {
    const matchedBy: (
      | "script"
      | "request"
    )[] = [];

    if (
      cmp.scripts.some(
        (script) =>
          scripts.some((url) =>
            url.includes(script)
          )
      )
    ) {
      matchedBy.push(
        "script"
      );
    }

    if (
      cmp.domains.some(
        (domain) =>
          requests.some((url) =>
            url.includes(domain)
          )
      )
    ) {
      matchedBy.push(
        "request"
      );
    }

    if (
      matchedBy.length >
      0
    ) {
      return {
        cmp,

        matchedBy,

        confidence:
          matchedBy.length ===
          2
            ? 100
            : 75,
      };
    }
  }

  return null;
}