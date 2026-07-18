import {
  SupabaseIdempotencyStore,
} from "./supabase-store";

import type {
  IdempotencyStore,
} from "./types";

export class IdempotencyEngine {
  private readonly store: IdempotencyStore;

  constructor() {
    this.store =
      new SupabaseIdempotencyStore();
  }

  execute<T>(
    key: string,
    ttlMs: number,
    operation: () => Promise<T>
  ) {
    return this.store.execute(
      key,
      ttlMs,
      operation
    );
  }
}

export const idempotencyEngine =
  new IdempotencyEngine();