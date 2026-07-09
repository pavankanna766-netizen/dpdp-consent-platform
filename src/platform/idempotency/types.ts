export interface IdempotencyResult<T> {
  executed: boolean;

  value?: T;
}

export interface IdempotencyStore {
  execute<T>(
    key: string,
    ttlMs: number,
    operation: () => Promise<T>
  ): Promise<IdempotencyResult<T>>;
}