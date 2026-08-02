export class UpstashRedisCache {
  private memoryStore: Map<string, { value: unknown; expiresAt: number }>;

  constructor() {
    this.memoryStore = new Map();
  }

  async get<T>(key: string): Promise<T | null> {
    const item = this.memoryStore.get(key);
    if (!item) return null;

    if (Date.now() > item.expiresAt) {
      this.memoryStore.delete(key);
      return null;
    }

    return item.value as T;
  }

  async set(key: string, value: unknown, ttlSeconds: number = 300): Promise<void> {
    const expiresAt = Date.now() + ttlSeconds * 1000;
    this.memoryStore.set(key, { value, expiresAt });
  }

  async delete(key: string): Promise<void> {
    this.memoryStore.delete(key);
  }

  async invalidatePattern(patternPrefix: string): Promise<void> {
    for (const key of this.memoryStore.keys()) {
      if (key.startsWith(patternPrefix)) {
        this.memoryStore.delete(key);
      }
    }
  }
}

export const redisCache = new UpstashRedisCache();
