import { logger } from "@/platform/logger";

// ---------------------------------------------------------------------------
// Upstash REST Redis Client — Singleton
// ---------------------------------------------------------------------------
// Uses the Upstash REST API (https://docs.upstash.com/redis/features/restapi)
// so it works in serverless/edge runtimes without TCP socket support.
// ---------------------------------------------------------------------------

interface UpstashResponse<T = unknown> {
  result: T;
  error?: string;
}

export class UpstashRedisClient {
  private readonly url: string;
  private readonly token: string;
  private readonly timeoutMs: number;
  private degraded = false;
  private lastHealthCheck = 0;
  private readonly healthCheckIntervalMs = 30_000;

  constructor() {
    this.url = process.env.UPSTASH_REDIS_REST_URL || "";
    this.token = process.env.UPSTASH_REDIS_REST_TOKEN || "";
    this.timeoutMs = parseInt(process.env.REDIS_TIMEOUT_MS || "5000", 10);
  }

  get isConfigured(): boolean {
    return !!(this.url && this.token);
  }

  get isDegraded(): boolean {
    return this.degraded;
  }

  // ---- Core Command Execution ----

  private async execute<T = unknown>(command: unknown[]): Promise<T | null> {
    if (!this.isConfigured) {
      return null;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(this.url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(command),
        signal: controller.signal,
      });

      if (!response.ok) {
        logger.error("[Redis] Upstash HTTP error", { status: response.status });
        this.enterDegradedMode();
        return null;
      }

      const json = (await response.json()) as UpstashResponse<T>;

      if (json.error) {
        logger.error("[Redis] Upstash command error", { error: json.error, command: command[0] });
        return null;
      }

      // Successful call — exit degraded mode
      if (this.degraded) {
        this.degraded = false;
        logger.info("[Redis] Connection recovered from degraded mode.");
      }

      return json.result;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);

      if (msg.includes("abort")) {
        logger.warn("[Redis] Command timed out", { command: command[0], timeoutMs: this.timeoutMs });
      } else {
        logger.error("[Redis] Command failed", { error: msg, command: command[0] });
      }

      this.enterDegradedMode();
      return null;
    } finally {
      clearTimeout(timeout);
    }
  }

  private enterDegradedMode() {
    if (!this.degraded) {
      this.degraded = true;
      logger.warn("[Redis] Entering DEGRADED mode — cache and rate-limit operations will fall back gracefully.");
    }
  }

  // ---- Health Check ----

  async ping(): Promise<boolean> {
    const result = await this.execute<string>(["PING"]);
    return result === "PONG";
  }

  async healthCheck(): Promise<{ healthy: boolean; latencyMs: number }> {
    const start = performance.now();
    const healthy = await this.ping();
    const latencyMs = Math.round(performance.now() - start);

    this.lastHealthCheck = Date.now();
    return { healthy, latencyMs };
  }

  shouldRunHealthCheck(): boolean {
    return this.degraded && Date.now() - this.lastHealthCheck > this.healthCheckIntervalMs;
  }

  // ---- Typed Helpers ----

  async get<T = string>(key: string): Promise<T | null> {
    if (this.degraded && !this.shouldRunHealthCheck()) return null;
    const result = await this.execute<string>(["GET", key]);
    if (result === null || result === undefined) return null;
    try {
      return JSON.parse(result) as T;
    } catch {
      return result as unknown as T;
    }
  }

  async set(key: string, value: unknown, ttlSeconds?: number): Promise<boolean> {
    if (this.degraded && !this.shouldRunHealthCheck()) return false;
    const serialized = typeof value === "string" ? value : JSON.stringify(value);
    const command: unknown[] = ttlSeconds
      ? ["SET", key, serialized, "EX", ttlSeconds]
      : ["SET", key, serialized];
    const result = await this.execute<string>(command);
    return result === "OK";
  }

  async del(...keys: string[]): Promise<number> {
    if (this.degraded) return 0;
    const result = await this.execute<number>(["DEL", ...keys]);
    return result ?? 0;
  }

  async incr(key: string): Promise<number | null> {
    if (this.degraded) return null;
    return this.execute<number>(["INCR", key]);
  }

  async expire(key: string, ttlSeconds: number): Promise<boolean> {
    if (this.degraded) return false;
    const result = await this.execute<number>(["EXPIRE", key, ttlSeconds]);
    return result === 1;
  }

  async ttl(key: string): Promise<number> {
    if (this.degraded) return -2;
    const result = await this.execute<number>(["TTL", key]);
    return result ?? -2;
  }

  async exists(key: string): Promise<boolean> {
    if (this.degraded) return false;
    const result = await this.execute<number>(["EXISTS", key]);
    return result === 1;
  }

  async keys(pattern: string): Promise<string[]> {
    if (this.degraded) return [];
    const result = await this.execute<string[]>(["KEYS", pattern]);
    return result ?? [];
  }

  // Pipelined multi-delete by pattern
  async invalidatePattern(prefix: string): Promise<number> {
    if (this.degraded) return 0;
    const matchingKeys = await this.keys(`${prefix}*`);
    if (matchingKeys.length === 0) return 0;
    return this.del(...matchingKeys);
  }

  // ---- Rate Limiting (Sliding Window Counter) ----

  async rateLimitConsume(
    key: string,
    limit: number,
    windowSeconds: number
  ): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
    if (this.degraded) {
      return { allowed: true, remaining: limit, resetAt: Date.now() + windowSeconds * 1000 };
    }

    const count = await this.incr(key);

    if (count === null) {
      // Redis unavailable — allow in degraded mode
      return { allowed: true, remaining: limit, resetAt: Date.now() + windowSeconds * 1000 };
    }

    // Set TTL on first request in window
    if (count === 1) {
      await this.expire(key, windowSeconds);
    }

    const remaining = Math.max(0, limit - count);
    const currentTtl = await this.ttl(key);
    const resetAt = Date.now() + Math.max(currentTtl, 0) * 1000;

    return {
      allowed: count <= limit,
      remaining,
      resetAt,
    };
  }
}

// Singleton
export const redis = new UpstashRedisClient();
