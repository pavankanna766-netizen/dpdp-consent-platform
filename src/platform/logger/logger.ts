const PII_FIELDS = new Set([
  "email",
  "password",
  "phone",
  "ssn",
  "address",
  "credit_card",
  "token",
  "secret",
  "authorization"
]);

function stripPII(obj: unknown): unknown {
  if (!obj) return obj;
  if (typeof obj !== 'object') return obj;

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

class Logger {
  private readonly isDevelopment = process.env.NODE_ENV !== "production";

  private log(level: LogLevel, message: string, ...args: unknown[]) {
    if (level === LogLevel.DEBUG && !this.isDevelopment) {
      return;
    }

    const context = stripPII(
      args.length > 0
        ? Object.assign(
            {},
            ...args.map((a) =>
              typeof a === "object" && a !== null ? a : { _value: a }
            )
          )
        : undefined
    );

    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...(context && typeof context === "object" && Object.keys(context).length > 0
        ? { context }
        : {}),
    };

    const logString = JSON.stringify(logEntry);

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