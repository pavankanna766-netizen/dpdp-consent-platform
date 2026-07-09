import {
  MemoryIdempotencyStore,
} from "./memory-store";

import type {
  IdempotencyStore,
} from "./types";

export class IdempotencyEngine {
  private readonly store: IdempotencyStore;

  constructor() {
    // Future:
    //
    // if (
    //   process.env.IDEMPOTENCY_STORE ===
    //   "redis"
    // ) {
    //   this.store =
    //     new RedisIdempotencyStore();
    // } else {
    //   this.store =
    //     new MemoryIdempotencyStore();
    // }

    this.store =
      new MemoryIdempotencyStore();
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