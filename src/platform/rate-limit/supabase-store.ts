import { supabaseAdmin } from "@/lib/supabase/admin";
import { logger } from "@/platform/logger";
import type { RateLimitResult, RateLimitStore } from "./types";

export class SupabaseRateLimitStore implements RateLimitStore {
  async consume(
    key: string,
    limit: number,
    windowMs: number
  ): Promise<RateLimitResult> {
    const { data, error } = await supabaseAdmin.rpc("consume_rate_limit_token", {
      p_key: key,
      p_limit: limit,
      p_window_ms: windowMs,
    });

    interface RateLimitRow {
      allowed: boolean;
      remaining: number;
      reset_at: number;
    }

    if (error || !data || (data as unknown as RateLimitRow[]).length === 0) {
      const isDev = process.env.NODE_ENV !== "production";
      logger.error("[RateLimit] Database rate limit consume failed, falling back to", { isDev, error });
      return {
        allowed: isDev,
        remaining: isDev ? limit : 0,
        resetAt: Date.now() + windowMs,
      };
    }

    const result = (data as unknown as RateLimitRow[])[0];
    return {
      allowed: result.allowed,
      remaining: result.remaining,
      resetAt: Number(result.reset_at),
    };
  }
}
