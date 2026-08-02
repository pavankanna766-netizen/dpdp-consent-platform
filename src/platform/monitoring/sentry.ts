export interface ErrorContext {
  userId?: string;
  companyId?: string;
  endpoint?: string;
  metadata?: Record<string, unknown>;
}

export class MonitoringService {
  private sentryDsn: string | undefined;

  constructor() {
    this.sentryDsn = process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN;
  }

  captureException(error: Error | unknown, context?: ErrorContext) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : undefined;

    const payload = {
      level: "error",
      message: errorMsg,
      timestamp: new Date().toISOString(),
      stack,
      context: {
        userId: context?.userId || "anonymous",
        companyId: context?.companyId || "unknown",
        endpoint: context?.endpoint || "unknown",
        metadata: context?.metadata || {},
      },
    };

    if (this.sentryDsn) {
      // Sentry DSN active logging simulation
      console.error("[SENTRY CAPTURE EXCEPTION]", JSON.stringify(payload));
    } else {
      console.error("[MONITORING EXCEPTION]", JSON.stringify(payload));
    }
  }

  captureMessage(message: string, level: "info" | "warning" | "error" = "info", context?: ErrorContext) {
    const payload = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
    };
    console.log(`[MONITORING ${level.toUpperCase()}]`, JSON.stringify(payload));
  }

  startTrace(spanName: string) {
    const startTime = performance.now();
    return {
      finish: (metadata?: Record<string, unknown>) => {
        const duration = performance.now() - startTime;
        if (duration > 1000) {
          this.captureMessage(`Slow Execution Span Detected: ${spanName} (${duration.toFixed(2)}ms)`, "warning", { metadata });
        }
        return duration;
      },
    };
  }
}

export const monitoringService = new MonitoringService();
