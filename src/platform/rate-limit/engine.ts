import {
  SupabaseRateLimitStore,
} from "./supabase-store";

import type {
  RateLimitStore,
} from "./types";

export class RateLimitEngine {
  private readonly store: RateLimitStore;

  constructor() {
    this.store =
      new SupabaseRateLimitStore();
  }

  consume(
    key: string,
    limit: number,
    windowMs: number
  ) {
    return this.store.consume(
      key,
      limit,
      windowMs
    );
  }
}

export const rateLimitEngine =
  new RateLimitEngine();