import { logger } from "@/platform/logger";

import { AppError } from "@/platform/errors";

import {
  internalServerErrorResponse,
} from "./response";

export function handleHttpError(
  error: unknown
) {
  if (error instanceof AppError) {
    return Response.json(
      {
        success: false,
        code: error.code,
        message: error.message,
      },
      {
        status: error.status,
      }
    );
  }

  logger.error(
    "Unhandled HTTP error",
    error
  );

  return internalServerErrorResponse();
}