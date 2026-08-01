import { logger } from "@/platform/logger";

import { AppError } from "@/platform/errors";

import {
  internalServerErrorResponse,
} from "./response";

import { RateLimitError } from "@/platform/errors";

export function handleHttpError(
  error: unknown
) {
  if (error instanceof AppError) {
    const headers: HeadersInit = {};
    if (error instanceof RateLimitError) {
      headers["Retry-After"] = String(error.retryAfterSeconds);
    }

    return Response.json(
      {
        success: false,
        code: error.code,
        message: error.message,
      },
      {
        status: error.status,
        headers,
      }
    );
  }

  logger.error(
    "Unhandled HTTP error",
    error
  );

  return internalServerErrorResponse();
}