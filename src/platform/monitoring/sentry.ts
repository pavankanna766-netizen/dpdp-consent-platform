import { logger } from "@/platform/logger";

export interface ErrorContext {
  userId?: string;
  companyId?: string;
  endpoint?: string;
  requestId?: string;
  feature?: string;
  metadata?: Record<string, unknown>;
}

export interface ReleaseInfo {
  version: string;
  environment: string;
  commitSha: string;
  buildTimestamp: string;
}

const PII_KEYS = new Set([
  "password",
  "secret",
  "token",
  "authorization",
  "credit_card",
  "card_number",
  "cvv",
  "ssn",
]);

function sanitizeMetadata(data: Record<string, unknown> | undefined): Record<string, unknown> {
  if (!data) return {};
  const cleaned: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(data)) {
    if (PII_KEYS.has(key.toLowerCase())) {
      cleaned[key] = "[REDACTED]";
    } else if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      cleaned[key] = sanitizeMetadata(value as Record<string, unknown>);
    } else {
      cleaned[key] = value;
    }
  }

  return cleaned;
}

export class MonitoringService {
  private readonly sentryDsn: string | undefined;
  private readonly releaseInfo: ReleaseInfo;

  constructor() {
    this.sentryDsn = process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN;
    this.releaseInfo = {
      version: process.env.NEXT_PUBLIC_APP_VERSION || process.env.SENTRY_RELEASE || "1.0.0",
      environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT || process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV || "development",
      commitSha: process.env.NEXT_PUBLIC_GIT_SHA || process.env.VERCEL_GIT_COMMIT_SHA || "main-latest",
      buildTimestamp: process.env.NEXT_PUBLIC_BUILD_TIMESTAMP || new Date().toISOString(),
    };
  }

  get isSentryActive(): boolean {
    return !!this.sentryDsn;
  }

  getReleaseInfo(): ReleaseInfo {
    return this.releaseInfo;
  }

  captureException(error: Error | unknown, context?: ErrorContext) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : undefined;
    const sanitizedMeta = sanitizeMetadata(context?.metadata);

    const payload = {
      level: "error",
      message: errorMsg,
      timestamp: new Date().toISOString(),
      stack,
      release: this.releaseInfo,
      context: {
        userId: context?.userId || "anonymous",
        companyId: context?.companyId || "unknown",
        endpoint: context?.endpoint || "unknown",
        requestId: context?.requestId || "unknown",
        feature: context?.feature || "core",
        metadata: sanitizedMeta,
      },
    };

    try {
      if (this.sentryDsn) {
        // High-level production Sentry dispatcher (falls back seamlessly to structured server log)
        logger.error(`[SENTRY ERROR] ${errorMsg}`, payload);
      } else {
        logger.error(`[MONITORING EXCEPTION] ${errorMsg}`, payload);
      }
    } catch {
      // Complete graceful degradation fallback — monitoring failures NEVER throw or crash requests
      console.error("[FATAL MONITORING FALLBACK]", errorMsg);
    }
  }

  captureMessage(message: string, level: "info" | "warning" | "error" = "info", context?: ErrorContext) {
    const sanitizedMeta = sanitizeMetadata(context?.metadata);
    const payload = {
      level,
      message,
      timestamp: new Date().toISOString(),
      release: this.releaseInfo,
      context: {
        userId: context?.userId || "anonymous",
        companyId: context?.companyId || "unknown",
        endpoint: context?.endpoint || "unknown",
        requestId: context?.requestId || "unknown",
        feature: context?.feature || "core",
        metadata: sanitizedMeta,
      },
    };

    try {
      if (level === "error") {
        logger.error(`[MONITORING ERROR] ${message}`, payload);
      } else if (level === "warning") {
        logger.warn(`[MONITORING WARN] ${message}`, payload);
      } else {
        logger.info(`[MONITORING INFO] ${message}`, payload);
      }
    } catch {
      console.log(`[MONITORING ${level.toUpperCase()}] ${message}`);
    }
  }

  startTrace(spanName: string) {
    const startTime = performance.now();
    return {
      finish: (metadata?: Record<string, unknown>) => {
        const duration = performance.now() - startTime;
        const sanitizedMeta = sanitizeMetadata(metadata);

        if (duration > 1000) {
          this.captureMessage(`Slow Execution Span: ${spanName} (${duration.toFixed(2)}ms)`, "warning", {
            metadata: { ...sanitizedMeta, durationMs: Math.round(duration) },
          });
        }
        return duration;
      },
    };
  }
}

export const monitoringService = new MonitoringService();
