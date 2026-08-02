import { redis } from "./redis-client";
import { logger } from "@/platform/logger";

// ---------------------------------------------------------------------------
// Cache Layer — Transparent read-through with automatic invalidation
// ---------------------------------------------------------------------------
// Graceful degradation: if Redis is unavailable, all cache reads return null
// (forcing a database hit) and all cache writes silently no-op.
// ---------------------------------------------------------------------------

export type CacheDomain =
  | "trust_center"
  | "privacy_policy"
  | "cookie_policy"
  | "consent_template"
  | "vendor_registry"
  | "data_inventory"
  | "scanner_summary"
  | "dashboard_metrics"
  | "company_settings"
  | "branding";

const DEFAULT_TTL_SECONDS: Record<CacheDomain, number> = {
  trust_center: 300,        // 5 min
  privacy_policy: 600,      // 10 min
  cookie_policy: 600,       // 10 min
  consent_template: 900,    // 15 min
  vendor_registry: 300,     // 5 min
  data_inventory: 300,      // 5 min
  scanner_summary: 120,     // 2 min
  dashboard_metrics: 60,    // 1 min
  company_settings: 600,    // 10 min
  branding: 900,            // 15 min
};

function cacheKey(domain: CacheDomain, companyId: string, suffix?: string): string {
  return suffix
    ? `cache:${domain}:${companyId}:${suffix}`
    : `cache:${domain}:${companyId}`;
}

// ---- Read-Through Cache ----

export async function cacheGet<T>(domain: CacheDomain, companyId: string, suffix?: string): Promise<T | null> {
  try {
    return await redis.get<T>(cacheKey(domain, companyId, suffix));
  } catch {
    logger.warn("[Cache] Read failed, returning null (graceful degradation)", { domain, companyId });
    return null;
  }
}

export async function cacheSet(domain: CacheDomain, companyId: string, value: unknown, suffix?: string, ttlOverride?: number): Promise<void> {
  const ttl = ttlOverride ?? DEFAULT_TTL_SECONDS[domain];
  try {
    await redis.set(cacheKey(domain, companyId, suffix), value, ttl);
  } catch {
    logger.warn("[Cache] Write failed, skipping (graceful degradation)", { domain, companyId });
  }
}

// ---- Invalidation ----

export async function cacheInvalidate(domain: CacheDomain, companyId: string, suffix?: string): Promise<void> {
  try {
    if (suffix) {
      await redis.del(cacheKey(domain, companyId, suffix));
    } else {
      await redis.invalidatePattern(`cache:${domain}:${companyId}`);
    }
    logger.info("[Cache] Invalidated", { domain, companyId, suffix: suffix || "*" });
  } catch {
    logger.warn("[Cache] Invalidation failed, skipping", { domain, companyId });
  }
}

export async function cacheInvalidateCompany(companyId: string): Promise<void> {
  try {
    await redis.invalidatePattern(`cache:*:${companyId}`);
    logger.info("[Cache] Full company cache invalidated", { companyId });
  } catch {
    logger.warn("[Cache] Company-wide invalidation failed", { companyId });
  }
}

// ---- Convenience: Read-Through with Loader ----

export async function cacheThrough<T>(
  domain: CacheDomain,
  companyId: string,
  loader: () => Promise<T>,
  suffix?: string,
  ttlOverride?: number
): Promise<T> {
  const cached = await cacheGet<T>(domain, companyId, suffix);
  if (cached !== null) return cached;

  const fresh = await loader();
  await cacheSet(domain, companyId, fresh, suffix, ttlOverride);
  return fresh;
}

// Re-export redis client and cache key builder for direct use
export { redis, cacheKey };
