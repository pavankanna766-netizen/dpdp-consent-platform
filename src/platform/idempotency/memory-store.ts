import type {
  IdempotencyResult,
  IdempotencyStore,
} from "./types";

type Entry = {
  expiresAt: number;
  value: unknown;
};

export class MemoryIdempotencyStore
  implements IdempotencyStore
{
  private readonly cache =
    new Map<string, Entry>();

  async execute<T>(
    key: string,
    ttlMs: number,
    operation: () => Promise<T>
  ): Promise<IdempotencyResult<T>> {
    const now = Date.now();

    const existing =
      this.cache.get(key);

    if (
      existing &&
      existing.expiresAt > now
    ) {
      return {
        executed: false,
        value:
          existing.value as T,
      };
    }

    const value =
      await operation();

    this.cache.set(key, {
      expiresAt:
        now + ttlMs,
      value,
    });

    return {
      executed: true,
      value,
    };
  }
}