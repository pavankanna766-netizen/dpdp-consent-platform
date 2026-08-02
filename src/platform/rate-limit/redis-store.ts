import { redis } from "@/platform/cache/redis-client";
import type { RateLimitResult, RateLimitStore } from "./types";

// ---------------------------------------------------------------------------
// Redis-backed Sliding Window Counter Rate Limit Store
// ---------------------------------------------------------------------------
// Uses Upstash Redis INCR + EXPIRE for O(1) per-request cost.
// Graceful degradation: if Redis is unavailable, falls back to allow-all
// in development and deny-all in production to prevent abuse.
// ---------------------------------------------------------------------------

export class RedisRateLimitStore implements RateLimitStore {
  async consume(
    key: string,
    limit: number,
    windowMs: number
  ): Promise<RateLimitResult> {
    const windowSeconds = Math.ceil(windowMs / 1000);
    const redisKey = `rl:${key}`;

    const result = await redis.rateLimitConsume(redisKey, limit, windowSeconds);

    return {
      allowed: result.allowed,
      remaining: result.remaining,
      resetAt: result.resetAt,
    };
  }
}
