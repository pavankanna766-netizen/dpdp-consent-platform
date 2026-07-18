import { supabaseAdmin } from "@/lib/supabase/admin";
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

    if (error || !data || (data as any[]).length === 0) {
      console.error("[RateLimit] Database rate limit consume failed, falling back to allow:", error);
      // Fallback in case of database connectivity issues
      return {
        allowed: true,
        remaining: limit,
        resetAt: Date.now() + windowMs,
      };
    }

    const result = (data as any[])[0];
    return {
      allowed: result.allowed,
      remaining: result.remaining,
      resetAt: Number(result.reset_at),
    };
  }
}
