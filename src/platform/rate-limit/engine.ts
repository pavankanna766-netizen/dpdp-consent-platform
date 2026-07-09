import {
  MemoryRateLimitStore,
} from "./memory-store";

import type {
  RateLimitStore,
} from "./types";

export class RateLimitEngine {
  private readonly store: RateLimitStore;

  constructor() {
    // Future:
    // if (process.env.RATE_LIMIT_STORE === "redis") {
    //   this.store = new RedisRateLimitStore();
    // } else {
    //   this.store = new MemoryRateLimitStore();
    // }

    this.store =
      new MemoryRateLimitStore();
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