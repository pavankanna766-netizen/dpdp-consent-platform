import type {
  RateLimitResult,
  RateLimitStore,
} from "./types";

type Entry = {
  count: number;

  resetAt: number;
};

export class MemoryRateLimitStore
  implements RateLimitStore
{
  private readonly cache =
    new Map<string, Entry>();

  async consume(
    key: string,
    limit: number,
    windowMs: number
  ): Promise<RateLimitResult> {
    const now = Date.now();

    let entry =
      this.cache.get(key);

    if (
      !entry ||
      entry.resetAt <= now
    ) {
      entry = {
        count: 0,
        resetAt:
          now + windowMs,
      };

      this.cache.set(
        key,
        entry
      );
    }

    entry.count++;

    return {
      allowed:
        entry.count <= limit,

      remaining: Math.max(
        0,
        limit - entry.count
      ),

      resetAt: entry.resetAt,
    };
  }
}