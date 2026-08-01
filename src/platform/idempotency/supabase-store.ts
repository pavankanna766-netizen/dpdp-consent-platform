import { supabaseAdmin } from "@/lib/supabase/admin";
import { logger } from "@/platform/logger";
import type { IdempotencyResult, IdempotencyStore } from "./types";

export class SupabaseIdempotencyStore implements IdempotencyStore {
  async execute<T>(
    key: string,
    ttlMs: number,
    operation: () => Promise<T>
  ): Promise<IdempotencyResult<T>> {
    // 1. Check for existing and valid key
    const { data: existing, error: fetchError } = await supabaseAdmin
      .from("idempotency_keys")
      .select("*")
      .eq("key", key)
      .maybeSingle();

    if (!fetchError && existing) {
      const expiresAt = new Date(existing.expires_at).getTime();
      if (expiresAt > Date.now()) {
        return {
          executed: false,
          value: existing.response as T,
        };
      }
    }

    // 2. Execute the operation
    const value = await operation();

    // 3. Store result in database
    const expiresAtStr = new Date(Date.now() + ttlMs).toISOString();
    const { error: insertError } = await supabaseAdmin
      .from("idempotency_keys")
      .upsert({
        key,
        response: value as never,
        expires_at: expiresAtStr,
      });

    if (insertError) {
      logger.error("[Idempotency] Failed to save idempotency key:", insertError);
    }

    return {
      executed: true,
      value,
    };
  }
}
