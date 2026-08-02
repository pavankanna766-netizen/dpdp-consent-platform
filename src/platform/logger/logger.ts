const PII_FIELDS = new Set([
  "email",
  "password",
  "phone",
  "ssn",
  "address",
  "credit_card",
  "card_number",
  "cvv",
  "token",
  "secret",
  "authorization",
  "consent_text",
  "bearer",
]);

function stripPII(obj: unknown): unknown {
  if (!obj) return obj;
  if (typeof obj !== "object") return obj;

  if (Array.isArray(obj)) {
    return obj.map(stripPII);
  }

  const record = obj as Record<string, unknown>;
  const result: Record<string, unknown> = {};
  for (const key in record) {
    if (PII_FIELDS.has(key.toLowerCase())) {
      result[key] = "[REDACTED]";
    } else {
      result[key] = stripPII(record[key]);
    }
  }
  return result;
}

export enum LogLevel {
  DEBUG = "debug",
  INFO = "info",
  WARN = "warn",
  ERROR = "error",
}

const LOG_LEVEL_SEVERITY: Record<LogLevel, number> = {
  [LogLevel.DEBUG]: 0,
  [LogLevel.INFO]: 1,
  [LogLevel.WARN]: 2,
  [LogLevel.ERROR]: 3,
};

export interface StructuredLogContext {
  request_id?: string;
  company_id?: string;
  user_id?: string;
  module?: string;
  event?: string;
  duration?: number;
  status?: string | number;
  environment?: string;
  [key: string]: unknown;
}

class Logger {
  private readonly isDevelopment = process.env.NODE_ENV !== "production";
  private readonly sourceToken = process.env.BETTERSTACK_SOURCE_TOKEN;
  private readonly endpoint = process.env.BETTERSTACK_ENDPOINT || "https://in.logs.betterstack.com";
  private readonly configuredLogLevel: LogLevel;

  constructor() {
    const envLevel = (process.env.LOG_LEVEL || "info").toLowerCase() as LogLevel;
    this.configuredLogLevel = LOG_LEVEL_SEVERITY[envLevel] !== undefined ? envLevel : LogLevel.INFO;
  }

  private shouldLog(level: LogLevel): boolean {
    const currentSeverity = LOG_LEVEL_SEVERITY[level] ?? 1;
    const minSeverity = LOG_LEVEL_SEVERITY[this.configuredLogLevel] ?? 1;
    return currentSeverity >= minSeverity;
  }

  private log(level: LogLevel, message: string, ...args: unknown[]) {
    if (!this.shouldLog(level)) {
      return;
    }

    const mergedArgs = args.length > 0
      ? Object.assign({}, ...args.map((a) => (typeof a === "object" && a !== null ? a : { _value: a })))
      : {};

    const sanitizedContext = stripPII(mergedArgs) as StructuredLogContext;

    const logEntry = {
      dt: new Date().toISOString(),
      timestamp: new Date().toISOString(),
      level,
      message,
      environment: process.env.NODE_ENV || "development",
      request_id: sanitizedContext.request_id || "req_none",
      company_id: sanitizedContext.company_id || "unknown",
      user_id: sanitizedContext.user_id || "anonymous",
      module: sanitizedContext.module || "core",
      event: sanitizedContext.event || "system_event",
      duration: sanitizedContext.duration,
      status: sanitizedContext.status,
      context: sanitizedContext,
    };

    const logString = JSON.stringify(logEntry);

    // 1. Console Output
    switch (level) {
      case LogLevel.DEBUG:
        console.debug(logString);
        break;
      case LogLevel.INFO:
        console.info(logString);
        break;
      case LogLevel.WARN:
        console.warn(logString);
        break;
      case LogLevel.ERROR:
        console.error(logString);
        break;
    }

    // 2. Asynchronous Ingestion to Better Stack (Logtail)
    if (this.sourceToken) {
      this.dispatchToBetterStack(logEntry).catch(() => {
        // Silent degradation — remote log failures never crash request lifecycle
      });
    }
  }

  private async dispatchToBetterStack(logEntry: Record<string, unknown>) {
    try {
      await fetch(this.endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.sourceToken}`,
        },
        body: JSON.stringify(logEntry),
      });
    } catch {
      // Ignored for graceful degradation
    }
  }

  debug(message: string, ...args: unknown[]) {
    this.log(LogLevel.DEBUG, message, ...args);
  }

  info(message: string, ...args: unknown[]) {
    this.log(LogLevel.INFO, message, ...args);
  }

  warn(message: string, ...args: unknown[]) {
    this.log(LogLevel.WARN, message, ...args);
  }

  error(message: string, ...args: unknown[]) {
    this.log(LogLevel.ERROR, message, ...args);
  }
}

export const logger = new Logger();