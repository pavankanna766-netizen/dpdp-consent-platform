import { redis } from "./redis-client";

// ---------------------------------------------------------------------------
// Backward-compatible UpstashRedisCache wrapper
// ---------------------------------------------------------------------------
// Existing consumers import `redisCache` from this module.
// This facade now delegates to the production Upstash REST client
// while preserving the original API surface.
// ---------------------------------------------------------------------------

export class UpstashRedisCache {
  async get<T>(key: string): Promise<T | null> {
    return redis.get<T>(key);
  }

  async set(key: string, value: unknown, ttlSeconds: number = 300): Promise<void> {
    await redis.set(key, value, ttlSeconds);
  }

  async delete(key: string): Promise<void> {
    await redis.del(key);
  }

  async invalidatePattern(patternPrefix: string): Promise<void> {
    await redis.invalidatePattern(patternPrefix);
  }
}

export const redisCache = new UpstashRedisCache();
