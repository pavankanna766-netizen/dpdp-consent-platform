export enum LogLevel {
  DEBUG = "debug",
  INFO = "info",
  WARN = "warn",
  ERROR = "error",
}

class Logger {
  private readonly isDevelopment =
    process.env.NODE_ENV !== "production";

  debug(
    message: string,
    ...args: unknown[]
  ) {
    if (!this.isDevelopment) {
      return;
    }

    console.debug(
      `[DEBUG] ${message}`,
      ...args
    );
  }

  info(
    message: string,
    ...args: unknown[]
  ) {
    console.info(
      `[INFO] ${message}`,
      ...args
    );
  }

  warn(
    message: string,
    ...args: unknown[]
  ) {
    console.warn(
      `[WARN] ${message}`,
      ...args
    );
  }

  error(
    message: string,
    ...args: unknown[]
  ) {
    console.error(
      `[ERROR] ${message}`,
      ...args
    );
  }
}

export const logger =
  new Logger();