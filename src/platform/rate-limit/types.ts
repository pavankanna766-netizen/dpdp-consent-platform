export interface RateLimitResult {
  allowed: boolean;

  remaining: number;

  resetAt: number;
}

export interface RateLimitStore {
  consume(
    key: string,
    limit: number,
    windowMs: number
  ): Promise<RateLimitResult>;
}