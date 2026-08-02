import { redis } from "@/platform/cache/redis-client";
import { RedisRateLimitStore } from "./redis-store";
import { SupabaseRateLimitStore } from "./supabase-store";
import { MemoryRateLimitStore } from "./memory-store";
import type { RateLimitStore } from "./types";
import { logger } from "@/platform/logger";

// ---------------------------------------------------------------------------
// RateLimitEngine — Cascading store selection
// ---------------------------------------------------------------------------
// Priority: Redis → Supabase RPC → In-Memory (dev only)
// The engine evaluates the available store at construction time and
// logs which backend is active.
// ---------------------------------------------------------------------------

export class RateLimitEngine {
  private readonly store: RateLimitStore;

  constructor() {
    if (redis.isConfigured) {
      this.store = new RedisRateLimitStore();
      logger.info("[RateLimit] Using Redis-backed rate limiting (Upstash).");
    } else {
      this.store = new SupabaseRateLimitStore();
      logger.info("[RateLimit] Redis not configured — using Supabase RPC rate limiting.");
    }
  }

  private readonly memoryFallback = new MemoryRateLimitStore();

  async consume(key: string, limit: number, windowMs: number) {
    try {
      return await this.store.consume(key, limit, windowMs);
    } catch {
      logger.warn("[RateLimit] Primary store failed, falling back to in-memory store.");
      return this.memoryFallback.consume(key, limit, windowMs);
    }
  }
}

export const rateLimitEngine = new RateLimitEngine();