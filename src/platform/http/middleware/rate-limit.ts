import { rateLimitEngine } from "@/platform/rate-limit";

import type {
  Middleware,
} from "./types";

export function rateLimitMiddleware(
  limit: number,
  windowMs: number
): Middleware<unknown> {
  return async (context) => {
    const result =
      await rateLimitEngine.consume(
        context.clientIp,
        limit,
        windowMs
      );

    if (!result.allowed) {
      throw new Error(
        "RATE_LIMIT_EXCEEDED"
      );
    }
  };
}